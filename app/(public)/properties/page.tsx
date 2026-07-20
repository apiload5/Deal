import * as React from 'react'
import { prisma } from '@/lib/prisma'
import { PropertyCard } from '@/features/search/components/PropertyCard'
import { SearchFilters } from '@/features/search/components/SearchFilters'

interface SearchParams {
  city?: string
  type?: string
  purpose?: string
  minPrice?: string
  maxPrice?: string
  beds?: string
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  
  const where: any = {
    status: 'approved',
  }

  if (params.city) {
    where.city = params.city
  }

  if (params.type) {
    where.propertyType = params.type
  }

  if (params.purpose) {
    where.purpose = params.purpose
  }

  if (params.minPrice || params.maxPrice) {
    where.price = {}
    if (params.minPrice) {
      where.price.gte = parseInt(params.minPrice)
    }
    if (params.maxPrice) {
      where.price.lte = parseInt(params.maxPrice)
    }
  }

  if (params.beds) {
    where.beds = parseInt(params.beds)
  }

  const properties = await prisma.property.findMany({
    where,
    include: {
      agent: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 gradient-text">Properties</h1>
      
      <div className="mb-8">
        <SearchFilters />
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Found {properties.length} properties
      </p>
      
      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">No properties found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
