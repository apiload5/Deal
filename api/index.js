// api/index.js - COMPLETE FILE FOR RENDER
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// SERVE STATIC FILES (Frontend)
// ============================================
app.use(express.static(join(__dirname, '../public')));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ============================================
// API ROOT
// ============================================
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Deal.pk API is running!',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            cities: '/api/cities',
            areas: '/api/areas',
            properties: '/api/properties',
            agencies: '/api/agencies',
            builders: '/api/builders',
            projects: '/api/projects',
            blog: '/api/blog',
            auth: '/api/auth',
            user: '/api/user',
            wishlist: '/api/wishlist',
            inquiries: '/api/inquiries'
        }
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// CITIES API
// ============================================
app.get('/api/cities', async (req, res) => {
    try {
        const { supabase } = await import('./supabase.js');
        const { data, error } = await supabase
            .from('cities')
            .select('*')
            .order('name');

        if (error) throw error;
        res.json({ success: true, data: data || [] });
    } catch (error) {
        console.error('Cities error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// AREAS API
// ============================================
app.get('/api/areas', async (req, res) => {
    try {
        const { supabase } = await import('./supabase.js');
        const { data, error } = await supabase
            .from('areas')
            .select('*')
            .order('name');

        if (error) throw error;
        res.json({ success: true, data: data || [] });
    } catch (error) {
        console.error('Areas error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// CITIES WITH AREAS
// ============================================
app.get('/api/cities-with-areas', async (req, res) => {
    try {
        const { supabase } = await import('./supabase.js');
        
        // Get all cities
        const { data: cities, error: citiesError } = await supabase
            .from('cities')
            .select('*')
            .order('name');

        if (citiesError) throw citiesError;

        // Get areas for each city
        const citiesWithAreas = await Promise.all((cities || []).map(async (city) => {
            const { data: areas, error: areasError } = await supabase
                .from('areas')
                .select('*')
                .eq('city_id', city.id)
                .order('name');

            if (areasError) throw areasError;
            return { ...city, areas: areas || [] };
        }));

        res.json({ success: true, data: citiesWithAreas });
    } catch (error) {
        console.error('Cities with areas error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// PROPERTIES API
// ============================================
app.get('/api/properties', async (req, res) => {
    try {
        const { supabase } = await import('./supabase.js');
        
        let query = supabase
            .from('properties')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(20);

        // Apply filters
        if (req.query.city) query = query.eq('city', req.query.city);
        if (req.query.area) query = query.eq('area', req.query.area);
        if (req.query.type) query = query.eq('property_type', req.query.type);
        if (req.query.purpose) query = query.eq('purpose', req.query.purpose);
        if (req.query.minPrice) query = query.gte('price', parseFloat(req.query.minPrice));
        if (req.query.maxPrice) query = query.lte('price', parseFloat(req.query.maxPrice));
        if (req.query.beds) query = query.gte('beds', parseInt(req.query.beds));
        if (req.query.baths) query = query.gte('baths', parseInt(req.query.baths));
        if (req.query.isPremium === 'true') query = query.eq('is_premium', true);
        if (req.query.isFeatured === 'true') query = query.eq('is_featured', true);

        const { data, error } = await query;
        if (error) throw error;

        res.json({ success: true, data: data || [], total: data?.length || 0 });
    } catch (error) {
        console.error('Properties error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// AUTH - LOGIN
// ============================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { supabase } = await import('./supabase.js');
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        res.json({
            success: true,
            user: data.user,
            session: data.session
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ success: false, error: error.message });
    }
});

// ============================================
// AUTH - REGISTER
// ============================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { supabase } = await import('./supabase.js');
        const { email, password, name, phone, roleType = 'user' } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ success: false, error: 'Email, password, and name required' });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, phone, role: roleType }
            }
        });

        if (error) throw error;

        if (data.user) {
            await supabase
                .from('users')
                .insert([{
                    id: data.user.id,
                    email,
                    name,
                    phone,
                    role: roleType
                }]);
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            user: data.user
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

// ============================================
// AUTH - LOGOUT
// ============================================
app.post('/api/auth/logout', async (req, res) => {
    try {
        const { supabase } = await import('./supabase.js');
        await supabase.auth.signOut();
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// 404 HANDLER - SPA ROUTING
// ============================================
app.get('*', (req, res) => {
    // Check if path is for admin
    if (req.path === '/admin' || req.path.startsWith('/admin/')) {
        return res.sendFile(join(__dirname, '../public/admin.html'));
    }
    
    // For all other routes, serve index.html (SPA routing)
    res.sendFile(join(__dirname, '../public/index.html'));
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Deal.pk API running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health: http://localhost:${PORT}/health`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`🔗 Frontend: http://localhost:${PORT}/`);
});
