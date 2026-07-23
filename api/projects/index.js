import { supabase } from '../_lib/supabase.js';
import { authMiddleware } from '../_lib/auth.js';

export default async function handler(req, res) {
    switch(req.method) {
        case 'GET':
            return await getProjects(req, res);
        case 'POST':
            return await createProject(req, res);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function getProjects(req, res) {
    try {
        const { limit = 20, page = 1, builder_id, city } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = supabase
            .from('projects')
            .select('*, builders!builder_id(*), agencies!agency_id(*)', { count: 'exact' })
            .eq('status', 'active')
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (builder_id) query = query.eq('builder_id', builder_id);
        if (city) query = query.eq('city', city);

        const { data, error, count } = await query;
        if (error) throw error;

        res.json({ success: true, data, total: count });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function createProject(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const role = await getUserRole(req.user.id);
            if (role !== 'admin' && role !== 'builder') {
                return res.status(403).json({ success: false, error: 'Not authorized to create project' });
            }

            const { data, error } = await supabase
                .from('projects')
                .insert([{
                    ...req.body,
                    status: role === 'admin' ? 'active' : 'pending'
                }])
                .select()
                .single();

            if (error) throw error;
            res.status(201).json({ success: true, data });
        });
    } catch (error) {
        console.error('Create project error:', error);
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
