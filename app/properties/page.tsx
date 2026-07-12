// app/properties/page.tsx - COMPLETE WITH FILTERS
import { supabase } from '@/lib/supabase/client'
import { PropertyCard } from '@/components/shared/PropertyCard'
import { AdBanner } from '@/components/shared/AdBanner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

export const revalidate = 3600

interface PropertiesPageProps {
  searchParams: {
    city?: string
    purpose?: string
    minPrice?: string
    maxPrice?: string
    beds?: string
    premium?: string
    page?: string
  }
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const page = parseInt(searchParams.page || '1')
  const limit = 12
  const offset = (page - 1) * limit

  // Build query
  let query = supabase
    .from('properties')
    .select('*, cities(name)', { count: 'exact' })
    .eq('status', 'active')

  // Apply filters
  if (searchParams.city) {
    const { data: cityData } = await supabase
      .from('cities')
      .select('id')
      .eq('slug', searchParams.city)
      .single()
    if (cityData) {
      query = query.eq('city_id', cityData.id)
    }
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

  if (searchParams.premium === 'true') {
    query = query.eq('is_premium', true).gt('premium_until', new Date().toISOString())
  }

  query = query
    .order('is_premium', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data: properties, count, error } = await query

  // Fetch cities for filter
  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .order('name')

  const totalPages = count ? Math.ceil(count / limit) : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-72 shrink-0">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Filters</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">City</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cities</SelectItem>
                    {cities?.map((city) => (
                      <SelectItem key={city.id} value={city.slug}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Purpose</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Price Range</label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="Min" />
                  <Input type="number" placeholder="Max" />
                </div>
              </div>

              <Button className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <AdBanner position="sidebar" />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Properties</h1>
            <span className="text-gray-500 text-sm">{count || 0} properties found</span>
          </div>

          {properties && properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property: any, index: number) => (
                  <div key={property.id}>
                    <PropertyCard property={property} />
                    {index === 5 && (
                      <div className="col-span-full my-6">
                        <AdBanner position="between-cards" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'default' : 'outline'}
                      size="sm"
                      asChild
                    >
                      <a href={`/properties?page=${pageNum}`}>{pageNum}</a>
                    </Button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No properties found</p>
              <p className="text-gray-400">Try adjusting your filters</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
