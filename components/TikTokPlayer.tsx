// components/TikTokPlayer.tsx
'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { Skeleton } from '@/components/ui/skeleton'

interface TikTokPlayerProps {
  tiktok_video_url: string | null
}

export function TikTokPlayer({ tiktok_video_url }: TikTokPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [videoId, setVideoId] = useState<string | null>(null)

  useEffect(() => {
    if (!tiktok_video_url) {
      setIsLoading(false)
      return
    }

    // Extract video ID from TikTok URL
    const match = tiktok_video_url.match(/video\/(\d+)/)
    if (match && match[1]) {
      setVideoId(match[1])
    }
    setIsLoading(false)
  }, [tiktok_video_url])

  if (!tiktok_video_url || !videoId) return null

  if (isLoading) {
    return (
      <div className="relative aspect-[9/16] w-full max-w-sm mx-auto bg-gray-100 rounded-xl overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://www.tiktok.com/embed.js"
        strategy="lazyOnload"
      />
      <div className="relative aspect-[9/16] w-full max-w-sm mx-auto bg-black rounded-xl overflow-hidden shadow-lg">
        <blockquote
          className="tiktok-embed"
          cite={tiktok_video_url}
          data-video-id={videoId}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <section>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={tiktok_video_url}
            >
              View on TikTok
            </a>
          </section>
        </blockquote>
      </div>
    </>
  )
}
