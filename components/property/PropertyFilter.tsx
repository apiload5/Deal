'use client'

import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { ChevronDown } from 'lucide-react'

interface FilterOptions {
  priceRange: [number, number]
  beds: number | null
  baths: number | null
  propertyType: string
  city: string
}

interface PropertyFilterProps {
  onFilterChange: (filters: FilterOptions) => void
}

export function PropertyFilter({ onFilterChange }: PropertyFilterProps) {
  const [showFilters, setShowFilters] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 50000000],
    beds: null,
    baths: null,
    propertyType: 'all',
    city: 'all',
  })

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const cities = ['all', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Multan', 'Peshawar']
  const propertyTypes = ['all', 'Residential', 'Commercial', 'Land', 'Apartment']

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6 cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
        <h3 className="text-lg font-bold">Filters</h3>
        <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
      </div>

      {showFilters && (
        <div className="space-y-6">
          {/* City Filter */}
          <div>
            <label className="block text-sm font-semibold mb-3">City</label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city === 'all' ? 'All Cities' : city}
                </option>
              ))}
            </select>
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="block text-sm font-semibold mb-3">Property Type</label>
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500"
            >
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold mb-3">Price Range</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) =>
                    handleFilterChange('priceRange', [
                      parseInt(e.target.value),
                      filters.priceRange[1],
                    ])
                  }
                  placeholder="Min"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800"
                />
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    handleFilterChange('priceRange', [
                      filters.priceRange[0],
                      parseInt(e.target.value),
                    ])
                  }
                  placeholder="Max"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-semibold mb-3">Bedrooms</label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => handleFilterChange('beds', filters.beds === num ? null : num)}
                  className={`py-2 rounded-lg font-semibold transition ${
                    filters.beds === num
                      ? 'bg-gradient-primary text-white'
                      : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {num}+
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-semibold mb-3">Bathrooms</label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => handleFilterChange('baths', filters.baths === num ? null : num)}
                  className={`py-2 rounded-lg font-semibold transition ${
                    filters.baths === num
                      ? 'bg-gradient-primary text-white'
                      : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {num}+
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={() => {
            setFilters({
              priceRange: [0, 50000000],
              beds: null,
              baths: null,
              propertyType: 'all',
              city: 'all',
            })
          }}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  )
}
