import { supabase } from '../_lib/supabase.js';
import { authMiddleware } from '../_lib/auth.js';

export default async function handler(req, res) {
    switch(req.method) {
        case 'GET':
            return await getAgencies(req, res);
        case 'POST':
            return await createAgency(req, res);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function getAgencies(req, res) {
    try {
        const { limit = 20, page = 1 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = supabase
            .from('agencies')
            .select('*, users!owner_id(name, email, phone)', { count: 'exact' })
            .eq('status', 'active')
            .order('is_premium', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        res.json({ success: true, data, total: count });
    } catch (error) {
        console.error('Get agencies error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function createAgency(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const role = await getUserRole(req.user.id);
            if (role !== 'admin' && role !== 'agency') {
                return res.status(403).json({ success: false, error: 'Not authorized to create agency' });
            }

            const { data, error } = await supabase
                .from('agencies')
                .insert([{
                    ...req.body,
                    owner_id: req.user.id,
                    status: role === 'admin' ? 'active' : 'pending'
                }])
                .select()
                .single();

            if (error) throw error;
            res.status(201).json({ success: true, data });
        });
    } catch (error) {
        console.error('Create agency error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getUserRole(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data?.role || 'user';
    } catch (error) {
        return 'user';
    }
}
