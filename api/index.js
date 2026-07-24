// api/index.js - DEAL.PK COMPLETE SYSTEM v2.0
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { supabase } from './supabase.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// SOCKET.IO - REAL-TIME CHAT & CALLS
// ============================================
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Store online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('🟢 New client connected:', socket.id);

    socket.on('user_online', (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        io.emit('users_online', Array.from(onlineUsers.keys()));
    });

    socket.on('send_message', async (data) => {
        const { receiverId, message, type = 'text' } = data;
        
        // Save to database
        const { data: msg, error } = await supabase
            .from('chat_messages')
            .insert([{
                sender_id: socket.userId,
                receiver_id: receiverId,
                message: message,
                message_type: type,
                is_read: false,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (!error) {
            // Send to receiver if online
            const receiverSocket = onlineUsers.get(receiverId);
            if (receiverSocket) {
                io.to(receiverSocket).emit('new_message', {
                    ...msg,
                    sender: socket.userId
                });
            }
            
            // Send confirmation to sender
            socket.emit('message_sent', msg);
        }
    });

    socket.on('typing', (data) => {
        const receiverSocket = onlineUsers.get(data.receiverId);
        if (receiverSocket) {
            io.to(receiverSocket).emit('user_typing', {
                userId: socket.userId,
                isTyping: data.isTyping
            });
        }
    });

    socket.on('call_user', async (data) => {
        const { receiverId, callType, offer } = data;
        const receiverSocket = onlineUsers.get(receiverId);
        
        if (receiverSocket) {
            io.to(receiverSocket).emit('incoming_call', {
                callerId: socket.userId,
                callType: callType,
                offer: offer
            });
        }
    });

    socket.on('answer_call', (data) => {
        const { callerId, answer } = data;
        const callerSocket = onlineUsers.get(callerId);
        if (callerSocket) {
            io.to(callerSocket).emit('call_answered', { answer });
        }
    });

    socket.on('ice_candidate', (data) => {
        const { receiverId, candidate } = data;
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
            io.to(receiverSocket).emit('ice_candidate', { candidate });
        }
    });

    socket.on('end_call', (data) => {
        const receiverSocket = onlineUsers.get(data.receiverId);
        if (receiverSocket) {
            io.to(receiverSocket).emit('call_ended');
        }
    });

    socket.on('disconnect', () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit('users_online', Array.from(onlineUsers.keys()));
        }
        console.log('🔴 Client disconnected:', socket.id);
    });
});

// ============================================
// EXPRESS MIDDLEWARE
// ============================================
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(join(__dirname, '../public')));

// ============================================
// AUTH MIDDLEWARE
// ============================================
async function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) throw error;
        req.user = user;
        req.userId = user.id;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
}

async function getUserRole(userId) {
    const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
    return data?.role || 'user';
}

async function adminMiddleware(req, res, next) {
    await authMiddleware(req, res, async () => {
        const role = await getUserRole(req.user.id);
        if (role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        next();
    });
}

async function agentMiddleware(req, res, next) {
    await authMiddleware(req, res, async () => {
        const role = await getUserRole(req.user.id);
        if (role !== 'agent' && role !== 'agency' && role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Agent access required' });
        }
        next();
    });
}

async function agencyMiddleware(req, res, next) {
    await authMiddleware(req, res, async () => {
        const role = await getUserRole(req.user.id);
        if (role !== 'agency' && role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Agency access required' });
        }
        next();
    });
}

async function builderMiddleware(req, res, next) {
    await authMiddleware(req, res, async () => {
        const role = await getUserRole(req.user.id);
        if (role !== 'builder' && role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Builder access required' });
        }
        next();
    });
}

// ============================================
// API ROUTES
// ============================================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        onlineUsers: onlineUsers.size
    });
});

// API Root
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Deal.pk v2.0 - Complete Real Estate System',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        features: {
            auth: '/api/auth',
            properties: '/api/properties',
            agencies: '/api/agencies',
            builders: '/api/builders',
            agents: '/api/agents',
            projects: '/api/projects',
            bookings: '/api/bookings',
            invoices: '/api/invoices',
            chat: '/api/chat',
            calls: '/api/calls',
            user: '/api/user',
            admin: '/api/admin'
        }
    });
});

// ============================================
// AUTH ROUTES (COMPLETE)
// ============================================

app.post('/api/auth/register', async (req, res) => {
    try {
        const {
            email, password, name, phone,
            role = 'user',
            businessName, businessAddress, businessPhone, businessLogo,
            cnic_front, cnic_back,
            agency_id,
            license_number,
            experience_years
        } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and name are required'
            });
        }

        // Register with Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, phone, role }
            }
        });

        if (error) throw error;

        if (data.user) {
            // Create user profile
            await supabase.from('users').insert([{
                id: data.user.id,
                email,
                name,
                phone,
                role,
                is_verified: false,
                is_premium: false,
                created_at: new Date().toISOString()
            }]);

            // Save KYC documents
            if (cnic_front && cnic_back) {
                await supabase.from('kyc_documents').insert([
                    { user_id: data.user.id, document_type: 'cnic_front', document_url: cnic_front, status: 'pending' },
                    { user_id: data.user.id, document_type: 'cnic_back', document_url: cnic_back, status: 'pending' }
                ]);
            }

            // Role-specific registration
            if (role === 'agent') {
                await supabase.from('agents').insert([{
                    user_id: data.user.id,
                    agency_id: agency_id || null,
                    license_number: license_number || '',
                    experience_years: parseInt(experience_years) || 0,
                    status: 'pending',
                    is_premium: false,
                    is_verified: false,
                    created_at: new Date().toISOString()
                }]);
            }

            if (role === 'agency') {
                await supabase.from('agencies').insert([{
                    owner_id: data.user.id,
                    name: businessName || name,
                    email: email,
                    phone: businessPhone || phone,
                    address: businessAddress || '',
                    logo: businessLogo || '',
                    license_number: license_number || '',
                    status: 'pending',
                    is_premium: false,
                    is_verified: false,
                    created_at: new Date().toISOString()
                }]);
            }

            if (role === 'builder') {
                await supabase.from('builders').insert([{
                    owner_id: data.user.id,
                    name: businessName || name,
                    email: email,
                    phone: businessPhone || phone,
                    address: businessAddress || '',
                    logo: businessLogo || '',
                    license_number: license_number || '',
                    status: 'pending',
                    is_premium: false,
                    is_verified: false,
                    created_at: new Date().toISOString()
                }]);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please wait for KYC verification.',
            user: data.user
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password required'
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Get user profile with role data
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        // Get role-specific data
        let roleData = null;
        if (profile?.role === 'agent') {
            const { data: agent } = await supabase
                .from('agents')
                .select('*, agencies(id, name, logo)')
                .eq('user_id', data.user.id)
                .single();
            roleData = agent;
        } else if (profile?.role === 'agency') {
            const { data: agency } = await supabase
                .from('agencies')
                .select('*')
                .eq('owner_id', data.user.id)
                .single();
            roleData = agency;
        } else if (profile?.role === 'builder') {
            const { data: builder } = await supabase
                .from('builders')
                .select('*')
                .eq('owner_id', data.user.id)
                .single();
            roleData = builder;
        }

        // Get KYC status
        const { data: kyc } = await supabase
            .from('kyc_documents')
            .select('*')
            .eq('user_id', data.user.id);

        // Get notifications count
        const { count: unreadCount } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', data.user.id)
            .eq('is_read', false);

        res.json({
            success: true,
            user: {
                ...data.user,
                profile,
                roleData,
                kyc: kyc || [],
                unreadCount: unreadCount || 0
            },
            session: data.session
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ success: false, error: error.message });
    }
});

app.post('/api/auth/logout', authMiddleware, async (req, res) => {
    try {
        await supabase.auth.signOut();
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// USER PROFILE (COMPLETE)
// ============================================

app.get('/api/user/profile', authMiddleware, async (req, res) => {
    try {
        // Get user profile
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (userError) throw userError;

        // Get role-specific data
        let roleData = null;
        let roleTable = null;
        
        if (user.role === 'agent') {
            const { data } = await supabase
                .from('agents')
                .select('*, agencies(id, name, logo, address, phone)')
                .eq('user_id', req.user.id)
                .single();
            roleData = data;
            roleTable = 'agents';
        } else if (user.role === 'agency') {
            const { data } = await supabase
                .from('agencies')
                .select('*')
                .eq('owner_id', req.user.id)
                .single();
            roleData = data;
            roleTable = 'agencies';
        } else if (user.role === 'builder') {
            const { data } = await supabase
                .from('builders')
                .select('*')
                .eq('owner_id', req.user.id)
                .single();
            roleData = data;
            roleTable = 'builders';
        }

        // Get KYC documents
        const { data: kyc } = await supabase
            .from('kyc_documents')
            .select('*')
            .eq('user_id', req.user.id);

        // Get stats
        let stats = {
            properties: 0,
            bookings: 0,
            inquiries: 0,
            favorites: 0
        };

        const [props, bookings, inquiries, favorites] = await Promise.all([
            supabase.from('properties').select('*', { count: 'exact', head: true }).eq('owner_id', req.user.id),
            supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('buyer_id', req.user.id),
            supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('user_id', req.user.id),
            supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', req.user.id)
        ]);

        stats.properties = props.count || 0;
        stats.bookings = bookings.count || 0;
        stats.inquiries = inquiries.count || 0;
        stats.favorites = favorites.count || 0;

        res.json({
            success: true,
            data: {
                ...user,
                roleData,
                roleTable,
                kyc: kyc || [],
                stats
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/user/profile', authMiddleware, async (req, res) => {
    try {
        const { name, phone, avatar_url, bio, address } = req.body;

        // Update user
        const { data: user, error: userError } = await supabase
            .from('users')
            .update({
                name,
                phone,
                avatar_url,
                bio,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.user.id)
            .select()
            .single();

        if (userError) throw userError;

        // Update role-specific profile
        const { data: userRole } = await supabase
            .from('users')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (userRole?.role === 'agency') {
            await supabase
                .from('agencies')
                .update({
                    name: name,
                    phone: phone,
                    address: address || '',
                    updated_at: new Date().toISOString()
                })
                .eq('owner_id', req.user.id);
        } else if (userRole?.role === 'builder') {
            await supabase
                .from('builders')
                .update({
                    name: name,
                    phone: phone,
                    address: address || '',
                    updated_at: new Date().toISOString()
                })
                .eq('owner_id', req.user.id);
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Upload avatar
app.post('/api/user/avatar', authMiddleware, async (req, res) => {
    try {
        const { avatar_url } = req.body;
        if (!avatar_url) {
            return res.status(400).json({ success: false, error: 'Avatar URL required' });
        }

        const { data, error } = await supabase
            .from('users')
            .update({ avatar_url, updated_at: new Date().toISOString() })
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// PROPERTIES ROUTES (COMPLETE)
// ============================================

app.get('/api/properties', async (req, res) => {
    try {
        let query = supabase
            .from('properties')
            .select('*, users!owner_id(id, name, email, phone, avatar_url), agencies(id, name, logo), builders(id, name, logo), agents(id, user_id)', { count: 'exact' })
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        // Apply filters
        if (req.query.city) query = query.eq('city', req.query.city);
        if (req.query.area) query = query.eq('area', req.query.area);
        if (req.query.type) query = query.eq('property_type', req.query.type);
        if (req.query.purpose) query = query.eq('purpose', req.query.purpose);
        if (req.query.minPrice) query = query.gte('price', parseFloat(req.query.minPrice));
        if (req.query.maxPrice) query = query.lte('price', parseFloat(req.query.maxPrice));
        if (req.query.beds) query = query.gte('beds', parseInt(req.query.beds));
        if (req.query.baths) query = query.gte('baths', parseInt(req.query.baths));
        if (req.query.minArea) query = query.gte('area_sqft', parseFloat(req.query.minArea));
        if (req.query.maxArea) query = query.lte('area_sqft', parseFloat(req.query.maxArea));
        if (req.query.furnished) query = query.eq('furnished', req.query.furnished);
        if (req.query.isPremium === 'true') query = query.eq('is_premium', true);
        if (req.query.isFeatured === 'true') query = query.eq('is_featured', true);
        if (req.query.agent_id) query = query.eq('agent_id', req.query.agent_id);
        if (req.query.agency_id) query = query.eq('agency_id', req.query.agency_id);
        if (req.query.builder_id) query = query.eq('builder_id', req.query.builder_id);

        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        res.json({
            success: true,
            data: data || [],
            total: count || 0,
            page,
            limit
        });
    } catch (error) {
        console.error('Properties error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/properties/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('properties')
            .select('*, users!owner_id(*), agencies(*), builders(*), agents(*, users!agent_user_id(id, name, email, phone, avatar_url))')
            .eq('id', req.params.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ success: false, error: 'Property not found' });
            }
            throw error;
        }

        // Increment views
        await supabase
            .from('properties')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', req.params.id);

        // Get similar properties
        const { data: similar } = await supabase
            .from('properties')
            .select('*')
            .eq('city', data.city)
            .eq('status', 'approved')
            .neq('id', req.params.id)
            .limit(5);

        res.json({
            success: true,
            data: { ...data, similar: similar || [] }
        });
    } catch (error) {
        console.error('Property detail error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/properties', authMiddleware, async (req, res) => {
    try {
        const role = await getUserRole(req.user.id);
        
        // Check if user is verified for agent/agency/builder roles
        let status = 'pending';
        let agentId = null;
        let agencyId = null;
        let builderId = null;

        if (role === 'agent') {
            const { data: agent } = await supabase
                .from('agents')
                .select('id, status, is_premium')
                .eq('user_id', req.user.id)
                .single();
            
            if (!agent || agent.status !== 'active') {
                return res.status(403).json({ success: false, error: 'Agent not verified' });
            }
            agentId = agent.id;
            status = agent.is_premium ? 'approved' : 'pending';
        } else if (role === 'agency') {
            const { data: agency } = await supabase
                .from('agencies')
                .select('id, status, is_premium')
                .eq('owner_id', req.user.id)
                .single();
            
            if (!agency || agency.status !== 'active') {
                return res.status(403).json({ success: false, error: 'Agency not verified' });
            }
            agencyId = agency.id;
            status = agency.is_premium ? 'approved' : 'pending';
        } else if (role === 'builder') {
            const { data: builder } = await supabase
                .from('builders')
                .select('id, status, is_premium')
                .eq('owner_id', req.user.id)
                .single();
            
            if (!builder || builder.status !== 'active') {
                return res.status(403).json({ success: false, error: 'Builder not verified' });
            }
            builderId = builder.id;
            status = builder.is_premium ? 'approved' : 'pending';
        }

        const propertyData = {
            ...req.body,
            owner_id: req.user.id,
            agent_id: agentId,
            agency_id: agencyId,
            builder_id: builderId,
            status: status,
            views: 0,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('properties')
            .insert([propertyData])
            .select()
            .single();

        if (error) throw error;

        // Notify admin for pending properties
        if (status === 'pending') {
            await supabase.from('notifications').insert([{
                user_id: process.env.ADMIN_USER_ID || 'admin',
                type: 'property_pending',
                title: 'New Property Pending Approval',
                message: `${req.user.user_metadata?.name || 'User'} listed a new property: ${data.title}`,
                data: { property_id: data.id },
                created_at: new Date().toISOString()
            }]);
        }

        res.status(201).json({
            success: true,
            data,
            message: status === 'approved' ? 'Property listed successfully!' : 'Property submitted for approval.'
        });
    } catch (error) {
        console.error('Create property error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/properties/:id', authMiddleware, async (req, res) => {
    try {
        // Check ownership
        const { data: existing } = await supabase
            .from('properties')
            .select('owner_id, status')
            .eq('id', req.params.id)
            .single();

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Property not found' });
        }

        const role = await getUserRole(req.user.id);
        if (existing.owner_id !== req.user.id && role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const updateData = { ...req.body, updated_at: new Date().toISOString() };
        if (role !== 'admin') {
            delete updateData.status; // Only admin can change status
        }

        const { data, error } = await supabase
            .from('properties')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        console.error('Update property error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/properties/:id', authMiddleware, async (req, res) => {
    try {
        const { data: existing } = await supabase
            .from('properties')
            .select('owner_id')
            .eq('id', req.params.id)
            .single();

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Property not found' });
        }

        const role = await getUserRole(req.user.id);
        if (existing.owner_id !== req.user.id && role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        await supabase.from('properties').delete().eq('id', req.params.id);
        res.json({ success: true, message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// FAVORITES / WISHLIST
// ============================================

app.get('/api/favorites', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select('*, properties!property_id(*)')
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json({ success: true, data: data || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/favorites', authMiddleware, async (req, res) => {
    try {
        const { propertyId } = req.body;
        if (!propertyId) {
            return res.status(400).json({ success: false, error: 'Property ID required' });
        }

        const { data: existing } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', req.user.id)
            .eq('property_id', propertyId)
            .maybeSingle();

        if (existing) {
            return res.status(400).json({ success: false, error: 'Already in favorites' });
        }

        const { data, error } = await supabase
            .from('favorites')
            .insert([{ user_id: req.user.id, property_id: propertyId }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/favorites/:propertyId', authMiddleware, async (req, res) => {
    try {
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', req.user.id)
            .eq('property_id', req.params.propertyId);

        if (error) throw error;
        res.json({ success: true, message: 'Removed from favorites' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// INQUIRIES
// ============================================

app.post('/api/inquiries', authMiddleware, async (req, res) => {
    try {
        const { property_id, message } = req.body;
        if (!property_id) {
            return res.status(400).json({ success: false, error: 'Property ID required' });
        }

        const { data, error } = await supabase
            .from('inquiries')
            .insert([{
                property_id,
                user_id: req.user.id,
                message,
                status: 'pending',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        // Notify property owner
        const { data: property } = await supabase
            .from('properties')
            .select('owner_id, title')
            .eq('id', property_id)
            .single();

        if (property) {
            await supabase.from('notifications').insert([{
                user_id: property.owner_id,
                type: 'new_inquiry',
                title: 'New Property Inquiry',
                message: `${req.user.user_metadata?.name || 'User'} inquired about "${property.title}"`,
                data: { inquiry_id: data.id, property_id },
                created_at: new Date().toISOString()
            }]);
        }

        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/inquiries', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('inquiries')
            .select('*, properties!property_id(*), users!user_id(*)')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data: data || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// CITIES & AREAS
// ============================================

app.get('/api/cities', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('cities')
            .select('*')
            .order('name');

        if (error) throw error;

        // Get property count per city
        const citiesWithCount = await Promise.all((data || []).map(async (city) => {
            const { count } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true })
                .eq('city', city.name)
                .eq('status', 'approved');
            return { ...city, property_count: count || 0 };
        }));

        res.json({ success: true, data: citiesWithCount });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/areas', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('areas')
            .select('*, cities!city_id(name)')
            .order('name');

        if (error) throw error;
        res.json({ success: true, data: data || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/cities/:cityId/areas', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('areas')
            .select('*')
            .eq('city_id', req.params.cityId)
            .order('name');

        if (error) throw error;
        res.json({ success: true, data: data || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// AGENCIES
// ============================================

app.get('/api/agencies', async (req, res) => {
    try {
        const { limit = 20, page = 1 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { data, error, count } = await supabase
            .from('agencies')
            .select('*, users!owner_id(id, name, email, phone, avatar_url)', { count: 'exact' })
            .eq('status', 'active')
            .eq('is_verified', true)
            .order('is_premium', { ascending: false })
            .order('rating', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (error) throw error;

        // Get agent count and property count for each agency
        const agenciesWithStats = await Promise.all((data || []).map(async (agency) => {
            const [agents, properties] = await Promise.all([
                supabase.from('agents').select('*', { count: 'exact', head: true }).eq('agency_id', agency.id).eq('status', 'active'),
                supabase.from('properties').select('*', { count: 'exact', head: true }).eq('agency_id', agency.id).eq('status', 'approved')
            ]);
            return {
                ...agency,
                agents_count: agents.count || 0,
                properties_count: properties.count || 0
            };
        }));

        res.json({ success: true, data: agenciesWithStats, total: count || 0 });
    } catch (error) {
        console.error('Agencies error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/agencies/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('agencies')
            .select('*, users!owner_id(*)')
            .eq('id', req.params.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ success: false, error: 'Agency not found' });
            }
            throw error;
        }

        // Get agents
        const { data: agents } = await supabase
            .from('agents')
            .select('*, users!user_id(id, name, email, phone, avatar_url)')
            .eq('agency_id', req.params.id)
            .eq('status', 'active');

        // Get properties
        const { data: properties } = await supabase
            .from('properties')
            .select('*')
            .eq('agency_id', req.params.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(10);

        // Get reviews
        const { data: reviews } = await supabase
            .from('reviews')
            .select('*, users!user_id(name, avatar_url)')
            .eq('agency_id', req.params.id)
            .order('created_at', { ascending: false })
            .limit(10);

        res.json({
            success: true,
            data: {
                ...data,
                agents: agents || [],
                properties: properties || [],
                reviews: reviews || []
            }
        });
    } catch (error) {
        console.error('Agency detail error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// BUILDERS
// ============================================

app.get('/api/builders', async (req, res) => {
    try {
        const { limit = 20, page = 1 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { data, error, count } = await supabase
            .from('builders')
            .select('*, users!owner_id(id, name, email, phone, avatar_url)', { count: 'exact' })
            .eq('status', 'active')
            .eq('is_verified', true)
            .order('is_premium', { ascending: false })
            .order('rating', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (error) throw error;

        const buildersWithStats = await Promise.all((data || []).map(async (builder) => {
            const [projects, properties] = await Promise.all([
                supabase.from('projects').select('*', { count: 'exact', head: true }).eq('builder_id', builder.id).eq('status', 'ongoing'),
                supabase.from('properties').select('*', { count: 'exact', head: true }).eq('builder_id', builder.id).eq('status', 'approved')
            ]);
            return {
                ...builder,
                projects_count: projects.count || 0,
                properties_count: properties.count || 0
            };
        }));

        res.json({ success: true, data: buildersWithStats, total: count || 0 });
    } catch (error) {
        console.error('Builders error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/builders/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('builders')
            .select('*, users!owner_id(*)')
            .eq('id', req.params.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ success: false, error: 'Builder not found' });
            }
            throw error;
        }

        // Get projects
        const { data: projects } = await supabase
            .from('projects')
            .select('*')
            .eq('builder_id', req.params.id)
            .order('created_at', { ascending: false });

        // Get properties
        const { data: properties } = await supabase
            .from('properties')
            .select('*')
            .eq('builder_id', req.params.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(10);

        res.json({
            success: true,
            data: {
                ...data,
                projects: projects || [],
                properties: properties || []
            }
        });
    } catch (error) {
        console.error('Builder detail error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// AGENTS
// ============================================

app.get('/api/agents', async (req, res) => {
    try {
        const { agency_id, limit = 20, page = 1 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = supabase
            .from('agents')
            .select('*, users!user_id(id, name, email, phone, avatar_url), agencies(id, name, logo)', { count: 'exact' })
            .eq('status', 'active')
            .eq('is_verified', true)
            .order('rating', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (agency_id) query = query.eq('agency_id', agency_id);

        const { data, error, count } = await query;
        if (error) throw error;

        const agentsWithStats = await Promise.all((data || []).map(async (agent) => {
            const { count } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true })
                .eq('agent_id', agent.id)
                .eq('status', 'approved');
            return { ...agent, properties_count: count || 0 };
        }));

        res.json({ success: true, data: agentsWithStats, total: count || 0 });
    } catch (error) {
        console.error('Agents error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/agents/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('agents')
            .select('*, users!user_id(*), agencies(*, users!agency_owner_id(id, name, email, phone))')
            .eq('id', req.params.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ success: false, error: 'Agent not found' });
            }
            throw error;
        }

        // Get properties
        const { data: properties } = await supabase
            .from('properties')
            .select('*')
            .eq('agent_id', req.params.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(10);

        // Get reviews
        const { data: reviews } = await supabase
            .from('reviews')
            .select('*, users!user_id(name, avatar_url)')
            .eq('agent_id', req.params.id)
            .order('created_at', { ascending: false })
            .limit(10);

        res.json({
            success: true,
            data: {
                ...data,
                properties: properties || [],
                reviews: reviews || []
            }
        });
    } catch (error) {
        console.error('Agent detail error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// PROJECTS (For Builders)
// ============================================

app.get('/api/projects', async (req, res) => {
    try {
        const { builder_id, city, limit = 20, page = 1 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = supabase
            .from('projects')
            .select('*, builders!builder_id(*, users!owner_id(id, name, email, phone))', { count: 'exact' })
            .in('status', ['ongoing', 'upcoming'])
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (builder_id) query = query.eq('builder_id', builder_id);
        if (city) query = query.eq('city', city);

        const { data, error, count } = await query;
        if (error) throw error;

        res.json({ success: true, data: data || [], total: count || 0 });
    } catch (error) {
        console.error('Projects error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/projects/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*, builders!builder_id(*, users!owner_id(*))')
            .eq('id', req.params.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ success: false, error: 'Project not found' });
            }
            throw error;
        }

        // Get properties in this project
        const { data: properties } = await supabase
            .from('properties')
            .select('*')
            .eq('project_id', req.params.id)
            .eq('status', 'approved')
            .limit(10);

        res.json({
            success: true,
            data: { ...data, properties: properties || [] }
        });
    } catch (error) {
        console.error('Project detail error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/projects', authMiddleware, builderMiddleware, async (req, res) => {
    try {
        const { data: builder } = await supabase
            .from('builders')
            .select('id, status, is_premium')
            .eq('owner_id', req.user.id)
            .single();

        if (!builder || builder.status !== 'active') {
            return res.status(403).json({ success: false, error: 'Builder not verified' });
        }

        const projectData = {
            ...req.body,
            builder_id: builder.id,
            status: builder.is_premium ? 'ongoing' : 'pending',
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('projects')
            .insert([projectData])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// BOOKINGS (COMPLETE WITH COMMISSION & ESCROW)
// ============================================

app.post('/api/bookings', authMiddleware, async (req, res) => {
    try {
        const { 
            property_id, 
            project_id,
            amount, 
            booking_type = 'booking',
            payment_method = 'online'
        } = req.body;

        // Get property details with all associations
        const { data: property } = await supabase
            .from('properties')
            .select(`
                *,
                users!owner_id(id, name, email, phone),
                agents!agent_id(id, commission_rate, user_id),
                agencies!agency_id(id, commission_rate, owner_id),
                builders!builder_id(id, commission_rate, owner_id)
            `)
            .eq('id', property_id)
            .single();

        if (!property) {
            return res.status(404).json({ success: false, error: 'Property not found' });
        }

        // Calculate commission
        let commission_rate = 0;
        let commission_amount = 0;
        let commission_receiver_type = null;
        let commission_receiver_id = null;

        if (property.agents) {
            commission_rate = property.agents.commission_rate || 5;
            commission_amount = (amount * commission_rate) / 100;
            commission_receiver_type = 'agent';
            commission_receiver_id = property.agents.user_id;
        } else if (property.agencies) {
            commission_rate = property.agencies.commission_rate || 5;
            commission_amount = (amount * commission_rate) / 100;
            commission_receiver_type = 'agency';
            commission_receiver_id = property.agencies.owner_id;
        } else if (property.builders) {
            commission_rate = property.builders.commission_rate || 5;
            commission_amount = (amount * commission_rate) / 100;
            commission_receiver_type = 'builder';
            commission_receiver_id = property.builders.owner_id;
        }

        // Calculate Deal.pk commission (2% of total)
        const dealCommission = amount * 0.02;
        const netAmount = amount - dealCommission;

        // Create booking
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert([{
                property_id,
                project_id,
                buyer_id: req.user.id,
                seller_id: property.owner_id,
                agent_id: property.agent_id || null,
                booking_type,
                amount: netAmount,
                payment_method,
                payment_status: 'pending',
                status: 'pending',
                commission_amount,
                commission_status: 'pending',
                booking_date: new Date().toISOString(),
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (bookingError) throw bookingError;

        // Create commission record
        if (commission_amount > 0) {
            await supabase.from('commissions').insert([{
                booking_id: booking.id,
                agent_id: property.agent_id || null,
                agency_id: property.agency_id || null,
                builder_id: property.builder_id || null,
                amount: commission_amount,
                rate: commission_rate,
                status: 'pending',
                created_at: new Date().toISOString()
            }]);
        }

        // Create invoice
        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert([{
                booking_id: booking.id,
                invoice_number: invoiceNumber,
                buyer_id: req.user.id,
                seller_id: property.owner_id,
                agent_id: property.agent_id || null,
                amount: amount,
                tax_amount: dealCommission,
                total_amount: amount,
                status: 'pending',
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (invoiceError) throw invoiceError;

        // Send notifications
        await supabase.from('notifications').insert([
            {
                user_id: property.owner_id,
                type: 'new_booking',
                title: 'New Booking Received',
                message: `${req.user.user_metadata?.name || 'User'} booked "${property.title}" for PKR ${amount.toLocaleString()}`,
                data: { booking_id: booking.id, property_id },
                created_at: new Date().toISOString()
            },
            {
                user_id: req.user.id,
                type: 'booking_confirmed',
                title: 'Booking Confirmed',
                message: `Your booking for "${property.title}" has been confirmed. Invoice #${invoiceNumber}`,
                data: { booking_id: booking.id, invoice_id: invoice.id },
                created_at: new Date().toISOString()
            },
            {
                user_id: process.env.ADMIN_USER_ID || 'admin',
                type: 'booking_pending',
                title: 'New Booking Pending Approval',
                message: `Booking #${booking.id} needs admin approval`,
                data: { booking_id: booking.id },
                created_at: new Date().toISOString()
            }
        ]);

        res.status(201).json({
            success: true,
            data: {
                booking,
                invoice,
                commission: {
                    amount: commission_amount,
                    rate: commission_rate,
                    receiver_type: commission_receiver_type,
                    receiver_id: commission_receiver_id
                },
                deal_commission: dealCommission
            },
            message: 'Booking created! Please complete payment to confirm.'
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user bookings
app.get('/api/bookings', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                properties!property_id(title, city, price, images),
                users!buyer_id(name, email, phone),
                users!seller_id(name, email, phone),
                invoices!booking_id(*)
            `)
            .or(`buyer_id.eq.${req.user.id},seller_id.eq.${req.user.id}`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data: data || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// INVOICES
// ============================================

app.get('/api/invoices', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('invoices')
            .select('*, bookings!booking_id(*, properties!property_id(title))')
            .or(`buyer_id.eq.${req.user.id},seller_id.eq.${req.user.id}`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data: data || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/invoices/:id/pay', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_method = 'online' } = req.body;

        // Check invoice exists and belongs to user
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('*, bookings!booking_id(*)')
            .eq('id', id)
            .single();

        if (invoiceError) throw invoiceError;

        if (invoice.buyer_id !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        // Process payment (integrate with payment gateway here)
        // For now, mark as paid
        const { data, error } = await supabase
            .from('invoices')
            .update({
                status: 'paid',
                paid_date: new Date().toISOString(),
                payment_method
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Update booking payment status
        await supabase
            .from('bookings')
            .update({
                payment_status: 'paid',
                status: 'confirmed'
            })
            .eq('id', invoice.booking_id);

        // Notify seller
        await supabase.from('notifications').insert([{
            user_id: invoice.seller_id,
            type: 'payment_received',
            title: 'Payment Received',
            message: `Payment of PKR ${invoice.amount.toLocaleString()} received for invoice #${invoice.invoice_number}`,
            data: { invoice_id: id },
            created_at: new Date().toISOString()
        }]);

        res.json({ success: true, data, message: 'Payment successful!' });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// CHAT ROUTES (REST API)
// ============================================

app.get('/api/chat/rooms', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('chat_rooms')
            .select(`
                *,
                users!user1_id(id, name, avatar_url),
                users!user2_id(id, name, avatar_url),
                chat_messages!last_message_id(*)
            `)
            .or(`user1_id.eq.${req.user.id},user2_id.eq.${req.user.id}`)
            .order('last_message_at', { ascending: false });

        if (error) throw error;

        // Get unread counts
        const roomsWithUnread = await Promise.all((data || []).map(async (room) => {
            const { count } = await supabase
                .from('chat_messages')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', room.id)
                .eq('receiver_id', req.user.id)
                .eq('is_read', false);

            return { ...room, unread_count: count || 0 };
        }));

        res.json({ success: true, data: roomsWithUnread || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/chat/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        // Find or create chat room
        let { data: room } = await supabase
            .from('chat_rooms')
            .select('*')
            .or(`user1_id.eq.${req.user.id},user2_id.eq.${req.user.id}`)
            .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
            .single();

        if (!room) {
            const { data: newRoom } = await supabase
                .from('chat_rooms')
                .insert([{
                    user1_id: req.user.id,
                    user2_id: userId,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();
            room = newRoom;
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

        // Get user info
        const { data: user } = await supabase
            .from('users')
            .select('id, name, email, phone, avatar_url, role')
            .eq('id', userId)
            .single();

        res.json({
            success: true,
            data: {
                room,
                messages: messages || [],
                user
            }
        });
    } catch (error) {
        console.error('Chat history error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// NOTIFICATIONS
// ============================================

app.get('/api/notifications', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        res.json({ success: true, data: data || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/notifications/:id/read', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/notifications/read-all', authMiddleware, async (req, res) => {
    try {
        await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('user_id', req.user.id)
            .eq('is_read', false);

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// ADMIN ROUTES (COMPLETE)
// ============================================

app.get('/api/admin/dashboard', adminMiddleware, async (req, res) => {
    try {
        const [
            totalUsers,
            totalProperties,
            pendingProperties,
            totalAgencies,
            totalBuilders,
            totalAgents,
            totalBookings,
            totalRevenue,
            pendingKYC,
            totalCommissions,
            pendingCommissions
        ] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
            supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('agencies').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('builders').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('bookings').select('*', { count: 'exact', head: true }),
            supabase.from('invoices').select('amount').eq('status', 'paid'),
            supabase.from('kyc_documents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('commissions').select('amount'),
            supabase.from('commissions').select('amount').eq('status', 'pending')
        ]);

        const revenue = totalRevenue.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        const totalCommission = totalCommissions.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        const pendingCommissionTotal = pendingCommissions.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

        // Get recent activity
        const { data: recentActivity } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        res.json({
            success: true,
            stats: {
                totalUsers: totalUsers.count || 0,
                totalProperties: totalProperties.count || 0,
                pendingProperties: pendingProperties.count || 0,
                totalAgencies: totalAgencies.count || 0,
                totalBuilders: totalBuilders.count || 0,
                totalAgents: totalAgents.count || 0,
                totalBookings: totalBookings.count || 0,
                totalRevenue: revenue,
                pendingKYC: pendingKYC.count || 0,
                totalCommissions: totalCommission,
                pendingCommissions: pendingCommissionTotal
            },
            recentActivity: recentActivity || []
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin - Get all users
app.get('/api/admin/users', adminMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data: data || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin - Update user
app.put('/api/admin/users/:id', adminMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({ ...req.body, updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin - Delete user
app.delete('/api/admin/users/:id', adminMiddleware, async (req, res) => {
    try {
        await supabase.from('users').delete().eq('id', req.params.id);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin - Get pending properties
app.get('/api/admin/properties/pending', adminMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('properties')
            .select('*, users!owner_id(id, name, email, phone)')
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json({ success: true, data: data || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin - Approve property
app.post('/api/admin/properties/approve', adminMiddleware, async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ success: false, error: 'Property ID required' });
        }

        const { data, error } = await supabase
            .from('properties')
            .update({ status: 'approved', updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        await supabase.from('notifications').insert([{
            user_id: data.owner_id,
            type: 'property_approved',
            title: 'Property Approved!',
            message: `Your property "${data.title}" has been approved and is now live!`,
            data: { property_id: data.id },
            created_at: new Date().toISOString()
        }]);

        res.json({ success: true, data, message: 'Property approved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin - Reject property
app.post('/api/admin/properties/reject', adminMiddleware, async (req, res) => {
    try {
        const { id, reason } = req.body;
        if (!id) {
            return res.status(400).json({ success: false, error: 'Property ID required' });
        }

        const { data, error } = await supabase
            .from('properties')
            .update({ status: 'rejected', updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        await supabase.from('notifications').insert([{
            user_id: data.owner_id,
            type: 'property_rejected',
            title: 'Property Rejected',
            message: `Your property "${data.title}" was rejected. Reason: ${reason || 'Not specified'}`,
            data: { property_id: data.id },
            created_at: new Date().toISOString()
        }]);

        res.json({ success: true, data, message: 'Property rejected' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin - Get pending KYC
app.get('/api/admin/kyc', adminMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('kyc_documents')
            .select('*, users!user_id(id, name, email, phone)')
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json({ success: true, data: data || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin - Verify KYC
app.post('/api/admin/kyc/verify', adminMiddleware, async (req, res) => {
    try {
        const { user_id, status } = req.body;

        // Update KYC documents
        await supabase
            .from('kyc_documents')
            .update({ 
                status, 
                verified_by: req.user.id, 
                verified_at: new Date().toISOString() 
            })
            .eq('user_id', user_id);

        if (status === 'verified') {
            // Update user
            await supabase
                .from('users')
                .update({ is_verified: true })
                .eq('id', user_id);

            // Update role-specific status
            const { data: user } = await supabase
                .from('users')
                .select('role')
                .eq('id', user_id)
                .single();

            if (user) {
                const table = user.role === 'agent' ? 'agents' : 
                            user.role === 'agency' ? 'agencies' : 
                            user.role === 'builder' ? 'builders' : null;
                
                if (table) {
                    const column = user.role === 'agent' ? 'user_id' : 'owner_id';
                    await supabase
                        .from(table)
                        .update({ status: 'active', is_verified: true })
                        .eq(column, user_id);
                }
            }

            await supabase.from('notifications').insert([{
                user_id,
                type: 'kyc_verified',
                title: 'KYC Verified!',
                message: 'Your KYC has been verified. You can now list properties and start dealing!',
                created_at: new Date().toISOString()
            }]);
        } else {
            await supabase.from('notifications').insert([{
                user_id,
                type: 'kyc_rejected',
                title: 'KYC Rejected',
                message: 'Your KYC has been rejected. Please re-submit your documents.',
                created_at: new Date().toISOString()
            }]);
        }

        res.json({ success: true, message: `KYC ${status} successfully` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin - Get all bookings
app.get('/api/admin/bookings', adminMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                properties!property_id(title, city, price),
                users!buyer_id(name, email, phone),
                users!seller_id(name, email, phone),
                invoices!booking_id(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data: data || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin - Update booking status
app.put('/api/admin/bookings/:id', adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const { data, error } = await supabase
            .from('bookings')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        await supabase.from('notifications').insert([{
            user_id: data.buyer_id,
            type: 'booking_updated',
            title: `Booking ${status}`,
            message: `Your booking #${data.id} is now ${status}`,
            data: { booking_id: data.id },
            created_at: new Date().toISOString()
        }]);

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin - Get all commissions
app.get('/api/admin/commissions', adminMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('commissions')
            .select(`
                *,
                bookings!booking_id(*, properties!property_id(title)),
                agents!agent_id(*, users!agent_user_id(name, email)),
                agencies!agency_id(*, users!agency_owner_id(name, email)),
                builders!builder_id(*, users!builder_owner_id(name, email))
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data: data || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin - Pay commission
app.post('/api/admin/commissions/pay', adminMiddleware, async (req, res) => {
    try {
        const { id, transaction_id } = req.body;

        const { data, error } = await supabase
            .from('commissions')
            .update({ 
                status: 'paid', 
                paid_date: new Date().toISOString(),
                transaction_id
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Update booking commission status
        await supabase
            .from('bookings')
            .update({ commission_status: 'paid' })
            .eq('id', data.booking_id);

        // Get receiver and notify
        let receiverId = null;
        if (data.agent_id) {
            const { data: agent } = await supabase
                .from('agents')
                .select('user_id')
                .eq('id', data.agent_id)
                .single();
            receiverId = agent?.user_id;
        } else if (data.agency_id) {
            const { data: agency } = await supabase
                .from('agencies')
                .select('owner_id')
                .eq('id', data.agency_id)
                .single();
            receiverId = agency?.owner_id;
        } else if (data.builder_id) {
            const { data: builder } = await supabase
                .from('builders')
                .select('owner_id')
                .eq('id', data.builder_id)
                .single();
            receiverId = builder?.owner_id;
        }

        if (receiverId) {
            await supabase.from('notifications').insert([{
                user_id: receiverId,
                type: 'commission_paid',
                title: 'Commission Paid!',
                message: `Commission of PKR ${data.amount.toLocaleString()} has been paid. Transaction #${transaction_id}`,
                data: { commission_id: id },
                created_at: new Date().toISOString()
            }]);
        }

        res.json({ success: true, data, message: 'Commission paid successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// SPA ROUTING - CATCH ALL
// ============================================

app.get('*', (req, res) => {
    // Check if path is for admin
    if (req.path === '/admin' || req.path.startsWith('/admin/')) {
        return res.sendFile(join(__dirname, '../public/admin.html'));
    }
    
    // Serve index.html for all other routes (SPA)
    res.sendFile(join(__dirname, '../public/index.html'));
});

// ============================================
// START SERVER
// ============================================

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Deal.pk v2.0 Complete System running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health: http://localhost:${PORT}/health`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`💬 WebSocket: ws://localhost:${PORT}`);
    console.log(`👥 Online Users: 0`);
});
