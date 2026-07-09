'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bed, Bath, MapPin, Play } from 'lucide-react'
import { formatPrice } from '@/lib/utils/helpers'

interface PropertyCardProps {
  property: {
    id: string
    title: string
    price: number
    area_sqft?: number
    beds: number
    baths: number
    images: string[]
    tiktok_video_url?: string
    is_featured: boolean
    is_premium: boolean
    cities?: {
      name: string
    }
  }
}

export function PropertyCard({ property }: PropertyCardProps) {
  const imageUrl = property.images?.[0] || '/placeholder-property.jpg'
  
  return (
    <Link href={`/property/${property.id}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {property.tiktok_video_url && (
            <div className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full">
              <Play className="h-4 w-4" />
            </div>
          )}
          {property.is_premium && (
            <Badge variant="premium" className="absolute top-2 left-2">
              Premium
            </Badge>
          )}
          {property.is_featured && !property.is_premium && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1 mb-2">
            {property.title}
          </h3>
          <p className="text-primary font-bold text-xl mb-2">
            {formatPrice(property.price)}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.beds}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.baths}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{property.cities?.name || 'Location'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
