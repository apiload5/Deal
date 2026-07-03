// app/property/[id]/page.tsx
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { TikTokPlayer } from '@/components/TikTokPlayer'
import { Map } from '@/components/Map'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { createServerClient } from '@/lib/supabase/server'
import { ChevronLeft, ChevronRight, Bed, Bath, Square, MapPin, Calendar } from 'lucide-react'
// YEH DEKHO - Button import hai?
import { Button } from '@/components/ui/button'  // ← YEH HONA CHAHIYE

export const revalidate = 3600

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = createServerClient()
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!property) {
    return {
      title: 'Property Not Found',
    }
  }

  return {
    title: `${property.title} - deal.online`,
    description: property.description || `Property for ${property.purpose} in Pakistan`,
    openGraph: {
      images: property.images?.[0] || '',
    },
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const supabase = createServerClient()
  
  const { data: property } = await supabase
    .from('properties')
    .select(`
      *,
      city:cities(*),
      owner:users(*)
    `)
    .eq('id', params.id)
    .single()

  if (!property) {
    notFound()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">{property.title}</h1>
      <div className="flex items-center gap-2 text-gray-600 mb-6">
        <MapPin className="w-4 h-4" />
        <span>{property.city?.name}, {property.address}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {property.images?.slice(1, 5).map((image, index) => (
            <div key={index} className="relative h-[230px] rounded-xl overflow-hidden">
              <Image
                src={image}
                alt={`${property.title} - ${index + 2}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(property.price)}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {property.purpose === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
            </div>
            <div className="flex flex-wrap gap-6 text-gray-600">
              {property.beds > 0 && (
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5" />
                  <span>{property.beds} Beds</span>
                </div>
              )}
              {property.baths > 0 && (
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5" />
                  <span>{property.baths} Baths</span>
                </div>
              )}
              {property.area_sqft && (
                <div className="flex items-center gap-2">
                  <Square className="w-5 h-5" />
                  <span>{property.area_sqft} sqft</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Posted {new Date(property.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
          </div>

          {property.lat && property.lng && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <Map lat={property.lat} lng={property.lng} title={property.title} />
            </div>
          )}

          {property.tiktok_video_url && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Video Tour</h2>
              <TikTokPlayer tiktok_video_url={property.tiktok_video_url} />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
            <h3 className="font-semibold mb-4">Contact Owner</h3>
            <Button className="w-full mb-3" asChild>
              <a href={`tel:${property.owner_whatsapp}`}>
                Call Now
              </a>
            </Button>
            <Button className="w-full bg-[#25D366] hover:bg-[#128C7E]" asChild>
              <a
                href={`https://wa.me/${property.owner_whatsapp}?text=Hi, I am interested in ${property.title} on deal.online`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>

      <WhatsAppButton
        phoneNumber={property.owner_whatsapp}
        propertyTitle={property.title}
      />
    </div>
  )
}
