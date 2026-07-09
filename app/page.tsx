import Link from 'next/link'
import { PropertyCard } from '@/components/shared/PropertyCard'
import { SearchBar } from '@/components/shared/SearchBar'

// This is a simplified version for initial deployment
// Full version with Supabase can be added later

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
]

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-sky-500 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Dream Property
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Pakistan's most trusted real estate platform
            </p>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Featured Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
