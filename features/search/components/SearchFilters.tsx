'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'

const cities = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
]

const propertyTypes = [
  'HOUSE',
  'APARTMENT',
  'PLOT',
  'COMMERCIAL',
  'PORTION',
  'FARM_HOUSE',
]

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [city, setCity] = React.useState(searchParams.get('city') || '')
  const [type, setType] = React.useState(searchParams.get('type') || '')
  const [purpose, setPurpose] = React.useState(searchParams.get('purpose') || '')
  const [minPrice, setMinPrice] = React.useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = React.useState(searchParams.get('maxPrice') || '')
  const [beds, setBeds] = React.useState(searchParams.get('beds') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (type) params.set('type', type)
    if (purpose) params.set('purpose', purpose)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (beds) params.set('beds', beds)
    router.push(`/properties?${params.toString()}`)
  }

  const handleReset = () => {
    setCity('')
    setType('')
    setPurpose('')
    setMinPrice('')
    setMaxPrice('')
    setBeds('')
    router.push('/properties')
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>City</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Property Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {propertyTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Purpose</Label>
          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger>
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Beds</Label>
          <Select value={beds} onValueChange={setBeds}>
            <SelectTrigger>
              <SelectValue placeholder="Beds" />
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

        <div className="space-y-2">
          <Label>Min Price (PKR)</Label>
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Max Price (PKR)</Label>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="gap-2">
          <Search className="h-4 w-4" />
          Search
        </Button>
        <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
          <X className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </form>
  )
}
