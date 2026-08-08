import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

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

    // Convert uploaded File to actual Data URL (base64) so real uploaded pictures are saved & shown!
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'image/jpeg';
    const base64String = buffer.toString('base64');
    const realDataUrl = `data:${mimeType};base64,${base64String}`;

    return NextResponse.json({
      success: true,
      url: realDataUrl,
      fileName,
      size: file.size,
      message: 'Real file processed and converted successfully.'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Upload server error' }, { status: 500 });
  }
}
