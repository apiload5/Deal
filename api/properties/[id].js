import { supabase } from '../_lib/supabase.js';
import { authMiddleware } from '../_lib/auth.js';
import { cache } from '../_lib/cache.js';

export default async function handler(req, res) {
    const { id } = req.query;

    switch(req.method) {
        case 'GET':
            return await getProperty(req, res, id);
        case 'PUT':
            return await updateProperty(req, res, id);
        case 'DELETE':
            return await deleteProperty(req, res, id);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function getProperty(req, res, id) {
    try {
        // Check cache first
        const cacheKey = `property:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const { data, error } = await supabase
            .from('properties')
            .select('*, users!owner_id(*), agencies!agency_id(*, users!owner_id(*))')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ success: false, error: 'Property not found' });
            }
            throw error;
        }

        // Increment view count
        await supabase
            .from('properties')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', id);

        // Get similar properties
        const { data: similar } = await supabase
            .from('properties')
            .select('*')
            .eq('city', data.city)
            .eq('status', 'approved')
            .neq('id', id)
            .limit(5);

        const response = {
            success: true,
            data: { ...data, similar: similar || [] }
        };

        // Cache for 10 minutes
        await cache.set(cacheKey, response, 600);

        res.json(response);
    } catch (error) {
        console.error('Get property error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function updateProperty(req, res, id) {
    try {
        await authMiddleware(req, res, async () => {
            // Check ownership
            const { data: existing } = await supabase
                .from('properties')
                .select('owner_id, status')
                .eq('id', id)
                .single();

            if (!existing) {
                return res.status(404).json({ success: false, error: 'Property not found' });
            }

            const role = await getUserRole(req.user.id);
            if (existing.owner_id !== req.user.id && role !== 'admin') {
                return res.status(403).json({ success: false, error: 'Not authorized' });
            }

            // If admin, allow status change
            const updateData = { ...req.body };
            if (role === 'admin' && req.body.status) {
                updateData.status = req.body.status;
            } else {
                delete updateData.status;
            }

            updateData.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from('properties')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Clear cache
            await cache.delete(`property:${id}`);
            await cache.clearPattern('cache:/api/properties*');

            res.json({ success: true, data });
        });
    } catch (error) {
        console.error('Update property error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function deleteProperty(req, res, id) {
    try {
        await authMiddleware(req, res, async () => {
            const { data: existing } = await supabase
                .from('properties')
                .select('owner_id')
                .eq('id', id)
                .single();

            if (!existing) {
                return res.status(404).json({ success: false, error: 'Property not found' });
            }

            const role = await getUserRole(req.user.id);
            if (existing.owner_id !== req.user.id && role !== 'admin') {
                return res.status(403).json({ success: false, error: 'Not authorized' });
            }

            const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Clear cache
            await cache.delete(`property:${id}`);
            await cache.clearPattern('cache:/api/properties*');

            res.json({ success: true, message: 'Property deleted successfully' });
        });
    } catch (error) {
        console.error('Delete property error:', error);
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
