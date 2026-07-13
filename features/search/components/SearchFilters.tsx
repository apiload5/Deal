'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

const CITIES = ['All Cities', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Hyderabad', 'Peshawar', 'Quetta']
const PROPERTY_TYPES = ['All Types', 'HOUSE', 'APARTMENT', 'PLOT', 'COMMERCIAL', 'PORTION', 'FARM_HOUSE']
const PURPOSES = ['All Purposes', 'Sale', 'Rent']

export function SearchFilters() {
  const router = useRouter()
  const [filters, setFilters] = useState({
    query: '',
    city: 'All Cities',
    propertyType: 'All Types',
    purpose: 'All Purposes',
    minPrice: '',
    maxPrice: '',
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (filters.query) params.set('q', filters.query)
    if (filters.city !== 'All Cities') params.set('city', filters.city)
    if (filters.propertyType !== 'All Types') params.set('type', filters.propertyType)
    if (filters.purpose !== 'All Purposes') params.set('purpose', filters.purpose.toLowerCase())
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="glass-card w-full p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="relative">
          <Input
            placeholder="Search properties..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <Select
          value={filters.city}
          onValueChange={(value) => setFilters({ ...filters, city: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            {CITIES.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.propertyType}
          onValueChange={(value) => setFilters({ ...filters, propertyType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.purpose}
          onValueChange={(value) => setFilters({ ...filters, purpose: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Purpose" />
          </SelectTrigger>
          <SelectContent>
            {PURPOSES.map((purpose) => (
              <SelectItem key={purpose} value={purpose}>
                {purpose}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" className="w-full">
          Search Properties
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-2 lg:max-w-sm">
        <Input
          type="number"
          placeholder="Min Price (Rs)"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Max Price (Rs)"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
        />
      </div>
    </form>
  )
}
