'use client'

import { useEffect, useRef } from 'react'

interface MapViewProps {
  latitude: number
  longitude: number
  title?: string
  zoom?: number
}

declare global {
  interface Window {
    google: any
  }
}

export default function MapView({ latitude, longitude, title, zoom = 15 }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if Google Maps API is loaded
    if (!window.google || !mapRef.current) {
      return
    }

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom: zoom,
      styles: [
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#7c93a3' }],
        },
        {
          featureType: 'all',
          elementType: 'labels.text.stroke',
          stylers: [{ visibility: 'on' }],
        },
      ],
    })

    // Add marker
    new window.google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: map,
      title: title || 'Property Location',
      animation: window.google.maps.Animation.DROP,
    })

    // Cleanup
    return () => {
      // No cleanup needed for Google Maps
    }
  }, [latitude, longitude, title, zoom])

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div ref={mapRef} className="h-[400px] w-full" />
      {!window.google && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">
            Google Maps API not loaded. Please check your API key.
          </p>
        </div>
      )}
    </div>
  )
}
