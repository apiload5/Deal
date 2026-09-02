import { io, Socket } from 'socket.io-client';
import { store } from './store';

const SIGNALING_SERVER_URL =
  process.env.NEXT_PUBLIC_WEBRTC_SIGNALING_URL ||
  process.env.VITE_WEBRTC_SIGNALING_URL ||
  'https://webrtcapi.onrender.com';

export interface ServerStatus {
  ready: boolean;
  progress: number;
  message: string;
  remainingSeconds: number;
}

export interface SignalingParticipant {
  userId: string;
  name: string;
  avatar?: string;
  role?: string;
}

class WebRTCSignalingService {
  private socket: Socket | null = null;
  private serverUrl: string = SIGNALING_SERVER_URL;
  private currentRoomId: string | null = null;
  private serverStatus: ServerStatus = {
    ready: true,
    progress: 100,
    message: 'Connecting to signaling server...',
    remainingSeconds: 0
  };

  public initSocket(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      return this.socket;
    }

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 20000,
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('🟢 Connected to WebRTC Signaling Server:', this.serverUrl);
    });

    this.socket.on('server-status', (status: ServerStatus) => {
      this.serverStatus = status;
      console.log('📡 WebRTC Server Status:', status);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('🔴 Disconnected from Signaling Server:', reason);
    });

    this.socket.on('error', (err: any) => {
      console.warn('⚠️ WebRTC Signaling error:', err);
    });

    return this.socket;
  }

  public getSocket(): Socket {
    return this.initSocket();
  }

  public getServerStatus(): ServerStatus {
    return this.serverStatus;
  }

  public registerUser(userId: string, userData?: { name?: string; avatar?: string; role?: string }) {
    if (!userId || userId === 'guest') return;
    const s = this.getSocket();
    s.emit('register-user', {
      userId,
      userData: {
        name: userData?.name || 'User',
        avatar: userData?.avatar || '',
        role: userData?.role || 'user'
      }
    });
    // Also join a personal room for direct notification
    s.emit('join-room', {
      roomId: `user_${userId}`,
      userId,
      userData
    });
  }

  public callUser(callData: {
    callId: string;
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    receiverId: string;
    receiverName: string;
    isVideo: boolean;
  }) {
    const s = this.getSocket();
    s.emit('call-user', callData);
    // Also broadcast to the receiver's personal user room
    s.emit('chat-message', {
      roomId: `user_${callData.receiverId}`,
      message: JSON.stringify({ type: 'INCOMING_CALL', ...callData }),
      senderName: callData.callerName
    });
  }

  public joinRoom(roomId: string, userId: string, userData?: { name?: string; avatar?: string; role?: string }) {
    const s = this.getSocket();
    this.currentRoomId = roomId;
    const payload = {
      roomId,
      userId,
      userData: {
        name: userData?.name || 'User',
        avatar: userData?.avatar || '',
        role: userData?.role || 'user'
      }
    };
    s.emit('join-room', payload);
    s.emit('join', payload);
    s.emit('user-joined', payload);
    s.emit('peer-ready', { roomId, userId });
  }

  public notifyReady(roomId: string, userId: string) {
    const s = this.getSocket();
    s.emit('peer-ready', { roomId, userId });
    s.emit('user-ready', { roomId, userId });
  }

  public sendOffer(to: string, offer: RTCSessionDescriptionInit, roomId: string) {
    const s = this.getSocket();
    const payload = { to, offer, sdp: offer, roomId, from: store.currentUser?.id || '' };
    s.emit('offer', payload);
    s.emit('send-offer', payload);
    s.emit('relay-sdp', { peerId: to, sessionDescription: offer, roomId });
    s.emit('signal', { to, signal: offer, roomId });
    s.emit('chat-message', {
      roomId,
      message: JSON.stringify({ type: 'SDP_OFFER', ...payload })
    });
    if (to) {
      s.emit('chat-message', {
        roomId: `user_${to}`,
        message: JSON.stringify({ type: 'SDP_OFFER', ...payload })
      });
    }
  }

  public sendAnswer(to: string, answer: RTCSessionDescriptionInit, roomId: string) {
    const s = this.getSocket();
    const payload = { to, answer, sdp: answer, roomId, from: store.currentUser?.id || '' };
    s.emit('answer', payload);
    s.emit('send-answer', payload);
    s.emit('relay-sdp', { peerId: to, sessionDescription: answer, roomId });
    s.emit('signal', { to, signal: answer, roomId });
    s.emit('chat-message', {
      roomId,
      message: JSON.stringify({ type: 'SDP_ANSWER', ...payload })
    });
    if (to) {
      s.emit('chat-message', {
        roomId: `user_${to}`,
        message: JSON.stringify({ type: 'SDP_ANSWER', ...payload })
      });
    }
  }

  public sendIceCandidate(to: string, candidate: RTCIceCandidate | RTCIceCandidateInit, roomId: string) {
    const s = this.getSocket();
    const candJson = (candidate as any).toJSON ? (candidate as any).toJSON() : candidate;
    const payload = { to, candidate: candJson, iceCandidate: candJson, roomId, from: store.currentUser?.id || '' };
    s.emit('ice-candidate', payload);
    s.emit('candidate', payload);
    s.emit('relay-ice', { peerId: to, iceCandidate: candJson, roomId });
    s.emit('chat-message', {
      roomId,
      message: JSON.stringify({ type: 'ICE_CANDIDATE', ...payload })
    });
  }

  public sendSignal(to: string, signal: any, roomId: string) {
    const s = this.getSocket();
    s.emit('signal', { to, signal, roomId });
  }

  public toggleMute(roomId: string, isMuted: boolean) {
    const s = this.getSocket();
    s.emit('toggle-mute', { roomId, isMuted });
  }

  public toggleVideo(roomId: string, isVideoOff: boolean) {
    const s = this.getSocket();
    s.emit('toggle-video', { roomId, isVideoOff });
  }

  public toggleScreenShare(roomId: string, isSharing: boolean) {
    const s = this.getSocket();
    s.emit('screen-share', { roomId, isSharing });
  }

  public sendChatMessage(roomId: string, message: string, senderName?: string) {
    const s = this.getSocket();
    s.emit('chat-message', { roomId, message, senderName });
  }

  public leaveRoom(roomId?: string, userId?: string) {
    const s = this.getSocket();
    const rId = roomId || this.currentRoomId;
    if (rId) {
      s.emit('leave-room', { roomId: rId, userId });
    }
    this.currentRoomId = null;
  }

  public endCall(roomId?: string) {
    const s = this.getSocket();
    const rId = roomId || this.currentRoomId;
    if (rId) {
      s.emit('end-call', { roomId: rId });
    }
    this.currentRoomId = null;
  }

  public checkHealth(): Promise<any> {
    return fetch(`${this.serverUrl}/health`)
      .then(res => res.json())
      .catch(err => {
        console.warn('Signaling health check failed:', err);
        return { status: 'offline', ready: false };
      });
  }
}

export const signalingService = new WebRTCSignalingService();
