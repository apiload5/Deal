// components/shared/PropertyCard.tsx - COMPLETE
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bed, Bath, MapPin, Eye, Heart, Star, TrendingUp, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils/helpers'

interface PropertyCardProps {
  property: any
  variant?: 'premium' | 'featured' | 'default'
}

export function PropertyCard({ property, variant = 'default' }: PropertyCardProps) {
  const imageUrl = property.images?.[0] || '/placeholder-property.jpg'
  const isPremium = property.is_premium || variant === 'premium'
  const isFeatured = property.is_featured || variant === 'featured'
  const daysLeft = property.premium_until 
    ? Math.ceil((new Date(property.premium_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <Link href={`/property/${property.id}`}>
      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden">
          <Image
            src={imageUrl}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isPremium && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black border-0 px-3 py-1.5 text-xs font-semibold shadow-lg flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                {daysLeft <= 3 ? '🔥 Urgent' : 'Premium'}
                {daysLeft > 0 && daysLeft <= 7 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                    {daysLeft}d
                  </span>
                )}
              </Badge>
            )}
            {isFeatured && !isPremium && (
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 px-3 py-1.5 text-xs font-semibold shadow-lg flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Featured
              </Badge>
            )}
            {property.purpose === 'sale' && (
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 px-3 py-1.5 text-xs font-semibold shadow-lg">
                For Sale
              </Badge>
            )}
            {property.purpose === 'rent' && (
              <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 px-3 py-1.5 text-xs font-semibold shadow-lg">
                For Rent
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <button 
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition"
            onClick={(e) => {
              e.preventDefault()
              // Add to favorites
            }}
          >
            <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition" />
          </button>

          {/* TikTok/Video Badge */}
          {property.tiktok_video_url && (
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-2.44 2.6-2.6V10.4c-3.03.44-5.6 2.98-5.6 6.1 0 3.37 2.74 6.1 6.1 6.1 3.37 0 6.1-2.73 6.1-6.1v-5.13c.91.64 2.04 1.02 3.29 1.02V8.9c-.01-.01-.01-.02-.01-.02-.56-.24-1.02-.75-1.29-1.35-.27-.6-.27-1.26-.27-1.89v-.02z"/>
              </svg>
              Video
            </div>
          )}

          {/* View Count */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
            <Eye className="h-3 w-3" />
            {property.views || 0} views
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Title & Location */}
          <div className="mb-2">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-green-600 transition">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>{property.cities?.name || 'Location'}</span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-3">
            <p className="text-2xl font-bold text-green-600">
              {formatPrice(property.price)}
              {property.purpose === 'rent' && (
                <span className="text-sm font-normal text-gray-500">/month</span>
              )}
            </p>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-100 pt-3">
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
            {property.created_at && (
              <div className="flex items-center gap-1 ml-auto text-gray-400">
                <Clock className="h-3 w-3" />
                <span className="text-xs">
                  {new Date(property.created_at).toLocaleDateString('en-PK', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Agent/Owner */}
          {property.agent && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-green-600">
                    {property.agent.name?.[0] || 'A'}
                  </span>
                </div>
                <span className="text-sm text-gray-600">{property.agent.name}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={(e) => {
                  e.preventDefault()
                  // Contact agent
                }}
              >
                Contact
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
