import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary server-side
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ta9s46p4',
  api_key: process.env.CLOUDINARY_API_KEY || '689466487983581',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'LT83EXI8f3YrW7yzZx188u-JyYA',
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, folder = 'dealfast_properties' } = body;

    if (!data) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    // Upload base64 or remote URL to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(data, {
      folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.url,
      secure_url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      format: uploadResponse.format,
      width: uploadResponse.width,
      height: uploadResponse.height
    });
  } catch (error: any) {
    console.error('Cloudinary API upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image to Cloudinary' },
      { status: 500 }
    );
  }
}
