import { supabase } from '../supabase.js';
import { authMiddleware } from '../auth.js';

export default async function handler(req, res) {
    switch(req.method) {
        case 'GET':
            return await getProfile(req, res);
        case 'PUT':
            return await updateProfile(req, res);
        case 'POST':
            return await uploadDocument(req, res);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function getProfile(req, res) {
    try {
        await authMiddleware(req, res, async () => {
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
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function updateProfile(req, res) {
    try {
        await authMiddleware(req, res, async () => {
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
            } else if (userRole?.role === 'agent') {
                // Agent can update agency relation if needed
            }

            res.json({ success: true, data: user });
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function uploadDocument(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const { document_type, document_url } = req.body;

            if (!document_type || !document_url) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Document type and URL required' 
                });
            }

            const { data, error } = await supabase
                .from('kyc_documents')
                .insert([{
                    user_id: req.user.id,
                    document_type: document_type,
                    document_url: document_url,
                    status: 'pending',
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            // Notify admin
            await supabase.from('notifications').insert([{
                user_id: process.env.ADMIN_USER_ID || 'admin',
                type: 'kyc_uploaded',
                title: 'New KYC Document Uploaded',
                message: `${req.user.user_metadata?.name || 'User'} uploaded ${document_type}`,
                data: { user_id: req.user.id, document_id: data.id },
                created_at: new Date().toISOString()
            }]);

            res.json({ success: true, data });
        });
    } catch (error) {
        console.error('Upload document error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
