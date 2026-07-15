'use client'

import * as React from 'react'

interface MapViewProps {
  latitude: number
  longitude: number
  zoom?: number
}

export function MapView({ latitude, longitude, zoom = 14 }: MapViewProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const mapRef = React.useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = React.useState<any>(null)

  React.useEffect(() => {
    const loadGoogleMaps = async () => {
      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY) {
        console.warn('Google Maps API key not found')
        return
      }

      try {
        // Dynamically load Google Maps
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`
        script.async = true
        script.defer = true
        document.head.appendChild(script)

        script.onload = () => {
          setIsLoaded(true)
        }
      } catch (error) {
        console.error('Failed to load Google Maps:', error)
      }
    }

    loadGoogleMaps()
  }, [])

  React.useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    const google = (window as any).google
    if (!google) return

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    })

    new google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map,
      animation: google.maps.Animation.DROP,
    })

    setMapInstance(map)

    return () => {
      if (mapInstance) {
        // Cleanup
      }
    }
  }, [isLoaded, latitude, longitude, zoom])

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg bg-muted">
        <p className="text-muted-foreground">
          Map unavailable. Please set NEXT_PUBLIC_GOOGLE_MAPS_KEY.
        </p>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className="h-[400px] w-full rounded-lg overflow-hidden"
    />
  )
}
