'use client'

import { PropertyCard } from './PropertyCard'

interface Property {
  id: string
  title: string
  price: number
  location: string
  beds: number
  baths: number
  area: number
  image: string
  isFavorite?: boolean
}

interface PropertyGridProps {
  properties: Property[]
  isLoading?: boolean
  onFavoriteToggle?: (id: string) => void
}

export function PropertyGrid({
  properties,
  isLoading = false,
  onFavoriteToggle,
}: PropertyGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-slate-800 rounded-xl h-96 animate-pulse" />
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">No properties found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          {...property}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  )
}
