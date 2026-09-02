import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ShieldCheck,
  Volume2,
  VolumeX,
  Wifi,
  Loader2,
  User,
  AlertCircle,
  Activity,
  PhoneCall,
  Volume1
} from 'lucide-react';
import { store } from '../../lib/store';
import { firestoreRealtime } from '../../lib/firestoreRealtime';
import { signalingService } from '../../lib/webrtcSignaling';

interface WebRTCCallModalProps {
  isOpen: boolean;
  agentName: string;
  agentAvatar?: string;
  agentId?: string;
  isVideo?: boolean;
  callSessionId?: string;
  isIncomingAnswer?: boolean;
  onEndCall: () => void;
}

// Enterprise-Grade STUN / TURN Configuration for Seamless NAT Traversal
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp'
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require'
};

// Outgoing Telephone Ringback Tone Generator (Standard 440Hz + 480Hz dial pulse)
class RingbackToneGenerator {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;

  public start() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      this.audioCtx = new AudioCtxClass();

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      const playBurst = () => {
        if (!this.isPlaying || !this.audioCtx || this.audioCtx.state === 'closed') return;
        try {
          if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
          }
          const now = this.audioCtx.currentTime;
          const osc1 = this.audioCtx.createOscillator();
          const osc2 = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(440, now);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(480, now);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
          gain.gain.setValueAtTime(0.15, now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 1.4);
          osc2.stop(now + 1.4);
        } catch (e) {}
      };

      playBurst();
      this.intervalId = setInterval(playBurst, 3500);
    } catch (e) {}
  }

  public unlock() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
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
  }
}

export const WebRTCCallModal: React.FC<WebRTCCallModalProps> = ({
  isOpen,
  agentName,
  agentAvatar,
  agentId,
  isVideo = true,
  callSessionId,
  isIncomingAnswer = false,
  onEndCall
}) => {
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(!isVideo);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [remoteVideoAvailable, setRemoteVideoAvailable] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [networkQuality, setNetworkQuality] = useState<'HD' | 'Auto' | 'Good'>('HD');
  const [audioAutoplayBlocked, setAudioAutoplayBlocked] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const activeCallIdRef = useRef<string>(callSessionId || '');
  const isSettingUpRef = useRef<boolean>(false);
  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);
  const cleanupFnsRef = useRef<(() => void)[]>([]);
  const ringbackToneRef = useRef<RingbackToneGenerator | null>(null);
  const speakerOnRef = useRef<boolean>(true);

  speakerOnRef.current = speakerOn;

  // Outgoing Ringback tone management (Caller hears dial tone until connected)
  useEffect(() => {
    if (isOpen && !isIncomingAnswer && callStatus === 'connecting') {
      const ringback = new RingbackToneGenerator();
      ringbackToneRef.current = ringback;
      ringback.start();

      const unlockAudio = () => ringback.unlock();
      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });

      return () => {
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        ringback.stop();
        ringbackToneRef.current = null;
      };
    } else {
      if (ringbackToneRef.current) {
        ringbackToneRef.current.stop();
        ringbackToneRef.current = null;
      }
    }
  }, [isOpen, isIncomingAnswer, callStatus]);

  // Duration Timer
  useEffect(() => {
    let timer: any;
    if (isOpen && callStatus === 'connected') {
      timer = setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, callStatus]);

  const cleanupSession = useCallback(() => {
    if (ringbackToneRef.current) {
      ringbackToneRef.current.stop();
      ringbackToneRef.current = null;
    }

    // Run all registered listener cleanup fns
    cleanupFnsRef.current.forEach(fn => {
      try { fn(); } catch (e) {}
    });
    cleanupFnsRef.current = [];

    // Stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => {
        try { t.stop(); } catch (e) {}
      });
      localStreamRef.current = null;
    }

    // Stop remote tracks
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(t => {
        try { t.stop(); } catch (e) {}
      });
      remoteStreamRef.current = null;
    }

    // Close PeerConnection
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {}
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;

    iceCandidatesQueue.current = [];
    isSettingUpRef.current = false;
    setRemoteVideoAvailable(false);
    setAudioAutoplayBlocked(false);
  }, []);

  const handleHangup = useCallback(() => {
    const currentId = activeCallIdRef.current;
    if (currentId) {
      signalingService.endCall(currentId);
      firestoreRealtime.updateCallStatus(currentId, 'ended').catch(() => {});
    }

    // Record to Call Logs & History
    try {
      store.addCallLog({
        callId: currentId || `call-${Date.now()}`,
        callerId: isIncomingAnswer ? (agentId || 'remote-agent') : store.currentUser.id,
        callerName: isIncomingAnswer ? (agentName || 'Agent') : store.currentUser.name,
        callerAvatar: isIncomingAnswer ? agentAvatar : store.currentUser.avatar,
        receiverId: isIncomingAnswer ? store.currentUser.id : (agentId || 'remote-agent'),
        receiverName: isIncomingAnswer ? store.currentUser.name : (agentName || 'Agent'),
        receiverAvatar: isIncomingAnswer ? store.currentUser.avatar : agentAvatar,
        isVideo: isVideo,
        type: isIncomingAnswer ? 'incoming' : 'outgoing',
        status: callStatus === 'connected' ? 'ended' : 'missed',
        durationSeconds: callSeconds
      });
    } catch (e) {}

    cleanupSession();
    setCallStatus('ended');
    onEndCall();
  }, [cleanupSession, onEndCall, agentId, agentName, agentAvatar, isIncomingAnswer, isVideo, callStatus, callSeconds]);

  const processIceQueue = (pc: RTCPeerConnection) => {
    while (iceCandidatesQueue.current.length > 0) {
      const candidate = iceCandidatesQueue.current.shift();
      if (candidate) {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
    }
  };

  // Low-latency Media Capture
  const getLocalStream = async (wantVideo: boolean): Promise<MediaStream | null> => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: wantVideo ? {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: 'user'
        } : false
      };
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e) {
      console.warn('Fallback to audio only media capture:', e);
      try {
        return await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        });
      } catch (audioErr) {
        console.error('Microphone access denied:', audioErr);
        return null;
      }
    }
  };

  // Explicit audio playback resume trigger
  const triggerAudioPlay = useCallback(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !speakerOnRef.current;
      remoteAudioRef.current.play().then(() => {
        setAudioAutoplayBlocked(false);
      }).catch(err => {
        console.warn('Audio play attempt blocked:', err);
        setAudioAutoplayBlocked(true);
      });
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.play().catch(() => {});
    }
  }, []);

  // Main Call Initialization (Run ONCE per open session)
  useEffect(() => {
    if (!isOpen) {
      cleanupSession();
      return;
    }

    let isMounted = true;
    setCallStatus('connecting');
    setErrorMessage('');
    setCallSeconds(0);
    setMicMuted(false);
    setCameraOff(!isVideo);
    setSpeakerOn(true);
    setRemoteVideoAvailable(false);
    setAudioAutoplayBlocked(false);

    const initCall = async () => {
      if (isSettingUpRef.current) return;
      isSettingUpRef.current = true;

      try {
        const myUser = store.currentUser;
        const targetUserId = agentId || 'agent';
        const myUserId = myUser.id || 'user-' + Date.now();

        // 1. Capture Local Microphone & Camera
        const stream = await getLocalStream(!!isVideo);
        if (!stream) {
          if (!isMounted) return;
          setErrorMessage('Microphone or Camera permission denied. Please allow permissions in your browser.');
          setCallStatus('error');
          isSettingUpRef.current = false;
          return;
        }

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
          localVideoRef.current.play().catch(() => {});
        }

        // 2. Initialize PeerConnection
        const pc = new RTCPeerConnection(RTC_CONFIG);
        peerConnectionRef.current = pc;

        // Add Local Media Tracks
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        // 3. Handle Remote Media Stream
        pc.ontrack = (event) => {
          if (!isMounted) return;
          console.log('📡 Remote WebRTC track arrived:', event.track.kind, event.track.id);

          if (!remoteStreamRef.current) {
            remoteStreamRef.current = new MediaStream();
          }

          // Add track to persistent stream
          const existingTrack = remoteStreamRef.current.getTracks().find(t => t.id === event.track.id);
          if (!existingTrack) {
            remoteStreamRef.current.addTrack(event.track);
          }

          // Attach to audio element
          if (remoteAudioRef.current) {
            if (remoteAudioRef.current.srcObject !== remoteStreamRef.current) {
              remoteAudioRef.current.srcObject = remoteStreamRef.current;
            }
            remoteAudioRef.current.muted = !speakerOnRef.current;
            remoteAudioRef.current.play().then(() => {
              if (isMounted) setAudioAutoplayBlocked(false);
            }).catch(e => {
              if (isMounted) setAudioAutoplayBlocked(true);
            });
          }

          // Attach to video element
          if (remoteVideoRef.current) {
            if (remoteVideoRef.current.srcObject !== remoteStreamRef.current) {
              remoteVideoRef.current.srcObject = remoteStreamRef.current;
            }
            remoteVideoRef.current.play().catch(() => {});
          }

          if (event.track.kind === 'video') {
            setRemoteVideoAvailable(true);
            event.track.onmute = () => {
              if (isMounted) setRemoteVideoAvailable(false);
            };
            event.track.onunmute = () => {
              if (isMounted) setRemoteVideoAvailable(true);
            };
            event.track.onended = () => {
              if (isMounted) setRemoteVideoAvailable(false);
            };
          }

          setCallStatus('connected');
        };

        // Track ICE & Connection States
        pc.oniceconnectionstatechange = () => {
          if (!isMounted) return;
          if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            setCallStatus('connected');
            setNetworkQuality('HD');
          } else if (pc.iceConnectionState === 'failed') {
            console.warn('ICE connection failed, attempting ICE restart...');
          }
        };

        pc.onconnectionstatechange = () => {
          if (!isMounted) return;
          const state = pc.connectionState;
          if (state === 'connected') {
            setCallStatus('connected');
            setNetworkQuality('HD');
          } else if (state === 'failed') {
            setCallStatus('error');
            setErrorMessage('P2P connection lost. Please check internet connection.');
          }
        };

        // 4. Socket & Dual-Channel Signaling Setup
        const socket = signalingService.getSocket();
        let callId = callSessionId || activeCallIdRef.current;

        if (!isIncomingAnswer) {
          // ==============================
          // CALLER WORKFLOW
          // ==============================

          // Send local ICE candidates to receiver
          pc.onicecandidate = (event) => {
            if (event.candidate && isMounted && callId) {
              signalingService.sendIceCandidate(targetUserId, event.candidate, callId);
              firestoreRealtime.addIceCandidate(callId, true, event.candidate.toJSON()).catch(() => {});
            }
          };

          // 1. Generate local Offer SDP
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: !!isVideo
          });
          await pc.setLocalDescription(offer);

          // 2. Create Firestore call record WITH OFFER ALREADY INCLUDED
          const res = await firestoreRealtime.createWebRTCCall({
            callerId: myUserId,
            callerName: myUser.name || 'User',
            callerAvatar: myUser.avatar || '',
            receiverId: targetUserId,
            receiverName: agentName || 'Agent',
            receiverAvatar: agentAvatar || '',
            isVideo: !!isVideo,
            offer
          });

          callId = res.callId;
          activeCallIdRef.current = callId;

          // 3. Join room & notify receiver via socket
          signalingService.joinRoom(callId, myUserId, {
            name: myUser.name || 'User',
            avatar: myUser.avatar || '',
            role: myUser.role || 'user'
          });

          signalingService.callUser({
            callId,
            callerId: myUserId,
            callerName: myUser.name || 'User',
            callerAvatar: myUser.avatar || '',
            receiverId: targetUserId,
            receiverName: agentName || 'Agent',
            isVideo: !!isVideo
          });

          signalingService.sendOffer(targetUserId, offer, callId);

          // Re-send offer helper for whenever receiver joins or signals ready
          const sendOfferSDP = () => {
            if (!isMounted || !pc || pc.signalingState === 'closed') return;
            try {
              if (pc.localDescription) {
                signalingService.sendOffer(targetUserId, pc.localDescription, callId);
                firestoreRealtime.setCallOffer(callId, pc.localDescription).catch(() => {});
              }
            } catch (e) {
              console.warn('Re-send offer note:', e);
            }
          };

          // Listen for Answer
          const onReceiveAnswer = async (data: any) => {
            if (!isMounted || !data) return;
            const answerSdp = data.answer || data.sdp || data.sessionDescription || data.signal;
            if (!answerSdp) return;

            if (pc.signalingState === 'have-local-offer') {
              try {
                const answerDesc = new RTCSessionDescription(answerSdp);
                await pc.setRemoteDescription(answerDesc);
                processIceQueue(pc);
                setCallStatus('connected');
                triggerAudioPlay();
              } catch (err) {
                console.warn('Set remote answer err:', err);
              }
            }
          };

          // ICE candidate listener
          const onReceiveIce = (data: any) => {
            if (!isMounted || !data) return;
            const cand = data.candidate || data.iceCandidate;
            if (!cand) return;

            if (pc.remoteDescription && pc.remoteDescription.type) {
              pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
            } else {
              iceCandidatesQueue.current.push(cand);
            }
          };

          const onChatMessageSignal = (data: any) => {
            if (!isMounted || !data || !data.message) return;
            try {
              const parsed = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
              if (parsed.type === 'SDP_ANSWER') {
                onReceiveAnswer(parsed);
              } else if (parsed.type === 'ICE_CANDIDATE') {
                onReceiveIce(parsed);
              }
            } catch (e) {}
          };

          const onCallEndedEvent = (data?: any) => {
            if (!data || !data.roomId || data.roomId === activeCallIdRef.current) {
              if (isMounted) {
                setCallStatus('ended');
                onEndCall();
              }
            }
          };

          // Socket event listeners
          socket.on('answer', onReceiveAnswer);
          socket.on('send-answer', onReceiveAnswer);
          socket.on('receive-answer', onReceiveAnswer);
          socket.on('ice-candidate', onReceiveIce);
          socket.on('candidate', onReceiveIce);
          socket.on('relay-ice', onReceiveIce);
          socket.on('peer-ready', sendOfferSDP);
          socket.on('user-ready', sendOfferSDP);
          socket.on('user-joined', sendOfferSDP);
          socket.on('user-connected', sendOfferSDP);
          socket.on('chat-message', onChatMessageSignal);
          socket.on('call-ended', onCallEndedEvent);

          // Firestore backup listener (Real-time snapshot)
          const unsubCall = firestoreRealtime.listenToCall(callId, async (call) => {
            if (!isMounted) return;
            if (call.status === 'rejected') {
              setCallStatus('error');
              setErrorMessage('Call was declined by recipient.');
            } else if (call.status === 'ended') {
              setCallStatus('ended');
              onEndCall();
            } else if (call.answer && pc.signalingState === 'have-local-offer') {
              try {
                await pc.setRemoteDescription(new RTCSessionDescription(call.answer));
                processIceQueue(pc);
                setCallStatus('connected');
                triggerAudioPlay();
              } catch (e) {}
            }
          });

          const unsubIce = firestoreRealtime.subscribeToIceCandidates(callId, true, (candidate) => {
            if (isMounted) {
              if (pc.remoteDescription && pc.remoteDescription.type) {
                pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
              } else {
                iceCandidatesQueue.current.push(candidate);
              }
            }
          });

          // Active answer polling interval for high reliability
          const callerPollTimer = setInterval(async () => {
            if (!isMounted || pc.signalingState !== 'have-local-offer') {
              clearInterval(callerPollTimer);
              return;
            }
            try {
              const call = await firestoreRealtime.getCall(callId);
              if (call?.status === 'rejected') {
                setCallStatus('error');
                setErrorMessage('Call was declined by recipient.');
                clearInterval(callerPollTimer);
              } else if (call?.status === 'ended') {
                setCallStatus('ended');
                onEndCall();
                clearInterval(callerPollTimer);
              } else if (call?.answer && pc.signalingState === 'have-local-offer') {
                await pc.setRemoteDescription(new RTCSessionDescription(call.answer));
                processIceQueue(pc);
                setCallStatus('connected');
                triggerAudioPlay();
                clearInterval(callerPollTimer);
              }
            } catch (e) {}
          }, 1200);

          // Store cleanup function
          cleanupFnsRef.current.push(() => {
            clearInterval(callerPollTimer);
            socket.off('answer', onReceiveAnswer);
            socket.off('send-answer', onReceiveAnswer);
            socket.off('receive-answer', onReceiveAnswer);
            socket.off('ice-candidate', onReceiveIce);
            socket.off('candidate', onReceiveIce);
            socket.off('relay-ice', onReceiveIce);
            socket.off('peer-ready', sendOfferSDP);
            socket.off('user-ready', sendOfferSDP);
            socket.off('user-joined', sendOfferSDP);
            socket.off('user-connected', sendOfferSDP);
            socket.off('chat-message', onChatMessageSignal);
            socket.off('call-ended', onCallEndedEvent);
            unsubCall();
            unsubIce();
          });

        } else {
          // ==============================
          // RECEIVER WORKFLOW
          // ==============================
          activeCallIdRef.current = callId;
          const handledOfferRef = { current: false };

          // Send local ICE candidates to caller
          pc.onicecandidate = (event) => {
            if (event.candidate && isMounted && callId) {
              signalingService.sendIceCandidate(targetUserId, event.candidate, callId);
              firestoreRealtime.addIceCandidate(callId, false, event.candidate.toJSON()).catch(() => {});
            }
          };

          signalingService.joinRoom(callId, myUserId, {
            name: myUser.name || 'User',
            avatar: myUser.avatar || '',
            role: myUser.role || 'user'
          });
          signalingService.notifyReady(callId, myUserId);

          const handleIncomingOffer = async (offerData: RTCSessionDescriptionInit) => {
            if (!isMounted || !pc || pc.signalingState === 'closed' || handledOfferRef.current) return;
            try {
              handledOfferRef.current = true;
              const offerDesc = new RTCSessionDescription(offerData);
              await pc.setRemoteDescription(offerDesc);
              processIceQueue(pc);

              const answer = await pc.createAnswer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: !!isVideo
              });
              await pc.setLocalDescription(answer);

              signalingService.sendAnswer(targetUserId, answer, callId);
              await firestoreRealtime.setCallAnswer(callId, answer).catch(() => {});
              setCallStatus('connected');
              triggerAudioPlay();
            } catch (err) {
              console.warn('Receiver handle offer err:', err);
              handledOfferRef.current = false;
            }
          };

          const onReceiveOffer = async (data: any) => {
            if (!isMounted || !data) return;
            const offerSdp = data.offer || data.sdp || data.sessionDescription || data.signal;
            if (offerSdp) {
              await handleIncomingOffer(offerSdp);
            }
          };

          const onReceiveIce = (data: any) => {
            if (!isMounted || !data) return;
            const cand = data.candidate || data.iceCandidate;
            if (!cand) return;

            if (pc.remoteDescription && pc.remoteDescription.type) {
              pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
            } else {
              iceCandidatesQueue.current.push(cand);
            }
          };

          const onChatMessageSignal = (data: any) => {
            if (!isMounted || !data || !data.message) return;
            try {
              const parsed = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
              if (parsed.type === 'SDP_OFFER') {
                onReceiveOffer(parsed);
              } else if (parsed.type === 'ICE_CANDIDATE') {
                onReceiveIce(parsed);
              }
            } catch (e) {}
          };

          const onCallEndedEvent = (data?: any) => {
            if (!data || !data.roomId || data.roomId === activeCallIdRef.current) {
              if (isMounted) {
                setCallStatus('ended');
                onEndCall();
              }
            }
          };

          socket.on('offer', onReceiveOffer);
          socket.on('send-offer', onReceiveOffer);
          socket.on('signal', onReceiveOffer);
          socket.on('ice-candidate', onReceiveIce);
          socket.on('candidate', onReceiveIce);
          socket.on('relay-ice', onReceiveIce);
          socket.on('chat-message', onChatMessageSignal);
          socket.on('call-ended', onCallEndedEvent);

          // 1. Immediate One-shot Fetch from Firestore for Instant Response
          firestoreRealtime.getCall(callId).then(call => {
            if (isMounted && call?.offer && !handledOfferRef.current) {
              handleIncomingOffer(call.offer);
            }
          }).catch(() => {});

          // 2. Real-time Firestore snapshot listener
          const unsubCall = firestoreRealtime.listenToCall(callId, async (call) => {
            if (!isMounted) return;
            if (call.status === 'ended') {
              setCallStatus('ended');
              onEndCall();
            } else if (call.offer && !handledOfferRef.current) {
              await handleIncomingOffer(call.offer);
            }
          });

          const unsubIce = firestoreRealtime.subscribeToIceCandidates(callId, false, (candidate) => {
            if (isMounted) {
              if (pc.remoteDescription && pc.remoteDescription.type) {
                pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
              } else {
                iceCandidatesQueue.current.push(candidate);
              }
            }
          });

          // Active receiver polling interval for zero-loss handshake
          const receiverPollTimer = setInterval(async () => {
            if (!isMounted || handledOfferRef.current) {
              clearInterval(receiverPollTimer);
              return;
            }
            try {
              signalingService.notifyReady(callId, myUserId);
              const call = await firestoreRealtime.getCall(callId);
              if (call?.status === 'ended') {
                setCallStatus('ended');
                onEndCall();
                clearInterval(receiverPollTimer);
              } else if (call?.offer && !handledOfferRef.current) {
                await handleIncomingOffer(call.offer);
                clearInterval(receiverPollTimer);
              }
            } catch (e) {}
          }, 1000);

          cleanupFnsRef.current.push(() => {
            clearInterval(receiverPollTimer);
            socket.off('offer', onReceiveOffer);
            socket.off('send-offer', onReceiveOffer);
            socket.off('signal', onReceiveOffer);
            socket.off('ice-candidate', onReceiveIce);
            socket.off('candidate', onReceiveIce);
            socket.off('relay-ice', onReceiveIce);
            socket.off('chat-message', onChatMessageSignal);
            socket.off('call-ended', onCallEndedEvent);
            unsubCall();
            unsubIce();
          });
        }

      } catch (err: any) {
        console.error('Call initialization failed:', err);
        if (isMounted) {
          setErrorMessage(err.message || 'Call setup failed.');
          setCallStatus('error');
        }
      } finally {
        isSettingUpRef.current = false;
      }
    };

    initCall();

    return () => {
      isMounted = false;
      cleanupSession();
    };
  }, [isOpen, agentId, callSessionId, isIncomingAnswer, isVideo]);

  // Realtime Media Control Handlers
  const toggleMic = () => {
    if (localStreamRef.current) {
      const nextMuted = !micMuted;
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !nextMuted;
      });
      setMicMuted(nextMuted);
      if (activeCallIdRef.current) {
        signalingService.toggleMute(activeCallIdRef.current, nextMuted);
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const nextCamOff = !cameraOff;
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !nextCamOff;
      });
      setCameraOff(nextCamOff);
      if (activeCallIdRef.current) {
        signalingService.toggleVideo(activeCallIdRef.current, nextCamOff);
      }
    }
  };

  const toggleSpeaker = () => {
    const nextSpeakerState = !speakerOn;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !nextSpeakerState;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !nextSpeakerState;
    }
    setSpeakerOn(nextSpeakerState);
    speakerOnRef.current = nextSpeakerState;
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  const showRemoteVideo = isVideo && remoteVideoAvailable;

  return (
    <div
      onClick={triggerAudioPlay}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in cursor-default overscroll-contain select-none"
    >
      {/* Dedicated audio element for low-latency voice playback */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/80 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 touch-auto"
      >
        
        {/* Autoplay blocked banner for immediate 1-tap sound unlock */}
        {audioAutoplayBlocked && callStatus === 'connected' && (
          <div
            onClick={triggerAudioPlay}
            className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs py-2 px-4 flex items-center justify-between cursor-pointer animate-pulse z-30 shadow-lg"
          >
            <div className="flex items-center space-x-2 font-bold">
              <Volume1 className="w-4 h-4" />
              <span>Click to enable audio</span>
            </div>
            <span className="bg-white text-orange-700 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow">
              Unmute Audio
            </span>
          </div>
        )}

        {/* Header Bar */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between z-20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500 bg-slate-800 flex items-center justify-center">
              {agentAvatar ? (
                <img src={agentAvatar} alt={agentName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-sm font-bold text-white leading-none">{agentName || 'DealFast Member'}</h3>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                {callStatus === 'connected' ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    In Call ({formatSeconds(callSeconds)})
                  </span>
                ) : callStatus === 'connecting' ? (
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <PhoneCall className="w-3 h-3 animate-bounce" />
                    {!isIncomingAnswer ? 'Ringing recipient...' : 'Connecting P2P Stream...'}
                  </span>
                ) : (
                  <span className="text-slate-400">Call Ended</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-[10px] font-bold text-emerald-400">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>HD Voice</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300">
              <Wifi className={`w-3.5 h-3.5 ${callStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
              <span>{callStatus === 'connected' ? `${networkQuality} Active` : 'Connecting'}</span>
            </div>
          </div>
        </div>

        {/* Video / Call Stage */}
        <div className="relative bg-slate-950 h-72 sm:h-96 flex items-center justify-center overflow-hidden">
          
          {/* Remote Video Stream Element */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              showRemoteVideo ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
            }`}
          />

          {/* Fallback Avatar View when Remote Video is off or in Voice Call */}
          {!showRemoteVideo && (
            <div className="text-center space-y-3 p-6 z-0 animate-in fade-in">
              <div className="relative mx-auto w-24 h-24">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800 shadow-xl flex items-center justify-center">
                  {agentAvatar ? (
                    <img src={agentAvatar} alt={agentName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                {callStatus === 'connected' && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
                )}
              </div>
              <h4 className="text-base font-bold text-white">{agentName || 'Verified Member'}</h4>
              <p className="text-xs text-emerald-400 font-medium">
                {callStatus === 'connected'
                  ? `Connected (${formatSeconds(callSeconds)})`
                  : !isIncomingAnswer
                  ? 'Calling recipient...'
                  : 'Establishing Secure Audio/Video link...'}
              </p>
            </div>
          )}

          {/* Picture-in-Picture Local Self Video */}
          {isVideo && (
            <div className="absolute top-4 right-4 w-28 h-36 sm:w-32 sm:h-44 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-2xl z-10">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover mirror ${cameraOff ? 'hidden' : 'block'}`}
              />
              {cameraOff && (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                  <VideoOff className="w-8 h-8" />
                </div>
              )}
              <div className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] font-bold text-white">
                You {micMuted && '🔇'}
              </div>
            </div>
          )}

          {/* Connection / Ringing Overlay */}
          {callStatus === 'connecting' && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center space-y-2.5 z-10">
              <Loader2 className="w-9 h-9 text-emerald-400 animate-spin" />
              <p className="text-sm font-bold text-white">
                {!isIncomingAnswer ? 'Ringing recipient...' : 'Connecting P2P Stream...'}
              </p>
              <p className="text-xs text-slate-400">
                {!isIncomingAnswer ? 'Waiting for answer...' : 'Exchanging audio & video tracks'}
              </p>
            </div>
          )}

          {/* Error Notice */}
          {callStatus === 'error' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 p-6 text-center z-10">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-sm font-bold text-red-400">{errorMessage || 'Call could not be connected.'}</p>
              <button
                type="button"
                onClick={handleHangup}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                Close Call Window
              </button>
            </div>
          )}
        </div>

        {/* Bottom Call Controls (1-Tap instant action buttons) */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center space-x-4 z-20">
          {/* Mute Mic */}
          <button
            type="button"
            onClick={toggleMic}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer touch-manipulation active:scale-95 ${
              micMuted
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-slate-900 text-slate-200 hover:text-white border-slate-800 hover:bg-slate-800'
            }`}
            title={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Camera */}
          {isVideo && (
            <button
              type="button"
              onClick={toggleCamera}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer touch-manipulation active:scale-95 ${
                cameraOff
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-slate-900 text-slate-200 hover:text-white border-slate-800 hover:bg-slate-800'
              }`}
              title={cameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {cameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          {/* Toggle Speaker */}
          <button
            type="button"
            onClick={toggleSpeaker}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer touch-manipulation active:scale-95 ${
              !speakerOn
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-900 text-slate-200 hover:text-white border-slate-800 hover:bg-slate-800'
            }`}
            title={speakerOn ? 'Mute Output Audio' : 'Unmute Output Audio'}
          >
            {!speakerOn ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Hang Up Button */}
          <button
            type="button"
            onClick={handleHangup}
            className="p-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center space-x-2 shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer touch-manipulation"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="font-bold">End Call</span>
          </button>
        </div>

      </div>
    </div>
  );
};
