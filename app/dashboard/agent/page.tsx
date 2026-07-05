// app/dashboard/agent/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Building, Users, Home, TrendingUp, Award, Star } from "lucide-react"

export default function AgentDashboard() {
  const { user, profile } = useAuth()
  const [agentData, setAgentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    totalFavorites: 0,
    rating: 0,
  })

  useEffect(() => {
    fetchAgentData()
  }, [user])

  const fetchAgentData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch agent profile
      const { data: agent } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", user.id)
        .single()

      setAgentData(agent)

      if (agent) {
        // Fetch stats
        const { data: listings } = await supabase
          .from("properties")
          .select("id, views")
          .eq("owner_id", user.id)

        if (listings) {
          setStats({
            totalListings: listings.length,
            totalViews: listings.reduce((sum, l) => sum + (l.views || 0), 0),
            totalFavorites: 0, // This would need a join query
            rating: agent.rating || 0,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching agent data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateAgentProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const data = {
      company_name: formData.get("company_name"),
      license_number: formData.get("license_number"),
      experience_years: parseInt(formData.get("experience_years") as string) || 0,
      specialization: (formData.get("specialization") as string)?.split(",").map(s => s.trim()) || [],
    }

    try {
      const { error } = await supabase
        .from("agents")
        .update(data)
        .eq("user_id", user?.id)

      if (error) throw error

      toast({
        title: "Profile Updated",
        description: "Your agent profile has been updated successfully",
      })
      fetchAgentData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (!profile || profile.role !== "agent") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Not an Agent</h3>
            <p className="text-gray-500 mb-4">You need to be verified as an agent to access this page</p>
            <Button asChild>
              <a href="/dashboard/agent/register">Apply as Agent</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-gray-500">Manage your real estate business</p>
        </div>
        {agentData?.is_verified && (
          <Badge variant="success" className="text-lg py-1 px-4">
            <Award className="h-4 w-4 mr-2" />
            Verified Agent
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Listings</p>
              <p className="text-2xl font-bold">{stats.totalListings}</p>
            </div>
            <Home className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <p className="text-2xl font-bold">{stats.totalViews}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Favorites</p>
              <p className="text-2xl font-bold">{stats.totalFavorites}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <p className="text-2xl font-bold">{stats.rating.toFixed(1)} ★</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateAgentProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  defaultValue={agentData?.company_name || ""}
                  placeholder="e.g., ABC Real Estate"
                />
              </div>
              <div>
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  name="license_number"
                  defaultValue={agentData?.license_number || ""}
                  placeholder="e.g., REA-12345"
                />
              </div>
              <div>
                <Label htmlFor="experience_years">Experience (Years)</Label>
                <Input
                  id="experience_years"
                  name="experience_years"
                  type="number"
                  defaultValue={agentData?.experience_years || 0}
                />
              </div>
              <div>
                <Label htmlFor="specialization">Specializations</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  defaultValue={agentData?.specialization?.join(", ") || ""}
                  placeholder="e.g., Residential, Commercial, Luxury"
                />
                <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
              </div>
            </div>
            <Button type="submit">Update Profile</Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
          <a href="/add-property">
            <Home className="h-6 w-6" />
            Add Listing
          </a>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
          <a href="/properties">
            <TrendingUp className="h-6 w-6" />
            View Analytics
          </a>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
          <a href="/premium">
            <Star className="h-6 w-6 text-premium" />
            Upgrade to Premium
          </a>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
          <a href={`/agent/${user?.id}`}>
            <Users className="h-6 w-6" />
            View Public Profile
          </a>
        </Button>
      </div>
    </div>
  )
}
