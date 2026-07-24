import { supabase } from './supabase.js';
import { authMiddleware } from './auth.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        await authMiddleware(req, res, async () => {
            await supabase.auth.signOut();
            res.json({ success: true, message: 'Logged out successfully' });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
