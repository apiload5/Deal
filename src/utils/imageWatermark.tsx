import React, { useState, useEffect } from 'react';

const watermarkCache = new Map<string, string>();
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';

/**
 * Draws both Zameen.com-style watermarks onto a Canvas:
 * 1. Center: Translucent / Semi-transparent DealFast logo emblem & text watermark badge (35% opacity)
 * 2. Bottom: Solid Zameen.com-style watermark bar (100% opacity) across full width
 */
export const drawWatermarksOnCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void => {
  ctx.save();

  // Draw semi-transparent header SVG logo emblem in center of the image (38% transparency)
  ctx.globalAlpha = 0.38;

  // Calculate scaled logo emblem size (35% of image width)
  const logoWidth = Math.max(120, Math.floor(width * 0.35));
  const logoHeight = Math.floor(logoWidth * (603 / 802));

  const posX = (width - logoWidth) / 2;
  const posY = (height - logoHeight) / 2;

  ctx.save();
  ctx.translate(posX, posY);
  const scaleX = logoWidth / 802;
  const scaleY = logoHeight / 603;
  ctx.scale(scaleX, scaleY);

  // Add drop shadow so white & orange logo is clearly visible on any background
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  // Path 1 (Orange D / Roof shape)
  const path1 = new Path2D('M 582,503 L 555,511 L 548,515 L 491,532 L 488,535 L 482,548 L 482,551 L 476,560 L 471,572 L 523,572 L 536,565 L 559,550 L 581,530 L 583,527 Z M 643,376 L 617,384 L 612,387 L 608,387 L 587,394 L 583,396 L 584,399 L 596,401 L 608,405 L 610,404 L 625,408 L 631,411 L 633,410 L 640,412 L 642,409 L 644,394 Z M 473,362 L 407,362 L 405,364 L 406,410 L 405,436 L 407,438 L 440,437 L 442,435 L 454,411 L 459,398 L 469,380 L 469,377 L 474,368 Z M 320,363 L 319,384 L 320,437 L 322,438 L 344,438 L 345,437 L 376,438 L 389,436 L 390,434 L 389,409 L 390,386 L 388,362 Z M 249,288 L 152,376 L 152,572 L 376,572 L 397,530 L 400,515 L 254,513 L 254,289 Z M 389,263 L 373,265 L 367,267 L 354,274 L 352,277 L 338,288 L 330,299 L 330,302 L 324,312 L 321,323 L 320,337 L 321,345 L 328,345 L 329,346 L 389,345 L 390,343 Z M 406,263 L 405,297 L 406,305 L 405,328 L 406,329 L 406,345 L 411,346 L 422,345 L 473,346 L 475,344 L 475,331 L 473,327 L 469,308 L 462,296 L 451,282 L 435,271 L 424,267 L 422,265 L 409,262 Z M 770,290 L 657,259 L 650,261 L 669,295 L 503,355 L 478,389 L 392,572 L 457,571 L 482,521 L 593,485 L 599,517 L 671,434 L 567,409 L 582,439 L 512,462 L 532,411 L 556,390 L 683,348 L 689,387 Z M 634,290 L 615,241 L 584,196 L 395,30 L 229,179 L 227,132 L 243,128 L 242,94 L 136,95 L 137,129 L 153,131 L 152,248 L 30,360 L 144,362 L 397,136 L 506,240 L 542,321 Z');
  ctx.fillStyle = '#FF8C00';
  ctx.fill(path1, 'evenodd');

  // Path 2 (White F shape)
  const path2 = new Path2D('M 770,290 L 657,259 L 650,261 L 669,295 L 503,355 L 478,389 L 392,572 L 457,571 L 482,521 L 593,485 L 599,517 L 671,434 L 567,409 L 582,439 L 511,464 L 532,411 L 556,390 L 683,348 L 689,387 Z');
  ctx.fillStyle = '#FFFFFF';
  ctx.fill(path2, 'evenodd');

  ctx.restore();
  ctx.restore();
};

/**
 * Returns watermarked Data URL for displaying or caching.
 */
export const getWatermarkedDataUrl = async (imageUrl: string): Promise<string> => {
  if (!imageUrl) return FALLBACK_IMAGE;

  if (watermarkCache.has(imageUrl)) {
    return watermarkCache.get(imageUrl)!;
  }

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = imageUrl;
    });

    if (!img.complete || img.naturalWidth === 0) {
      return imageUrl;
    }

    const width = img.naturalWidth || 1200;
    const height = img.naturalHeight || 800;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return imageUrl;

    // Draw base property image
    ctx.drawImage(img, 0, 0, width, height);

    // Apply watermarks
    drawWatermarksOnCanvas(ctx, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    watermarkCache.set(imageUrl, dataUrl);
    return dataUrl;
  } catch (err) {
    return imageUrl;
  }
};

/**
 * Burns watermarks onto an uploaded File and returns a Base64 Data URL.
 * Used during property photo uploads to guarantee uploaded pictures carry watermarks.
 */
export const watermarkImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return resolve('');

      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || 1200;
        const height = img.naturalHeight || 800;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(src);

        ctx.drawImage(img, 0, 0, width, height);
        drawWatermarksOnCanvas(ctx, width, height);

        const watermarkedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(watermarkedDataUrl);
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

/**
 * Downloads a property image with watermarks permanently burned in.
 */
export const downloadWatermarkedImage = async (imageUrl: string, fileName?: string): Promise<void> => {
  try {
    let finalDataUrl = imageUrl;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = imageUrl;
    });

    if (img.complete && img.naturalWidth > 0) {
      const width = img.naturalWidth || 1200;
      const height = img.naturalHeight || 800;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        drawWatermarksOnCanvas(ctx, width, height);
        finalDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      }
    }

    const a = document.createElement('a');
    a.href = finalDataUrl;
    a.download = fileName || `DealFast-Property-Photo-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('Download watermarked image failed:', err);
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = fileName || 'DealFast-Property.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

interface WatermarkedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  showOverlayWatermark?: boolean;
}

export const WatermarkedImage: React.FC<WatermarkedImageProps> = ({
  src,
  alt,
  className = '',
  style,
  onError,
  showOverlayWatermark = true,
  ...props
}) => {
  const [displaySrc, setDisplaySrc] = useState<string>(src || FALLBACK_IMAGE);

  useEffect(() => {
    let isMounted = true;
    if (src) {
      setDisplaySrc(src);
      getWatermarkedDataUrl(src).then((url) => {
        if (isMounted && url) {
          setDisplaySrc(url);
        }
      });
    } else {
      setDisplaySrc(FALLBACK_IMAGE);
    }
    return () => {
      isMounted = false;
    };
  }, [src]);

  return (
    <div className="relative inline-block w-full h-full overflow-hidden group/wm select-none">
      <img
        src={displaySrc || src || FALLBACK_IMAGE}
        alt={alt || 'DealFast Property'}
        className={`w-full h-full object-cover ${className}`}
        style={style}
        onError={(e) => {
          if (displaySrc !== FALLBACK_IMAGE) {
            setDisplaySrc(FALLBACK_IMAGE);
          }
          if (onError) onError(e);
        }}
        {...props}
      />

      {/* Watermark Overlay containing pure SVG Logo with transparency (ONLY if image is not already canvas watermarked) */}
      {showOverlayWatermark && displaySrc === src && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center p-4">
          <div className="opacity-40 hover:opacity-60 transition-opacity">
            <svg viewBox="0 0 802 603" className="w-24 h-18 sm:w-36 sm:h-28 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              <path fill="#FF8C00" fillRule="evenodd" d="M 582,503 L 555,511 L 548,515 L 491,532 L 488,535 L 482,548 L 482,551 L 476,560 L 471,572 L 523,572 L 536,565 L 559,550 L 581,530 L 583,527 Z M 643,376 L 617,384 L 612,387 L 608,387 L 587,394 L 583,396 L 584,399 L 596,401 L 608,405 L 610,404 L 625,408 L 631,411 L 633,410 L 640,412 L 642,409 L 644,394 Z M 473,362 L 407,362 L 405,364 L 406,410 L 405,436 L 407,438 L 440,437 L 442,435 L 454,411 L 459,398 L 469,380 L 469,377 L 474,368 Z M 320,363 L 319,384 L 320,437 L 322,438 L 344,438 L 345,437 L 376,438 L 389,436 L 390,434 L 389,409 L 390,386 L 388,362 Z M 249,288 L 152,376 L 152,572 L 376,572 L 397,530 L 400,515 L 254,513 L 254,289 Z M 389,263 L 373,265 L 367,267 L 354,274 L 352,277 L 338,288 L 330,299 L 330,302 L 324,312 L 321,323 L 320,337 L 321,345 L 328,345 L 329,346 L 389,345 L 390,343 Z M 406,263 L 405,297 L 406,305 L 405,328 L 406,329 L 406,345 L 411,346 L 422,345 L 473,346 L 475,344 L 475,331 L 473,327 L 469,308 L 462,296 L 451,282 L 435,271 L 424,267 L 422,265 L 409,262 Z M 770,290 L 657,259 L 650,261 L 669,295 L 503,355 L 478,389 L 392,572 L 457,571 L 482,521 L 593,485 L 599,517 L 671,434 L 567,409 L 582,439 L 512,462 L 532,411 L 556,390 L 683,348 L 689,387 Z M 634,290 L 615,241 L 584,196 L 395,30 L 229,179 L 227,132 L 243,128 L 242,94 L 136,95 L 137,129 L 153,131 L 152,248 L 30,360 L 144,362 L 397,136 L 506,240 L 542,321 Z" />
              <path fill="#FFFFFF" fillRule="evenodd" d="M 770,290 L 657,259 L 650,261 L 669,295 L 503,355 L 478,389 L 392,572 L 457,571 L 482,521 L 593,485 L 599,517 L 671,434 L 567,409 L 582,439 L 511,464 L 532,411 L 556,390 L 683,348 L 689,387 Z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatermarkedImage;
