import React, { useEffect, useState, useRef } from 'react';
import { Phone, PhoneOff, Video, User, Volume2, Bell } from 'lucide-react';
import { firestoreRealtime, WebRTCCallSession } from '../../lib/firestoreRealtime';
import { signalingService } from '../../lib/webrtcSignaling';
import { store } from '../../lib/store';

interface IncomingCallModalProps {
  onAccept: (call: WebRTCCallSession) => void;
  onDecline?: (call: WebRTCCallSession) => void;
}

// Enterprise-grade Web Audio Telephone Bell Generator
class IncomingCallRingtone {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;
  private audioEl: HTMLAudioElement | null = null;

  public start() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Mobile vibration pattern
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([500, 250, 500, 250, 1000]);
      }
    } catch (e) {}

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }

        const playRingPair = () => {
          if (!this.isPlaying || !this.audioCtx || this.audioCtx.state === 'closed') return;
          try {
            if (this.audioCtx.state === 'suspended') {
              this.audioCtx.resume().catch(() => {});
            }
            const now = this.audioCtx.currentTime;

            const playTonePulse = (offset: number, duration: number) => {
              if (!this.audioCtx || this.audioCtx.state === 'closed') return;
              const t = now + offset;
              const osc1 = this.audioCtx.createOscillator();
              const osc2 = this.audioCtx.createOscillator();
              const gain = this.audioCtx.createGain();

              // Classic pleasant telephone bell frequencies: 523Hz (C5) + 659Hz (E5)
              osc1.type = 'sine';
              osc1.frequency.setValueAtTime(523.25, t);
              osc2.type = 'sine';
              osc2.frequency.setValueAtTime(659.25, t);

              // Phone ring envelope
              gain.gain.setValueAtTime(0, t);
              gain.gain.linearRampToValueAtTime(0.35, t + 0.04);
              gain.gain.setValueAtTime(0.35, t + duration - 0.05);
              gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

              osc1.connect(gain);
              osc2.connect(gain);
              gain.connect(this.audioCtx.destination);

              osc1.start(t);
              osc2.start(t);
              osc1.stop(t + duration);
              osc2.stop(t + duration);
            };

            // Double ring pattern
            playTonePulse(0, 0.45);
            playTonePulse(0.65, 0.45);

            // Repeat vibration
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate([400, 200, 400]);
            }
          } catch (e) {}
        };

        playRingPair();
        this.intervalId = setInterval(playRingPair, 2600);
      }
    } catch (e) {
      console.warn('AudioContext init note:', e);
    }
  }

  public unlock() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    if (this.audioEl && this.audioEl.paused) {
      this.audioEl.play().catch(() => {});
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl = null;
    }
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(0);
      }
    } catch (e) {}
  }
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ onAccept, onDecline }) => {
  const [incomingCall, setIncomingCall] = useState<WebRTCCallSession | null>(null);
  const [userId, setUserId] = useState<string>(store.currentUser?.id || '');
  const ringtoneRef = useRef<IncomingCallRingtone | null>(null);

  useEffect(() => {
    const unsubStore = store.subscribe(() => {
      const currentId = store.currentUser?.id || '';
      if (currentId !== userId) {
        setUserId(currentId);
      }
    });
    return () => unsubStore();
  }, [userId]);

  useEffect(() => {
    if (!userId || userId === 'guest' || userId === 'user-guest') return;

    // Register user with signaling server
    signalingService.registerUser(userId, {
      name: store.currentUser?.name || 'User',
      avatar: store.currentUser?.avatar || '',
      role: store.currentUser?.role || 'user'
    });

    const socket = signalingService.getSocket();

    // 1. Socket.io Incoming Call Listener
    const onSocketIncomingCall = (callData: any) => {
      if (!callData) return;
      if (callData.receiverId === userId || callData.to === userId) {
        setIncomingCall({
          id: callData.callId || callData.id || `call_${Date.now()}`,
          callerId: callData.callerId,
          callerName: callData.callerName || 'DealFast Member',
          callerAvatar: callData.callerAvatar || '',
          receiverId: userId,
          receiverName: store.currentUser?.name || 'User',
          isVideo: !!callData.isVideo,
          status: 'offering'
        });
      }
    };

    const onSocketChatMessage = (data: any) => {
      if (data && data.message) {
        try {
          const parsed = JSON.parse(data.message);
          if (parsed && parsed.type === 'INCOMING_CALL' && (parsed.receiverId === userId || parsed.to === userId)) {
            setIncomingCall({
              id: parsed.callId || `call_${Date.now()}`,
              callerId: parsed.callerId,
              callerName: parsed.callerName || 'DealFast Member',
              callerAvatar: parsed.callerAvatar || '',
              receiverId: userId,
              receiverName: store.currentUser?.name || 'User',
              isVideo: !!parsed.isVideo,
              status: 'offering'
            });
          }
        } catch (e) {}
      }
    };

    socket.on('call-user', onSocketIncomingCall);
    socket.on('incoming-call', onSocketIncomingCall);
    socket.on('chat-message', onSocketChatMessage);

    // 2. Firestore Incoming Call Listener (Backup)
    const unsub = firestoreRealtime.subscribeToIncomingCalls(userId, (call) => {
      if (call) {
        setIncomingCall(call);
      }
    });

    return () => {
      socket.off('call-user', onSocketIncomingCall);
      socket.off('incoming-call', onSocketIncomingCall);
      socket.off('chat-message', onSocketChatMessage);
      unsub();
    };
  }, [userId]);

  // Loud Ringtone generator using Web Audio API
  useEffect(() => {
    if (!incomingCall) {
      if (ringtoneRef.current) {
        ringtoneRef.current.stop();
        ringtoneRef.current = null;
      }
      return;
    }

    const ring = new IncomingCallRingtone();
    ringtoneRef.current = ring;
    ring.start();

    const handleUserInteraction = () => {
      ring.unlock();
    };

    window.addEventListener('pointerdown', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('click', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      ring.stop();
      ringtoneRef.current = null;
    };
  }, [incomingCall?.id]);

  if (!incomingCall) return null;

  const handleDeclineCall = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (ringtoneRef.current) ringtoneRef.current.stop();
    firestoreRealtime.updateCallStatus(incomingCall.id, 'rejected');
    try {
      store.addCallLog({
        callId: incomingCall.id,
        callerId: incomingCall.callerId,
        callerName: incomingCall.callerName,
        callerAvatar: incomingCall.callerAvatar,
        receiverId: store.currentUser?.id || 'me',
        receiverName: store.currentUser?.name || 'You',
        receiverAvatar: store.currentUser?.avatar,
        isVideo: incomingCall.isVideo,
        type: 'missed',
        status: 'rejected',
        durationSeconds: 0
      });
    } catch (err) {}
    if (onDecline) onDecline(incomingCall);
    setIncomingCall(null);
  };

  const handleAcceptCall = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (ringtoneRef.current) ringtoneRef.current.stop();
    onAccept(incomingCall);
    setIncomingCall(null);
  };

  return (
    <div
      onClick={() => ringtoneRef.current?.unlock()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overscroll-contain touch-none select-none"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          ringtoneRef.current?.unlock();
        }}
        className="bg-slate-900 border border-slate-700/80 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center space-y-5 animate-in zoom-in-95 touch-auto"
      >
        
        {/* Animated Ringing Pulse & Avatar */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping duration-1000" />
          <div className="absolute -inset-2 rounded-full bg-emerald-500/15 animate-pulse" />
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
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            {incomingCall.isVideo ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            <span>Incoming {incomingCall.isVideo ? 'Video Call' : 'Voice Call'}</span>
          </div>
          <h3 className="text-xl font-black text-white">{incomingCall.callerName || 'DealFast Member'}</h3>
          <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
            <Volume2 className="w-4 h-4 animate-bounce text-emerald-400" />
            <span>Ringing...</span>
          </p>
        </div>

        {/* 1-Tap Tap Action Buttons (No dragging required) */}
        <div className="flex items-center justify-center space-x-8 pt-3">
          {/* 1-Tap Decline Button */}
          <button
            type="button"
            onClick={handleDeclineCall}
            onTouchEnd={handleDeclineCall}
            className="flex flex-col items-center space-y-2 group cursor-pointer active:scale-95 transition-transform select-none touch-manipulation"
          >
            <div className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-all">
              <PhoneOff className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-red-400">Decline</span>
          </button>

          {/* 1-Tap Accept Button */}
          <button
            type="button"
            onClick={handleAcceptCall}
            onTouchEnd={handleAcceptCall}
            className="flex flex-col items-center space-y-2 group cursor-pointer active:scale-95 transition-transform select-none touch-manipulation"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-bounce transition-all">
              {incomingCall.isVideo ? <Video className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
            </div>
            <span className="text-xs font-bold text-emerald-400">Accept</span>
          </button>
        </div>

      </div>
    </div>
  );
};
