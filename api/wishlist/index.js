import { supabase } from '../_lib/supabase.js';
import { authMiddleware } from '../_lib/auth.js';

export default async function handler(req, res) {
    switch(req.method) {
        case 'GET':
            return await getWishlist(req, res);
        case 'POST':
            return await addToWishlist(req, res);
        case 'DELETE':
            return await removeFromWishlist(req, res);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function getWishlist(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const { data, error } = await supabase
                .from('favorites')
                .select('*, properties!property_id(*)')
                .eq('user_id', req.user.id);

            if (error) throw error;

            const properties = (data || [])
                .map(item => item.properties)
                .filter(p => p !== null);

            res.json({ success: true, data: properties });
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function addToWishlist(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const { propertyId } = req.body;
            if (!propertyId) {
                return res.status(400).json({ success: false, error: 'Property ID is required' });
            }

            // Check if already exists
            const { data: existing } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', req.user.id)
                .eq('property_id', propertyId)
                .maybeSingle();

            if (existing) {
                return res.status(400).json({ success: false, error: 'Already in wishlist' });
            }

            const { data, error } = await supabase
                .from('favorites')
                .insert([{
                    user_id: req.user.id,
                    property_id: propertyId
                }])
                .select()
                .single();

            if (error) throw error;
            res.status(201).json({ success: true, data });
        });
    } catch (error) {
        console.error('Add wishlist error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function removeFromWishlist(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const { propertyId } = req.body;
            if (!propertyId) {
                return res.status(400).json({ success: false, error: 'Property ID is required' });
            }

            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', req.user.id)
                .eq('property_id', propertyId);

            if (error) throw error;
            res.json({ success: true, message: 'Removed from wishlist' });
        });
    } catch (error) {
        console.error('Remove wishlist error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
