import { ChatRoom, ChatMessage, User, UserRole } from '../types';
import { INITIAL_CHAT_ROOMS, INITIAL_CHAT_MESSAGES } from '../data/mockData';
import { firestoreRealtime } from '../lib/firestoreRealtime';

export class ChatService {
  private static instance: ChatService;
  private chatRooms: ChatRoom[] = [...INITIAL_CHAT_ROOMS];
  private chatMessages: Record<string, ChatMessage[]> = { ...INITIAL_CHAT_MESSAGES };
  private roomListeners: ((rooms: ChatRoom[]) => void)[] = [];
  private messageListeners: Record<string, ((msgs: ChatMessage[]) => void)[]> = {};

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public subscribeToRooms(userId: string, listener: (rooms: ChatRoom[]) => void): () => void {
    this.roomListeners.push(listener);
    listener(this.chatRooms);

    // Subscribe to Firestore Realtime Rooms
    const unsub = firestoreRealtime.subscribeToUserChatRooms(userId, '', (cloudRooms) => {
      if (cloudRooms && cloudRooms.length > 0) {
        const map = new Map<string, ChatRoom>();
        this.chatRooms.forEach(r => map.set(r.id, r));
        cloudRooms.forEach(r => {
          const existing = map.get(r.id);
          map.set(r.id, {
            ...r,
            participants: r.participants && r.participants.length > 0 ? r.participants : (existing?.participants || []),
            unreadCount: r.unreadCount !== undefined ? r.unreadCount : (existing?.unreadCount || 0)
          });
        });
        this.chatRooms = Array.from(map.values());
        this.roomListeners.forEach(l => l(this.chatRooms));
      }
    });

    return () => {
      this.roomListeners = this.roomListeners.filter(l => l !== listener);
      if (unsub) unsub();
    };
  }

  public subscribeToMessages(roomId: string, listener: (msgs: ChatMessage[]) => void): () => void {
    if (!this.messageListeners[roomId]) {
      this.messageListeners[roomId] = [];
    }
    this.messageListeners[roomId].push(listener);
    listener(this.chatMessages[roomId] || []);

    // Subscribe to Firestore Realtime message stream
    const unsub = firestoreRealtime.subscribeToRoomMessages(roomId, (incomingMsgs) => {
      if (incomingMsgs && incomingMsgs.length > 0) {
        const existing = this.chatMessages[roomId] || [];
        const map = new Map<string, ChatMessage>();
        existing.forEach(m => map.set(m.id, m));
        incomingMsgs.forEach(m => map.set(m.id, m));
        const merged = Array.from(map.values()).sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
        this.chatMessages[roomId] = merged;

        (this.messageListeners[roomId] || []).forEach(l => l(merged));
      }
    });

    return () => {
      if (this.messageListeners[roomId]) {
        this.messageListeners[roomId] = this.messageListeners[roomId].filter(l => l !== listener);
      }
      if (unsub) unsub();
    };
  }

  public getOrCreateRoom(
    currentUser: User,
    agent: { id: string; name: string; avatar?: string; role?: UserRole; email?: string; phone?: string },
    propertyId?: string,
    propertyTitle?: string
  ): ChatRoom {
    const p1 = (currentUser.id || 'guest').trim();
    const p2 = (agent.id || 'agent').trim();
    const sortedPair = [p1, p2].sort().join('_');
    const roomId = propertyId ? `room_${sortedPair}_${propertyId.replace(/[^a-zA-Z0-9]/g, '')}` : `room_${sortedPair}`;

    let room = this.chatRooms.find(r => r.id === roomId || r.participants.some(p => p.id === agent.id));
    if (!room) {
      room = {
        id: roomId,
        participants: [
          { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, role: currentUser.role },
          { id: agent.id, name: agent.name, avatar: agent.avatar, role: agent.role || 'agent' }
        ],
        lastMessage: 'Chat started',
        lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unreadCount: 0,
        propertyId,
        propertyTitle
      };
      this.chatRooms = [room, ...this.chatRooms];
      if (!this.chatMessages[roomId]) {
        this.chatMessages[roomId] = [];
      }
      this.roomListeners.forEach(l => l(this.chatRooms));
    }

    // Sync in Firestore Realtime DB
    firestoreRealtime.getOrCreateChatRoom(currentUser, agent, propertyId, propertyTitle).catch(() => {});
    return room;
  }

  public async sendMessage(
    roomId: string,
    sender: User,
    receiverId: string,
    text: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'file'
  ): Promise<ChatMessage> {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      text,
      mediaUrl,
      mediaType,
      isRead: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    if (!this.chatMessages[roomId]) {
      this.chatMessages[roomId] = [];
    }
    this.chatMessages[roomId] = [...this.chatMessages[roomId], newMsg];

    // Update room last message
    this.chatRooms = this.chatRooms.map(r => {
      if (r.id === roomId) {
        return { ...r, lastMessage: text, lastMessageTime: newMsg.timestamp };
      }
      return r;
    });

    (this.messageListeners[roomId] || []).forEach(l => l(this.chatMessages[roomId]));
    this.roomListeners.forEach(l => l(this.chatRooms));

    // Send to Firestore Realtime
    await firestoreRealtime.sendRealtimeMessage(
      roomId,
      newMsg,
      receiverId
    ).catch(() => {});

    return newMsg;
  }
}

export const chatService = ChatService.getInstance();
