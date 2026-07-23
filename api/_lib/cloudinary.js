import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (image, folder = 'dealpk') => {
    try {
        const result = await cloudinary.uploader.upload(image, {
            folder: folder,
            resource_type: 'auto',
            transformation: [{ quality: 'auto' }]
        });
        return {
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return { success: true, result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
