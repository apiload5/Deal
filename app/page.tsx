// app/page.tsx - COMPLETE VERSION
import { supabase } from '@/lib/supabase/client'
import { PropertyCard } from '@/components/shared/PropertyCard'
import { SearchBar } from '@/components/shared/SearchBar'
import Link from 'next/link'

export default async function HomePage() {
  // ✅ REAL DATABASE SE FETCH
  const { data: properties } = await supabase
    .from('properties')
    .select('*, cities(name)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: premiumProperties } = await supabase
    .from('properties')
    .select('*, cities(name)')
    .eq('is_premium', true)
    .eq('status', 'active')
    .gt('premium_until', new Date().toISOString())
    .limit(6)

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

      {/* Premium Properties */}
      {premiumProperties && premiumProperties.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-yellow-50 to-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-yellow-500">✦</span> Premium Listings
              </h2>
              <Link href="/properties?premium=true" className="text-blue-600 hover:underline">
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
            <Link href="/properties" className="text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          {properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500">No properties listed yet.</p>
              <Link href="/add-property" className="text-blue-600 hover:underline">
                Be the first to list a property!
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
