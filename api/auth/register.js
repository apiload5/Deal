import { supabase } from '../supabase.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const {
            email, password, name, phone,
            role = 'user',
            businessName, businessAddress, businessPhone, businessLogo,
            cnic_front, cnic_back,
            agency_id,
            license_number,
            experience_years
        } = req.body;

        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and name are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters'
            });
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Register with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, phone, role }
            }
        });

        if (error) throw error;

        if (data.user) {
            // Create user profile
            await supabase.from('users').insert([{
                id: data.user.id,
                email,
                name,
                phone,
                role,
                is_verified: false,
                is_premium: false,
                created_at: new Date().toISOString()
            }]);

            // Save KYC documents if provided
            if (cnic_front && cnic_back) {
                await supabase.from('kyc_documents').insert([
                    { 
                        user_id: data.user.id, 
                        document_type: 'cnic_front', 
                        document_url: cnic_front, 
                        status: 'pending',
                        created_at: new Date().toISOString()
                    },
                    { 
                        user_id: data.user.id, 
                        document_type: 'cnic_back', 
                        document_url: cnic_back, 
                        status: 'pending',
                        created_at: new Date().toISOString()
                    }
                ]);
            }

            // Role-specific registration
            if (role === 'agent') {
                await supabase.from('agents').insert([{
                    user_id: data.user.id,
                    agency_id: agency_id || null,
                    license_number: license_number || '',
                    experience_years: parseInt(experience_years) || 0,
                    status: 'pending',
                    is_premium: false,
                    is_verified: false,
                    created_at: new Date().toISOString()
                }]);
            }

            if (role === 'agency') {
                await supabase.from('agencies').insert([{
                    owner_id: data.user.id,
                    name: businessName || name,
                    email: email,
                    phone: businessPhone || phone,
                    address: businessAddress || '',
                    logo: businessLogo || '',
                    license_number: license_number || '',
                    status: 'pending',
                    is_premium: false,
                    is_verified: false,
                    created_at: new Date().toISOString()
                }]);
            }

            if (role === 'builder') {
                await supabase.from('builders').insert([{
                    owner_id: data.user.id,
                    name: businessName || name,
                    email: email,
                    phone: businessPhone || phone,
                    address: businessAddress || '',
                    logo: businessLogo || '',
                    license_number: license_number || '',
                    status: 'pending',
                    is_premium: false,
                    is_verified: false,
                    created_at: new Date().toISOString()
                }]);
            }

            // Send welcome notification
            await supabase.from('notifications').insert([{
                user_id: data.user.id,
                type: 'welcome',
                title: 'Welcome to Deal.pk!',
                message: `Welcome ${name}! Your account is created. Please wait for verification.`,
                created_at: new Date().toISOString()
            }]);

            // Notify admin about new registration
            await supabase.from('notifications').insert([{
                user_id: process.env.ADMIN_USER_ID || 'admin',
                type: 'new_user',
                title: 'New User Registered',
                message: `${name} (${email}) registered as ${role}`,
                data: { user_id: data.user.id, role },
                created_at: new Date().toISOString()
            }]);
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
