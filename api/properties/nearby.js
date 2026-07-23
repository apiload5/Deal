import { supabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { lat, lng, radius = 10, limit = 20 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ 
                success: false, 
                error: 'Latitude and longitude are required' 
            });
        }

        // For now, return all approved properties
        // In production, use PostGIS with Supabase for actual distance calculation
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('status', 'approved')
            .limit(parseInt(limit));

        if (error) throw error;

        res.json({
            success: true,
            data: data || [],
            total: data?.length || 0,
            location: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseFloat(radius) }
        });
    } catch (error) {
        console.error('Nearby properties error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
