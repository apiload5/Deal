'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { extractTikTokId } from '@/lib/utils/helpers';

interface TikTokPlayerProps {
  videoUrl: string | null;
  className?: string;
}

export default function TikTokPlayer({ videoUrl, className = '' }: TikTokPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoId = videoUrl ? extractTikTokId(videoUrl) : null;

  useEffect(() => {
    // Load TikTok embed script
    if (videoId && containerRef.current) {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [videoId]);

  if (!videoId || !videoUrl) {
    return null;
  }

  return (
    <div ref={containerRef} className={className}>
      <div className="aspect-[9/16] w-full overflow-hidden rounded-xl bg-black">
        <blockquote
          className="tiktok-embed"
          cite={videoUrl}
          data-video-id={videoId}
          style={{ 
            width: '100%', 
            height: '100%',
            minWidth: '100%',
            maxWidth: '100%',
          }}
        >
          <section>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={videoUrl}
            >
              Watch on TikTok
            </a>
          </section>
        </blockquote>
      </div>
    </div>
  );
}
