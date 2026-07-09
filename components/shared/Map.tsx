'use client'

import { useEffect, useState } from 'react'

interface MapProps {
  lat: number
  lng: number
  title: string
}

export function Map({ lat, lng, title }: MapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }

  // Simple placeholder map
  return (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center flex-col">
      <p className="text-gray-500">📍 {title}</p>
      <p className="text-sm text-gray-400">Lat: {lat}, Lng: {lng}</p>
      <p className="text-xs text-gray-300 mt-2">Map will be displayed here</p>
    </div>
  )
}
