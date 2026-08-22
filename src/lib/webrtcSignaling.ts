import { io, Socket } from 'socket.io-client';

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

  public joinRoom(roomId: string, userId: string, userData?: { name?: string; avatar?: string; role?: string }) {
    const s = this.getSocket();
    this.currentRoomId = roomId;
    s.emit('join-room', {
      roomId,
      userId,
      userData: {
        name: userData?.name || 'User',
        avatar: userData?.avatar || '',
        role: userData?.role || 'user'
      }
    });
  }

  public sendOffer(to: string, offer: RTCSessionDescriptionInit, roomId: string) {
    const s = this.getSocket();
    s.emit('offer', { to, offer, roomId });
  }

  public sendAnswer(to: string, answer: RTCSessionDescriptionInit, roomId: string) {
    const s = this.getSocket();
    s.emit('answer', { to, answer, roomId });
  }

  public sendIceCandidate(to: string, candidate: RTCIceCandidate, roomId: string) {
    const s = this.getSocket();
    s.emit('ice-candidate', { to, candidate, roomId });
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
