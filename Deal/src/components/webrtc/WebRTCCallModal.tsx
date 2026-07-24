import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, ShieldCheck, Sparkles } from 'lucide-react';

interface WebRTCCallModalProps {
  isOpen: boolean;
  agentName: string;
  agentAvatar?: string;
  isVideo?: boolean;
  onEndCall: () => void;
}

export const WebRTCCallModal: React.FC<WebRTCCallModalProps> = ({
  isOpen,
  agentName,
  agentAvatar,
  isVideo = true,
  onEndCall
}) => {
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(!isVideo);
  const [callSeconds, setCallSeconds] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isOpen) {
      timer = setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in">
      <div className="glass-card-glow w-full max-w-lg rounded-3xl p-6 border border-purple-500/30 text-center relative overflow-hidden shadow-2xl space-y-6">
        
        {/* Call Security Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>WebRTC P2P Encrypted Session</span>
        </div>

        {/* Video / Avatar Canvas Box */}
        <div className="relative h-64 w-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
          {!cameraOff ? (
            <div className="w-full h-full relative">
              <img
                src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200"
                alt="Agent Video Stream"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1" />
                <span>HD Video Stream</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3">
              <img
                src={agentAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'}
                alt={agentName}
                className="w-24 h-24 rounded-full border-4 border-orange-500 object-cover shadow-2xl animate-pulse"
              />
              <p className="text-sm font-bold text-white">{agentName}</p>
            </div>
          )}
        </div>

        {/* Call Info */}
        <div>
          <h3 className="text-base font-bold text-white">{agentName}</h3>
          <p className="text-xs text-amber-400 font-mono mt-1 font-bold">{formatTime(callSeconds)}</p>
        </div>

        {/* Control Buttons Bar */}
        <div className="flex items-center justify-center space-x-4 pt-2">
          {/* Mute Mic */}
          <button
            onClick={() => setMicMuted(!micMuted)}
            className={`p-3.5 rounded-2xl border transition-all ${
              micMuted ? 'bg-red-600/20 text-red-400 border-red-500' : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call */}
          <button
            onClick={onEndCall}
            className="p-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/30 transition-all transform hover:scale-105"
            title="Hang Up"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Camera Toggle */}
          <button
            onClick={() => setCameraOff(!cameraOff)}
            className={`p-3.5 rounded-2xl border transition-all ${
              cameraOff ? 'bg-red-600/20 text-red-400 border-red-500' : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {cameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
        </div>

      </div>
    </div>
  );
};
