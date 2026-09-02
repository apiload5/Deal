import React, { useState } from 'react';
import { Play, ExternalLink, Video as VideoIcon, AlertCircle, RefreshCw } from 'lucide-react';

interface ListingVideoPlayerProps {
  videoUrl: string;
  title: string;
  thumbnailUrl?: string;
}

export const ListingVideoPlayer: React.FC<ListingVideoPlayerProps> = ({
  videoUrl,
  title,
  thumbnailUrl
}) => {
  const [embedFailed, setEmbedFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoUrl) return null;

  const trimmed = videoUrl.trim();

  // Helper to extract TikTok Video ID
  const getTikTokEmbedUrl = (url: string): string | null => {
    // Matches https://www.tiktok.com/@username/video/1234567890123456789
    const match = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i) || url.match(/tiktok\.com\/v\/(\d+)/i);
    if (match && match[1]) {
      return `https://www.tiktok.com/embed/v2/${match[1]}?lang=en-US`;
    }
    // vm.tiktok.com or vt.tiktok.com short links
    if (url.includes('tiktok.com')) {
      return url;
    }
    return null;
  };

  // Helper to extract YouTube Embed URL
  const getYouTubeEmbedUrl = (url: string): string | null => {
    // Matches regular youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
    if (url.includes('youtube.com/watch')) {
      const vidId = url.split('v=')[1]?.split('&')[0]?.split('#')[0];
      if (vidId) return `https://www.youtube-nocookie.com/embed/${vidId}?autoplay=1&rel=0`;
    }
    if (url.includes('youtu.be/')) {
      const vidId = url.split('youtu.be/')[1]?.split('?')[0]?.split('#')[0];
      if (vidId) return `https://www.youtube-nocookie.com/embed/${vidId}?autoplay=1&rel=0`;
    }
    if (url.includes('youtube.com/shorts/')) {
      const vidId = url.split('youtube.com/shorts/')[1]?.split('?')[0]?.split('#')[0];
      if (vidId) return `https://www.youtube-nocookie.com/embed/${vidId}?autoplay=1&rel=0`;
    }
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    return null;
  };

  // Helper to extract Instagram Embed URL
  const getInstagramEmbedUrl = (url: string): string | null => {
    if (url.includes('instagram.com/reel/') || url.includes('instagram.com/p/') || url.includes('instagram.com/tv/')) {
      const cleanUrl = url.split('?')[0].replace(/\/$/, '');
      return `${cleanUrl}/embed/captioned`;
    }
    return null;
  };

  // Helper to extract Vimeo Embed URL
  const getVimeoEmbedUrl = (url: string): string | null => {
    const match = url.match(/vimeo\.com\/(\d+)/i);
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
    }
    return null;
  };

  // Direct MP4 / WebM video files
  const isDirectVideoFile =
    trimmed.endsWith('.mp4') ||
    trimmed.endsWith('.webm') ||
    trimmed.endsWith('.mov') ||
    trimmed.endsWith('.ogg') ||
    trimmed.includes('.mp4?') ||
    trimmed.includes('blob:') ||
    trimmed.startsWith('data:video');

  const tikTokEmbed = getTikTokEmbedUrl(trimmed);
  const youTubeEmbed = getYouTubeEmbedUrl(trimmed);
  const instagramEmbed = getInstagramEmbedUrl(trimmed);
  const vimeoEmbed = getVimeoEmbedUrl(trimmed);

  const isTikTok = Boolean(tikTokEmbed || trimmed.includes('tiktok.com'));

  // 1. Direct Video File Player
  if (isDirectVideoFile) {
    return (
      <div className="aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl relative group">
        <video
          controls
          playsInline
          preload="metadata"
          src={trimmed}
          poster={thumbnailUrl}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // 2. TikTok Specialized Card & Embed Player
  if (isTikTok) {
    return (
      <div className="w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-pink-500/30 shadow-2xl space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-black text-xs border border-pink-500/30">
              TT
            </div>
            <div>
              <h5 className="font-bold text-white text-xs">TikTok Video Tour</h5>
              <p className="text-[10px] text-slate-400">Verified Virtual Walkthrough</p>
            </div>
          </div>
          <a
            href={trimmed}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-[11px] flex items-center space-x-1 shadow transition-all"
          >
            <span>Open in TikTok</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Embedded Frame or Preview Poster */}
        {!embedFailed && tikTokEmbed && isPlaying ? (
          <div className="relative aspect-[9/16] max-h-[480px] w-full mx-auto rounded-xl overflow-hidden border border-slate-800 bg-black">
            <iframe
              src={tikTokEmbed}
              title={`TikTok - ${title}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onError={() => setEmbedFailed(true)}
            />
          </div>
        ) : (
          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 group bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform"
              />
            )}
            <div className="relative z-10 space-y-3">
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-pink-600/40 transform hover:scale-110 transition-transform"
                title="Play TikTok Video"
              >
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </button>
              <div>
                <p className="text-xs font-bold text-white">Click to Play TikTok Walkthrough</p>
                <p className="text-[10px] text-slate-300 mt-0.5">Or tap 'Open in TikTok' for native app playback</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. YouTube Embed Player
  if (youTubeEmbed) {
    return (
      <div className="aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
        <iframe
          src={youTubeEmbed}
          title={`YouTube - ${title}`}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // 4. Instagram Reels Player
  if (instagramEmbed) {
    return (
      <div className="w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-purple-500/30 shadow-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
              IG
            </div>
            <div>
              <h5 className="font-bold text-white text-xs">Instagram Reel Tour</h5>
              <p className="text-[10px] text-slate-400">{title}</p>
            </div>
          </div>
          <a
            href={trimmed}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] flex items-center space-x-1"
          >
            <span>View on Instagram</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="relative aspect-[9/16] max-h-[480px] w-full mx-auto rounded-xl overflow-hidden border border-slate-800">
          <iframe
            src={instagramEmbed}
            title={`Instagram - ${title}`}
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // 5. Vimeo Embed Player
  if (vimeoEmbed) {
    return (
      <div className="aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
        <iframe
          src={vimeoEmbed}
          title={`Vimeo - ${title}`}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // 6. Generic Embed or Safe Fallback Link
  return (
    <div className="aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl relative">
      {!embedFailed ? (
        <iframe
          src={trimmed}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={() => setEmbedFailed(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-900">
          <VideoIcon className="w-10 h-10 text-orange-400" />
          <div>
            <h5 className="font-bold text-white text-xs">External Property Video Tour</h5>
            <p className="text-[11px] text-slate-400 max-w-sm mt-1">
              This video provider requires opening directly in their player.
            </p>
          </div>
          <a
            href={trimmed}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-orange-500/25"
          >
            <span>Watch External Video</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};
