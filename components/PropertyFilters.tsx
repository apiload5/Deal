// components/PropertyFilters.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { City } from '@/types'
import { createClient } from '@/lib/supabase/client'

export function PropertyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [cities, setCities] = useState<City[]>([])
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    purpose: searchParams.get('purpose') || '',
    property_type: searchParams.get('property_type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    beds: searchParams.get('beds') || '',
  })

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('cities')
      .select('*')
      .order('name')
    if (data) {
      setCities(data)
    }
  }

  const handleFilter = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    router.push(`/properties?${params.toString()}`)
  }

  const handleClear = () => {
    setFilters({
      city: '',
      purpose: '',
      property_type: '',
      minPrice: '',
      maxPrice: '',
      beds: '',
    })
    router.push('/properties')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>City</Label>
          <Select
            value={filters.city}
            onValueChange={(value) => setFilters({ ...filters, city: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Purpose</Label>
          <Select
            value={filters.purpose}
            onValueChange={(value) => setFilters({ ...filters, purpose: value })}
          >
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
          <Label>Property Type</Label>
          <Select
            value={filters.property_type}
            onValueChange={(value) => setFilters({ ...filters, property_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="flat">Flat</SelectItem>
              <SelectItem value="plot">Plot</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Min Price</Label>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />
          </div>
          <div>
            <Label>Max Price</Label>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label>Beds</Label>
          <Select
            value={filters.beds}
            onValueChange={(value) => setFilters({ ...filters, beds: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleFilter} className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={handleClear} variant="outline">
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
