// components/PropertyCard.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Bed, Bath, Square, Play } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Property } from '@/types'

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Link href={`/property/${property.id}`}>
      <Card className="overflow-hidden property-card shadow-md hover:shadow-xl transition-all duration-300">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {property.images && property.images.length > 0 ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          {property.tiktok_video_url && (
            <div className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full">
              <Play className="w-4 h-4" />
            </div>
          )}
          {property.is_featured && (
            <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-md text-xs font-semibold">
              Featured
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-semibold">
            {property.purpose === 'sale' ? 'For Sale' : 'For Rent'}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1 mb-1">
            {property.title}
          </h3>
          <p className="text-2xl font-bold text-primary mb-2">
            {formatPrice(property.price)}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{property.city?.name}</span>
            </div>
            {property.beds > 0 && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>{property.beds}</span>
              </div>
            )}
            {property.baths > 0 && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{property.baths}</span>
              </div>
            )}
            {property.area_sqft && (
              <div className="flex items-center gap-1">
                <Square className="w-4 h-4" />
                <span>{property.area_sqft} sqft</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
