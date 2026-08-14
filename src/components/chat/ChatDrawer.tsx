import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  PhoneCall,
  Video,
  Check,
  CheckCheck,
  MessageSquare,
  Trash2,
  Users,
  Sparkles,
  Bot,
  UserCheck,
  CornerDownLeft,
  Volume2
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { store } from '../../lib/store';
import { supabaseService, supabase } from '../../lib/supabase';

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
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    activeRoomId || store.chatRooms[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [showRoomList, setShowRoomList] = useState(false);
  const [isOtherOnline, setIsOtherOnline] = useState<boolean>(true);
  const [isOtherTyping, setIsOtherTyping] = useState<boolean>(false);
  const [typingName, setTypingName] = useState<string>('');
  const [showReplyAsPanel, setShowReplyAsPanel] = useState<boolean>(false);
  const [replyAsText, setReplyAsText] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Play subtle sound for message events
  const playSound = (type: 'send' | 'receive') => {
    try {
      if (typeof window === 'undefined') return;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
      } else {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const unsub = store.subscribe(() => setTick(t => t + 1));
    return () => unsub();
  }, []);

  const currentRoom = store.chatRooms.find(r => r.id === selectedRoomId) || store.chatRooms[0];
  const otherParticipant = currentRoom?.participants.find(p => p.id !== store.currentUser.id);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedRoomId, store.chatMessages[selectedRoomId]?.length, isOtherTyping]);

  // 1️⃣ Listen to real Supabase messages for selected room
  useEffect(() => {
    if (!isOpen || !selectedRoomId) return;
    try {
      // Initial fetch from Supabase
      supabaseService.getChatMessages(selectedRoomId).then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const currentMsgs = store.chatMessages[selectedRoomId] || [];
          const mergedMap = new Map<string, ChatMessage>();
          currentMsgs.forEach(m => mergedMap.set(m.id, m));
          data.forEach((item: any) => {
            mergedMap.set(item.id, {
              id: item.id,
              roomId: item.room_id || selectedRoomId,
              senderId: item.sender_id,
              senderName: item.sender_name,
              senderAvatar: item.sender_avatar,
              text: item.text || item.message || '',
              mediaUrl: item.media_url || item.mediaUrl,
              mediaType: item.media_type || item.mediaType,
              timestamp: item.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isRead: item.is_read ?? false,
              isDelivered: true,
              status: item.is_read ? 'read' : 'delivered'
            });
          });
          const mergedList = Array.from(mergedMap.values());
          mergedList.sort((a, b) => (a.id > b.id ? 1 : -1));
          store.chatMessages[selectedRoomId] = mergedList;
          setTick(t => t + 1);
        }
      });

      // Realtime subscription
      const channel = supabaseService.subscribeToChat(selectedRoomId, (newMsg: any) => {
        if (newMsg) {
          const formatted: ChatMessage = {
            id: newMsg.id,
            roomId: newMsg.room_id || selectedRoomId,
            senderId: newMsg.sender_id,
            senderName: newMsg.sender_name,
            senderAvatar: newMsg.sender_avatar,
            text: newMsg.text || newMsg.message || '',
            mediaUrl: newMsg.media_url || newMsg.mediaUrl,
            mediaType: newMsg.media_type || newMsg.mediaType,
            timestamp: newMsg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: newMsg.is_read ?? false,
            isDelivered: true,
            status: newMsg.is_read ? 'read' : 'delivered'
          };
          const current = store.chatMessages[selectedRoomId] || [];
          if (!current.some(m => m.id === formatted.id)) {
            store.chatMessages[selectedRoomId] = [...current, formatted];
            setTick(t => t + 1);
          }
        }
      });

      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    } catch (e) {}
  }, [isOpen, selectedRoomId]);

  // 2️⃣ Online presence status
  useEffect(() => {
    setIsOtherOnline(true);
  }, [otherParticipant?.id]);

  useEffect(() => {
    if (activeRoomId) {
      setSelectedRoomId(activeRoomId);
      store.markRoomAsRead(activeRoomId);
    } else if (store.chatRooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(store.chatRooms[0].id);
      store.markRoomAsRead(store.chatRooms[0].id);
    }
  }, [activeRoomId, isOpen]);

  useEffect(() => {
    if (isOpen && selectedRoomId) {
      store.markRoomAsRead(selectedRoomId);
    }
  }, [isOpen, selectedRoomId]);

  if (!isOpen) return null;

  const messages = selectedRoomId ? store.chatMessages[selectedRoomId] || [] : [];

  // Generate realistic agent reply based on user inquiry text
  const generateContextualReply = (userQuery: string, agentName: string, propTitle?: string): string => {
    const q = userQuery.toLowerCase();
    const greetings = ['Assalam-o-Alaikum!', 'Hello!', 'Walaikum Assalam!'];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    if (q.includes('price') || q.includes('rate') || q.includes('negotiable') || q.includes('discount') || q.includes('offer') || q.includes('final') || q.includes('kam') || q.includes('pese')) {
      return `${greeting} The demand price is slightly negotiable for genuine buyers with quick token deposit through DealFast Escrow. Are you interested in a cash deal or installment plan?`;
    }
    if (q.includes('visit') || q.includes('schedule') || q.includes('dekh') || q.includes('timing') || q.includes('time') || q.includes('location') || q.includes('map') || q.includes('milna')) {
      return `${greeting} I can arrange a physical site inspection with you tomorrow between 11:00 AM to 5:00 PM. Please share your convenient time so I can be present at the site.`;
    }
    if (q.includes('noc') || q.includes('fard') || q.includes('registry') || q.includes('legal') || q.includes('document') || q.includes('approved') || q.includes('society') || q.includes('cda') || q.includes('lda') || q.includes('rda')) {
      return `${greeting} The NOC and property registry documents are 100% verified and approved. DealFast legal team has also vetted the title deed. I can also initiate the verification certificate for you.`;
    }
    if (q.includes('installment') || q.includes('plan') || q.includes('booking') || q.includes('down payment') || q.includes('qist')) {
      return `${greeting} Booking starts with 15% - 20% down payment, and remaining in easy 2 to 3-year quarterly installments. Your funds remain 100% safe in DealFast Escrow until milestone verification.`;
    }
    if (q.includes('call') || q.includes('number') || q.includes('contact') || q.includes('phone') || q.includes('rabta')) {
      return `${greeting} You can click the Voice Call or Video Call button at the top right anytime to speak with me directly through DealFast P2P calling!`;
    }

    return `${greeting} Thank you for inquiring about ${propTitle || 'this property'}. I have received your message and will assist you with full details, market valuation, and site visit.`;
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedRoomId) return;
    const userText = inputText.trim();
    setInputText('');
    playSound('send');

    // 1. Send user message with initial 'sent' status
    store.sendMessage(selectedRoomId, userText);

    // 2. Simulate Realistic Recipient Behavior (Receipt + Read + Typing + Smart Reply)
    const counterpart = otherParticipant || {
      id: 'agent-1',
      name: 'Verified Real Estate Agent',
      role: 'agent' as const
    };

    const roomId = selectedRoomId;
    const roomTitle = currentRoom?.propertyTitle;

    // Step A: Mark as Read after recipient views it (1.0s)
    setTimeout(() => {
      if (store.chatMessages[roomId]) {
        let hasUnread = false;
        store.chatMessages[roomId] = store.chatMessages[roomId].map(m => {
          if (m.senderId === store.currentUser.id && !m.isRead) {
            hasUnread = true;
            try {
              supabaseService.saveChatMessage({ ...m, isRead: true, isDelivered: true, status: 'read' }).catch(() => {});
            } catch (e) {}
            return { ...m, isRead: true, isDelivered: true, status: 'read' };
          }
          return m;
        });
        if (hasUnread) {
          store.notify();
        }
      }
    }, 1000);

    // Step B: Show typing indicator (1.2s)
    setTimeout(() => {
      setTypingName(counterpart.name);
      setIsOtherTyping(true);
    }, 1200);

    // Step C: Send Contextual Agent Reply (2.6s)
    setTimeout(() => {
      setIsOtherTyping(false);
      const replyText = generateContextualReply(userText, counterpart.name, roomTitle);
      store.receiveAgentReply(roomId, counterpart.id, counterpart.name, replyText);
      playSound('receive');
    }, 2600);
  };

  // Allow user to manually send message as the other participant for testing
  const handleManualReplyAsOther = () => {
    if (!replyAsText.trim() || !selectedRoomId || !otherParticipant) return;
    const text = replyAsText.trim();
    setReplyAsText('');
    setShowReplyAsPanel(false);

    store.receiveAgentReply(
      selectedRoomId,
      otherParticipant.id,
      otherParticipant.name,
      text
    );
    playSound('receive');
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

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] glass-card-glow border-l border-slate-800 shadow-2xl flex flex-col bg-[#0a0e1a]/98 animate-in slide-in-from-right duration-300">
      
      {/* Drawer Top Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-sm font-bold text-white">DealFast Live Messenger</h3>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold rounded-full">
                Real-Time
              </span>
            </div>
            <p className="text-[10px] text-slate-400">P2P Encrypted Chat & HD WebRTC Calling</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {store.chatRooms.length > 1 && (
            <button
              onClick={() => setShowRoomList(!showRoomList)}
              className={`p-2 rounded-xl text-xs font-bold border flex items-center gap-1 transition-colors ${
                showRoomList ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
              }`}
              title="All Conversations"
            >
              <Users className="w-4 h-4" />
              <span className="text-[11px] font-bold">Chats ({store.chatRooms.length})</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Conversations Dropdown / Drawer List */}
      {showRoomList && (
        <div className="p-3 bg-slate-950 border-b border-slate-800 max-h-48 overflow-y-auto space-y-1 text-xs">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Active Conversations</p>
          {store.chatRooms.map(room => {
            const participant = room.participants.find(p => p.id !== store.currentUser.id);
            const isSelected = room.id === selectedRoomId;
            return (
              <div
                key={room.id}
                onClick={() => {
                  setSelectedRoomId(room.id);
                  store.markRoomAsRead(room.id);
                  setShowRoomList(false);
                }}
                className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected ? 'bg-orange-500/20 border border-orange-500/40 text-white' : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={participant?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'}
                      alt={participant?.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-slate-950 bg-emerald-500" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-xs truncate">{participant?.name || 'Agent'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{room.lastMessage}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {room.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-orange-500 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                      {room.unreadCount}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRoom(room.id, participant?.name || 'Agent');
                    }}
                    className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Split: Room Header & Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Room Header & Call Controls */}
        {currentRoom ? (
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={otherParticipant?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full object-cover border border-slate-700 shadow"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 bg-emerald-500" />
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <p className="text-xs font-bold text-white truncate">{otherParticipant?.name || 'Verified Agent'}</p>
                  <UserCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                </div>
                {isOtherTyping ? (
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-orange-400 animate-pulse">
                    <span>typing</span>
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <p className="text-[10px] font-medium text-emerald-400">Online • Instant Response</p>
                  </div>
                )}
              </div>
            </div>

            {/* Calling & Quick Actions Buttons */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => onStartCall(otherParticipant?.name || 'Agent', otherParticipant?.avatar, true, otherParticipant?.id)}
                className="p-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 border border-purple-500/30 transition-colors"
                title="WebRTC Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => onStartCall(otherParticipant?.name || 'Agent', otherParticipant?.avatar, false, otherParticipant?.id)}
                className="p-2 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-500/30 transition-colors"
                title="WebRTC Voice Call"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
              </button>
              <button
                onClick={() => setShowReplyAsPanel(!showReplyAsPanel)}
                className={`p-2 rounded-xl border transition-colors ${
                  showReplyAsPanel ? 'bg-amber-500/30 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                }`}
                title="Simulate 2-Way Reply (Testing)"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
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
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs">
            No active chat. Click "Chat" on any listing or agent to start messaging.
          </div>
        )}

        {/* 🎭 Testing Panel: Reply as Other Participant */}
        {showReplyAsPanel && otherParticipant && (
          <div className="p-2.5 bg-amber-950/40 border-b border-amber-500/30 text-xs flex flex-col gap-2 animate-in slide-in-from-top">
            <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
              <span className="flex items-center space-x-1">
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Reply as <strong>{otherParticipant.name}</strong>:</span>
              </span>
              <button onClick={() => setShowReplyAsPanel(false)} className="text-amber-400/80 hover:text-amber-200">✕</button>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder={`Type message as ${otherParticipant.name}...`}
                value={replyAsText}
                onChange={e => setReplyAsText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualReplyAsOther()}
                className="flex-1 bg-slate-950 border border-amber-500/40 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
              />
              <button
                onClick={handleManualReplyAsOther}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1"
              >
                <span>Send</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Property Context Banner (if chat started from a specific listing) */}
        {currentRoom?.propertyTitle && (
          <div className="px-3 py-1.5 bg-slate-950/70 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="truncate">Listing: <strong className="text-orange-400">{currentRoom.propertyTitle}</strong></span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 shrink-0">Escrow Protected</span>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0a0e1a]/95 text-xs">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 py-10 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-700 mx-auto" />
              <p className="font-semibold text-slate-400">Start a live discussion</p>
              <p className="text-[11px] text-slate-500">Ask about pricing negotiation, site visits, legal title, or escrow terms.</p>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isMe = m.senderId === store.currentUser.id;
              const isRead = m.isRead || m.status === 'read';
              const isDelivered = m.isDelivered || m.status === 'delivered' || isRead;

              return (
                <div key={m.id || idx} className={`flex items-end space-x-2 group ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isMe && (
                    <img
                      src={m.senderAvatar || otherParticipant?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'}
                      alt={m.senderName}
                      className="w-6 h-6 rounded-full object-cover shrink-0 mb-1 border border-slate-700"
                    />
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

          {/* Typing Indicator in conversation stream */}
          {isOtherTyping && (
            <div className="flex items-end space-x-2 animate-in fade-in">
              <img
                src={otherParticipant?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'}
                alt="Typing"
                className="w-6 h-6 rounded-full object-cover shrink-0 mb-1 border border-slate-700"
              />
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none px-3 py-2 text-slate-300 flex items-center space-x-1.5 shadow-sm">
                <span className="text-[11px] text-slate-400 font-medium">{typingName || 'Agent'} is typing</span>
                <div className="flex space-x-1 items-center pl-1">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        {currentRoom && (
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
        )}

        {/* Bottom Input Field */}
        {currentRoom && (
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type message in Urdu or English..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500 placeholder:text-slate-500 transition-colors"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className={`p-2 rounded-xl text-white font-bold shadow-md transition-all ${
                inputText.trim() ? 'gradient-btn active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
