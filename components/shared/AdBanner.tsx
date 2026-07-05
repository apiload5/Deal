// components/shared/AdBanner.tsx
"use client"

import { useEffect, useState } from "react"

interface AdBannerProps {
  position: "homepage" | "sidebar" | "between-cards" | "below-description" | "footer"
  className?: string
}

export function AdBanner({ position, className = "" }: AdBannerProps) {
  const [adsEnabled, setAdsEnabled] = useState(true)

  useEffect(() => {
    // Check if ads are enabled
    const checkAds = async () => {
      try {
        // For now, use environment variable
        setAdsEnabled(process.env.NEXT_PUBLIC_ADS_ENABLED === "true")
      } catch {
        setAdsEnabled(false)
      }
    }
    checkAds()
  }, [])

  if (!adsEnabled) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 text-center ${className}`}>
        <p className="text-gray-500 text-sm">Ad Space</p>
      </div>
    )
  }

  // Different ad sizes based on position
  const adSizes = {
    homepage: "horizontal",
    sidebar: "vertical",
    "between-cards": "horizontal",
    "below-description": "horizontal",
    footer: "horizontal",
  }

  const adSize = adSizes[position]

  return (
    <div className={`ad-container ${className}`}>
      <div
        className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
        style={{
          minHeight: adSize === "vertical" ? "250px" : "90px",
          width: "100%",
        }}
      >
        <div className="flex items-center justify-center h-full p-4">
          <div className="text-center">
            <div className="w-full max-w-[728px] h-[90px] bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
              {/* AdSense ad will be inserted here */}
              <span>Advertisement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
