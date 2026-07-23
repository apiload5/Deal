import { supabase } from '../_lib/supabase.js';
import { adminMiddleware } from '../_lib/auth.js';
import { cache } from '../_lib/cache.js';

export default async function handler(req, res) {
    switch(req.method) {
        case 'GET':
            return await getPendingProperties(req, res);
        case 'POST':
            return await approveProperty(req, res);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function getPendingProperties(req, res) {
    try {
        await adminMiddleware(req, res, async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('*, users!owner_id(id, name, email, phone)')
                .eq('status', 'pending')
                .order('created_at', { ascending: true });

            if (error) throw error;
            res.json({ success: true, data });
        });
    } catch (error) {
        console.error('Get pending properties error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function approveProperty(req, res) {
    try {
        await adminMiddleware(req, res, async () => {
            const { id, action } = req.body;
            if (!id) {
                return res.status(400).json({ success: false, error: 'Property ID is required' });
            }

            const newStatus = action === 'approve' ? 'approved' : 'rejected';

            const { data, error } = await supabase
                .from('properties')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Clear cache
            await cache.delete(`property:${id}`);
            await cache.clearPattern('cache:/api/properties*');

            res.json({
                success: true,
                data,
                message: `Property ${action === 'approve' ? 'approved' : 'rejected'} successfully`
            });
        });
    } catch (error) {
        console.error('Approve property error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
