// components/shared/PropertyCard.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bed, Bath, MapPin, Eye, Heart, Star, TrendingUp, Calendar } from 'lucide-react'
import { formatPrice } from '@/lib/utils/helpers'
import { cn } from '@/lib/utils/helpers'

interface PropertyCardProps {
  property: any
  variant?: 'premium' | 'featured' | 'default'
  className?: string
}

export function PropertyCard({ property, variant = 'default', className }: PropertyCardProps) {
  const imageUrl = property.images?.[0] || '/placeholder-property.jpg'
  const isPremium = property.is_premium || variant === 'premium'
  const isFeatured = property.is_featured || variant === 'featured'

  const getBadge = () => {
    if (isPremium && property.premium_until) {
      const daysLeft = Math.ceil(
        (new Date(property.premium_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysLeft <= 7) {
        return (
          <Badge variant="premium" className="absolute top-2 left-2 z-10 flex items-center gap-1 animate-pulse">
            <Star className="h-3 w-3 fill-current" />
            {daysLeft <= 3 ? '🔥 Urgent' : 'Premium'}
          </Badge>
        )
      }
      return (
        <Badge variant="premium" className="absolute top-2 left-2 z-10 flex items-center gap-1">
          <Star className="h-3 w-3 fill-current" />
          Premium
        </Badge>
      )
    }
    if (isFeatured) {
      return (
        <Badge variant="secondary" className="absolute top-2 left-2 z-10 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Featured
        </Badge>
      )
    }
    if (property.status === 'sold') {
      return (
        <Badge variant="destructive" className="absolute top-2 left-2 z-10">
          Sold
        </Badge>
      )
    }
    return null
  }

  return (
    <Link href={`/property/${property.id}`} className={cn('block group', className)}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-green-500 relative">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          
          {/* Badge */}
          {getBadge()}

          {/* Save Button */}
          <button
            className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
            onClick={(e) => {
              e.preventDefault()
              // TODO: Add to favorites
            }}
          >
            <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
          </button>

          {/* Property Type */}
          <div className="absolute bottom-2 left-2 z-10 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md capitalize">
            {property.property_type || 'House'}
          </div>

          {/* TikTok indicator */}
          {property.tiktok_video_url && (
            <div className="absolute bottom-2 right-2 z-10 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-2.44 2.6-2.6V10.4c-3.03.44-5.6 2.98-5.6 6.1 0 3.37 2.74 6.1 6.1 6.1 3.37 0 6.1-2.73 6.1-6.1v-5.13c.91.64 2.04 1.02 3.29 1.02V8.9c-.01-.01-.01-.02-.01-.02-.56-.24-1.02-.75-1.29-1.35-.27-.6-.27-1.26-.27-1.89v-.02z"/>
              </svg>
              Video
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-base line-clamp-1 group-hover:text-green-600 transition">
            {property.title}
          </h3>

          {/* Price */}
          <div className="flex items-center justify-between mt-1">
            <p className="text-xl font-bold text-green-600">
              {formatPrice(property.price)}
              {property.purpose === 'rent' && (
                <span className="text-sm font-normal text-gray-500">/mo</span>
              )}
            </p>
            {property.purpose === 'sale' && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                For Sale
              </span>
            )}
            {property.purpose === 'rent' && (
              <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                For Rent
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            {property.beds > 0 && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{property.beds}</span>
              </div>
            )}
            {property.baths > 0 && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{property.baths}</span>
              </div>
            )}
            {property.area_sqft > 0 && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{property.area_sqft} sqft</span>
              </div>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Calendar className="h-3 w-3" />
              <span className="text-xs">
                {new Date(property.created_at).toLocaleDateString('en-PK', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          </div>

          {/* City & Views */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="h-3 w-3" />
              <span>{property.cities?.name || 'Location'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {property.views || 0}
              </span>
              {property.agent && (
                <span className="flex items-center gap-1 text-green-600">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {property.agent.name}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
