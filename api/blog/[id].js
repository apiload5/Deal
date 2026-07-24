import { supabase } from './supabase.js';
import { adminMiddleware } from './auth.js';

export default async function handler(req, res) {
    const { id } = req.query;

    switch(req.method) {
        case 'GET':
            return await getBlogPost(req, res, id);
        case 'PUT':
            return await updateBlogPost(req, res, id);
        case 'DELETE':
            return await deleteBlogPost(req, res, id);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function getBlogPost(req, res, id) {
    try {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ success: false, error: 'Blog post not found' });
            }
            throw error;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get blog post error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function updateBlogPost(req, res, id) {
    try {
        await adminMiddleware(req, res, async () => {
            const { data, error } = await supabase
                .from('blogs')
                .update({
                    ...req.body,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            res.json({ success: true, data });
        });
    } catch (error) {
        console.error('Update blog error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function deleteBlogPost(req, res, id) {
    try {
        await adminMiddleware(req, res, async () => {
            const { error } = await supabase
                .from('blogs')
                .delete()
                .eq('id', id);

            if (error) throw error;
            res.json({ success: true, message: 'Blog post deleted successfully' });
        });
    } catch (error) {
        console.error('Delete blog error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
