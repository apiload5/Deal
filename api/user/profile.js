import { supabase } from '../_lib/supabase.js';
import { authMiddleware } from '../_lib/auth.js';

export default async function handler(req, res) {
    switch(req.method) {
        case 'GET':
            return await getProfile(req, res);
        case 'PUT':
            return await updateProfile(req, res);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function getProfile(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', req.user.id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Create profile if it doesn't exist
                    const { data: newProfile, error: createError } = await supabase
                        .from('users')
                        .insert([{
                            id: req.user.id,
                            email: req.user.email,
                            name: req.user.user_metadata?.name || 'User',
                            role: req.user.user_metadata?.role || 'user'
                        }])
                        .select()
                        .single();

                    if (createError) throw createError;
                    return res.json({ success: true, data: newProfile });
                }
                throw error;
            }

            res.json({ success: true, data });
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function updateProfile(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const { name, phone, avatar_url, bio } = req.body;

            // Update user metadata in auth
            await supabase.auth.updateUser({
                data: { name }
            });

            // Update user profile
            const { data, error } = await supabase
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

            if (error) throw error;

            res.json({ success: true, data });
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
