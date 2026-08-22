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
  UserCheck,
  User
} from 'lucide-react';
import { ChatMessage } from '../../types';
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
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    activeRoomId || store.chatRooms[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [showRoomList, setShowRoomList] = useState(false);
  const [isOtherOnline] = useState<boolean>(true);

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
  }, [selectedRoomId, store.chatMessages[selectedRoomId]?.length]);

  // 1️⃣ Listen to real Firestore messages for selected room
  useEffect(() => {
    if (!isOpen || !selectedRoomId) return;

    // Real-time Firestore messages listener
    const unsubFirestore = firestoreRealtime.subscribeToRoomMessages(selectedRoomId, (incomingMsgs) => {
      if (incomingMsgs && incomingMsgs.length > 0) {
        const existing = store.chatMessages[selectedRoomId] || [];
        const map = new Map<string, ChatMessage>();
        existing.forEach(m => map.set(m.id, m));
        incomingMsgs.forEach(m => map.set(m.id, m));
        const merged = Array.from(map.values()).sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
        store.chatMessages[selectedRoomId] = merged;
        setTick(t => t + 1);
      }
    });

    // Mark as read in Firestore
    firestoreRealtime.markRoomMessagesAsRead(selectedRoomId, store.currentUser.id).catch(() => {});
    store.markRoomAsRead(selectedRoomId);

    return () => {
      unsubFirestore();
    };
  }, [isOpen, selectedRoomId]);

  // Listen to activeRoomId changes
  useEffect(() => {
    if (activeRoomId) {
      setSelectedRoomId(activeRoomId);
      store.markRoomAsRead(activeRoomId);
      firestoreRealtime.markRoomMessagesAsRead(activeRoomId, store.currentUser.id).catch(() => {});
    } else if (store.chatRooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(store.chatRooms[0].id);
      store.markRoomAsRead(store.chatRooms[0].id);
    }
  }, [activeRoomId, isOpen]);

  if (!isOpen) return null;

  const messages = selectedRoomId ? store.chatMessages[selectedRoomId] || [] : [];

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedRoomId) return;
    const userText = inputText.trim();
    setInputText('');
    playSound('send');

    // Send user message with real Firestore delivery & notification triggers
    store.sendMessage(selectedRoomId, userText);
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
                Real-Time Firestore
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
                  firestoreRealtime.markRoomMessagesAsRead(room.id, store.currentUser.id).catch(() => {});
                  setShowRoomList(false);
                }}
                className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected ? 'bg-orange-500/20 border border-orange-500/40 text-white' : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="relative shrink-0 w-7 h-7 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-700">
                    {participant?.avatar ? (
                      <img
                        src={participant.avatar}
                        alt={participant?.name}
                        className="w-full h-full object-cover shrink-0"
                      />
                    ) : (
                      <User className="w-4 h-4 text-slate-400" />
                    )}
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
                  <UserCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <p className="text-[10px] font-medium text-emerald-400">Online • Instant Response</p>
                </div>
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
