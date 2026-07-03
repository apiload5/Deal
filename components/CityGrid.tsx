// components/CityGrid.tsx
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { City } from '@/types'

interface CityGridProps {
  cities: City[]
}

export function CityGrid({ cities }: CityGridProps) {
  if (!cities || cities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No cities available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cities.map((city) => (
        <Link key={city.id} href={`/properties?city=${city.id}`}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-lg">{city.name}</h3>
              <p className="text-sm text-gray-500">
                {city.total_properties || 0} properties
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
