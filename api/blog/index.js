import { supabase } from '../_lib/supabase.js';
import { adminMiddleware } from '../_lib/auth.js';

export default async function handler(req, res) {
    switch(req.method) {
        case 'GET':
            return await getBlogPosts(req, res);
        case 'POST':
            return await createBlogPost(req, res);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function getBlogPosts(req, res) {
    try {
        const { limit = 9, page = 1, slug } = req.query;

        if (slug) {
            const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return res.status(404).json({ success: false, error: 'Blog post not found' });
                }
                throw error;
            }

            return res.json({ success: true, data });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { data, error, count } = await supabase
            .from('blogs')
            .select('*', { count: 'exact' })
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (error) throw error;
        res.json({ success: true, data, total: count });
    } catch (error) {
        console.error('Get blog error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function createBlogPost(req, res) {
    try {
        await adminMiddleware(req, res, async () => {
            const { data, error } = await supabase
                .from('blogs')
                .insert([{
                    ...req.body,
                    author_id: req.user.id,
                    status: 'published'
                }])
                .select()
                .single();

            if (error) throw error;
            res.status(201).json({ success: true, data });
        });
    } catch (error) {
        console.error('Create blog error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
