import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, Video, ShieldCheck, User } from 'lucide-react';
import { firestoreRealtime, WebRTCCallSession } from '../../lib/firestoreRealtime';
import { store } from '../../lib/store';

interface IncomingCallModalProps {
  onAccept: (call: WebRTCCallSession) => void;
  onDecline?: (call: WebRTCCallSession) => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ onAccept, onDecline }) => {
  const [incomingCall, setIncomingCall] = useState<WebRTCCallSession | null>(null);

  useEffect(() => {
    const uid = store.currentUser?.id;
    if (!uid || uid === 'guest' || uid === 'user-guest') return;

    const unsub = firestoreRealtime.subscribeToIncomingCalls(uid, (call) => {
      setIncomingCall(call);
    });

    return () => unsub();
  }, [store.currentUser?.id]);

  // Ringtone generator using Web Audio API
  useEffect(() => {
    if (!incomingCall) return;

    let intervalId: any;
    try {
      if (typeof window !== 'undefined') {
        const playRingTone = () => {
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.setValueAtTime(480, ctx.currentTime + 0.2);

            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

            osc.start();
            osc.stop(ctx.currentTime + 1.2);
          } catch (e) {}
        };

        playRingTone();
        intervalId = setInterval(playRingTone, 3000);
      }
    } catch (e) {}

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [incomingCall?.id]);

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
        
        {/* Glowing Avatar */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-400 bg-slate-800 shadow-xl flex items-center justify-center">
            {incomingCall.callerAvatar ? (
              <img
                src={incomingCall.callerAvatar}
                alt={incomingCall.callerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-slate-400" />
            )}
          </div>
        </div>

        {/* Caller Info */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            {incomingCall.isVideo ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
            <span>Incoming {incomingCall.isVideo ? 'Video' : 'Voice'} Call</span>
          </div>
          <h3 className="text-lg font-black text-white">{incomingCall.callerName || 'DealFast Member'}</h3>
          <p className="text-xs text-slate-400">P2P Encrypted WebRTC High Definition Call</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-6 pt-2">
          {/* Decline */}
          <button
            onClick={() => {
              firestoreRealtime.updateCallStatus(incomingCall.id, 'rejected');
              onDecline(incomingCall);
              setIncomingCall(null);
            }}
            className="flex flex-col items-center space-y-1.5 group"
          >
            <div className="w-14 h-14 rounded-full bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all transform group-hover:scale-110 shadow-lg">
              <PhoneOff className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 group-hover:text-red-400">Decline</span>
          </button>

          {/* Accept */}
          <button
            onClick={() => {
              onAccept(incomingCall);
              setIncomingCall(null);
            }}
            className="flex flex-col items-center space-y-1.5 group"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:bg-emerald-400 transition-all transform group-hover:scale-110 shadow-lg shadow-emerald-500/30 animate-bounce">
              {incomingCall.isVideo ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
            </div>
            <span className="text-[11px] font-bold text-emerald-400">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};
