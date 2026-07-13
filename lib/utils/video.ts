// lib/utils/video.ts
export function extractTikTokId(url: string): string | null {
  const patterns = [
    /tiktok\.com\/@[\w.]+\/video\/(\d+)/,
    /tiktok\.com\/[\w.]+\/video\/(\d+)/,
    /vm\.tiktok\.com\/(\w+)/,
    /vt\.tiktok\.com\/(\w+)/,
    /tiktok\.com\/embed\/v2\/(\d+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function getTikTokEmbedUrl(url: string): string | null {
  const id = extractTikTokId(url)
  if (!id) return null
  return `https://www.tiktok.com/embed/v2/${id}`
}

export function isValidTikTokUrl(url: string): boolean {
  return extractTikTokId(url) !== null
}
