import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  PhoneCall,
  Video,
  CheckCheck,
  MessageSquare,
  Trash2,
  Users
} from 'lucide-react';
import { ChatRoom, ChatMessage } from '../../types';
import { store } from '../../lib/store';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoomId?: string;
  onStartCall: (agentName: string, agentAvatar?: string, isVideo?: boolean) => void;
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

  useEffect(() => {
    const unsub = store.subscribe(() => setTick(t => t + 1));
    return () => unsub();
  }, []);

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

  const currentRoom = store.chatRooms.find(r => r.id === selectedRoomId) || store.chatRooms[0];
  const messages = selectedRoomId ? store.chatMessages[selectedRoomId] || [] : [];
  const otherParticipant = currentRoom?.participants.find(p => p.id !== store.currentUser.id);

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedRoomId) return;
    store.sendMessage(selectedRoomId, inputText);
    setInputText('');
    store.markRoomAsRead(selectedRoomId);
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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] glass-card-glow border-l border-slate-800 shadow-2xl flex flex-col bg-[#0a0e1a]/95 animate-in slide-in-from-right duration-300">
      
      {/* Drawer Top Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">DealFast Instant Messenger</h3>
            <p className="text-[10px] text-slate-400">Encrypted Real-Time Chat & WebRTC Calls</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {store.chatRooms.length > 1 && (
            <button
              onClick={() => setShowRoomList(!showRoomList)}
              className={`p-2 rounded-xl text-xs font-bold border flex items-center gap-1 transition-colors ${
                showRoomList ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
              title="All Conversations"
            >
              <Users className="w-4 h-4" />
              <span className="text-[11px] font-bold">Chats ({store.chatRooms.length})</span>
            </button>
          )}
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800">
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
                  <img
                    src={participant?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'}
                    alt={participant?.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
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
          <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={otherParticipant?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full object-cover border border-slate-700"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{otherParticipant?.name || 'Verified Agent'}</p>
                <p className="text-[10px] text-amber-400">Online • Response &lt; 2 mins</p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => onStartCall(otherParticipant?.name || 'Agent', otherParticipant?.avatar, true)}
                className="p-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 border border-purple-500/30 transition-colors"
                title="WebRTC Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => onStartCall(otherParticipant?.name || 'Agent', otherParticipant?.avatar, false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
                title="WebRTC Voice Call"
              >
                <PhoneCall className="w-4 h-4 text-orange-400" />
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

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0a0e1a]/90 text-xs">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 py-10 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-700 mx-auto" />
              <p>Start conversation regarding property inspection or NOC verification.</p>
            </div>
          ) : (
            messages.map(m => {
              const isMe = m.senderId === store.currentUser.id;
              return (
                <div key={m.id} className={`flex items-end space-x-2 group ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isMe && (
                    <img
                      src={m.senderAvatar || otherParticipant?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'}
                      alt={m.senderName}
                      className="w-6 h-6 rounded-full object-cover shrink-0 mb-1"
                    />
                  )}
                  <div
                    className={`p-3 rounded-2xl max-w-[80%] space-y-1 relative ${
                      isMe
                        ? 'bg-orange-500 text-white rounded-br-none shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    <div className="flex items-center justify-end space-x-1.5 text-[9px] opacity-70 pt-0.5">
                      <span>{m.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-white" />}
                    </div>
                  </div>

                  {/* Delete Single Message Option */}
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
        </div>

        {/* Quick Question Pills */}
        {currentRoom && (
          <div className="p-2 bg-slate-950 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              'Is this price negotiable?',
              'When can we schedule a site visit?',
              'Please share NOC & tax details'
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  if (selectedRoomId) store.sendMessage(selectedRoomId, q);
                }}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input */}
        {currentRoom && (
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Write message..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500 placeholder:text-slate-500"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 rounded-xl gradient-btn text-white font-bold shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
