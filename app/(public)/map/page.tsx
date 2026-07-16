'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapView } from '@/features/map/components/MapView'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export default function MapPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [properties, setProperties] = React.useState<any[]>([])

  React.useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties')
        const data = await response.json()
        setProperties(data)
      } catch (error) {
        console.error('Error fetching properties:', error)
      }
    }
    fetchProperties()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 gradient-text">Property Map</h1>
      
      <Card className="glass mb-6">
        <CardHeader>
          <CardTitle>Find Properties on Map</CardTitle>
          <CardDescription>
            Search and view properties in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by city or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button className="btn-premium">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass overflow-hidden">
        <CardContent className="p-0">
          <div className="h-[600px] w-full bg-muted flex items-center justify-center">
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ? (
              <MapView
                latitude={33.6844}
                longitude={73.0479}
                zoom={12}
              />
            ) : (
              <div className="text-center p-8">
                <p className="text-lg text-muted-foreground">Map is loading...</p>
                <p className="text-sm text-muted-foreground">Please wait for Google Maps to load</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
