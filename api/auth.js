import { supabase } from './supabase.js';

export async function verifyToken(token) {
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Token verification error:', error.message);
        return null;
    }
}

export async function getUserRole(userId) {
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

export async function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized - No token provided' });
    }
    const user = await verifyToken(token);
    if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized - Invalid token' });
    }
    req.user = user;
    req.userId = user.id;
    next();
}

export async function adminMiddleware(req, res, next) {
    await authMiddleware(req, res, async () => {
        const role = await getUserRole(req.user.id);
        if (role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        next();
    });
}
