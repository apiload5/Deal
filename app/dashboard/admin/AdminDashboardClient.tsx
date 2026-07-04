// app/dashboard/admin/AdminDashboardClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users, Building2, Eye, DollarSign,
  Shield, Settings, BarChart3, TrendingUp,
  Loader2, RefreshCw
} from 'lucide-react';
import { User, Property } from '@/types';

export default function AdminDashboardClient() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminData, setAdminData] = useState({
    users: [] as User[],
    properties: [] as Property[],
    stats: { users: 0, properties: 0, views: 0, revenue: 0 },
  });
  const [settings, setSettings] = useState<Record<string, string>>({});

  const fetchAdminData = async () => {
    setRefreshing(true);

    // Fetch users
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch properties with city and owner data
    const { data: properties } = await supabase
      .from('properties')
      .select(`
        *,
        city:cities(*),
        owner:users(*)
      `)
      .order('created_at', { ascending: false });

    // Fetch view count
    const { data: views } = await supabase
      .from('property_views')
      .select('*');

    // Fetch settings
    const { data: settingsData } = await supabase
      .from('site_settings')
      .select('*');

    const settingsObj: Record<string, string> = {};
    settingsData?.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    // Calculate revenue (total premium listings * premium price)
    const premiumProperties = properties?.filter(p => p.is_premium) || [];
    const premiumPrice = parseInt(settingsObj.premium_price || '999');
    const revenue = premiumProperties.length * premiumPrice;

    setAdminData({
      users: users || [],
      properties: properties || [],
      stats: {
        users: users?.length || 0,
        properties: properties?.length || 0,
        views: views?.length || 0,
        revenue: revenue,
      },
    });
    setSettings(settingsObj);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const updateSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });

    if (!error) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const togglePropertyFeature = async (propertyId: string, field: 'is_featured' | 'is_premium') => {
    const property = adminData.properties.find(p => p.id === propertyId);
    if (!property) return;

    const { error } = await supabase
      .from('properties')
      .update({ [field]: !property[field] })
      .eq('id', propertyId);

    if (!error) {
      await fetchAdminData();
    }
  };

  const deleteProperty = async (propertyId: string) => {
    if (!confirm('⚠️ Are you sure you want to permanently delete this property? This action cannot be undone.')) return;

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (!error) {
      await fetchAdminData();
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (!error) {
      await fetchAdminData();
    }
  };

  const verifyAgent = async (userId: string) => {
    const { error } = await supabase
      .from('agents')
      .update({ is_verified: true })
      .eq('user_id', userId);

    if (!error) {
      await fetchAdminData();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with refresh */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your real estate platform</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchAdminData}
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminData.stats.users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminData.stats.properties}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminData.stats.views.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {adminData.stats.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Properties Tab */}
        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>Manage Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminData.properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="max-w-[150px] truncate font-medium">
                          {property.title}
                        </TableCell>
                        <TableCell>PKR {property.price.toLocaleString()}</TableCell>
                        <TableCell>{property.owner?.name || property.owner?.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`capitalize ${property.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                            {property.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={property.is_featured ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => togglePropertyFeature(property.id, 'is_featured')}
                            className="w-16"
                          >
                            {property.is_featured ? 'Yes' : 'No'}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={property.is_premium ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => togglePropertyFeature(property.id, 'is_premium')}
                            className="w-16"
                          >
                            {property.is_premium ? 'Yes' : 'No'}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteProperty(property.id)}
                              className="text-xs"
                            >
                              Delete
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

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Manage Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminData.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.name || 'N/A'}</TableCell>
                        <TableCell>{user.email || 'N/A'}</TableCell>
                        <TableCell>
                          <select
                            className="rounded border p-1 text-sm"
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                          >
                            <option value="user">User</option>
                            <option value="agent">Agent</option>
                            <option value="admin">Admin</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          {user.is_verified ? '✅' : '❌'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.role === 'agent' && !user.is_verified && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => verifyAgent(user.id)}
                                className="text-xs"
                              >
                                Verify Agent
                              </Button>
                            )}
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

        {/* Agents Tab */}
        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Manage Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Listings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminData.users
                      .filter(u => u.role === 'agent')
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name || user.phone}</TableCell>
                          <TableCell>{user.agent_company || 'N/A'}</TableCell>
                          <TableCell>{user.agent_license || 'N/A'}</TableCell>
                          <TableCell>N/A</TableCell>
                          <TableCell>
                            {user.is_verified ? '✅' : '❌'}
                          </TableCell>
                          <TableCell>N/A</TableCell>
                          <TableCell>
                            {adminData.properties.filter(p => p.owner_id === user.id).length}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Site Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name || ''}
                    onChange={(e) => updateSetting('site_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_email">Admin Email</Label>
                  <Input
                    id="admin_email"
                    value={settings.admin_email || ''}
                    onChange={(e) => updateSetting('admin_email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auto_ads_code">Auto Ads Code</Label>
                  <Input
                    id="auto_ads_code"
                    value={settings.auto_ads_code || ''}
                    onChange={(e) => updateSetting('auto_ads_code', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="premium_price">Premium Price (PKR)</Label>
                  <Input
                    id="premium_price"
                    type="number"
                    value={settings.premium_price || '999'}
                    onChange={(e) => updateSetting('premium_price', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    value={settings.commission_rate || '5'}
                    onChange={(e) => updateSetting('commission_rate', e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-medium">ℹ️ Settings saved automatically</p>
                <p className="mt-1">Changes take effect immediately.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
