import * as React from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapView } from '@/features/map/components/MapView'
import { VideoPlayer } from '@/features/video-embed/components/VideoPlayer'
import { MortgageCalculator } from '@/features/mortgage/components/MortgageCalculator'
import { Share2, Heart, MapPin, Bed, Bath, Square, Calendar, Eye, MessageCircle, Building2 } from 'lucide-react'

interface PageParams {
  id: string
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { id } = await params
  
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      agent: {
        include: {
          user: true,
        },
      },
      owner: true,
      reviews: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!property) {
    notFound()
  }

  // Increment view count
  await prisma.property.update({
    where: { id: property.id },
    data: { views: { increment: 1 } },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Images */}
          <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl">
            <div className="col-span-2 aspect-video">
              <img
                src={property.images[0] || '/placeholder-property.jpg'}
                alt={property.title}
                className="h-full w-full object-cover"
              />
            </div>
            {property.images.slice(1, 3).map((image, index) => (
              <div key={index} className="aspect-square">
                <img
                  src={image}
                  alt={`${property.title} ${index + 2}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Title & Price */}
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{property.title}</h1>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {property.city}, {property.area}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold gradient-text">
                {formatPrice(property.price)}
              </span>
              <p className="text-sm text-muted-foreground capitalize">For {property.purpose}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2 rounded-full">
              <Heart className="h-4 w-4" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="gap-2 rounded-full">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Property Details */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-xl">
              <Bed className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">{property.beds || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Beds</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-xl">
              <Bath className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">{property.baths || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Baths</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-xl">
              <Square className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">{property.areaSqft} sqft</p>
                <p className="text-xs text-muted-foreground">Area</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-xl">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">{property.builtYear || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Year Built</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Video - FIXED: Type assertion */}
          {property.videoUrl && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Video Tour</h2>
              <VideoPlayer 
                url={property.videoUrl} 
                platform={(property.videoPlatform as 'youtube' | 'vimeo' | 'custom') || 'youtube'} 
              />
            </div>
          )}

          {/* Map */}
          {property.latitude && property.longitude && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <MapView
                latitude={property.latitude}
                longitude={property.longitude}
                zoom={14}
              />
            </div>
          )}

          {/* Reviews */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            {property.reviews.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {property.reviews.map((review) => (
                  <Card key={review.id} className="glass">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{review.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-muted-foreground">{review.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Card */}
          {property.agent && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-500" />
                  Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold">
                    {property.agent.user.name?.[0] || 'A'}
                  </div>
                  <div>
                    <p className="font-medium">{property.agent.user.name}</p>
                    <p className="text-sm text-muted-foreground">{property.agent.company}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Rating</p>
                    <p className="font-medium">{property.agent.rating.toFixed(1)} ★</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Deals</p>
                    <p className="font-medium">{property.agent.totalDealsCompleted}</p>
                  </div>
                </div>
                <Button className="w-full gap-2 btn-premium">
                  <MessageCircle className="h-4 w-4" />
                  Contact Agent
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Mortgage Calculator */}
          <MortgageCalculator price={property.price} />

          {/* Details Card */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="font-medium capitalize">{property.propertyType.toLowerCase()}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-muted-foreground">Purpose</dt>
                  <dd className="font-medium capitalize">{property.purpose}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-muted-foreground">Furnished</dt>
                  <dd className="font-medium">{property.furnished || 'Not specified'}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-muted-foreground">Floor</dt>
                  <dd className="font-medium">{property.floor || 'Ground'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Views</dt>
                  <dd className="font-medium flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {property.views}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
