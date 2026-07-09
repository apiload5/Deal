import { notFound } from 'next/navigation'
import { PropertyCard } from '@/components/shared/PropertyCard'
import { Map } from '@/components/shared/Map'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils/helpers'

// Sample property data
const sampleProperties = {
  '1': {
    id: '1',
    title: 'Luxury Villa in DHA',
    description: 'A beautiful luxury villa located in the heart of DHA Karachi. Features include marble flooring, modern kitchen, and a spacious garden.',
    price: 25000000,
    area_sqft: 5000,
    beds: 4,
    baths: 3,
    images: ['/placeholder-property.jpg'],
    address: 'DHA Phase 6, Karachi',
    lat: '24.8607',
    lng: '67.0011',
    owner_whatsapp: '3001234567',
    is_featured: true,
    is_premium: false,
    cities: { name: 'Karachi' },
    purpose: 'sale',
    property_type: 'house',
    created_at: new Date().toISOString(),
    views: 150,
    owner: {
      name: 'Ahmed Khan',
      phone: '03001234567',
      email: 'ahmed@example.com'
    }
  }
}

interface PropertyPageProps {
  params: {
    id: string
  }
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const property = sampleProperties[params.id as keyof typeof sampleProperties]
  
  if (!property) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Title & Price */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              {property.is_premium && (
                <Badge variant="premium">Premium</Badge>
              )}
              {property.is_featured && !property.is_premium && (
                <Badge variant="secondary">Featured</Badge>
              )}
              <Badge variant="outline">{property.purpose === 'sale' ? 'For Sale' : 'For Rent'}</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{property.title}</h1>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {formatPrice(property.price)}
            </p>
          </div>

          {/* Description */}
          {property.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{property.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Property Type</p>
              <p className="font-semibold capitalize">{property.property_type}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Area</p>
              <p className="font-semibold">{property.area_sqft} sqft</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Beds</p>
              <p className="font-semibold">{property.beds}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Baths</p>
              <p className="font-semibold">{property.baths}</p>
            </div>
          </div>

          {/* Map */}
          {property.lat && property.lng && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <Map
                lat={parseFloat(property.lat)}
                lng={parseFloat(property.lng)}
                title={property.title}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h3 className="font-semibold text-lg mb-4">Contact Owner</h3>
            
            {property.owner && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="font-medium">{property.owner.name}</p>
                </div>
                {property.owner.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm">{property.owner.email}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              <WhatsAppButton phoneNumber={property.owner_whatsapp} className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
