// Chat System with WebRTC Support
class ChatSystem {
    constructor() {
        this.ws = null;
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.roomId = null;
        this.currentChatUser = null;
        this.isCalling = false;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.socketId = null;
    }

    // Initialize WebSocket
    initWebSocket(userId) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws`;

        this.ws = new WebSocket(`${wsUrl}?userId=${userId}`);
        
        this.ws.onopen = () => {
            console.log('🔗 WebSocket connected');
            this.connected = true;
            this.reconnectAttempts = 0;
            this.ws.send(JSON.stringify({
                type: 'user_online',
                userId: userId
            }));
            this.loadChatRooms();
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (e) {
                console.error('WebSocket message parse error:', e);
            }
        };

        this.ws.onclose = () => {
            console.log('🔌 WebSocket disconnected');
            this.connected = false;
            this.reconnectWebSocket(userId);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    reconnectWebSocket(userId) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnect attempts reached');
            return;
        }
        this.reconnectAttempts++;
        setTimeout(() => {
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
            this.initWebSocket(userId);
        }, 3000 * this.reconnectAttempts);
    }

    // Handle incoming messages
    handleMessage(data) {
        switch(data.type) {
            case 'new_message':
                this.displayMessage(data.message);
                break;
            case 'call_offer':
                this.handleCallOffer(data);
                break;
            case 'call_answer':
                this.handleCallAnswer(data);
                break;
            case 'ice_candidate':
                this.handleIceCandidate(data);
                break;
            case 'call_end':
                this.endCall();
                break;
            case 'user_typing':
                this.showTypingIndicator(data.userId, data.isTyping);
                break;
            case 'users_online':
                this.updateOnlineUsers(data.users);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }

    // Load chat rooms
    async loadChatRooms() {
        try {
            const response = await fetch('/api/chat/rooms', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            const data = await response.json();
            if (data.success) {
                this.renderChatRooms(data.data);
            }
        } catch (error) {
            console.error('Load chat rooms error:', error);
        }
    }

    // Render chat rooms
    renderChatRooms(rooms) {
        const container = document.getElementById('chatRoomsList');
        if (!container) return;

        if (!rooms || rooms.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-comment text-4xl text-gray-600 mb-3 block"></i>
                    <p class="text-gray-400">No conversations yet</p>
                    <p class="text-gray-500 text-sm">Start chatting with agents or buyers</p>
                </div>
            `;
            return;
        }

        let html = '';
        rooms.forEach(room => {
            const otherUser = room.user1_id === localStorage.getItem('userId') ? room.user2 : room.user1;
            const unread = room.unread_count || 0;
            const lastMsg = room.last_message || 'No messages yet';
            
            html += `
                <div class="chat-room glass p-3 rounded-xl cursor-pointer hover:border-orange-500/30 transition flex items-center gap-3" 
                     onclick="chatSystem.openChat('${otherUser?.id || ''}', '${otherUser?.name || 'Unknown'}')">
                    <div class="relative">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold">
                            ${otherUser?.name?.charAt(0) || 'U'}
                        </div>
                        <div class="absolute bottom-0 right-0 w-3 h-3 rounded-full ${room.is_online ? 'bg-green-500' : 'bg-gray-500'} border-2 border-dark"></div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center">
                            <h4 class="font-semibold text-sm truncate">${otherUser?.name || 'Unknown'}</h4>
                            ${unread > 0 ? `<span class="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">${unread}</span>` : ''}
                        </div>
                        <p class="text-xs text-gray-400 truncate">${lastMsg}</p>
                    </div>
                    <button onclick="event.stopPropagation(); chatSystem.startCall('${otherUser?.id || ''}', 'voice')" 
                            class="text-gray-400 hover:text-green-500 transition p-1">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button onclick="event.stopPropagation(); chatSystem.startCall('${otherUser?.id || ''}', 'video')" 
                            class="text-gray-400 hover:text-blue-500 transition p-1">
                        <i class="fas fa-video"></i>
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // Open chat with user
    async openChat(userId, userName) {
        this.currentChatUser = { id: userId, name: userName };
        document.getElementById('chatCurrentUser').textContent = userName;
        document.getElementById('chatView').classList.remove('hidden');
        document.getElementById('chatRoomsView').classList.add('hidden');

        try {
            const response = await fetch(`/api/chat/${userId}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            const data = await response.json();
            if (data.success) {
                this.renderMessages(data.data.messages || []);
                this.roomId = data.data.room?.id;
                document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
            }
        } catch (error) {
            console.error('Open chat error:', error);
        }
    }

    // Render messages
    renderMessages(messages) {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        if (!messages || messages.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500 text-sm">
                    No messages yet. Start the conversation!
                </div>
            `;
            return;
        }

        const userId = localStorage.getItem('userId');
        let html = '';
        messages.forEach(msg => {
            const isMine = msg.sender_id === userId;
            html += `
                <div class="flex ${isMine ? 'justify-end' : 'justify-start'} mb-2">
                    <div class="max-w-[70%] ${isMine ? 'bg-orange-500/20 rounded-l-xl rounded-tr-xl' : 'bg-white/5 rounded-r-xl rounded-tl-xl'} p-3">
                        <p class="text-sm">${msg.message || ''}</p>
                        <p class="text-[9px] text-gray-500 mt-1">${new Date(msg.created_at).toLocaleTimeString()}</p>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        container.scrollTop = container.scrollHeight;
    }

    // Send message
    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message || !this.currentChatUser) return;

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'send_message',
                receiverId: this.currentChatUser.id,
                message: message,
                type: 'text'
            }));
        }

        // Optimistically add message
        const container = document.getElementById('chatMessages');
        const userId = localStorage.getItem('userId');
        container.innerHTML += `
            <div class="flex justify-end mb-2">
                <div class="max-w-[70%] bg-orange-500/20 rounded-l-xl rounded-tr-xl p-3">
                    <p class="text-sm">${message}</p>
                    <p class="text-[9px] text-gray-500 mt-1">Just now</p>
                </div>
            </div>
        `;
        container.scrollTop = container.scrollHeight;
        input.value = '';
    }

    // Display incoming message
    displayMessage(message) {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        const userId = localStorage.getItem('userId');
        const isMine = message.sender_id === userId;
        
        container.innerHTML += `
            <div class="flex ${isMine ? 'justify-end' : 'justify-start'} mb-2">
                <div class="max-w-[70%] ${isMine ? 'bg-orange-500/20 rounded-l-xl rounded-tr-xl' : 'bg-white/5 rounded-r-xl rounded-tl-xl'} p-3">
                    <p class="text-sm">${message.message || ''}</p>
                    <p class="text-[9px] text-gray-500 mt-1">${new Date(message.created_at).toLocaleTimeString()}</p>
                </div>
            </div>
        `;
        container.scrollTop = container.scrollHeight;
    }

    // Start Call (Voice/Video)
    async startCall(receiverId, callType) {
        try {
            const constraints = {
                audio: true,
                video: callType === 'video'
            };

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });

            this.peerConnection.ontrack = (event) => {
                this.remoteStream = event.streams[0];
                this.showRemoteStream();
            };

            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate && this.ws) {
                    this.ws.send(JSON.stringify({
                        type: 'ice_candidate',
                        receiverId: receiverId,
                        candidate: event.candidate
                    }));
                }
            };

            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            if (this.ws) {
                this.ws.send(JSON.stringify({
                    type: 'call_offer',
                    receiverId: receiverId,
                    callType: callType,
                    offer: offer
                }));
            }

            this.isCalling = true;
            this.showCallUI('Calling...');
            this.showLocalStream();

        } catch (error) {
            console.error('Start call error:', error);
            showToast('error', 'Call Error', 'Unable to start call');
        }
    }

    // Handle call offer
    handleCallOffer(data) {
        if (confirm(`${data.callerName || 'Someone'} is calling you. Accept?`)) {
            this.answerCall(data);
        } else {
            if (this.ws) {
                this.ws.send(JSON.stringify({
                    type: 'call_end',
                    receiverId: data.senderId
                }));
            }
        }
    }

    // Answer call
    async answerCall(data) {
        try {
            const constraints = {
                audio: true,
                video: data.callType === 'video'
            };

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });

            this.peerConnection.ontrack = (event) => {
                this.remoteStream = event.streams[0];
                this.showRemoteStream();
            };

            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate && this.ws) {
                    this.ws.send(JSON.stringify({
                        type: 'ice_candidate',
                        receiverId: data.senderId,
                        candidate: event.candidate
                    }));
                }
            };

            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            if (this.ws) {
                this.ws.send(JSON.stringify({
                    type: 'call_answer',
                    receiverId: data.senderId,
                    answer: answer
                }));
            }

            this.isCalling = true;
            this.showCallUI('Connected');
            this.showLocalStream();

        } catch (error) {
            console.error('Answer call error:', error);
            showToast('error', 'Call Error', 'Unable to answer call');
        }
    }

    // Handle call answer
    handleCallAnswer(data) {
        if (this.peerConnection) {
            this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            this.showCallUI('Connected');
        }
    }

    // Handle ICE candidate
    handleIceCandidate(data) {
        if (this.peerConnection) {
            this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    }

    // End call
    endCall() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        this.remoteStream = null;
        this.isCalling = false;
        this.hideCallUI();
        document.getElementById('localVideo').srcObject = null;
        document.getElementById('remoteVideo').srcObject = null;
    }

    // Show call UI
    showCallUI(status) {
        document.getElementById('callStatus').textContent = status;
        document.getElementById('callUI').classList.remove('hidden');
    }

    hideCallUI() {
        document.getElementById('callUI').classList.add('hidden');
    }

    showLocalStream() {
        const video = document.getElementById('localVideo');
        if (video) video.srcObject = this.localStream;
    }

    showRemoteStream() {
        const video = document.getElementById('remoteVideo');
        if (video) video.srcObject = this.remoteStream;
        document.getElementById('remoteVideoContainer').classList.remove('hidden');
    }

    showTypingIndicator(userId, isTyping) {
        // Show typing indicator
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.textContent = isTyping ? 'Typing...' : '';
            indicator.classList.toggle('hidden', !isTyping);
        }
    }

    updateOnlineUsers(users) {
        // Update online status of users
        document.querySelectorAll('.chat-room .online-status').forEach(el => {
            const userId = el.dataset.userId;
            el.classList.toggle('bg-green-500', users.includes(userId));
            el.classList.toggle('bg-gray-500', !users.includes(userId));
        });
    }

    // Back to rooms
    backToRooms() {
        document.getElementById('chatView').classList.add('hidden');
        document.getElementById('chatRoomsView').classList.remove('hidden');
        this.currentChatUser = null;
        this.loadChatRooms();
    }
}

// Initialize chat system
const chatSystem = new ChatSystem();

// Show toast function (if not already defined)
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer') || document.body;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<strong>${title}</strong>: ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Export for use in main app
export { chatSystem };
