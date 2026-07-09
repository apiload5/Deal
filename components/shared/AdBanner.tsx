'use client'

interface AdBannerProps {
  position: 'homepage' | 'sidebar' | 'between-cards' | 'below-description' | 'footer'
  className?: string
}

export function AdBanner({ position, className = '' }: AdBannerProps) {
  // Simplified version - returns placeholder
  return (
    <div className={`bg-gray-100 rounded-lg p-4 text-center ${className}`}>
      <p className="text-gray-500 text-sm">Advertisement</p>
      <div className="h-[90px] bg-gray-200 rounded flex items-center justify-center">
        <span className="text-gray-400 text-xs">Ad Space - {position}</span>
      </div>
    </div>
  )
}
