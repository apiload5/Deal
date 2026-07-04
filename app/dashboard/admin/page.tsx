'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
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
  Shield, Settings, BarChart3, TrendingUp
} from 'lucide-react';
import { User, Property } from '@/types';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [adminData, setAdminData] = useState({
    users: [] as User[],
    properties: [] as Property[],
    stats: { users: 0, properties: 0, views: 0, revenue: 0 },
  });
  const [loadingData, setLoadingData] = useState(true);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // Check if user is admin
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (data?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      await fetchAdminData();
    };

    checkAdmin();
  }, [user, loading, router]);

  const fetchAdminData = async () => {
    setLoadingData(true);

    // Fetch users
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch properties
    const { data: properties } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch stats
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

    setAdminData({
      users: users || [],
      properties: properties || [],
      stats: {
        users: users?.length || 0,
        properties: properties?.length || 0,
        views: views?.length || 0,
        revenue: 0, // Calculate from premium payments
      },
    });
    setSettings(settingsObj);
    setLoadingData(false);
  };

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
    if (!confirm('Are you sure you want to delete this property?')) return;

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

  if (loading || loadingData) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="skeleton h-12 w-12 rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your real estate platform
          </p>
        </div>
        <Shield className="h-8 w-8 text-primary" />
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
            <div className="text-2xl font-bold">{adminData.stats.views}</div>
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
        <TabsList>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Properties Tab */}
        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>Manage Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminData.properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.title}</TableCell>
                        <TableCell>PKR {property.price.toLocaleString()}</TableCell>
                        <TableCell className="capitalize">{property.status}</TableCell>
                        <TableCell>
                          <Button
                            variant={property.is_featured ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => togglePropertyFeature(property.id, 'is_featured')}
                          >
                            {property.is_featured ? 'Yes' : 'No'}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={property.is_premium ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => togglePropertyFeature(property.id, 'is_premium')}
                          >
                            {property.is_premium ? 'Yes' : 'No'}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteProperty(property.id)}
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone</TableHead>
                      <TableHead>Name</TableHead>
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
                        <TableCell className="capitalize">{user.role}</TableCell>
                        <TableCell>{user.is_verified ? '✅' : '❌'}</TableCell>
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
            <CardContent className="space-y-4">
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
                  value={settings.premium_price || '999'}
                  onChange={(e) => updateSetting('premium_price', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                <Input
                  id="commission_rate"
                  value={settings.commission_rate || '5'}
                  onChange={(e) => updateSetting('commission_rate', e.target.value)}
                />
              </div>

              <Button onClick={fetchAdminData}>Refresh Data</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
