import { supabase } from '../_lib/supabase.js';
import { authMiddleware } from '../_lib/auth.js';

export default async function handler(req, res) {
    const { id } = req.query;

    switch(req.method) {
        case 'GET':
            return await getProject(req, res, id);
        case 'PUT':
            return await updateProject(req, res, id);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function getProject(req, res, id) {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*, builders!builder_id(*), agencies!agency_id(*)')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ success: false, error: 'Project not found' });
            }
            throw error;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function updateProject(req, res, id) {
    try {
        await authMiddleware(req, res, async () => {
            const role = await getUserRole(req.user.id);
            if (role !== 'admin') {
                return res.status(403).json({ success: false, error: 'Admin access required' });
            }

            const { data, error } = await supabase
                .from('projects')
                .update({
                    ...req.body,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            res.json({ success: true, data });
        });
    } catch (error) {
        console.error('Update project error:', error);
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
