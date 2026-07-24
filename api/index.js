// api/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './supabase.js';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// __dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (public folder)
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

app.get('/api/health', (req, res) => {
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
            properties: '/api/properties',
            agencies: '/api/agencies',
            builders: '/api/builders',
            projects: '/api/projects',
            blog: '/api/blog',
            auth: '/api/auth',
            user: '/api/user',
            wishlist: '/api/wishlist',
            inquiries: '/api/inquiries',
            cities: '/api/cities',
            areas: '/api/areas'
        }
    });
});

// ============================================
// DYNAMIC ROUTE LOADING (AUTO-IMPORT ALL ROUTES)
// ============================================
async function loadRoutes() {
    const routesDir = join(__dirname);
    const folders = readdirSync(routesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('_'));

    for (const folder of folders) {
        try {
            const routePath = join(routesDir, folder.name, 'index.js');
            const routeModule = await import(`file://${routePath}`);
            
            if (routeModule.default) {
                const router = routeModule.default;
                const basePath = `/api/${folder.name}`;
                app.use(basePath, router);
                console.log(`✅ Loaded route: ${basePath}`);
            }
        } catch (error) {
            // Skip if index.js doesn't exist
        }
    }
}

// ============================================
// 404 HANDLER
// ============================================
app.use('*', (req, res) => {
    // For frontend routes, serve index.html
    if (req.path.startsWith('/admin')) {
        return res.sendFile(join(__dirname, '../public/admin.html'));
    }
    
    // Check if requested file exists in public
    try {
        const publicPath = join(__dirname, '../public', req.path);
        return res.sendFile(publicPath);
    } catch (error) {
        // Serve index.html for SPA routing
        return res.sendFile(join(__dirname, '../public/index.html'));
    }
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
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
});
