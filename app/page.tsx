// app/page.tsx - COMPLETE VERSION WITH REAL DATABASE
import { supabase } from '@/lib/supabase/client'
import { PropertyCard } from '@/components/shared/PropertyCard'
import { SearchBar } from '@/components/shared/SearchBar'
import Link from 'next/link'

export default async function HomePage() {
  // Fetch featured properties
  const { data: featuredProperties } = await supabase
    .from('properties')
    .select('*, cities(name)')
    .eq('is_featured', true)
    .eq('status', 'active')
    .limit(6)

  // Fetch premium properties
  const { data: premiumProperties } = await supabase
    .from('properties')
    .select('*, cities(name)')
    .eq('is_premium', true)
    .eq('status', 'active')
    .gt('premium_until', new Date().toISOString())
    .limit(6)

  // Fetch cities
  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .order('total_properties', { ascending: false })
    .limit(8)

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-20">
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

      {/* Premium Properties */}
      {premiumProperties && premiumProperties.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-yellow-50 to-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-premium">✦</span> Premium Listings
              </h2>
              <Link href="/properties?premium=true" className="text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Properties */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Properties</h2>
            <Link href="/properties" className="text-primary hover:underline">
              View All
            </Link>
          </div>
          {featuredProperties && featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500">No featured properties yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Cities Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Popular Cities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cities?.map((city) => (
              <Link
                key={city.id}
                href={`/properties?city=${city.slug}`}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <h3 className="font-semibold text-lg">{city.name}</h3>
                <p className="text-gray-500 text-sm">{city.total_properties} properties</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
