import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Bed, Bath, Square, MapPin, Heart } from 'lucide-react'

interface PropertyCardProps {
  property: {
    id: string
    title: string
    price: number
    city: string
    area: string
    propertyType: string
    purpose: string
    beds: number | null
    baths: number | null
    areaSqft: number
    images: string[]
    isPremium: boolean
    isFeatured: boolean
    agent?: {
      user: {
        name: string | null
      }
    } | null
  }
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={property.images[0] || '/placeholder-property.jpg'}
            alt={property.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 flex gap-1">
            {property.isFeatured && (
              <Badge variant="success">Featured</Badge>
            )}
            {property.isPremium && (
              <Badge variant="warning">Premium</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 rounded-full bg-background/80 backdrop-blur hover:bg-background"
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Badge className="absolute bottom-2 left-2 bg-primary/90 backdrop-blur">
            {property.purpose}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Link href={`/property/${property.id}`}>
          <h3 className="line-clamp-1 text-lg font-semibold hover:text-primary transition-colors">
            {property.title}
          </h3>
        </Link>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {property.city}, {property.area}
        </p>
        <p className="mt-2 text-2xl font-bold text-primary">
          {formatPrice(property.price)}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
          {property.beds && (
            <span className="flex items-center gap-1">
              <Bed className="h-3 w-3" />
              {property.beds}
            </span>
          )}
          {property.baths && (
            <span className="flex items-center gap-1">
              <Bath className="h-3 w-3" />
              {property.baths}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Square className="h-3 w-3" />
            {property.areaSqft} sqft
          </span>
        </div>
        {property.agent && (
          <p className="mt-2 text-xs text-muted-foreground">
            Agent: {property.agent.user.name}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/property/${property.id}`} className="w-full">
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
