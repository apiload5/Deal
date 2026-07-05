// app/property/[id]/page.tsx
import { notFound } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"
import { Map } from "@/components/shared/Map"
import { TikTokPlayer } from "@/components/shared/TikTokPlayer"
import { WhatsAppButton } from "@/components/shared/WhatsAppButton"
import { AdBanner } from "@/components/shared/AdBanner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bed, Bath, MapPin, Calendar, Eye, Star, Heart } from "lucide-react"
import { formatPrice, formatDate } from "@/lib/utils/helpers"

export const revalidate = 3600

interface PropertyPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PropertyPageProps) {
  const { data: property } = await supabase
    .from("properties")
    .select("title, description, images")
    .eq("id", params.id)
    .single()

  if (!property) {
    return {
      title: "Property Not Found",
    }
  }

  return {
    title: property.title,
    description: property.description?.slice(0, 160) || "Property for sale/rent in Pakistan",
    openGraph: {
      images: property.images?.[0] || "/placeholder-property.jpg",
    },
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { data: property, error } = await supabase
    .from("properties")
    .select(`
      *,
      cities(name),
      owner:users(id, name, phone, email)
    `)
    .eq("id", params.id)
    .single()

  if (error || !property) {
    notFound()
  }

  // Increment view count
  await supabase.rpc("increment_property_views", { property_id: params.id })

  return (
    <div className="container mx-auto px-4 py-8">
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
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">No image available</span>
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
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Property details */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {property.is_premium && (
                    <Badge variant="premium">
                      <Star className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  {property.is_featured && !property.is_premium && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                  <Badge variant="outline">{property.purpose === "sale" ? "For Sale" : "For Rent"}</Badge>
                  <Badge variant="outline">{property.property_type}</Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">{property.title}</h1>
                <div className="flex items-center gap-2 text-gray-500 mt-2">
                  <MapPin className="h-4 w-4" />
                  <span>{property.address || property.cities?.name}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  {formatPrice(property.price)}
                </p>
                {property.purpose === "rent" && (
                  <span className="text-sm text-gray-500">per month</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 py-4 border-y">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-gray-500" />
                <span>{property.beds} Beds</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-gray-500" />
                <span>{property.baths} Baths</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span>{property.area_sqft || "N/A"} sqft</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span>Posted {formatDate(property.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-gray-500" />
                <span>{property.views || 0} views</span>
              </div>
            </div>

            {property.description && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Ad below description */}
            <AdBanner position="below-description" />

            {/* TikTok Video */}
            {property.tiktok_video_url && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Property Video</h2>
                <TikTokPlayer url={property.tiktok_video_url} />
              </div>
            )}

            {/* Map */}
            {property.lat && property.lng && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <Map
                  lat={parseFloat(property.lat)}
                  lng={parseFloat(property.lng)}
                  title={property.title}
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact card */}
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h3 className="font-semibold text-lg mb-4">Contact Owner</h3>
            
            {property.owner && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="font-medium">{property.owner.name || "Property Owner"}</p>
                </div>
                {property.owner.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm">{property.owner.email}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 space-y-2">
              <WhatsAppButton phoneNumber={property.owner_whatsapp} className="w-full" />
              <Button variant="outline" className="w-full">
                <Heart className="h-4 w-4 mr-2" />
                Save to Favorites
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-400 text-center">
                Property ID: {property.id.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Sidebar Ad */}
          <AdBanner position="sidebar" />
        </div>
      </div>
    </div>
  )
}
