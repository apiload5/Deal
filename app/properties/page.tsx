'use client'

import { useState, useEffect } from 'react'
import { PropertyGrid } from '@/components/property/PropertyGrid'
import { PropertyFilter } from '@/components/property/PropertyFilter'

interface FilterOptions {
  priceRange: [number, number]
  beds: number | null
  baths: number | null
  propertyType: string
  city: string
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch properties from API
    const mockProperties = [
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
        title: 'Cozy 2 Bedroom Flat',
        price: 3000000,
        location: 'Gulberg, Lahore',
        beds: 2,
        baths: 1,
        area: 1200,
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop',
      },
      {
        id: '4',
        title: 'Studio Apartment',
        price: 1500000,
        location: 'Defense, Karachi',
        beds: 1,
        baths: 1,
        area: 600,
        image: 'https://images.unsplash.com/photo-1495882894008-e5488da97aee?w=500&h=400&fit=crop',
      },
      {
        id: '5',
        title: 'Commercial Space',
        price: 2000000,
        location: 'Main Boulevard, Lahore',
        beds: 0,
        baths: 1,
        area: 1500,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=400&fit=crop',
      },
      {
        id: '6',
        title: 'Plot in Bahria Town',
        price: 8000000,
        location: 'Bahria Town, Rawalpindi',
        beds: 0,
        baths: 0,
        area: 3000,
        image: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2c0e4?w=500&h=400&fit=crop',
      },
    ]
    setProperties(mockProperties)
    setFilteredProperties(mockProperties)
    setIsLoading(false)
  }, [])

  const handleFilterChange = (filters: FilterOptions) => {
    let filtered = properties.filter((prop) => {
      const priceMatch =
        prop.price >= filters.priceRange[0] && prop.price <= filters.priceRange[1]
      const bedsMatch = !filters.beds || prop.beds >= filters.beds
      const bathsMatch = !filters.baths || prop.baths >= filters.baths
      const cityMatch = filters.city === 'all' || prop.location.includes(filters.city)

      return priceMatch && bedsMatch && bathsMatch && cityMatch
    })
    setFilteredProperties(filtered)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Properties</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredProperties.length} properties
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filter */}
          <div className="lg:col-span-1">
            <PropertyFilter onFilterChange={handleFilterChange} />
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            <PropertyGrid
              properties={filteredProperties}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
