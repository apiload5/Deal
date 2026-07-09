'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X } from 'lucide-react'

export function SearchBar() {
  const router = useRouter()
  const [city, setCity] = useState('')
  const [purpose, setPurpose] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (purpose) params.set('purpose', purpose)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    router.push(`/properties?${params.toString()}`)
  }

  const clearFilters = () => {
    setCity('')
    setPurpose('')
    setMinPrice('')
    setMaxPrice('')
  }

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger>
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="karachi">Karachi</SelectItem>
            <SelectItem value="lahore">Lahore</SelectItem>
            <SelectItem value="islamabad">Islamabad</SelectItem>
          </SelectContent>
        </Select>

        <Select value={purpose} onValueChange={setPurpose}>
          <SelectTrigger>
            <SelectValue placeholder="Purpose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sale">For Sale</SelectItem>
            <SelectItem value="rent">For Rent</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2"
          />
          <Input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          {(city || purpose || minPrice || maxPrice) && (
            <Button type="button" variant="outline" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
