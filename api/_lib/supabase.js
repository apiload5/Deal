import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: false
    }
});

// Database helpers
export const db = {
    // Properties
    properties: {
        getAll: async (filters = {}) => {
            let query = supabase
                .from('properties')
                .select('*, users!owner_id(id, name, email, phone), agencies!agency_id(id, name)', { count: 'exact' })
                .eq('status', 'approved');

            // Apply filters
            if (filters.city) query = query.eq('city', filters.city);
            if (filters.area) query = query.eq('area', filters.area);
            if (filters.type) query = query.eq('property_type', filters.type);
            if (filters.purpose) query = query.eq('purpose', filters.purpose);
            if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice));
            if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice));
            if (filters.beds) query = query.gte('beds', parseInt(filters.beds));
            if (filters.baths) query = query.gte('baths', parseInt(filters.baths));
            if (filters.minArea) query = query.gte('area_sqft', parseFloat(filters.minArea));
            if (filters.maxArea) query = query.lte('area_sqft', parseFloat(filters.maxArea));
            if (filters.furnished) query = query.eq('furnished', filters.furnished);
            if (filters.isPremium === 'true') query = query.eq('is_premium', true);
            if (filters.isFeatured === 'true') query = query.eq('is_featured', true);
            if (filters.owner_id) query = query.eq('owner_id', filters.owner_id);
            if (filters.agency_id) query = query.eq('agency_id', filters.agency_id);

            // Sorting
            const sortBy = filters.sortBy || 'created_at';
            const sortOrder = filters.sortOrder || 'desc';
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });

            // Pagination
            const limit = parseInt(filters.limit) || 20;
            const page = parseInt(filters.page) || 1;
            const offset = (page - 1) * limit;
            query = query.range(offset, offset + limit - 1);

            return await query;
        },
        getById: async (id) => {
            return await supabase
                .from('properties')
                .select('*, users!owner_id(*), agencies!agency_id(*, users!owner_id(*))')
                .eq('id', id)
                .single();
        },
        create: async (data) => {
            return await supabase
                .from('properties')
                .insert([data])
                .select()
                .single();
        },
        update: async (id, data) => {
            return await supabase
                .from('properties')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
        },
        delete: async (id) => {
            return await supabase
                .from('properties')
                .delete()
                .eq('id', id);
        }
    },
    
    // Agencies
    agencies: {
        getAll: async (filters = {}) => {
            let query = supabase
                .from('agencies')
                .select('*, users!owner_id(name, email, phone)', { count: 'exact' })
                .eq('status', 'active');

            if (filters.city) query = query.eq('city', filters.city);
            query = query.order('is_premium', { ascending: false })
                        .order('created_at', { ascending: false });

            const limit = parseInt(filters.limit) || 20;
            const page = parseInt(filters.page) || 1;
            const offset = (page - 1) * limit;
            query = query.range(offset, offset + limit - 1);

            return await query;
        },
        getById: async (id) => {
            return await supabase
                .from('agencies')
                .select('*, users!owner_id(*)')
                .eq('id', id)
                .single();
        }
    },

    // Builders
    builders: {
        getAll: async (filters = {}) => {
            let query = supabase
                .from('builders')
                .select('*, users!owner_id(name, email, phone)', { count: 'exact' })
                .eq('status', 'active')
                .order('is_premium', { ascending: false })
                .order('created_at', { ascending: false });

            const limit = parseInt(filters.limit) || 20;
            const page = parseInt(filters.page) || 1;
            const offset = (page - 1) * limit;
            query = query.range(offset, offset + limit - 1);

            return await query;
        },
        getById: async (id) => {
            return await supabase
                .from('builders')
                .select('*, users!owner_id(*)')
                .eq('id', id)
                .single();
        }
    },

    // Users
    users: {
        getProfile: async (userId) => {
            return await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
        },
        updateProfile: async (userId, data) => {
            return await supabase
                .from('users')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', userId)
                .select()
                .single();
        }
    },

    // Favorites/Wishlist
    favorites: {
        getAll: async (userId) => {
            return await supabase
                .from('favorites')
                .select('*, properties!property_id(*)')
                .eq('user_id', userId);
        },
        add: async (userId, propertyId) => {
            return await supabase
                .from('favorites')
                .insert([{ user_id: userId, property_id: propertyId }])
                .select()
                .single();
        },
        remove: async (userId, propertyId) => {
            return await supabase
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('property_id', propertyId);
        }
    },

    // Inquiries
    inquiries: {
        create: async (data) => {
            return await supabase
                .from('inquiries')
                .insert([data])
                .select()
                .single();
        },
        getByUser: async (userId) => {
            return await supabase
                .from('inquiries')
                .select('*, properties!property_id(*), users!user_id(*)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
        }
    }
};
