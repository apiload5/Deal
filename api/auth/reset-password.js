import { supabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL || 'https://deal.pk'}/reset-password`
        });

        if (error) throw error;

        res.json({
            success: true,
            message: 'Password reset email sent! Please check your inbox.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
}
