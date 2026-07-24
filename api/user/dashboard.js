import { supabase } from './supabase.js';
import { authMiddleware } from './auth.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        await authMiddleware(req, res, async () => {
            const userId = req.user.id;

            // Get user's properties
            const { data: properties, count: propertiesCount } = await supabase
                .from('properties')
                .select('*', { count: 'exact' })
                .eq('owner_id', userId);

            // Get user's favorites
            const { data: favorites, count: favoritesCount } = await supabase
                .from('favorites')
                .select('*, properties!property_id(*)', { count: 'exact' })
                .eq('user_id', userId);

            // Get user's inquiries
            const { data: inquiries, count: inquiriesCount } = await supabase
                .from('inquiries')
                .select('*, properties!property_id(*)', { count: 'exact' })
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            // Get total views
            const { data: viewsData } = await supabase
                .from('properties')
                .select('views')
                .eq('owner_id', userId);

            const totalViews = viewsData?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;

            res.json({
                success: true,
                data: {
                    properties: properties || [],
                    propertiesCount: propertiesCount || 0,
                    favorites: favorites || [],
                    favoritesCount: favoritesCount || 0,
                    inquiries: inquiries || [],
                    inquiriesCount: inquiriesCount || 0,
                    totalViews: totalViews
                }
            });
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
