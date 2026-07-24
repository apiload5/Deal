import {
  User,
  UserRole,
  Property,
  Booking,
  Invoice,
  KYCRecord,
  AppNotification,
  ChatRoom,
  ChatMessage,
  SearchFilter,
  Agency,
  Builder,
  Project,
  Agent,
  BlogArticle
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PROPERTIES,
  INITIAL_AGENCIES,
  INITIAL_BUILDERS,
  INITIAL_PROJECTS,
  INITIAL_AGENTS,
  INITIAL_BOOKINGS,
  INITIAL_INVOICES,
  INITIAL_KYC_RECORDS,
  INITIAL_BLOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CHAT_ROOMS,
  INITIAL_CHAT_MESSAGES
} from '../data/mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'dealpk_current_user',
  PROPERTIES: 'dealpk_properties',
  FAVORITES: 'dealpk_favorites',
  BOOKINGS: 'dealpk_bookings',
  INVOICES: 'dealpk_invoices',
  KYC: 'dealpk_kyc',
  NOTIFICATIONS: 'dealpk_notifications',
  CHAT_ROOMS: 'dealpk_chat_rooms',
  CHAT_MESSAGES: 'dealpk_chat_messages'
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to store', key, e);
  }
}

export class AppStore {
  private static instance: AppStore;

  public currentUser: User;
  public properties: Property[];
  public favorites: string[];
  public bookings: Booking[];
  public invoices: Invoice[];
  public kycRecords: KYCRecord[];
  public notifications: AppNotification[];
  public chatRooms: ChatRoom[];
  public chatMessages: Record<string, ChatMessage[]>;

  public agencies: Agency[] = INITIAL_AGENCIES;
  public builders: Builder[] = INITIAL_BUILDERS;
  public projects: Project[] = INITIAL_PROJECTS;
  public agents: Agent[] = INITIAL_AGENTS;
  public blogs: BlogArticle[] = INITIAL_BLOGS;

  private listeners: (() => void)[] = [];

  private constructor() {
    this.currentUser = getStored<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]); // Default admin/user switcher
    this.properties = getStored<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
    this.favorites = getStored<string[]>(STORAGE_KEYS.FAVORITES, ['prop-1', 'prop-2']);
    this.bookings = getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    this.invoices = getStored<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    this.kycRecords = getStored<KYCRecord[]>(STORAGE_KEYS.KYC, INITIAL_KYC_RECORDS);
    this.notifications = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.chatRooms = getStored<ChatRoom[]>(STORAGE_KEYS.CHAT_ROOMS, INITIAL_CHAT_ROOMS);
    this.chatMessages = getStored<Record<string, ChatMessage[]>>(STORAGE_KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES);
  }

  public static getInstance(): AppStore {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore();
    }
    return AppStore.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // --- ROLE & USER SWITCHER ---
  public switchRole(role: UserRole) {
    const found = INITIAL_USERS.find(u => u.role === role);
    if (found) {
      this.currentUser = { ...found };
    } else {
      this.currentUser = {
        id: `user-${role}`,
        name: `${role.toUpperCase()} Account`,
        email: `${role}@deal.pk`,
        role: role,
        kycStatus: role === 'guest' ? 'none' : 'verified',
        createdAt: new Date().toISOString()
      };
    }
    setStored(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.notify();
  }

  public updateUserProfile(updates: Partial<User>) {
    this.currentUser = { ...this.currentUser, ...updates };
    setStored(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.notify();
  }

  // --- FAVORITES ---
  public toggleFavorite(propertyId: string) {
    if (this.favorites.includes(propertyId)) {
      this.favorites = this.favorites.filter(id => id !== propertyId);
    } else {
      this.favorites = [...this.favorites, propertyId];
    }
    setStored(STORAGE_KEYS.FAVORITES, this.favorites);
    this.notify();
  }

  public isFavorite(propertyId: string): boolean {
    return this.favorites.includes(propertyId);
  }

  // --- PROPERTIES CRUD ---
  public addProperty(newProp: Omit<Property, 'id' | 'createdAt' | 'views' | 'status' | 'slug'>): Property {
    const id = `prop-${Date.now()}`;
    const slug = newProp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    // Auto approve if user is admin or verified agent/agency, else pending
    const autoApprove = this.currentUser.role === 'admin' || this.currentUser.role === 'agent' || this.currentUser.role === 'agency';
    
    const created: Property = {
      ...newProp,
      id,
      slug,
      status: autoApprove ? 'approved' : 'pending',
      views: 1,
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.properties = [created, ...this.properties];
    setStored(STORAGE_KEYS.PROPERTIES, this.properties);

    this.addNotification({
      userId: this.currentUser.id,
      title: 'Property Submitted',
      message: autoApprove ? `Your listing "${created.title}" is now active!` : `Your listing "${created.title}" is pending admin review.`,
      type: 'property',
      isRead: false,
      timestamp: 'Just now'
    });

    this.notify();
    return created;
  }

  public updatePropertyStatus(id: string, status: Property['status']) {
    this.properties = this.properties.map(p => p.id === id ? { ...p, status } : p);
    setStored(STORAGE_KEYS.PROPERTIES, this.properties);
    this.notify();
  }

  public togglePropertyFeature(id: string, field: 'isPremium' | 'isFeatured') {
    this.properties = this.properties.map(p => p.id === id ? { ...p, [field]: !p[field] } : p);
    setStored(STORAGE_KEYS.PROPERTIES, this.properties);
    this.notify();
  }

  public incrementViews(id: string) {
    this.properties = this.properties.map(p => p.id === id ? { ...p, views: p.views + 1 } : p);
    setStored(STORAGE_KEYS.PROPERTIES, this.properties);
    this.notify();
  }

  // --- BOOKING & ESCROW ---
  public createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'transactionId' | 'escrowHoldDate'>): Booking {
    const id = `book-${Date.now()}`;
    const txn = `TXN-DEAL-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString().split('T')[0];

    const newBooking: Booking = {
      ...bookingData,
      id,
      transactionId: txn,
      escrowHoldDate: now,
      createdAt: now
    };

    this.bookings = [newBooking, ...this.bookings];
    setStored(STORAGE_KEYS.BOOKINGS, this.bookings);

    // Auto-generate invoice
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      bookingId: id,
      date: now,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      customerName: newBooking.buyerName,
      customerEmail: newBooking.buyerEmail,
      propertyTitle: newBooking.propertyTitle,
      amount: newBooking.amountPaid,
      platformFee: newBooking.platformFee,
      commission: newBooking.agentCommission,
      status: 'paid',
      paymentMethod: newBooking.paymentMethod.toUpperCase()
    };

    this.invoices = [newInvoice, ...this.invoices];
    setStored(STORAGE_KEYS.INVOICES, this.invoices);

    this.addNotification({
      userId: newBooking.buyerId,
      title: 'Booking Escrow Active',
      message: `Token payment for ${newBooking.propertyTitle} received and secured in Deal.pk Escrow.`,
      type: 'booking',
      isRead: false,
      timestamp: 'Just now'
    });

    this.notify();
    return newBooking;
  }

  public updateBookingStatus(id: string, bookingStatus: Booking['bookingStatus'], paymentStatus: Booking['paymentStatus']) {
    this.bookings = this.bookings.map(b => b.id === id ? { ...b, bookingStatus, paymentStatus } : b);
    setStored(STORAGE_KEYS.BOOKINGS, this.bookings);
    this.notify();
  }

  // --- KYC ---
  public submitKYC(data: { cnicFront: string; cnicBack: string; licenseDoc?: string }) {
    const id = `kyc-${Date.now()}`;
    const record: KYCRecord = {
      id,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userEmail: this.currentUser.email,
      userRole: this.currentUser.role,
      cnicFront: data.cnicFront,
      cnicBack: data.cnicBack,
      licenseDoc: data.licenseDoc,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0]
    };

    this.kycRecords = [record, ...this.kycRecords];
    this.currentUser.kycStatus = 'pending';
    setStored(STORAGE_KEYS.KYC, this.kycRecords);
    setStored(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.notify();
  }

  public reviewKYC(id: string, status: 'approved' | 'rejected', rejectionReason?: string) {
    this.kycRecords = this.kycRecords.map(k => {
      if (k.id === id) {
        return { ...k, status, rejectionReason };
      }
      return k;
    });

    const record = this.kycRecords.find(k => k.id === id);
    if (record && record.userId === this.currentUser.id) {
      this.currentUser.kycStatus = status === 'approved' ? 'verified' : 'rejected';
      setStored(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    }

    setStored(STORAGE_KEYS.KYC, this.kycRecords);
    this.notify();
  }

  // --- CHAT & MESSAGES ---
  public sendMessage(roomId: string, text: string, mediaUrl?: string, mediaType?: 'image' | 'file'): ChatMessage {
    const msgId = `m-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: msgId,
      roomId,
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      senderAvatar: this.currentUser.avatar,
      text,
      mediaUrl,
      mediaType,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true
    };

    const roomMsgs = this.chatMessages[roomId] || [];
    this.chatMessages[roomId] = [...roomMsgs, newMsg];

    // Update room last message
    this.chatRooms = this.chatRooms.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          lastMessage: text,
          lastMessageTime: newMsg.timestamp
        };
      }
      return r;
    });

    setStored(STORAGE_KEYS.CHAT_MESSAGES, this.chatMessages);
    setStored(STORAGE_KEYS.CHAT_ROOMS, this.chatRooms);
    this.notify();

    // Auto simulated reply after 2 seconds if chatting with agent
    setTimeout(() => {
      this.simulateReply(roomId);
    }, 2000);

    return newMsg;
  }

  private simulateReply(roomId: string) {
    const replies = [
      "Assalam-o-Alaikum! Thanks for contacting Deal.pk. How can I assist with your site visit?",
      "I have verified the NOC and property documents. Shall I share the payment breakdown?",
      "The property owner is willing to offer a 2% discount for token payment via Deal.pk Escrow."
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    const replyMsg: ChatMessage = {
      id: `m-bot-${Date.now()}`,
      roomId,
      senderId: 'user-agent-1',
      senderName: 'Tariq Malik (Agent)',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      text: randomReply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    this.chatMessages[roomId] = [...(this.chatMessages[roomId] || []), replyMsg];
    this.chatRooms = this.chatRooms.map(r => r.id === roomId ? { ...r, lastMessage: randomReply, unreadCount: r.unreadCount + 1 } : r);

    setStored(STORAGE_KEYS.CHAT_MESSAGES, this.chatMessages);
    setStored(STORAGE_KEYS.CHAT_ROOMS, this.chatRooms);
    this.notify();
  }

  public getOrCreateRoomWithAgent(agentId: string, agentName: string, propertyId?: string, propertyTitle?: string): ChatRoom {
    let room = this.chatRooms.find(r => r.participants.some(p => p.id === agentId));
    if (!room) {
      const roomId = `room-${Date.now()}`;
      room = {
        id: roomId,
        participants: [
          { id: this.currentUser.id, name: this.currentUser.name, role: this.currentUser.role, avatar: this.currentUser.avatar, isOnline: true },
          { id: agentId, name: agentName, role: 'agent', isOnline: true }
        ],
        lastMessage: 'Chat started',
        lastMessageTime: 'Just now',
        unreadCount: 0,
        propertyId,
        propertyTitle
      };
      this.chatRooms = [room, ...this.chatRooms];
      this.chatMessages[roomId] = [];
      setStored(STORAGE_KEYS.CHAT_ROOMS, this.chatRooms);
      setStored(STORAGE_KEYS.CHAT_MESSAGES, this.chatMessages);
      this.notify();
    }
    return room;
  }

  // --- ADMIN METHODS ---
  public getAdminStats() {
    const totalUsers = INITIAL_USERS.length + 12;
    const activeProperties = this.properties.filter(p => p.status === 'approved').length;
    const escrowVolumePKR = this.bookings.reduce((sum, b) => sum + b.amountPaid, 0);
    const platformRevenuePKR = this.bookings.reduce((sum, b) => sum + b.platformFee, 0);

    return {
      totalUsers,
      activeProperties,
      escrowVolumePKR,
      platformRevenuePKR
    };
  }

  public approveProperty(id: string) {
    this.updatePropertyStatus(id, 'approved');
  }

  public rejectProperty(id: string) {
    this.updatePropertyStatus(id, 'rejected');
  }

  public releaseEscrow(bookingId: string) {
    this.updateBookingStatus(bookingId, 'completed', 'released');
  }

  public refundEscrow(bookingId: string) {
    this.updateBookingStatus(bookingId, 'cancelled', 'refunded');
  }

  public getOrCreateChatRoom(agentId: string, agentName: string, propertyId?: string, propertyTitle?: string): ChatRoom {
    return this.getOrCreateRoomWithAgent(agentId, agentName, propertyId, propertyTitle);
  }

  // --- NOTIFICATIONS ---
  public addNotification(notif: Omit<AppNotification, 'id'>) {
    const newN: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`
    };
    this.notifications = [newN, ...this.notifications];
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public markNotificationAsRead(id: string) {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public clearAllNotifications() {
    this.notifications = [];
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }
}

export const store = AppStore.getInstance();
