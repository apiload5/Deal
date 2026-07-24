import { supabase } from './supabase.js';
import { authMiddleware } from './auth.js';

export default async function handler(req, res) {
    const { id } = req.query;

    switch(req.method) {
        case 'GET':
            return await getAgency(req, res, id);
        case 'PUT':
            return await updateAgency(req, res, id);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function getAgency(req, res, id) {
    try {
        const { data, error } = await supabase
            .from('agencies')
            .select('*, users!owner_id(*)')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ success: false, error: 'Agency not found' });
            }
            throw error;
        }

        // Get agents for this agency
        const { data: agents } = await supabase
            .from('agents')
            .select('*, users!user_id(*)')
            .eq('agency_id', id);

        // Get properties for this agency
        const { data: properties } = await supabase
            .from('properties')
            .select('*')
            .eq('agency_id', id)
            .eq('status', 'approved')
            .limit(10);

        res.json({
            success: true,
            data: { ...data, agents: agents || [], properties: properties || [] }
        });
    } catch (error) {
        console.error('Get agency error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function updateAgency(req, res, id) {
    try {
        await authMiddleware(req, res, async () => {
            const { data: agency } = await supabase
                .from('agencies')
                .select('owner_id')
                .eq('id', id)
                .single();

            if (!agency) {
                return res.status(404).json({ success: false, error: 'Agency not found' });
            }

            const role = await getUserRole(req.user.id);
            if (agency.owner_id !== req.user.id && role !== 'admin') {
                return res.status(403).json({ success: false, error: 'Not authorized to update this agency' });
            }

            const { data, error } = await supabase
                .from('agencies')
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
        console.error('Update agency error:', error);
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
