import { Suspense } from 'react'
import Link from 'next/link'
import { SearchBar } from '@/components/SearchBar'
import { PropertyCard } from '@/components/PropertyCard'
import { CityGrid } from '@/components/CityGrid'
import { createServerClient } from '@/lib/supabase/server'
import { Skeleton } from '@/components/ui/skeleton'
// YEH ADD KARO - Button import
import { Button } from '@/components/ui/button'

export const revalidate = 3600 // ISR

export default async function HomePage() {
  const supabase = createServerClient()
  
  // Fetch featured properties
  const { data: featuredProperties } = await supabase
    .from('properties')
    .select(`
      *,
      city:cities(*)
    `)
    .eq('is_featured', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch cities
  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .order('total_properties', { ascending: false })
    .limit(8)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Dream Property in Pakistan
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Discover thousands of properties for sale and rent across Pakistan
            </p>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Properties</h2>
          <Suspense fallback={<PropertiesSkeleton />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties?.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </Suspense>
          <div className="text-center mt-8">
            <Link href="/properties">
              <Button variant="outline" size="lg">
                View All Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Popular Cities</h2>
          <CityGrid cities={cities || []} />
        </div>
      </section>
    </div>
  )
}

function PropertiesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[300px] rounded-xl" />
      ))}
    </div>
  )
}
