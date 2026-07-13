// features/video-embed/components/TikTokPlayer.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

interface TikTokPlayerProps {
  url: string
  thumbnail?: string
  title?: string
  className?: string
}

export function TikTokPlayer({ url, thumbnail, title, className = '' }: TikTokPlayerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Extract video ID from TikTok URL
  const getTikTokId = (url: string) => {
    const patterns = [
      /tiktok\.com\/@[\w.]+\/video\/(\d+)/,
      /tiktok\.com\/[\w.]+\/video\/(\d+)/,
      /vm\.tiktok\.com\/(\w+)/,
      /vt\.tiktok\.com\/(\w+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const videoId = getTikTokId(url)

  useEffect(() => {
    if (isOpen && !isLoaded) {
      // Load TikTok embed script
      const script = document.createElement('script')
      script.src = 'https://www.tiktok.com/embed.js'
      script.async = true
      script.onload = () => setIsLoaded(true)
      document.body.appendChild(script)

      return () => {
        document.body.removeChild(script)
      }
    }
  }, [isOpen, isLoaded])

  if (!videoId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        Invalid TikTok URL. Please check the video link.
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          className={`relative group rounded-lg overflow-hidden bg-gray-100 ${className}`}
          style={{ aspectRatio: '16/9' }}
        >
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={title || 'TikTok Video'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-white text-center">
                <Play className="h-16 w-16 mx-auto mb-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="text-sm opacity-70">TikTok Video</span>
              </div>
            </div>
          )}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
          </div>

          {/* TikTok badge */}
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
              <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-2.44 2.6-2.6V10.4c-3.03.44-5.6 2.98-5.6 6.1 0 3.37 2.74 6.1 6.1 6.1 3.37 0 6.1-2.73 6.1-6.1v-5.13c.91.64 2.04 1.02 3.29 1.02V8.9c-.01-.01-.01-.02-.01-.02-.56-.24-1.02-.75-1.29-1.35-.27-.6-.27-1.26-.27-1.89v-.02z"/>
            </svg>
            <span>TikTok</span>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0 bg-black rounded-lg overflow-hidden">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 text-white hover:text-white hover:bg-black/50"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          
          <div ref={containerRef} className="aspect-[9/16] max-h-[80vh] w-full">
            <blockquote
              className="tiktok-embed w-full h-full"
              cite={`https://www.tiktok.com/@deal/video/${videoId}`}
              data-video-id={videoId}
              style={{ width: '100%', height: '100%', minHeight: '400px' }}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
