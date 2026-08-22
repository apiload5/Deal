import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';

// Configure Cloudinary server-side
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ta9s46p4',
  api_key: process.env.CLOUDINARY_API_KEY || '689466487983581',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'LT83EXI8f3YrW7yzZx188u-JyYA',
  secure: true,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'dealfast_properties';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided in request.' }, { status: 400 });
    }

    const fileName = file.name || '';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    const BLOCKED_EXTENSIONS = [
      'exe', 'bat', 'sh', 'vbs', 'msi', 'com', 'cmd', 'scr', 'pif', 'application',
      'gadget', 'msp', 'hta', 'cpl', 'msc', 'jar', 'ps1', 'ps1xml', 'ps2', 'ps2xml',
      'psc1', 'psc2', 'dll', 'sys', 'drv', 'sct', 'wsc', 'wsf', 'wsh'
    ];

    if (BLOCKED_EXTENSIONS.includes(extension)) {
      return NextResponse.json({
        success: false,
        error: `🚨 SECURITY SHIELD BLOCKED: Executable or script file type (.${extension}) is strictly prohibited for system safety.`
      }, { status: 403 });
    }

    // Convert file to base64 buffer for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'image/jpeg';
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

    try {
      // 🚀 Upload directly to Cloudinary CDN
      const uploadResult = await cloudinary.uploader.upload(base64Data, {
        folder,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      return NextResponse.json({
        success: true,
        url: uploadResult.secure_url || uploadResult.url,
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        fileName,
        size: file.size,
        provider: 'cloudinary',
        message: 'Image successfully uploaded to Cloudinary CDN.'
      });
    } catch (cloudErr: any) {
      console.warn('Cloudinary direct upload fallback notice:', cloudErr?.message);
      // If network issue with remote cloud, return base64 Data URL so user never gets blocked
      return NextResponse.json({
        success: true,
        url: base64Data,
        fileName,
        size: file.size,
        provider: 'local_fallback',
        message: 'Processed locally with fallback'
      });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Upload server error' }, { status: 500 });
  }
}
