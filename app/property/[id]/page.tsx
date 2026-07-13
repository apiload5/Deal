// app/property/[id]/page.tsx - REAL DATABASE VERSION
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'
import { PropertyCard } from '@/components/shared/PropertyCard'
import { Map } from '@/components/shared/Map'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { TikTokPlayer } from '@/components/shared/TikTokPlayer'
import { AdBanner } from '@/components/shared/AdBanner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bed, Bath, MapPin, Calendar, Eye, Star, Heart, Share2 } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils/helpers'
import { PropertyStructuredData } from '@/components/seo/PropertyStructuredData'

export const revalidate = 3600
export const dynamicParams = true

interface PropertyPageProps {
  params: {
    id: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PropertyPageProps) {
  const { data: property } = await supabase
    .from('properties')
    .select('title, description, images, price, cities(name)')
    .eq('id', params.id)
    .single()

  if (!property) {
    return {
      title: 'Property Not Found',
      description: 'The property you are looking for does not exist.',
    }
  }

  return {
    title: `${property.title} - ${formatPrice(property.price)} | deal.pk`,
    description: property.description?.slice(0, 160) || 'Property for sale/rent in Pakistan',
    openGraph: {
      images: property.images?.[0] || '/placeholder-property.jpg',
    },
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  // ✅ REAL DATABASE FETCH
  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      cities(name),
      owner:users(id, name, phone, email)
    `)
    .eq('id', params.id)
    .single()

  if (error || !property) {
    notFound()
  }

  // Increment view count
  await supabase.rpc('increment_property_views', { property_id: params.id })

  // Fetch related properties
  const { data: relatedProperties } = await supabase
    .from('properties')
    .select('id, title, price, images, beds, baths, cities(name)')
    .eq('city_id', property.city_id)
    .neq('id', params.id)
    .eq('status', 'active')
    .limit(4)

  return (
    <>
      {/* Structured Data for SEO */}
      <PropertyStructuredData property={property} />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <span>›</span>
          <a href="/properties" className="hover:text-primary">Properties</a>
          <span>›</span>
          <a href={`/properties?city=${property.cities?.slug}`} className="hover:text-primary">
            {property.cities?.name}
          </a>
          <span>›</span>
          <span className="text-gray-900 font-medium truncate">{property.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-gray-100 rounded-xl overflow-hidden mb-6">
              <div className="relative aspect-[16/9]">
                {property.images && property.images.length > 0 ? (
                  <Image
                    src={property.images[0]}
                    alt={property.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
                {property.is_premium && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="premium" className="text-sm py-1 px-3">
                      <Star className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                )}
              </div>
              {property.images && property.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-2">
                  {property.images.slice(1, 5).map((image: string, index: number) => (
                    <div key={index} className="relative aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`${property.title} - Image ${index + 2}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 25vw, 20vw"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Property details */}
            <article className="space-y-6">
              <header>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {property.is_premium && (
                    <Badge variant="premium" className="text-sm py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  {property.is_featured && !property.is_premium && (
                    <Badge variant="secondary" className="text-sm py-1">Featured</Badge>
                  )}
                  <Badge variant="outline" className="text-sm py-1 capitalize">
                    {property.purpose === 'sale' ? 'For Sale' : 'For Rent'}
                  </Badge>
                  <Badge variant="outline" className="text-sm py-1 capitalize">
                    {property.property_type}
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">{property.title}</h1>
                <div className="flex items-center gap-2 text-gray-500 mt-2">
                  <MapPin className="h-4 w-4" />
                  <address className="not-italic">{property.address || property.cities?.name}</address>
                </div>
              </header>

              <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-primary">
                    {formatPrice(property.price)}
                  </p>
                  {property.purpose === 'rent' && (
                    <span className="text-sm text-gray-500">per month</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-gray-500" />
                    <span>{property.beds} Beds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-gray-500" />
                    <span>{property.baths} Baths</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span>{formatDate(property.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-gray-500" />
                    <span>{property.views || 0} views</span>
                  </div>
                </div>
              </div>

              {property.description && (
                <section>
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {property.description}
                    </p>
                  </div>
                </section>
              )}

              {/* Ad below description */}
              <AdBanner position="below-description" />

              {/* TikTok Video */}
              {property.tiktok_video_url && (
                <section>
                  <h2 className="text-xl font-semibold mb-4">Property Video</h2>
                  <div className="max-w-md">
                    <TikTokPlayer url={property.tiktok_video_url} />
                  </div>
                </section>
              )}

              {/* Map */}
              {property.lat && property.lng && (
                <section>
                  <h2 className="text-xl font-semibold mb-4">Location</h2>
                  <Map
                    lat={parseFloat(property.lat)}
                    lng={parseFloat(property.lng)}
                    title={property.title}
                  />
                </section>
              )}

              {/* Related Properties */}
              {relatedProperties && relatedProperties.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold mb-4">Similar Properties</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {relatedProperties.map((related: any) => (
                      <a
                        key={related.id}
                        href={`/property/${related.id}`}
                        className="group block"
                      >
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                          {related.images?.[0] && (
                            <Image
                              src={related.images[0]}
                              alt={related.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 50vw, 25vw"
                            />
                          )}
                        </div>
                        <h3 className="font-medium mt-2 text-sm line-clamp-1 group-hover:text-primary transition">
                          {related.title}
                        </h3>
                        <p className="text-primary font-semibold text-sm">
                          {formatPrice(related.price)}
                        </p>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </article>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Contact card */}
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24 border">
              <h3 className="font-semibold text-lg mb-4">Contact Owner</h3>
              
              {property.owner && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Owner</p>
                    <p className="font-medium">{property.owner.name || 'Property Owner'}</p>
                  </div>
                  {property.owner.email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a href={`mailto:${property.owner.email}`} className="text-sm text-primary hover:underline">
                        {property.owner.email}
                      </a>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Listed</p>
                    <p className="text-sm">{formatDate(property.created_at)}</p>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <WhatsAppButton phoneNumber={property.owner_whatsapp} className="w-full" />
                <Button variant="outline" className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Save to Favorites
                </Button>
              </div>
            </div>

            {/* Sidebar Ad */}
            <AdBanner position="sidebar" />
          </aside>
        </div>
      </div>
    </>
  )
}
