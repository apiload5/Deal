import { supabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { data, error } = await supabase
            .from('areas')
            .select('*, cities!city_id(name)')
            .order('name');

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get all areas error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
