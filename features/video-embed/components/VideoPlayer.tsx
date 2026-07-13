'use client'

import { useState } from 'react'
import ReactPlayer from 'react-player/lazy'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoPlayerProps {
  url: string
  platform?: 'youtube' | 'vimeo' | 'dailymotion' | 'facebook' | 'tiktok'
  className?: string
}

export default function VideoPlayer({ url, platform, className = '' }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const playerRef = useState<any>(null)

  const togglePlay = () => setIsPlaying(!isPlaying)
  const toggleMute = () => setIsMuted(!isMuted)
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleProgress = (state: any) => {
    setProgress(state.played)
  }

  const handleDuration = (duration: number) => {
    setDuration(duration)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value) * duration
    if (playerRef.current) {
      playerRef.current.seekTo(seekTime)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-black ${className}`}>
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={isPlaying}
        muted={isMuted}
        onProgress={handleProgress}
        onDuration={handleDuration}
        width="100%"
        height="100%"
        className="aspect-video"
        config={{
          youtube: {
            playerVars: { showinfo: 1, rel: 0 },
          },
        }}
      />

      {/* Custom Controls Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity hover:opacity-100">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div className="mb-4 flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={progress}
              onChange={handleSeek}
              className="flex-1 accent-white"
            />
            <span className="text-sm text-white">
              {formatTime(progress * duration)} / {formatTime(duration)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>

            <div className="flex-1" />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Play Button Overlay (when not playing) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="rounded-full bg-white/20 p-6 backdrop-blur-sm transition-transform hover:scale-110">
            <Play className="h-12 w-12 fill-white text-white" />
          </div>
        </button>
      )}
    </div>
  )
}
