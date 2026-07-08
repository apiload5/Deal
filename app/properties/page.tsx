'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/common/Button'
import { PropertyGrid } from '@/components/property/PropertyGrid'
import { Search, SlidersHorizontal } from 'lucide-react'

type Property = {
  id: string
  title: string
  price: number
  location: string
  beds: number
  baths: number
  area: number
  image: string
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // TODO: Fetch from API
    const mockProperties: Property[] = [
      {
        id: '1',
        title: 'Modern 3 Bedroom Apartment',
        price: 5000000,
        location: 'DHA, Karachi',
        beds: 3,
        baths: 2,
        area: 2500,
        image: 'https://images.unsplash.com/photo-1580587771525-78991c7bde8d?w=500&h=400&fit=crop',
      },
      {
        id: '2',
        title: 'Luxury Villa with Pool',
        price: 15000000,
        location: 'F-7, Islamabad',
        beds: 5,
        baths: 4,
        area: 5000,
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=400&fit=crop',
      },
      {
        id: '3',
        title: 'Commercial Space',
        price: 2000000,
        location: 'Main Boulevard, Lahore',
        beds: 0,
        baths: 1,
        area: 1500,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=400&fit=crop',
      },
      {
        id: '4',
        title: '2 Bedroom Flat',
        price: 3500000,
        location: 'Gulberg, Lahore',
        beds: 2,
        baths: 2,
        area: 1800,
        image: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d2?w=500&h=400&fit=crop',
      },
    ]

    setProperties(mockProperties)
    setFilteredProperties(mockProperties)
    setIsLoading(false)
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    
    const filtered = properties.filter(
      (prop) =>
        prop.title.toLowerCase().includes(term) ||
        prop.location.toLowerCase().includes(term)
    )
    setFilteredProperties(filtered)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-4">All Properties</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Find your perfect property from {properties.length}+ listings
          </p>
          
          {/* Search & Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by location or property name..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button variant="outline">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyGrid properties={filteredProperties} isLoading={isLoading} />
        
        {!isLoading && filteredProperties.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No properties found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
