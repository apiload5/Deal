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
              <
