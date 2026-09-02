import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  PhoneCall,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Video,
  Check,
  CheckCheck,
  MessageSquare,
  Trash2,
  Users,
  UserCheck,
  User,
  Search,
  Clock,
  ArrowUpRight,
  Bell,
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';
import { ChatMessage, CallLog, ChatRoom } from '../../types';
import { store } from '../../lib/store';
import { firestoreRealtime } from '../../lib/firestoreRealtime';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoomId?: string;
  onStartCall: (agentName: string, agentAvatar?: string, isVideo?: boolean, agentId?: string) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  activeRoomId,
  onStartCall
}) => {
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<'chats' | 'calls'>('chats');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    activeRoomId || store.chatRooms[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [showRoomListView, setShowRoomListView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [callFilter, setCallFilter] = useState<'all' | 'missed' | 'incoming' | 'outgoing'>('all');
  
  // Floating banner alert for other incoming messages
  const [crossRoomAlert, setCrossRoomAlert] = useState<{
    roomId: string;
    senderName: string;
    senderAvatar?: string;
    text: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const alertTimerRef = useRef<any>(null);
  const initialSnapshotsLoadedRef = useRef<Record<string, boolean>>({});

  // Play subtle sound for message events
  const playSound = (type: 'send' | 'receive' | 'alert') => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'send') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'receive') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'alert') {
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {}
  };

  // Subscribe to store updates
  useEffect(() => {
    const unsub = store.subscribe(() => setTick(t => t + 1));
    return () => unsub();
  }, []);

  // Listen to activeRoomId prop changes
  useEffect(() => {
    if (activeRoomId) {
      setSelectedRoomId(activeRoomId);
      store.markRoomAsRead(activeRoomId);
      firestoreRealtime.markRoomMessagesAsRead(activeRoomId, store.currentUser.id).catch(() => {});
      setShowRoomListView(false);
    } else if (store.chatRooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(store.chatRooms[0].id);
      store.markRoomAsRead(store.chatRooms[0].id);
    }
  }, [activeRoomId, isOpen]);

  // Real-time Firestore sync for all rooms and active room
  useEffect(() => {
    if (!isOpen) return;

    const unsubs: (() => void)[] = [];

    // Subscribe to all rooms so messages from any user are received instantly
    store.chatRooms.forEach(room => {
      const unsub = firestoreRealtime.subscribeToRoomMessages(room.id, (incomingMsgs) => {
        if (incomingMsgs && incomingMsgs.length > 0) {
          const existing = store.chatMessages[room.id] || [];
          const map = new Map<string, ChatMessage>();
          existing.forEach(m => map.set(m.id, m));
          incomingMsgs.forEach(m => map.set(m.id, m));
          const merged = Array.from(map.values()).sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

          const isInitialLoadForRoom = !initialSnapshotsLoadedRef.current[room.id];
          initialSnapshotsLoadedRef.current[room.id] = true;

          const lastMsg = merged[merged.length - 1];
          // Only trigger real-time sound/toast alert if this is NOT the initial load of past messages and it is a genuinely new message
          const hasNewMsg = !isInitialLoadForRoom && lastMsg && lastMsg.senderId !== store.currentUser.id && existing.length < merged.length;

          if (hasNewMsg) {
            if (room.id === selectedRoomId) {
              playSound('receive');
              firestoreRealtime.markRoomMessagesAsRead(room.id, store.currentUser.id).catch(() => {});
              store.markRoomAsRead(room.id);
            } else {
              // Message from another person while reading current chat!
              playSound('alert');
              setCrossRoomAlert({
                roomId: room.id,
                senderName: lastMsg.senderName || 'New Message',
                senderAvatar: lastMsg.senderAvatar,
                text: lastMsg.text
              });

              if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
              alertTimerRef.current = setTimeout(() => {
                setCrossRoomAlert(null);
              }, 7000);
            }
          }

          store.chatMessages[room.id] = merged;
          setTick(t => t + 1);
          store.notify();
        }
      });
      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach(u => u());
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, [isOpen, selectedRoomId, store.chatRooms.length]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedRoomId, store.chatMessages[selectedRoomId]?.length, activeTab]);

  if (!isOpen) return null;

  const currentRoom = store.chatRooms.find(r => r.id === selectedRoomId) || store.chatRooms[0];
  const otherParticipant = currentRoom?.participants.find(p => p.id !== store.currentUser.id);
  const messages = selectedRoomId ? store.chatMessages[selectedRoomId] || [] : [];

  // Total unread messages across all rooms
  const totalUnreadCount = store.chatRooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);

  // Total missed calls
  const missedCallsCount = store.callLogs.filter(c => c.status === 'missed' || c.status === 'rejected' || c.type === 'missed').length;

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedRoomId) return;
    const userText = inputText.trim();
    setInputText('');
    playSound('send');
    store.sendMessage(selectedRoomId, userText);
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    store.markRoomAsRead(roomId);
    firestoreRealtime.markRoomMessagesAsRead(roomId, store.currentUser.id).catch(() => {});
    setShowRoomListView(false);
    setCrossRoomAlert(null);
  };

  const handleDeleteRoom = (roomId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete chat history with ${name}?`)) {
      store.deleteChatRoom(roomId);
      const remaining = store.chatRooms.filter(r => r.id !== roomId);
      if (remaining.length > 0) {
        setSelectedRoomId(remaining[0].id);
        store.markRoomAsRead(remaining[0].id);
      } else {
        setSelectedRoomId('');
      }
    }
  };

  // Filtered rooms for search
  const filteredRooms = store.chatRooms.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const other = r.participants.find(p => p.id !== store.currentUser.id);
    return (
      other?.name?.toLowerCase().includes(q) ||
      r.lastMessage?.toLowerCase().includes(q) ||
      r.propertyTitle?.toLowerCase().includes(q)
    );
  });

  // Filtered call logs
  const filteredCallLogs = store.callLogs.filter(call => {
    if (callFilter === 'missed') return call.status === 'missed' || call.status === 'rejected' || call.type === 'missed';
    if (callFilter === 'incoming') return call.type === 'incoming';
    if (callFilter === 'outgoing') return call.type === 'outgoing';
    return true;
  });

  const formatDuration = (sec?: number) => {
    if (!sec || sec === 0) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div
      id="dealfast-chat-drawer"
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] glass-card-glow border-l border-slate-800 shadow-2xl flex flex-col bg-[#0a0e1a]/98 text-slate-100 animate-in slide-in-from-right duration-300"
    >
      {/* 1. Main Top Header with Tabs & Close */}
      <div className="p-3.5 bg-slate-950/95 border-b border-slate-800/90 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-inner">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-sm font-bold text-white tracking-tight">DealFast Realtime Hub</h3>
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-[10px] text-slate-400">P2P Realtime Chat & HD WebRTC Audio/Video</p>
            </div>
          </div>

          <button
            id="chat-drawer-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Tab Navigation: 💬 Chats vs 📞 Call Logs */}
        <div className="flex items-center p-1 bg-slate-900/90 rounded-2xl border border-slate-800/80">
          <button
            id="tab-chats-btn"
            onClick={() => {
              setActiveTab('chats');
              setShowRoomListView(false);
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'chats'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chats</span>
            {totalUnreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-extrabold animate-pulse">
                {totalUnreadCount}
              </span>
            )}
          </button>

          <button
            id="tab-call-logs-btn"
            onClick={() => setActiveTab('calls')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'calls'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Logs</span>
            {missedCallsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-extrabold animate-pulse">
                {missedCallsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT 1: CHATS */}
      {/* ========================================================================= */}
      {activeTab === 'chats' && (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Quick Horizontal Active Chats Carousel */}
          {store.chatRooms.length > 0 && (
            <div className="p-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 flex-1">
                {store.chatRooms.map(room => {
                  const participant = room.participants.find(p => p.id !== store.currentUser.id);
                  const isCurrent = room.id === selectedRoomId && !showRoomListView;
                  const unread = room.unreadCount || 0;

                  return (
                    <button
                      key={room.id}
                      onClick={() => handleSelectRoom(room.id)}
                      className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border shrink-0 transition-all ${
                        isCurrent
                          ? 'bg-orange-500/20 border-orange-500/50 text-white shadow-sm ring-1 ring-orange-500/30'
                          : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                      title={participant?.name || 'Contact'}
                    >
                      <div className="relative w-6 h-6 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                        {participant?.avatar ? (
                          <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-slate-400 m-auto mt-1" />
                        )}
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full ring-1 ring-slate-950 bg-emerald-500" />
                      </div>

                      <span className="text-xs font-semibold max-w-[80px] truncate">
                        {participant?.name?.split(' ')[0] || 'Agent'}
                      </span>

                      {unread > 0 && (
                        <span className="w-4 h-4 rounded-full bg-red-500 text-white font-black text-[9px] flex items-center justify-center shrink-0 animate-bounce">
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* View All Chats Toggle Button */}
              <button
                id="toggle-all-chats-list"
                onClick={() => setShowRoomListView(!showRoomListView)}
                className={`p-1.5 px-2.5 rounded-xl text-xs font-bold border shrink-0 flex items-center gap-1 transition-colors ${
                  showRoomListView
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                }`}
                title="View All Conversations"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="text-[11px]">List</span>
              </button>
            </div>
          )}

          {/* Floating Cross-Room Incoming Message Banner Alert */}
          {crossRoomAlert && (
            <div className="absolute top-16 left-3 right-3 z-30 bg-gradient-to-r from-orange-950/95 to-slate-900/95 border-2 border-orange-500/60 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-orange-500 shrink-0">
                  {crossRoomAlert.senderAvatar ? (
                    <img src={crossRoomAlert.senderAvatar} alt={crossRoomAlert.senderName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-slate-400 m-auto mt-1" />
                  )}
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-slate-950 animate-ping" />
                </div>
                <div className="truncate">
                  <div className="flex items-center space-x-1.5">
                    <p className="text-xs font-bold text-white truncate">{crossRoomAlert.senderName}</p>
                    <span className="text-[9px] text-orange-400 font-bold bg-orange-500/20 px-1 rounded">New Message</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">{crossRoomAlert.text}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  onClick={() => handleSelectRoom(crossRoomAlert.roomId)}
                  className="px-2.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold flex items-center space-x-1 shadow-md transition-all active:scale-95"
                >
                  <span>Open Chat</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCrossRoomAlert(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* VIEW A: Full Conversation List View */}
          {showRoomListView ? (
            <div className="flex-1 flex flex-col overflow-hidden p-4 bg-slate-950/60">
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search chats by member or property..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredRooms.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 space-y-2">
                    <Users className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs">No conversations found.</p>
                  </div>
                ) : (
                  filteredRooms.map(room => {
                    const participant = room.participants.find(p => p.id !== store.currentUser.id);
                    const isSelected = room.id === selectedRoomId;
                    const unread = room.unreadCount || 0;

                    return (
                      <div
                        key={room.id}
                        onClick={() => handleSelectRoom(room.id)}
                        className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer border transition-all ${
                          isSelected
                            ? 'bg-orange-500/15 border-orange-500/40 text-white shadow-md'
                            : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                            {participant?.avatar ? (
                              <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-slate-400 m-auto mt-2" />
                            )}
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 bg-emerald-500" />
                          </div>

                          <div className="truncate">
                            <div className="flex items-center space-x-1.5">
                              <p className="font-bold text-xs text-white truncate">{participant?.name || 'Agent'}</p>
                              <UserCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{room.lastMessage || 'No messages yet'}</p>
                            {room.propertyTitle && (
                              <p className="text-[10px] text-orange-400/80 truncate">Listing: {room.propertyTitle}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {unread > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                              {unread}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRoom(room.id, participant?.name || 'Agent');
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete Chat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* VIEW B: Active Chat Stream View */
            <div className="flex-1 flex flex-col overflow-hidden">
              {currentRoom ? (
                <>
                  {/* Chat Top Contact Bar */}
                  <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="relative shrink-0 w-9 h-9 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-700 shadow">
                        {otherParticipant?.avatar ? (
                          <img
                            src={otherParticipant.avatar}
                            alt={otherParticipant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 bg-emerald-500" />
                      </div>

                      <div className="truncate">
                        <div className="flex items-center space-x-1.5">
                          <p className="text-xs font-bold text-white truncate">{otherParticipant?.name || 'Verified Agent'}</p>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </div>
                        <p className="text-[10px] text-slate-400">Direct Encrypted Chat • Online</p>
                      </div>
                    </div>

                    {/* Calling Buttons */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        id="start-video-call-btn"
                        onClick={() => onStartCall(otherParticipant?.name || 'Agent', otherParticipant?.avatar, true, otherParticipant?.id)}
                        className="p-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 border border-purple-500/30 transition-colors flex items-center gap-1"
                        title="WebRTC Video Call"
                      >
                        <Video className="w-4 h-4 text-purple-400" />
                      </button>

                      <button
                        id="start-voice-call-btn"
                        onClick={() => onStartCall(otherParticipant?.name || 'Agent', otherParticipant?.avatar, false, otherParticipant?.id)}
                        className="p-2 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-500/30 transition-colors flex items-center gap-1"
                        title="WebRTC Voice Call"
                      >
                        <PhoneCall className="w-4 h-4 text-emerald-400" />
                      </button>

                      <button
                        onClick={() => handleDeleteRoom(currentRoom.id, otherParticipant?.name || 'Agent')}
                        className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                        title="Delete Entire Chat History"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Property Context Banner */}
                  {currentRoom.propertyTitle && (
                    <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="truncate">Listing: <strong className="text-orange-400">{currentRoom.propertyTitle}</strong></span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 shrink-0">Verified Property</span>
                    </div>
                  )}

                  {/* Messages Stream */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0a0e1a]/95 text-xs">
                    {messages.length === 0 ? (
                      <div className="text-center text-slate-500 py-12 space-y-2">
                        <MessageSquare className="w-8 h-8 text-slate-700 mx-auto" />
                        <p className="font-semibold text-slate-400">Start a live discussion</p>
                        <p className="text-[11px] text-slate-500">Ask about pricing negotiation, site visits, or property documents.</p>
                      </div>
                    ) : (
                      messages.map((m, idx) => {
                        const isMe = m.senderId === store.currentUser.id;
                        const isRead = m.isRead || m.status === 'read';
                        const isDelivered = m.isDelivered || m.status === 'delivered' || isRead;

                        return (
                          <div key={m.id || idx} className={`flex items-end space-x-2 group ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {!isMe && (
                              <div className="w-6 h-6 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center shrink-0 mb-1 border border-slate-700">
                                {m.senderAvatar || otherParticipant?.avatar ? (
                                  <img
                                    src={m.senderAvatar || otherParticipant?.avatar}
                                    alt={m.senderName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </div>
                            )}

                            <div
                              className={`p-3 rounded-2xl max-w-[82%] space-y-1 relative shadow-sm ${
                                isMe
                                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-br-none'
                                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                              }`}
                            >
                              {!isMe && (
                                <p className="text-[10px] font-bold text-orange-400 pb-0.5">{m.senderName}</p>
                              )}
                              <p className="leading-relaxed whitespace-pre-wrap select-text">{m.text}</p>
                              
                              <div className={`flex items-center justify-end space-x-1 text-[9px] pt-0.5 ${isMe ? 'text-white/80' : 'text-slate-400'}`}>
                                <span>{m.timestamp}</span>
                                {isMe && (
                                  isRead ? (
                                    <span className="flex items-center space-x-0.5 text-sky-300 font-black" title="Read / Seen by Recipient">
                                      <CheckCheck className="w-3.5 h-3.5 text-sky-300 stroke-[2.5]" />
                                      <span className="text-[8px] uppercase tracking-tighter">Read</span>
                                    </span>
                                  ) : isDelivered ? (
                                    <span className="flex items-center space-x-0.5 text-slate-200" title="Delivered to Recipient">
                                      <CheckCheck className="w-3.5 h-3.5 text-slate-200 stroke-[1.8]" />
                                      <span className="text-[8px] uppercase tracking-tighter">Delivered</span>
                                    </span>
                                  ) : (
                                    <span className="flex items-center space-x-0.5 text-white/60" title="Sent to Server">
                                      <Check className="w-3 h-3 text-white/60 stroke-[2]" />
                                      <span className="text-[8px] uppercase tracking-tighter">Sent</span>
                                    </span>
                                  )
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                if (selectedRoomId) store.deleteChatMessage(selectedRoomId, m.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                              title="Delete Message"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Suggestion Pills */}
                  <div className="p-2 bg-slate-950 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {[
                      'Is this price negotiable?',
                      'When can we schedule a site visit?',
                      'Please share NOC & registry status',
                      'Can I pay token money via Escrow?'
                    ].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (selectedRoomId) {
                            setInputText(q);
                          }
                        }}
                        className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 hover:text-orange-400 border border-slate-800 hover:border-orange-500/40 whitespace-nowrap transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Bottom Input Field */}
                  <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
                    <input
                      id="chat-input-text"
                      type="text"
                      placeholder="Type message in Urdu or English..."
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500 placeholder:text-slate-500 transition-colors"
                    />
                    <button
                      id="chat-send-btn"
                      onClick={handleSendMessage}
                      disabled={!inputText.trim()}
                      className={`p-2 rounded-xl text-white font-bold shadow-md transition-all ${
                        inputText.trim() ? 'gradient-btn active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs my-auto space-y-2">
                  <Users className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-white font-bold">No active conversation</p>
                  <p className="text-slate-400">Click "Chat" on any property listing or agent profile to start real-time messaging.</p>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 2: CALL LOGS & HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'calls' && (
        <div className="flex-1 flex flex-col overflow-hidden p-4 bg-slate-950/60">
          
          {/* Header Controls: Filters & Clear All */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {(['all', 'missed', 'incoming', 'outgoing'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setCallFilter(filter)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold capitalize transition-all ${
                    callFilter === filter
                      ? filter === 'missed'
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {store.callLogs.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all call logs?')) {
                    store.clearCallLogs();
                  }
                }}
                className="text-[10px] text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                title="Clear Call History"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Call Logs List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredCallLogs.length === 0 ? (
              <div className="text-center py-16 text-slate-500 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-300">No Call History</h4>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                    When you make or receive WebRTC audio or video calls with agents, your call history will appear here.
                  </p>
                </div>
              </div>
            ) : (
              filteredCallLogs.map(log => {
                const isIncoming = log.type === 'incoming';
                const isOutgoing = log.type === 'outgoing';
                const isMissed = log.status === 'missed' || log.status === 'rejected' || log.type === 'missed';
                
                const remoteName = isIncoming || isMissed ? log.callerName : log.receiverName;
                const remoteAvatar = isIncoming || isMissed ? log.callerAvatar : log.receiverAvatar;
                const remoteId = isIncoming || isMissed ? log.callerId : log.receiverId;

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between gap-3 shadow-sm group"
                  >
                    {/* Left: Avatar & Call Details */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                        {remoteAvatar ? (
                          <img src={remoteAvatar} alt={remoteName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-400 m-auto mt-2" />
                        )}
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${
                            isMissed ? 'bg-red-500' : isIncoming ? 'bg-emerald-500' : 'bg-sky-500'
                          }`}
                        />
                      </div>

                      <div className="truncate">
                        <div className="flex items-center space-x-1.5">
                          <p className={`font-bold text-xs truncate ${isMissed ? 'text-red-400' : 'text-white'}`}>
                            {remoteName || 'Agent'}
                          </p>
                          <UserCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                        </div>

                        <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-0.5">
                          {isMissed ? (
                            <span className="flex items-center space-x-1 text-red-400 font-semibold">
                              <PhoneMissed className="w-3 h-3" />
                              <span>Missed Call</span>
                            </span>
                          ) : isIncoming ? (
                            <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                              <PhoneIncoming className="w-3 h-3" />
                              <span>Incoming ({formatDuration(log.durationSeconds)})</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-sky-400 font-semibold">
                              <PhoneOutgoing className="w-3 h-3" />
                              <span>Outgoing ({formatDuration(log.durationSeconds)})</span>
                            </span>
                          )}

                          <span>•</span>
                          <span>{log.isVideo ? 'Video' : 'Voice'}</span>
                          <span>•</span>
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Action Call Back buttons */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {/* Video Call Back */}
                      <button
                        onClick={() => onStartCall(remoteName, remoteAvatar, true, remoteId)}
                        className="p-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 border border-purple-500/30 transition-all hover:scale-105"
                        title={`Video Call ${remoteName}`}
                      >
                        <Video className="w-3.5 h-3.5" />
                      </button>

                      {/* Voice Call Back */}
                      <button
                        onClick={() => onStartCall(remoteName, remoteAvatar, false, remoteId)}
                        className="p-2 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-500/30 transition-all hover:scale-105"
                        title={`Voice Call ${remoteName}`}
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>

                      {/* Switch to Chat */}
                      <button
                        onClick={() => {
                          const room = store.getOrCreateRoomWithAgent(remoteId, remoteName);
                          handleSelectRoom(room.id);
                          setActiveTab('chats');
                        }}
                        className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all"
                        title="Chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Log */}
                      <button
                        onClick={() => store.deleteCallLog(log.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete this call log"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

    </div>
  );
};
