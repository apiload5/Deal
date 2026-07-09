import { PropertyCard } from '@/components/shared/PropertyCard'

// Sample data for initial deployment
const sampleProperties = [
  {
    id: '1',
    title: 'Luxury Villa in DHA',
    price: 25000000,
    beds: 4,
    baths: 3,
    images: ['/placeholder-property.jpg'],
    cities: { name: 'Karachi' },
    is_featured: true,
    is_premium: false,
  },
  {
    id: '2',
    title: '3 Bed Flat in Clifton',
    price: 15000000,
    beds: 3,
    baths: 2,
    images: ['/placeholder-property.jpg'],
    cities: { name: 'Karachi' },
    is_featured: false,
    is_premium: true,
  },
  {
    id: '3',
    title: 'Commercial Plot in DHA',
    price: 35000000,
    beds: 0,
    baths: 0,
    images: ['/placeholder-property.jpg'],
    cities: { name: 'Karachi' },
    is_featured: false,
    is_premium: false,
  },
]

export default function PropertiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}
