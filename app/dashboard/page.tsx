// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { PropertyCard } from '@/components/PropertyCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Home, Heart, LogOut } from 'lucide-react'
import { Property, Favorite } from '@/types'
import { toast } from '@/components/ui/toast'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [favorites, setFavorites] = useState<Property[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
    if (user) {
      fetchData()
    }
  }, [user, loading])

  const fetchData = async () => {
    setLoadingData(true)
    try {
      // Fetch user's properties
      const { data: propertiesData } = await supabase
        .from('properties')
        .select(`
          *,
          city:cities(*)
        `)
        .eq('owner_id', user!.id)
        .order('created_at', { ascending: false })

      if (propertiesData) {
        setProperties(propertiesData)
      }

      // Fetch user's favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select(`
          property:properties(
            *,
            city:cities(*)
          )
        `)
        .eq('user_id', user!.id)

      if (favoritesData) {
        const favProperties = favoritesData
          .map(f => f.property)
          .filter(p => p !== null) as Property[]
        setFavorites(favProperties)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
      toast({
        title: 'Error',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (loading || loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[300px] bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/add-property">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Property
            </Link>
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* My Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              My Properties ({properties.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {properties.length > 0 ? (
              <div className="space-y-4">
                {properties.slice(0, 5).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
                {properties.length > 5 && (
                  <Button variant="link" className="w-full">
                    View All ({properties.length})
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't listed any properties yet</p>
                <Button asChild>
                  <Link href="/add-property">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    List Your First Property
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favorites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Favorites ({favorites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favorites.length > 0 ? (
              <div className="space-y-4">
                {favorites.slice(0, 5).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
                {favorites.length > 5 && (
                  <Button variant="link" className="w-full">
                    View All ({favorites.length})
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No favorites yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Start exploring properties and save your favorites
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
