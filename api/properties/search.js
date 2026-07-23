import { supabase } from '../_lib/supabase.js';
import { cache, withCache } from '../_lib/cache.js';
import { authMiddleware } from '../_lib/auth.js';

// AI Search handler with cache
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const {
            q,
            city,
            area,
            type,
            purpose,
            minPrice,
            maxPrice,
            beds,
            baths,
            minArea,
            maxArea,
            furnished,
            isPremium,
            isFeatured,
            sortBy = 'relevance',
            page = 1,
            limit = 20,
            lat,
            lng,
            radius = 10
        } = req.query;

        // Generate cache key
        const cacheKey = `search:${JSON.stringify(req.query)}`;
        
        // Check cache
        const cached = await cache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        let query = supabase
            .from('properties')
            .select('*, users!owner_id(id, name, email, phone), agencies!agency_id(id, name)', { count: 'exact' })
            .eq('status', 'approved');

        // AI Search - Full text search with ranking
        if (q) {
            // Split query into terms
            const terms = q.split(' ').filter(t => t.length > 2);
            
            // Build search condition
            const searchConditions = terms.map(term => 
                `title.ilike.%${term}% OR description.ilike.%${term}% OR city.ilike.%${term}% OR area.ilike.%${term}%`
            ).join(' OR ');
            
            if (searchConditions) {
                query = query.or(searchConditions);
            }
        }

        // Apply filters
        if (city) query = query.eq('city', city);
        if (area) query = query.eq('area', area);
        if (type) query = query.eq('property_type', type);
        if (purpose) query = query.eq('purpose', purpose);
        if (minPrice) query = query.gte('price', parseFloat(minPrice));
        if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
        if (beds) query = query.gte('beds', parseInt(beds));
        if (baths) query = query.gte('baths', parseInt(baths));
        if (minArea) query = query.gte('area_sqft', parseFloat(minArea));
        if (maxArea) query = query.lte('area_sqft', parseFloat(maxArea));
        if (furnished) query = query.eq('furnished', furnished);
        if (isPremium === 'true') query = query.eq('is_premium', true);
        if (isFeatured === 'true') query = query.eq('is_featured', true);

        // Location-based search
        if (lat && lng) {
            // This requires PostGIS extension in Supabase
            // For now, we'll filter in memory
            // You can add latitude/longitude columns to properties table
        }

        // Sorting
        switch(sortBy) {
            case 'price_asc':
                query = query.order('price', { ascending: true });
                break;
            case 'price_desc':
                query = query.order('price', { ascending: false });
                break;
            case 'newest':
                query = query.order('created_at', { ascending: false });
                break;
            case 'popular':
                query = query.order('views', { ascending: false });
                break;
            case 'relevance':
            default:
                query = query.order('is_premium', { ascending: false })
                            .order('is_featured', { ascending: false })
                            .order('created_at', { ascending: false });
        }

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query = query.range(offset, offset + parseInt(limit) - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        // Get aggregations for filters
        const aggregations = {
            priceRanges: await getPriceRanges(city, area, purpose),
            cities: await getCityCounts(),
            types: await getTypeCounts()
        };

        const response = {
            success: true,
            data: data || [],
            total: count || 0,
            page: parseInt(page),
            limit: parseInt(limit),
            aggregations
        };

        // Cache for 5 minutes
        await cache.set(cacheKey, response, 300);

        res.json(response);

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Helper functions for aggregations
async function getPriceRanges(city, area, purpose) {
    let query = supabase
        .from('properties')
        .select('price')
        .eq('status', 'approved');
    
    if (city) query = query.eq('city', city);
    if (area) query = query.eq('area', area);
    if (purpose) query = query.eq('purpose', purpose);

    const { data } = await query;
    if (!data || data.length === 0) return [];

    const prices = data.map(p => p.price);
    const ranges = [
        { label: 'Under 50 Lakh', min: 0, max: 5000000 },
        { label: '50 Lakh - 1 Crore', min: 5000000, max: 10000000 },
        { label: '1 - 2 Crore', min: 10000000, max: 20000000 },
        { label: '2 - 5 Crore', min: 20000000, max: 50000000 },
        { label: 'Above 5 Crore', min: 50000000, max: Infinity }
    ];

    return ranges.map(range => ({
        ...range,
        count: prices.filter(p => p >= range.min && p < range.max).length
    }));
}

async function getCityCounts() {
    const { data } = await supabase
        .from('properties')
        .select('city')
        .eq('status', 'approved');
    
    if (!data) return [];
    
    const counts = {};
    data.forEach(p => {
        if (p.city) counts[p.city] = (counts[p.city] || 0) + 1;
    });
    
    return Object.entries(counts)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count);
}

async function getTypeCounts() {
    const { data } = await supabase
        .from('properties')
        .select('property_type')
        .eq('status', 'approved');
    
    if (!data) return [];
    
    const counts = {};
    data.forEach(p => {
        if (p.property_type) counts[p.property_type] = (counts[p.property_type] || 0) + 1;
    });
    
    return Object.entries(counts)
        .map(([type, count]) => ({ type, count }));
}
