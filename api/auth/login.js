import { supabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Get user profile
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        res.json({
            success: true,
            user: { ...data.user, profile },
            session: data.session
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ success: false, error: error.message });
    }
}
