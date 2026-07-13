'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Bed, Bath, Maximize, MapPin, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { formatPKR } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: {
    id: string
    title: string
    price: number
    city: string
    area: string
    propertyType: string
    beds?: number | null
    baths?: number | null
    areaSqft: number
    images: string[]
    isPremium?: boolean
    isFeatured?: boolean
  }
  className?: string
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const {
    id,
    title,
    price,
    city,
    area,
    propertyType,
    beds,
    baths,
    areaSqft,
    images,
    isPremium,
    isFeatured,
  } = property

  const displayImage = images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'

  return (
    <Card className={cn('group overflow-hidden transition-all hover:shadow-xl', className)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={displayImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {isPremium && (
          <Badge className="premium-badge absolute left-3 top-3 z-10">
            Premium
          </Badge>
        )}
        {isFeatured && (
          <Badge className="featured-badge absolute right-3 top-3 z-10">
            Featured
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute right-3 top-12 z-10 rounded-full bg-background/80 backdrop-blur-sm transition-all hover:scale-110',
            isLiked && 'text-red-500'
          )}
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
        </Button>
        <div className="absolute bottom-3 left-3 right-3 flex gap-1 overflow-x-auto">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                'h-1 flex-1 rounded-full transition-all',
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              )}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </div>

      <CardHeader className="space-y-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-lg font-semibold group-hover:text-primary">
            <Link href={`/property/${id}`}>{title}</Link>
          </h3>
        </div>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {area}, {city}
        </p>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="mb-3 flex flex-wrap gap-3 text-sm">
          {beds !== undefined && beds !== null && beds > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Bed className="h-4 w-4" /> {beds}
            </span>
          )}
          {baths !== undefined && baths !== null && baths > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Bath className="h-4 w-4" /> {baths}
            </span>
          )}
          {areaSqft > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Maximize className="h-4 w-4" /> {areaSqft.toLocaleString()} sqft
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-primary">{formatPKR(price)}</p>
          <Badge variant="secondary">{propertyType.replace('_', ' ')}</Badge>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button asChild className="flex-1">
          <Link href={`/property/${id}`}>View Details</Link>
        </Button>
        <Button variant="outline" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
