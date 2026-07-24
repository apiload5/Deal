import { supabase } from './supabase.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { email, password, name, phone, roleType = 'user', agency_id } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and name are required'
            });
        }

        // Register user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, phone, role: roleType }
            }
        });

        if (error) throw error;

        if (data.user) {
            // Create user profile
            const { error: profileError } = await supabase
                .from('users')
                .insert([{
                    id: data.user.id,
                    email,
                    name,
                    phone,
                    role: roleType
                }]);

            if (profileError) {
                console.error('Profile creation error:', profileError);
            }

            // Create role-specific entries
            if (roleType === 'agency') {
                await supabase
                    .from('agencies')
                    .insert([{
                        owner_id: data.user.id,
                        name: name,
                        email: email,
                        phone: phone,
                        status: 'pending',
                        is_premium: false
                    }]);
            }

            if (roleType === 'builder') {
                await supabase
                    .from('builders')
                    .insert([{
                        owner_id: data.user.id,
                        name: name,
                        email: email,
                        phone: phone,
                        status: 'pending',
                        is_premium: false
                    }]);
            }

            if (roleType === 'agent' && agency_id) {
                await supabase
                    .from('agents')
                    .insert([{
                        user_id: data.user.id,
                        agency_id: agency_id,
                        status: 'pending',
                        is_premium: false
                    }]);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            user: data.user
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
}
