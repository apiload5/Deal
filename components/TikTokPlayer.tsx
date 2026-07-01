'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';

interface TikTokPlayerProps {
  url: string | null;
}

export default function TikTokPlayer({ url }: TikTokPlayerProps) {
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    const match = url.match(/video\/(\d+)/);
    if (match && match[1]) {
      setVideoId(match[1]);
    }
  }, [url]);

  if (!url || !videoId) return null;

  return (
    <div className="mx-auto w-full max-w-[360px] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-xl border relative">
      <blockquote
        className="tiktok-embed w-full h-full m-0 p-0 absolute top-0 left-0"
        data-video-id={videoId}
      >
        <section className="w-full h-full flex items-center justify-center text-white bg-slate-900">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <p className="text-xs text-slate-400">Loading walkthrough video...</p>
          </div>
        </section>
      </blockquote>
      <Script async src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
    </div>
  );
}
