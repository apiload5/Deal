'use client'

import { useEffect, useRef } from 'react'

interface TikTokPlayerProps {
  url: string
}

export function TikTokPlayer({ url }: TikTokPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load TikTok embed script
    const script = document.createElement('script')
    script.src = 'https://www.tiktok.com/embed.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Extract video ID from URL
  const extractVideoId = (url: string) => {
    const match = url.match(/video\/(\d+)/)
    return match ? match[1] : null
  }

  const videoId = extractVideoId(url)

  if (!videoId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        Invalid TikTok URL
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative aspect-[9/16] max-h-[600px] w-full max-w-[400px] mx-auto">
      <blockquote
        className="tiktok-embed"
        cite={`https://www.tiktok.com/@deal/video/${videoId}`}
        data-video-id={videoId}
        style={{ width: '100%', height: '100%' }}
      >
        <section>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://www.tiktok.com/@deal/video/${videoId}`}
          >
            View on TikTok
          </a>
        </section>
      </blockquote>
    </div>
  )
}
