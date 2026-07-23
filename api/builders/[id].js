import { supabase } from '../_lib/supabase.js';
import { authMiddleware } from '../_lib/auth.js';

export default async function handler(req, res) {
    const { id } = req.query;

    switch(req.method) {
        case 'GET':
            return await getBuilder(req, res, id);
        case 'PUT':
            return await updateBuilder(req, res, id);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function getBuilder(req, res, id) {
    try {
        const { data, error } = await supabase
            .from('builders')
            .select('*, users!owner_id(*)')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ success: false, error: 'Builder not found' });
            }
            throw error;
        }

        // Get projects for this builder
        const { data: projects } = await supabase
            .from('projects')
            .select('*')
            .eq('builder_id', id)
            .limit(10);

        res.json({
            success: true,
            data: { ...data, projects: projects || [] }
        });
    } catch (error) {
        console.error('Get builder error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function updateBuilder(req, res, id) {
    try {
        await authMiddleware(req, res, async () => {
            const { data: builder } = await supabase
                .from('builders')
                .select('owner_id')
                .eq('id', id)
                .single();

            if (!builder) {
                return res.status(404).json({ success: false, error: 'Builder not found' });
            }

            const role = await getUserRole(req.user.id);
            if (builder.owner_id !== req.user.id && role !== 'admin') {
                return res.status(403).json({ success: false, error: 'Not authorized to update this builder' });
            }

            const { data, error } = await supabase
                .from('builders')
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
        console.error('Update builder error:', error);
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
