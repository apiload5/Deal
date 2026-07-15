import * as React from 'react'
import { SearchFilters } from '@/features/search/components/SearchFilters'
import { PropertyCard } from '@/features/search/components/PropertyCard'
import { prisma } from '@/lib/prisma'

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: {
    city?: string
    type?: string
    purpose?: string
    minPrice?: string
    maxPrice?: string
    beds?: string
  }
}) {
  const where: any = {
    status: 'approved',
  }

  if (searchParams.city) {
    where.city = searchParams.city
  }

  if (searchParams.type) {
    where.propertyType = searchParams.type
  }

  if (searchParams.purpose) {
    where.purpose = searchParams.purpose
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {}
    if (searchParams.minPrice) {
      where.price.gte = parseInt(searchParams.minPrice)
    }
    if (searchParams.maxPrice) {
      where.price.lte = parseInt(searchParams.maxPrice)
    }
  }

  if (searchParams.beds) {
    where.beds = parseInt(searchParams.beds)
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
      <h1 className="text-3xl font-bold mb-8">Properties</h1>
      <SearchFilters />
      <div className="mt-8">
        <p className="text-sm text-muted-foreground mb-4">
          Found {properties.length} properties
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        {properties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">No properties found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
