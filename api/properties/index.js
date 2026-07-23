import { supabase } from '../_lib/supabase.js';
import { authMiddleware, adminMiddleware } from '../_lib/auth.js';
import { cache } from '../_lib/cache.js';

export default async function handler(req, res) {
    switch(req.method) {
        case 'GET':
            return await getProperties(req, res);
        case 'POST':
            return await createProperty(req, res);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function getProperties(req, res) {
    try {
        const {
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
            owner_id,
            agency_id,
            limit = 20,
            page = 1
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = supabase
            .from('properties')
            .select('*, users!owner_id(id, name, email, phone), agencies!agency_id(id, name)', { count: 'exact' })
            .eq('status', 'approved');

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
        if (owner_id) query = query.eq('owner_id', owner_id);
        if (agency_id) query = query.eq('agency_id', agency_id);

        // Sorting
        query = query
            .order('is_premium', { ascending: false })
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        res.json({
            success: true,
            data: data || [],
            total: count || 0,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function createProperty(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const role = await getUserRole(req.user.id);
            const status = (role === 'admin' || role === 'agency') ? 'approved' : 'pending';

            const propertyData = {
                ...req.body,
                owner_id: req.user.id,
                status: status,
                views: 0,
                is_premium: req.body.is_premium || false,
                is_featured: req.body.is_featured || false
            };

            const { data, error } = await supabase
                .from('properties')
                .insert([propertyData])
                .select()
                .single();

            if (error) throw error;

            // Clear cache
            await cache.clearPattern('cache:/api/properties*');

            res.status(201).json({
                success: true,
                data,
                message: status === 'approved' ? 'Property listed successfully!' : 'Property submitted for approval.'
            });
        });
    } catch (error) {
        console.error('Create property error:', error);
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
