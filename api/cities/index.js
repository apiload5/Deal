import { supabase } from '../_lib/supabase.js';
import { cache, withCache } from '../_lib/cache.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        // Check cache
        const cacheKey = 'cities:all';
        const cached = await cache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // Get all cities with area counts
        const { data, error } = await supabase
            .from('cities')
            .select('*, areas!city_id(id, name, total_properties)')
            .order('name');

        if (error) throw error;

        // Get property count per city
        const cityStats = await Promise.all((data || []).map(async (city) => {
            const { count } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true })
                .eq('city', city.name)
                .eq('status', 'approved');
            
            return { ...city, total_properties: count || 0 };
        }));

        const response = { success: true, data: cityStats };

        // Cache for 1 hour
        await cache.set(cacheKey, response, 3600);

        res.json(response);
    } catch (error) {
        console.error('Get cities error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
