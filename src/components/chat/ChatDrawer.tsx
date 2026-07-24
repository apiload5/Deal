import React, { useState } from 'react';
import {
  X,
  Send,
  Image as ImageIcon,
  PhoneCall,
  Video,
  ShieldCheck,
  CheckCheck,
  Paperclip,
  Smile,
  User as UserIcon,
  MessageSquare
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
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    activeRoomId || store.chatRooms[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const currentRoom = store.chatRooms.find(r => r.id === selectedRoomId) || store.chatRooms[0];
  const messages = selectedRoomId ? store.chatMessages[selectedRoomId] || [] : [];
  const otherParticipant = currentRoom?.participants.find(p => p.id !== store.currentUser.id);

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedRoomId) return;
    store.sendMessage(selectedRoomId, inputText);
    setInputText('');
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
            <h3 className="text-sm font-bold text-white">Deal.pk Instant Messenger</h3>
            <p className="text-[10px] text-slate-400">Encrypted Real-Time Chat & WebRTC</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Split: Room List or Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Room Header & Call Controls */}
        {currentRoom && (
          <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="relative">
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
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0a0e1a]/90 text-xs">
          {messages.length === 0 ? (
            <p className="text-center text-slate-500 py-10">Start conversation regarding property inspection or NOC.</p>
          ) : (
            messages.map(m => {
              const isMe = m.senderId === store.currentUser.id;
              return (
                <div key={m.id} className={`flex items-end space-x-2 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div
                    className={`p-3 rounded-2xl max-w-[80%] space-y-1 ${
                      isMe
                        ? 'bg-orange-500 text-white rounded-br-none shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    <div className="flex items-center justify-end space-x-1 text-[9px] opacity-70">
                      <span>{m.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Question Pills */}
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

        {/* Chat Input */}
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

      </div>
    </div>
  );
};
