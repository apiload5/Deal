/**
 * Cloudinary Integration Helper for DealFast Real Estate App
 */

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ta9s46p4',
  apiKey: process.env.CLOUDINARY_API_KEY || '689466487983581',
};

/**
 * Upload an image file or base64 data to Cloudinary via the server-side API endpoint
 */
export async function uploadToCloudinary(
  fileOrBase64: File | string,
  folder: string = 'dealfast_properties'
): Promise<{ url: string; public_id?: string; secure_url: string }> {
  try {
    let dataPayload = '';

    if (typeof fileOrBase64 === 'string') {
      dataPayload = fileOrBase64;
    } else {
      // Convert File to base64
      dataPayload = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrBase64);
      });
    }

    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: dataPayload,
        folder,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Upload to Cloudinary failed');
    }

    const result = await response.json();
    return {
      url: result.secure_url || result.url,
      secure_url: result.secure_url || result.url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.warn('Server-side Cloudinary upload notice, using direct fallback:', error);
    // Fallback: Return data URL or direct placeholder if network/offline
    if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
      return { url: fileOrBase64, secure_url: fileOrBase64 };
    }
    throw error;
  }
}

/**
 * Generates an optimized Cloudinary delivery URL with transformation parameters
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  options?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'scale' | 'fit' | 'thumb';
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const { width = 800, height, crop = 'fill', quality = 'auto', format = 'auto' } = options || {};

  const transformations: string[] = [`f_${format}`, `q_${quality}`];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);

  const transformString = transformations.join(',');

  // Insert transformations into Cloudinary URL path
  return url.replace('/upload/', `/upload/${transformString}/`);
}
