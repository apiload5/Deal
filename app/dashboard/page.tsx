// app/dashboard/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyCard } from "@/components/shared/PropertyCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Heart, Plus, User, Users, Building, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, profile, isAgent, isAdmin } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch user's listings
      const { data: listingsData } = await supabase
        .from("properties")
        .select("*, cities(name)")
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false })

      setListings(listingsData || [])

      // Fetch user's favorites
      const { data: favoritesData } = await supabase
        .from("favorites")
        .select("property:properties(*, cities(name))")
        .eq("user_id", user?.id)

      setFavorites(favoritesData?.map((f: any) => f.property) || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {profile?.name || "User"}</p>
        </div>
        <div className="flex gap-3">
          {isAgent && (
            <Link href="/dashboard/agent">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Agent Panel
              </Button>
            </Link>
          )}
          {isAdmin && (
            <Link href="/dashboard/admin">
              <Button variant="outline">
                <Building className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            </Link>
          )}
          <Link href="/add-property">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Listings</p>
              <p className="text-2xl font-bold">{listings.length}</p>
            </div>
            <Home className="h-8 w-8 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Favorites</p>
              <p className="text-2xl font-bold">{favorites.length}</p>
            </div>
            <Heart className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Views</p>
              <p className="text-2xl font-bold">
                {listings.reduce((sum, l) => sum + (l.views || 0), 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <Badge className="capitalize">{profile?.role || "user"}</Badge>
            </div>
            <User className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="listings">
            <Home className="h-4 w-4 mr-2" />
            My Listings
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="h-4 w-4 mr-2" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Listings Yet</h3>
                <p className="text-gray-500 mb-4">Start by adding your first property</p>
                <Link href="/add-property">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Favorites</h3>
                <p className="text-gray-500">Save properties you like to see them here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-gray-600">{profile?.name || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-gray-600">{profile?.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-gray-600">{profile?.email || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Badge className="capitalize">{profile?.role || "User"}</Badge>
                </div>
              </div>

              {!isAgent && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Become an Agent</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Get verified as an agent and access exclusive features
                  </p>
                  <Link href="/dashboard/agent/register">
                    <Button variant="outline" size="sm">
                      Apply as Agent
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
