// app/dashboard/admin/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { 
  Users, Home, Eye, TrendingUp, Settings, Shield, 
  Check, X, Edit, Trash2, DollarSign, Star
} from "lucide-react"

export default function AdminDashboard() {
  const { user, profile, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalViews: 0,
    totalRevenue: 0,
  })
  const [users, setUsers] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({})

  useEffect(() => {
    if (!isAdmin) {
      return
    }
    fetchData()
  }, [isAdmin])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch stats
      const [
        { count: userCount },
        { count: propertyCount },
        { data: viewsData },
        { data: revenueData },
      ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("properties").select("*", { count: "exact", head: true }),
        supabase.from("property_views").select("*"),
        supabase.from("properties").select("price").eq("is_premium", true),
      ])

      setStats({
        totalUsers: userCount || 0,
        totalProperties: propertyCount || 0,
        totalViews: viewsData?.length || 0,
        totalRevenue: revenueData?.reduce((sum, p) => sum + p.price * 0.05, 0) || 0,
      })

      // Fetch users
      const { data: usersData } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)
      setUsers(usersData || [])

      // Fetch properties
      const { data: propertiesData } = await supabase
        .from("properties")
        .select("*, cities(name), users(name)")
        .order("created_at", { ascending: false })
        .limit(50)
      setProperties(propertiesData || [])

      // Fetch agents
      const { data: agentsData } = await supabase
        .from("agents")
        .select("*, users(name, phone, email)")
        .order("created_at", { ascending: false })
      setAgents(agentsData || [])

      // Fetch settings
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("*")
      const settingsObj: any = {}
      settingsData?.forEach((s: any) => {
        settingsObj[s.key] = s.value
      })
      setSettings(settingsObj)

    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ role })
        .eq("id", userId)

      if (error) throw error

      toast({
        title: "User Updated",
        description: `User role changed to ${role}`,
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const deleteProperty = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return

    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyId)

      if (error) throw error

      toast({
        title: "Property Deleted",
        description: "Property has been removed",
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ value })
        .eq("key", key)

      if (error) throw error

      toast({
        title: "Setting Updated",
        description: `${key} has been updated`,
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const verifyAgent = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from("agents")
        .update({ is_verified: true })
        .eq("id", agentId)

      if (error) throw error

      toast({
        title: "Agent Verified",
        description: "Agent has been verified successfully",
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-gray-500">You don't have permission to access the admin panel</p>
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
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Properties</p>
              <p className="text-2xl font-bold">{stats.totalProperties}</p>
            </div>
            <Home className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
            </div>
            <Eye className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-bold">PKR {stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>View and manage all registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name || "N/A"}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.email || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className="capitalize">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) => updateUserRole(user.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="agent">Agent</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>Manage Properties</CardTitle>
              <CardDescription>View and manage all property listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="max-w-xs truncate">{property.title}</TableCell>
                        <TableCell>PKR {property.price.toLocaleString()}</TableCell>
                        <TableCell>{property.cities?.name}</TableCell>
                        <TableCell>
                          {property.is_premium && (
                            <Badge variant="premium" className="mr-1">
                              <Star className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                          {property.is_featured && !property.is_premium && (
                            <Badge variant="secondary">Featured</Badge>
                          )}
                          <Badge className="capitalize">{property.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/property/${property.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteProperty(property.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Manage Agents</CardTitle>
              <CardDescription>Verify and manage agent applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>{agent.company_name}</TableCell>
                        <TableCell>{agent.users?.name}</TableCell>
                        <TableCell>{agent.license_number}</TableCell>
                        <TableCell>{agent.experience_years} years</TableCell>
                        <TableCell>
                          <Badge variant={agent.is_verified ? "success" : "destructive"}>
                            {agent.is_verified ? "Verified" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {!agent.is_verified && (
                            <Button
                              size="sm"
                              onClick={() => verifyAgent(agent.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>Configure site-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="site_name"
                      defaultValue={settings.site_name || "deal.online"}
                      onBlur={(e) => updateSetting("site_name", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_email">Admin Email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="admin_email"
                      defaultValue={settings.admin_email || "admin@deal.pk"}
                      onBlur={(e) => updateSetting("admin_email", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="premium_price">Premium Price (PKR)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="premium_price"
                      type="number"
                      defaultValue={settings.premium_price || "999"}
                      onBlur={(e) => updateSetting("premium_price", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="commission_rate"
                      type="number"
                      defaultValue={settings.commission_rate || "5"}
                      onBlur={(e) => updateSetting("commission_rate", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="auto_ads_code">Auto Ads Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="auto_ads_code"
                      defaultValue={settings.auto_ads_code || ""}
                      onBlur={(e) => updateSetting("auto_ads_code", e.target.value)}
                      placeholder="Paste Google AdSense auto ads code"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="ads_enabled">Ads Enabled</Label>
                  <div className="flex gap-2">
                    <Select
                      defaultValue={settings.ads_enabled || "true"}
                      onValueChange={(value) => updateSetting("ads_enabled", value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Enabled</SelectItem>
                        <SelectItem value="false">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
