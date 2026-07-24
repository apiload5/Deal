import { uploadToCloudinary, deleteFromCloudinary } from './cloudinary.js';
import { authMiddleware } from './auth.js';

export default async function handler(req, res) {
    switch(req.method) {
        case 'POST':
            return await uploadImage(req, res);
        case 'DELETE':
            return await deleteImage(req, res);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function uploadImage(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const { image, folder = 'dealpk' } = req.body;
            if (!image) {
                return res.status(400).json({ success: false, error: 'No image provided' });
            }

            const result = await uploadToCloudinary(image, folder);
            if (!result.success) {
                throw new Error(result.error);
            }

            res.json({
                success: true,
                url: result.url,
                public_id: result.public_id,
                width: result.width,
                height: result.height
            });
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function deleteImage(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const { public_id } = req.body;
            if (!public_id) {
                return res.status(400).json({ success: false, error: 'No public_id provided' });
            }

            const result = await deleteFromCloudinary(public_id);
            if (!result.success) {
                throw new Error(result.error);
            }

            res.json({ success: true, message: 'Image deleted', result });
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
