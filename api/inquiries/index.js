import { supabase } from '../_lib/supabase.js';
import { authMiddleware } from '../_lib/auth.js';

export default async function handler(req, res) {
    switch(req.method) {
        case 'GET':
            return await getInquiries(req, res);
        case 'POST':
            return await createInquiry(req, res);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function getInquiries(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const { data, error } = await supabase
                .from('inquiries')
                .select('*, properties!property_id(*), users!user_id(*)')
                .eq('user_id', req.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.json({ success: true, data });
        });
    } catch (error) {
        console.error('Get inquiries error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function createInquiry(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const { property_id, message } = req.body;
            if (!property_id) {
                return res.status(400).json({ success: false, error: 'Property ID is required' });
            }

            const { data, error } = await supabase
                .from('inquiries')
                .insert([{
                    property_id,
                    user_id: req.user.id,
                    message,
                    status: 'pending'
                }])
                .select()
                .single();

            if (error) throw error;
            res.status(201).json({ success: true, data });
        });
    } catch (error) {
        console.error('Create inquiry error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
