// features/search/components/AdvancedSearch.tsx
'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Search, MapPin, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AdvancedSearch() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [purpose, setPurpose] = useState('')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(50000000)
  const [beds, setBeds] = useState('')
  const [baths, setBaths] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Location auto-complete
  useEffect(() => {
    if (location.length > 2) {
      fetchSuggestions(location)
    } else {
      setSuggestions([])
    }
  }, [location])

  const fetchSuggestions = async (query: string) => {
    // Fetch from Supabase
    const { data } = await supabase
      .from('cities')
      .select('name')
      .ilike('name', `%${query}%`)
      .limit(5)
    
    if (data) {
      setSuggestions(data.map(c => c.name))
      setShowSuggestions(true)
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.set('city', location)
    if (propertyType) params.set('type', propertyType)
    if (purpose) params.set('purpose', purpose)
    if (minPrice > 0) params.set('minPrice', minPrice.toString())
    if (maxPrice < 50000000) params.set('maxPrice', maxPrice.toString())
    if (beds) params.set('beds', beds)
    if (baths) params.set('baths', baths)
    
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Location with Auto-complete */}
        <div className="relative">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="City, Area, or Project"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10"
            />
            {location && (
              <button
                onClick={() => setLocation('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition"
                  onClick={() => {
                    setLocation(suggestion)
                    setShowSuggestions(false)
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Property Type */}
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger>
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="flat">Flat/Apartment</SelectItem>
            <SelectItem value="plot">Plot</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>

        {/* Purpose */}
        <Select value={purpose} onValueChange={setPurpose}>
          <SelectTrigger>
            <SelectValue placeholder="Purpose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sale">For Sale</SelectItem>
            <SelectItem value="rent">For Rent</SelectItem>
          </SelectContent>
        </Select>

        {/* Search Button */}
        <Button 
          onClick={handleSearch}
          className="bg-green-600 hover:bg-green-700 text-white h-11 w-full"
        >
          <Search className="h-5 w-5 mr-2" />
          Search
        </Button>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Price Range (Rs)
          </label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-1/2"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-1/2"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Beds
          </label>
          <Select value={beds} onValueChange={setBeds}>
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

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Baths
          </label>
          <Select value={baths} onValueChange={setBaths}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
