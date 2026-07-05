// components/shared/AdSense.tsx
"use client"

import { useEffect } from "react"

export function AdSense() {
  useEffect(() => {
    try {
      // Load AdSense script
      const script = document.createElement("script")
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`
      script.async = true
      script.crossOrigin = "anonymous"
      document.head.appendChild(script)

      // Initialize ads
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
    } catch (error) {
      console.error("Failed to load AdSense:", error)
    }
  }, [])

  return null
}
