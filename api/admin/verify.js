import { supabase } from './supabase.js';
import { adminMiddleware } from './auth.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        await adminMiddleware(req, res, async () => {
            const { type, id, action } = req.body;
            if (!type || !id) {
                return res.status(400).json({ success: false, error: 'type and id are required' });
            }

            const newStatus = action === 'verify' ? 'active' : 'rejected';
            const table = type + 's';

            const { data, error } = await supabase
                .from(table)
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            res.json({
                success: true,
                data,
                message: `${type} ${action === 'verify' ? 'verified' : 'rejected'} successfully`
            });
        });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
