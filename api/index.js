// api/index.js - Root API Handler
export default function handler(req, res) {
    res.status(200).json({
        success: true,
        message: 'Deal.pk API is running!',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
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
}
