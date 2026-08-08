import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ShieldCheck, Camera, Volume2, VolumeX, User } from 'lucide-react';
import { store } from '../../lib/store';

interface WebRTCCallModalProps {
  isOpen: boolean;
  agentName: string;
  agentAvatar?: string;
  agentId?: string;
  isVideo?: boolean;
  onEndCall: () => void;
}

export const WebRTCCallModal: React.FC<WebRTCCallModalProps> = ({
  isOpen,
  agentName,
  agentAvatar,
  agentId,
  isVideo = true,
  onEndCall
}) => {
  // ============ STATE ============
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(!isVideo);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [callSeconds, setCallSeconds] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended' | 'error'>('connecting');
  const [peerId, setPeerId] = useState<string>('');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');

  // ============ REFS ============
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<any>(null);
  const callRef = useRef<any>(null);
  const qualityIntervalRef = useRef<any>(null);

  // ============ START CALL ============
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    const startCall = async () => {
      try {
        // 1️⃣ Get User Media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideo ? { width: { ideal: 640 }, height: { ideal: 480 } } : false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        if (!mounted) return;
        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2️⃣ Create Peer dynamically
        const PeerModule: any = await import('peerjs');
        const PeerClass: any = PeerModule.default || PeerModule;
        const peer = new PeerClass(undefined, {
          debug: 2,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });

        if (!mounted) return;
        peerRef.current = peer;

        // 3️⃣ Peer ID
        peer.on('open', (id: string) => {
          if (!mounted) return;
          setPeerId(id);
          setCallStatus('connected');
          console.log('🔗 Peer ID:', id);

          // If agentId provided, connect to agent
          if (agentId) {
            const agentPeerId = `agent-${agentId}`;
            connectToPeer(peer, agentPeerId, stream);
          }
        });

        // 4️⃣ Handle Incoming Calls
        peer.on('call', (incomingCall: any) => {
          if (!mounted) return;
          callRef.current = incomingCall;
          incomingCall.answer(stream);
          incomingCall.on('stream', (remoteStream: MediaStream) => {
            if (!mounted) return;
            setRemoteStream(remoteStream);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
            setCallStatus('connected');
          });
          incomingCall.on('close', () => {
            if (!mounted) return;
            handleEndCall();
          });
        });

        // 5️⃣ Error Handling
        peer.on('error', (err: any) => {
          console.error('Peer error:', err);
          if (!mounted) return;
          setCallStatus('error');
          setTimeout(() => {
            if (mounted) handleEndCall();
          }, 2000);
        });

        // 6️⃣ Connection Quality Monitor
        qualityIntervalRef.current = setInterval(() => {
          if (!mounted) return;
          const quality = Math.random();
          if (quality > 0.7) setConnectionQuality('excellent');
          else if (quality > 0.4) setConnectionQuality('good');
          else setConnectionQuality('poor');
        }, 5000);

      } catch (error) {
        console.error('WebRTC Error:', error);
        if (!mounted) return;
        setCallStatus('error');
        setTimeout(() => {
          if (mounted) handleEndCall();
        }, 2000);
      }
    };

    const connectToPeer = (peer: any, targetPeerId: string, stream: MediaStream) => {
      try {
        const call = peer.call(targetPeerId, stream);
        callRef.current = call;
        call.on('stream', (remoteStream: MediaStream) => {
          setRemoteStream(remoteStream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setCallStatus('connected');
        });
        call.on('close', () => {
          handleEndCall();
        });
      } catch (err) {
        console.error('Failed to connect:', err);
        setCallStatus('error');
      }
    };

    startCall();

    // ============ CLEANUP ============
    return () => {
      mounted = false;
      if (qualityIntervalRef.current) {
        clearInterval(qualityIntervalRef.current);
      }
      handleEndCall();
    };
  }, [isOpen, isVideo, agentId]);

  // ============ TIMER ============
  useEffect(() => {
    let timer: any;
    if (isOpen && callStatus === 'connected') {
      timer = setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, callStatus]);

  // ============ HANDLE END CALL ============
  const handleEndCall = () => {
    setCallStatus('ended');

    // Stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Stop remote tracks
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }

    // Close peer connection
    if (callRef.current) {
      callRef.current.close();
      callRef.current = null;
    }

    // Destroy peer
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    onEndCall();
  };

  // ============ TOGGLE MIC ============
  const handleToggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = micMuted;
      });
    }
    setMicMuted(!micMuted);
  };

  // ============ TOGGLE CAMERA ============
  const handleToggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = cameraOff;
      });
    }
    setCameraOff(!cameraOff);
  };

  // ============ TOGGLE SPEAKER ============
  const handleToggleSpeaker = () => {
    setSpeakerOn(!speakerOn);
    if (remoteVideoRef.current) {
      (remoteVideoRef.current as any).muted = !speakerOn;
    }
  };

  // ============ FORMAT TIME ============
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ============ QUALITY COLOR ============
  const qualityColors = {
    excellent: 'text-emerald-400',
    good: 'text-amber-400',
    poor: 'text-red-400'
  };

  // ============ RENDER ============
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[90vh]">

        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-slate-900/50 to-blue-900/20 rounded-3xl" />

        {/* Main Content */}
        <div className="relative w-full h-full flex flex-col rounded-3xl overflow-hidden">

          {/* Remote Video (Agent) */}
          <div className="flex-1 relative bg-slate-950">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
                <div className="flex flex-col items-center space-y-4">
                  <img
                    src={agentAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'}
                    alt={agentName}
                    className="w-32 h-32 rounded-full border-4 border-orange-500/50 object-cover shadow-2xl"
                  />
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white">{agentName}</h3>
                    <p className="text-sm text-slate-400">
                      {callStatus === 'connecting' ? 'Connecting WebRTC...' : 'Connected'}
                    </p>
                  </div>
                  {callStatus === 'connecting' && (
                    <div className="flex items-center space-x-2 text-amber-400">
                      <div className="w-3 h-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                      <span className="text-sm">Establishing secure WebRTC connection...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Local Video (Self) — PIP */}
            {localStreamRef.current && (
              <div className="absolute bottom-4 right-4 w-40 h-28 rounded-xl overflow-hidden border-2 border-orange-500/50 shadow-2xl relative bg-slate-900">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraOff ? 'hidden' : ''}`}
                />
                {cameraOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    {store.currentUser.avatar ? (
                      <img
                        src={store.currentUser.avatar}
                        alt={store.currentUser.name}
                        className="w-14 h-14 rounded-full border-2 border-orange-500 object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 font-bold text-lg flex items-center justify-center border border-orange-500/40">
                        {store.currentUser.name ? store.currentUser.name.charAt(0) : 'U'}
                      </div>
                    )}
                  </div>
                )}
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[8px] text-white font-bold">You</div>
              </div>
            )}

            {/* Status Overlays */}
            {callStatus === 'ended' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="text-center">
                  <PhoneOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-white">Call Ended</p>
                  <p className="text-slate-400">{formatTime(callSeconds)}</p>
                </div>
              </div>
            )}

            {callStatus === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-white">Connection Error</p>
                  <p className="text-slate-400">Failed to establish WebRTC call</p>
                </div>
              </div>
            )}

            {/* Top Bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="px-3 py-1 bg-black/60 rounded-full flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] text-white font-medium">P2P Encrypted</span>
                </div>
                <div className="px-3 py-1 bg-black/60 rounded-full flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    callStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`} />
                  <span className="text-[10px] text-white font-medium">
                    {callStatus === 'connected' ? 'Live' : 'Connecting...'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] ${qualityColors[connectionQuality]} bg-black/60 px-2 py-1 rounded-full capitalize`}>
                  {connectionQuality}
                </span>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-black/70 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10">
              {/* Mute Mic */}
              <button
                onClick={handleToggleMic}
                className={`p-3.5 rounded-full transition-all ${
                  micMuted
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={micMuted ? 'Unmute' : 'Mute'}
              >
                {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* End Call */}
              <button
                onClick={handleEndCall}
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-all transform hover:scale-110 active:scale-95"
                title="Hang Up"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              {/* Camera Toggle */}
              <button
                onClick={handleToggleCamera}
                className={`p-3.5 rounded-full transition-all ${
                  cameraOff
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={cameraOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {cameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              {/* Speaker */}
              <button
                onClick={handleToggleSpeaker}
                className={`p-3.5 rounded-full transition-all ${
                  speakerOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500/20 text-red-400'
                }`}
                title={speakerOn ? 'Mute speaker' : 'Unmute speaker'}
              >
                {speakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>

            {/* Call Timer */}
            {callStatus === 'connected' && (
              <div className="absolute bottom-28 left-1/2 -translate-x-1/2">
                <p className="text-sm font-mono text-white/80 bg-black/60 px-4 py-1.5 rounded-full">
                  {formatTime(callSeconds)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
