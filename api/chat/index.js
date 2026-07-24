import { supabase } from '../supabase.js';
import { authMiddleware } from '../auth.js';

export default async function handler(req, res) {
    switch(req.method) {
        case 'GET':
            return await getChatRooms(req, res);
        case 'POST':
            return await sendMessage(req, res);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function getChatRooms(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const { data, error } = await supabase
                .from('chat_rooms')
                .select(`
                    *,
                    user1:users!user1_id(id, name, avatar_url, email),
                    user2:users!user2_id(id, name, avatar_url, email)
                `)
                .or(`user1_id.eq.${req.user.id},user2_id.eq.${req.user.id}`)
                .order('last_message_at', { ascending: false });

            if (error) throw error;

            // Get unread counts for each room
            const roomsWithUnread = await Promise.all((data || []).map(async (room) => {
                const { count } = await supabase
                    .from('chat_messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('room_id', room.id)
                    .eq('receiver_id', req.user.id)
                    .eq('is_read', false);

                // Get last message
                const { data: lastMsg } = await supabase
                    .from('chat_messages')
                    .select('*')
                    .eq('room_id', room.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                return { 
                    ...room, 
                    unread_count: count || 0,
                    last_message: lastMsg?.[0] || null
                };
            }));

            res.json({ success: true, data: roomsWithUnread || [] });
        });
    } catch (error) {
        console.error('Chat rooms error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function sendMessage(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const { receiver_id, message, type = 'text' } = req.body;

            if (!receiver_id) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Receiver ID required' 
                });
            }

            if (!message && type === 'text') {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Message required' 
                });
            }

            // Check if receiver exists
            const { data: receiver } = await supabase
                .from('users')
                .select('id')
                .eq('id', receiver_id)
                .single();

            if (!receiver) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Receiver not found' 
                });
            }

            // Find or create chat room
            let { data: room } = await supabase
                .from('chat_rooms')
                .select('*')
                .or(`user1_id.eq.${req.user.id},user2_id.eq.${req.user.id}`)
                .or(`user1_id.eq.${receiver_id},user2_id.eq.${receiver_id}`)
                .maybeSingle();

            if (!room) {
                const { data: newRoom, error: createError } = await supabase
                    .from('chat_rooms')
                    .insert([{
                        user1_id: req.user.id,
                        user2_id: receiver_id,
                        created_at: new Date().toISOString(),
                        last_message_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (createError) throw createError;
                room = newRoom;
            }

            // Save message
            const { data: msg, error: msgError } = await supabase
                .from('chat_messages')
                .insert([{
                    room_id: room.id,
                    sender_id: req.user.id,
                    receiver_id: receiver_id,
                    message: message,
                    message_type: type,
                    is_read: false,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (msgError) throw msgError;

            // Update room last message
            await supabase
                .from('chat_rooms')
                .update({
                    last_message: message,
                    last_message_at: new Date().toISOString(),
                    [`${room.user1_id === req.user.id ? 'user1' : 'user2'}_unread_count`]: supabase.raw('? + 1', [1])
                })
                .eq('id', room.id);

            // Send notification to receiver (if online via WebSocket)
            try {
                const { data: receiverSocket } = await supabase
                    .from('user_sockets')
                    .select('socket_id')
                    .eq('user_id', receiver_id)
                    .maybeSingle();

                if (receiverSocket) {
                    // WebSocket will handle real-time delivery
                    // This is handled in the main index.js
                }
            } catch (e) {
                // WebSocket not available
            }

            // Create notification
            await supabase.from('notifications').insert([{
                user_id: receiver_id,
                type: 'new_message',
                title: 'New Message',
                message: `${req.user.user_metadata?.name || 'User'}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
                data: { 
                    sender_id: req.user.id, 
                    room_id: room.id,
                    message_id: msg.id
                },
                created_at: new Date().toISOString()
            }]);

            res.status(201).json({ 
                success: true, 
                data: { ...msg, room_id: room.id } 
            });
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get chat history with specific user
export async function getChatHistory(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'User ID required' 
                });
            }

            // Find room
            const { data: room } = await supabase
                .from('chat_rooms')
                .select('*')
                .or(`user1_id.eq.${req.user.id},user2_id.eq.${req.user.id}`)
                .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
                .maybeSingle();

            if (!room) {
                return res.json({ success: true, data: { messages: [], room: null } });
            }

            // Get messages
            const { data: messages, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('room_id', room.id)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Mark messages as read
            await supabase
                .from('chat_messages')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('room_id', room.id)
                .eq('receiver_id', req.user.id)
                .eq('is_read', false);

            // Reset unread count
            await supabase
                .from('chat_rooms')
                .update({
                    [`${room.user1_id === req.user.id ? 'user1' : 'user2'}_unread_count`]: 0
                })
                .eq('id', room.id);

            res.json({ 
                success: true, 
                data: { 
                    messages: messages || [], 
                    room 
                } 
            });
        });
    } catch (error) {
        console.error('Chat history error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
