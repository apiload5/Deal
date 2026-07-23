import { supabase } from '../_lib/supabase.js';
import { adminMiddleware } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        await adminMiddleware(req, res, async () => {
            // Get all stats in parallel
            const [
                usersCount,
                propertiesCount,
                agenciesCount,
                buildersCount,
                projectsCount,
                pendingProperties,
                blogsCount,
                inquiriesCount
            ] = await Promise.all([
                supabase.from('users').select('*', { count: 'exact', head: true }),
                supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
                supabase.from('agencies').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                supabase.from('builders').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('blogs').select('*', { count: 'exact', head: true }),
                supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'pending')
            ]);

            // Get revenue from payments
            const { data: revenueData } = await supabase
                .from('payments')
                .select('amount')
                .eq('status', 'completed');

            const totalRevenue = revenueData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

            res.json({
                success: true,
                stats: {
                    totalUsers: usersCount.count || 0,
                    totalProperties: propertiesCount.count || 0,
                    totalAgencies: agenciesCount.count || 0,
                    totalBuilders: buildersCount.count || 0,
                    totalProjects: projectsCount.count || 0,
                    pendingProperties: pendingProperties.count || 0,
                    totalBlogs: blogsCount.count || 0,
                    pendingInquiries: inquiriesCount.count || 0,
                    revenue: totalRevenue
                }
            });
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
