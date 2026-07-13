'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PropertyCard } from '@/features/search/components/PropertyCard'
import { SearchFilters } from '@/features/search/components/SearchFilters'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Grid, List } from 'lucide-react'

// Mock data - will be replaced with real API calls
const mockProperties = [
  {
    id: '1',
    title: 'Luxury Villa with Ocean View',
    price: 45000000,
    city: 'Karachi',
    area: 'Clifton',
    propertyType: 'HOUSE',
    beds: 5,
    baths: 6,
    areaSqft: 5000,
    images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
    isPremium: true,
    isFeatured: true,
  },
  // ... more properties
]

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState(mockProperties)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    // Fetch properties with filters from URL
    const fetchProperties = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProperties(mockProperties)
      setIsLoading(false)
    }
    fetchProperties()
  }, [searchParams])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Properties</h1>
        <p className="text-muted-foreground">
          {properties.length} properties found
        </p>
      </div>

      <SearchFilters />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="mt-8 flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div
          className={`mt-8 grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}
        >
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {!isLoading && properties.length === 0 && (
        <div className="mt-8 flex flex-col items-center justify-center py-12 text-center">
          <p className="text-xl font-semibold">No properties found</p>
          <p className="text-muted-foreground">Try adjusting your search filters</p>
        </div>
      )}
    </div>
  )
}
