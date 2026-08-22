import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { User, UserRole, ChatRoom, ChatMessage, AppNotification } from '../types';

export interface WebRTCCallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  isVideo: boolean;
  status: 'offering' | 'connected' | 'rejected' | 'ended';
  offer?: any;
  answer?: any;
  createdAt?: any;
}

class FirestoreRealtimeService {
  // ==========================================
  // 1. USER PROFILE REAL-TIME SYNC
  // ==========================================
  public async syncUserProfile(user: User): Promise<void> {
    if (!user || !user.id || user.id === 'guest' || user.id === 'user-guest') return;
    try {
      const userRef = doc(db, 'users', user.id);
      const cleanData: Record<string, any> = {
        id: user.id,
        name: user.name || 'User',
        email: (user.email || '').toLowerCase().trim(),
        role: user.role || 'user',
        avatar: user.avatar || '',
        phone: user.phone || '',
        city: user.city || 'Islamabad',
        kycStatus: user.kycStatus || 'none',
        isVerified: !!user.isVerified,
        updatedAt: serverTimestamp()
      };
      if (user.cnic) cleanData.cnic = user.cnic;
      if (user.agencyName) cleanData.agencyName = user.agencyName;

      await setDoc(userRef, cleanData, { merge: true });

      // Also index by email doc for easy lookup if email exists
      if (user.email) {
        const emailRef = doc(db, 'users_by_email', user.email.toLowerCase().replace(/[^a-z0-9]/g, '_'));
        await setDoc(emailRef, cleanData, { merge: true }).catch(() => {});
      }
    } catch (err) {
      console.warn('Firestore syncUserProfile notice:', err);
    }
  }

  public async getUserProfile(userIdOrEmail: string): Promise<User | null> {
    if (!userIdOrEmail) return null;
    try {
      // 1. Try by direct user id
      const userDoc = await getDoc(doc(db, 'users', userIdOrEmail));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }

      // 2. Try by email query
      const q = query(collection(db, 'users'), where('email', '==', userIdOrEmail.toLowerCase().trim()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as User;
      }
    } catch (e) {
      console.warn('Firestore getUserProfile notice:', e);
    }
    return null;
  }

  // ==========================================
  // 2. REAL-TIME CHAT ROOMS
  // ==========================================
  public async getOrCreateChatRoom(
    currentUser: User,
    recipient: { id: string; name: string; avatar?: string; email?: string; phone?: string; role?: UserRole },
    propertyId?: string,
    propertyTitle?: string
  ): Promise<ChatRoom> {
    // Look up real recipient profile from Firestore to ensure real photo & details
    let realRecipientAvatar = recipient.avatar || '';
    let realRecipientName = recipient.name || 'User';

    if (recipient.id && recipient.id !== 'guest') {
      try {
        const profile = await this.getUserProfile(recipient.id);
        if (profile) {
          if (profile.avatar) realRecipientAvatar = profile.avatar;
          if (profile.name) realRecipientName = profile.name;
        }
      } catch (e) {}
    }

    // Deterministic room ID between 2 participants so they always share the exact same room
    const p1 = (currentUser.id || 'guest').trim();
    const p2 = (recipient.id || 'agent').trim();
    const sortedPair = [p1, p2].sort().join('_');
    const roomId = propertyId ? `room_${sortedPair}_${propertyId.replace(/[^a-zA-Z0-9]/g, '')}` : `room_${sortedPair}`;

    const roomRef = doc(db, 'chatRooms', roomId);
    const existing = await getDoc(roomRef);

    if (existing.exists()) {
      const data = existing.data() as ChatRoom;
      return {
        ...data,
        id: roomId
      };
    }

    const newRoom: ChatRoom = {
      id: roomId,
      participants: [
        {
          id: currentUser.id,
          name: currentUser.name || 'User',
          role: currentUser.role || 'user',
          avatar: currentUser.avatar || '',
          isOnline: true
        },
        {
          id: recipient.id,
          name: realRecipientName,
          role: (recipient.role as UserRole) || 'agent',
          avatar: realRecipientAvatar,
          isOnline: true
        }
      ],
      lastMessage: 'Chat started',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      propertyId,
      propertyTitle
    };

    try {
      await setDoc(roomRef, {
        ...newRoom,
        participantIds: [currentUser.id, recipient.id],
        participantEmails: [currentUser.email || '', recipient.email || ''].filter(Boolean),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore create room note:', e);
    }

    return newRoom;
  }

  public subscribeToUserChatRooms(
    userId: string,
    userEmail: string,
    onUpdate: (rooms: ChatRoom[]) => void
  ): () => void {
    if (!userId || userId === 'guest' || userId === 'user-guest') {
      return () => {};
    }

    try {
      // Query rooms where user is in participantIds
      const q = query(
        collection(db, 'chatRooms'),
        where('participantIds', 'array-contains', userId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const rooms: ChatRoom[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            rooms.push({
              id: docSnap.id,
              participants: data.participants || [],
              lastMessage: data.lastMessage || '',
              lastMessageTime: data.lastMessageTime || 'Just now',
              unreadCount: data.lastSenderId && data.lastSenderId !== userId ? (data.unreadCount || 1) : 0,
              propertyId: data.propertyId,
              propertyTitle: data.propertyTitle
            });
          });
          // Sort by latest update
          rooms.sort((a, b) => (b.id > a.id ? 1 : -1));
          onUpdate(rooms);
        },
        (err) => {
          console.warn('Rooms snapshot error:', err);
        }
      );

      return unsubscribe;
    } catch (e) {
      console.warn('Subscribe to rooms error:', e);
      return () => {};
    }
  }

  // ==========================================
  // 3. REAL-TIME MESSAGING
  // ==========================================
  public async sendRealtimeMessage(
    roomId: string,
    message: ChatMessage,
    recipientId?: string
  ): Promise<void> {
    if (!roomId) return;
    try {
      // 1. Add message to Firestore subcollection
      const msgRef = doc(db, 'chatRooms', roomId, 'messages', message.id);
      await setDoc(msgRef, {
        id: message.id,
        roomId,
        senderId: message.senderId,
        senderName: message.senderName,
        senderAvatar: message.senderAvatar || '',
        text: message.text || '',
        mediaUrl: message.mediaUrl || null,
        mediaType: message.mediaType || null,
        timestamp: message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        isDelivered: true,
        status: 'delivered',
        createdAt: serverTimestamp()
      });

      // 2. Update room metadata
      const roomRef = doc(db, 'chatRooms', roomId);
      await updateDoc(roomRef, {
        lastMessage: message.text || (message.mediaUrl ? 'Attachment' : 'Message'),
        lastMessageTime: message.timestamp,
        lastSenderId: message.senderId,
        updatedAt: serverTimestamp()
      }).catch(async () => {
        // If room doc didn't exist, create it
        await setDoc(roomRef, {
          id: roomId,
          lastMessage: message.text,
          lastMessageTime: message.timestamp,
          lastSenderId: message.senderId,
          participantIds: [message.senderId, recipientId].filter(Boolean),
          updatedAt: serverTimestamp()
        }, { merge: true });
      });

      // 3. Push real-time notification to recipient
      if (recipientId && recipientId !== message.senderId && recipientId !== 'guest') {
        await this.sendNotificationToUser(recipientId, {
          title: `New Message from ${message.senderName || 'User'}`,
          message: message.text.length > 80 ? `${message.text.substring(0, 80)}...` : message.text,
          type: 'chat'
        });
      }
    } catch (err) {
      console.warn('sendRealtimeMessage error:', err);
    }
  }

  public subscribeToRoomMessages(
    roomId: string,
    onUpdate: (messages: ChatMessage[]) => void
  ): () => void {
    if (!roomId) return () => {};

    try {
      const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const msgs: ChatMessage[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            msgs.push({
              id: docSnap.id,
              roomId: data.roomId || roomId,
              senderId: data.senderId,
              senderName: data.senderName,
              senderAvatar: data.senderAvatar,
              text: data.text,
              mediaUrl: data.mediaUrl,
              mediaType: data.mediaType,
              timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isRead: !!data.isRead,
              isDelivered: !!data.isDelivered,
              status: data.isRead ? 'read' : data.isDelivered ? 'delivered' : 'sent'
            });
          });
          onUpdate(msgs);
        },
        (err) => {
          // Fallback query if index is building
          const fallbackUnsub = onSnapshot(messagesRef, (snapshot) => {
            const msgs: ChatMessage[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              msgs.push({
                id: docSnap.id,
                roomId: data.roomId || roomId,
                senderId: data.senderId,
                senderName: data.senderName,
                senderAvatar: data.senderAvatar,
                text: data.text,
                mediaUrl: data.mediaUrl,
                mediaType: data.mediaType,
                timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isRead: !!data.isRead,
                isDelivered: !!data.isDelivered,
                status: data.isRead ? 'read' : 'delivered'
              });
            });
            msgs.sort((a, b) => (a.id > b.id ? 1 : -1));
            onUpdate(msgs);
          });
          return fallbackUnsub;
        }
      );

      return unsubscribe;
    } catch (e) {
      console.warn('subscribeToRoomMessages error:', e);
      return () => {};
    }
  }

  public async markRoomMessagesAsRead(roomId: string, currentUserId: string): Promise<void> {
    if (!roomId || !currentUserId) return;
    try {
      const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
      const snap = await getDocs(messagesRef);
      const updates: Promise<any>[] = [];

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.senderId !== currentUserId && !data.isRead) {
          updates.push(updateDoc(docSnap.ref, { isRead: true, status: 'read' }));
        }
      });

      if (updates.length > 0) {
        await Promise.all(updates);
      }
    } catch (e) {}
  }

  public async deleteChatRoom(roomId: string): Promise<void> {
    if (!roomId) return;
    try {
      await deleteDoc(doc(db, 'chatRooms', roomId));
    } catch (e) {}
  }

  // ==========================================
  // 4. REAL-TIME NOTIFICATIONS
  // ==========================================
  public async sendNotificationToUser(
    userId: string,
    notification: { title: string; message: string; type: string }
  ): Promise<void> {
    if (!userId || userId === 'guest') return;
    try {
      const notifId = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const notifRef = doc(db, 'notifications', notifId);
      await setDoc(notifRef, {
        id: notifId,
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: false,
        timestamp: 'Just now',
        createdAt: serverTimestamp()
      });
    } catch (e) {}
  }

  public subscribeToUserNotifications(
    userId: string,
    onUpdate: (notifs: AppNotification[]) => void
  ): () => void {
    if (!userId || userId === 'guest') return () => {};
    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', userId));
      return onSnapshot(q, (snapshot) => {
        const notifs: AppNotification[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          notifs.push({
            id: docSnap.id,
            userId: d.userId,
            title: d.title,
            message: d.message,
            type: d.type || 'system',
            isRead: !!d.isRead,
            timestamp: d.timestamp || 'Just now'
          });
        });
        notifs.sort((a, b) => (b.id > a.id ? 1 : -1));
        onUpdate(notifs);
      });
    } catch (e) {
      return () => {};
    }
  }

  // ==========================================
  // 5. WEBRTC SIGNALING OVER FIRESTORE
  // ==========================================
  public async createWebRTCCall(callData: {
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    receiverId: string;
    receiverName: string;
    receiverAvatar?: string;
    isVideo: boolean;
  }): Promise<{ callId: string }> {
    const callId = `call_${callData.callerId}_${callData.receiverId}_${Date.now()}`;
    const callRef = doc(db, 'calls', callId);

    await setDoc(callRef, {
      id: callId,
      callerId: callData.callerId,
      callerName: callData.callerName,
      callerAvatar: callData.callerAvatar || '',
      receiverId: callData.receiverId,
      receiverName: callData.receiverName,
      receiverAvatar: callData.receiverAvatar || '',
      isVideo: callData.isVideo,
      status: 'offering',
      createdAt: serverTimestamp()
    });

    return { callId };
  }

  public subscribeToIncomingCalls(
    userId: string,
    onIncomingCall: (call: WebRTCCallSession | null) => void
  ): () => void {
    if (!userId || userId === 'guest') return () => {};
    try {
      const q = query(
        collection(db, 'calls'),
        where('receiverId', '==', userId),
        where('status', '==', 'offering')
      );

      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          onIncomingCall({
            id: docSnap.id,
            ...(docSnap.data() as any)
          });
        } else {
          onIncomingCall(null);
        }
      });
    } catch (e) {
      return () => {};
    }
  }

  public async setCallOffer(callId: string, offerSdp: RTCSessionDescriptionInit): Promise<void> {
    const callRef = doc(db, 'calls', callId);
    await updateDoc(callRef, {
      offer: {
        type: offerSdp.type,
        sdp: offerSdp.sdp
      },
      status: 'offering'
    });
  }

  public async setCallAnswer(callId: string, answerSdp: RTCSessionDescriptionInit): Promise<void> {
    const callRef = doc(db, 'calls', callId);
    await updateDoc(callRef, {
      answer: {
        type: answerSdp.type,
        sdp: answerSdp.sdp
      },
      status: 'connected'
    });
  }

  public async updateCallStatus(callId: string, status: 'connected' | 'rejected' | 'ended'): Promise<void> {
    if (!callId) return;
    try {
      const callRef = doc(db, 'calls', callId);
      await updateDoc(callRef, {
        status,
        endedAt: serverTimestamp()
      });
    } catch (e) {}
  }

  public listenToCall(callId: string, onUpdate: (call: WebRTCCallSession) => void): () => void {
    if (!callId) return () => {};
    const callRef = doc(db, 'calls', callId);
    return onSnapshot(callRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({ id: docSnap.id, ...(docSnap.data() as any) });
      }
    });
  }

  public async addIceCandidate(callId: string, isCaller: boolean, candidate: RTCIceCandidateInit): Promise<void> {
    if (!callId || !candidate) return;
    try {
      const subcollectionName = isCaller ? 'callerCandidates' : 'receiverCandidates';
      const colRef = collection(db, 'calls', callId, subcollectionName);
      await addDoc(colRef, {
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex,
        createdAt: serverTimestamp()
      });
    } catch (e) {}
  }

  public subscribeToIceCandidates(
    callId: string,
    isCaller: boolean,
    onCandidate: (candidate: RTCIceCandidateInit) => void
  ): () => void {
    if (!callId) return () => {};
    try {
      // Caller listens to receiver's candidates, and receiver listens to caller's candidates
      const subcollectionName = isCaller ? 'receiverCandidates' : 'callerCandidates';
      const colRef = collection(db, 'calls', callId, subcollectionName);
      return onSnapshot(colRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            onCandidate({
              candidate: data.candidate,
              sdpMid: data.sdpMid,
              sdpMLineIndex: data.sdpMLineIndex
            });
          }
        });
      });
    } catch (e) {
      return () => {};
    }
  }
}

export const firestoreRealtime = new FirestoreRealtimeService();
