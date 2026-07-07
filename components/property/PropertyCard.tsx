'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin, BedDouble, Bath, Ruler } from 'lucide-react'
import { Card } from '@/components/common/Card'

interface PropertyCardProps {
  id: string
  title: string
  price: number
  location: string
  beds: number
  baths: number
  area: number
  image: string
  isFavorite?: boolean
  onFavoriteToggle?: (id: string) => void
}

export function PropertyCard({
  id,
  title,
  price,
  location,
  beds,
  baths,
  area,
  image,
  isFavorite = false,
  onFavoriteToggle,
}: PropertyCardProps) {
  const [favorite, setFavorite] = useState(isFavorite)

  const handleFavorite = () => {
    setFavorite(!favorite)
    onFavoriteToggle?.(id)
  }

  return (
    <Link href={`/properties/${id}`}>
      <Card interactive className="overflow-hidden h-full">
        {/* Image Container */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <button
            onClick={(e) => {
              e.preventDefault()
              handleFavorite()
            }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition"
          >
            <Heart
              className="w-5 h-5"
              fill={favorite ? 'currentColor' : 'none'}
              color={favorite ? '#ef4444' : '#999'}
            />
          </button>
          <div className="absolute top-3 left-3 bg-gradient-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
            Featured
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{title}</h3>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="line-clamp-1">{location}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-t border-b border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                <BedDouble className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold mt-1">{beds}</p>
              <p className="text-xs text-gray-500">Beds</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                <Bath className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold mt-1">{baths}</p>
              <p className="text-xs text-gray-500">Baths</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                <Ruler className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold mt-1">{area}</p>
              <p className="text-xs text-gray-500">sqft</p>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Price</p>
              <p className="text-2xl font-bold text-gradient-primary">
                Rs {price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
