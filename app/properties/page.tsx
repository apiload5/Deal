// app/properties/page.tsx
import { Suspense } from 'react'
import { PropertyCard } from '@/components/PropertyCard'
import { PropertyFilters } from '@/components/PropertyFilters'
import { createServerClient } from '@/lib/supabase/server'
import { Skeleton } from '@/components/ui/skeleton'
// YEH DEKHO - Button import hai?
import { Button } from '@/components/ui/button'  // ← YEH HONA CHAHIYE

export const revalidate = 3600

interface PageProps {
  searchParams: {
    city?: string
    purpose?: string
    minPrice?: string
    maxPrice?: string
    beds?: string
    property_type?: string
  }
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const supabase = createServerClient()
  
  let query = supabase
    .from('properties')
    .select(`
      *,
      city:cities(*)
    `)
    .eq('status', 'active')

  if (searchParams.city) {
    query = query.eq('city_id', searchParams.city)
  }
  if (searchParams.purpose) {
    query = query.eq('purpose', searchParams.purpose)
  }
  if (searchParams.minPrice) {
    query = query.gte('price', parseInt(searchParams.minPrice))
  }
  if (searchParams.maxPrice) {
    query = query.lte('price', parseInt(searchParams.maxPrice))
  }
  if (searchParams.beds) {
    query = query.gte('beds', parseInt(searchParams.beds))
  }
  if (searchParams.property_type) {
    query = query.eq('property_type', searchParams.property_type)
  }

  const { data: properties } = await query
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <PropertyFilters />
        </div>

        <div className="lg:w-3/4">
          <h1 className="text-3xl font-bold mb-6">
            {properties?.length || 0} Properties Found
          </h1>
          
          <Suspense fallback={<PropertiesGridSkeleton />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties?.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </Suspense>

          {properties?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No properties found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PropertiesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[300px] rounded-xl" />
      ))}
    </div>
  )
}
