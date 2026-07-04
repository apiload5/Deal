'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Heart, Eye, PlusCircle } from 'lucide-react';
import PropertyCard from '@/components/properties/PropertyCard';
import { Property } from '@/types';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, views: 0 });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      if (!user) return;

      // Fetch user's properties
      const { data: userProperties } = await supabase
        .from('properties')
        .select(`
          *,
          city:cities(*),
          owner:users(*)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (userProperties) {
        setProperties(userProperties);
        const totalViews = userProperties.reduce((sum, p) => sum + (p.views || 0), 0);
        setStats({
          total: userProperties.length,
          views: totalViews,
        });
      }

      // Fetch favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (favoritesData) {
        setFavorites(favoritesData.map(f => f.property_id));
      }
    };

    fetchData();
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="skeleton h-12 w-12 rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.user_metadata?.full_name || user.phone || 'User'}!
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.views}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favorites.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Property Button */}
      <div className="mb-8">
        <Button asChild>
          <Link href="/add-property">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Property
          </Link>
        </Button>
      </div>

      {/* Properties List */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Your Properties</h2>
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                You haven't listed any properties yet.
              </p>
              <Button asChild className="mt-4">
                <Link href="/add-property">List Your First Property</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
