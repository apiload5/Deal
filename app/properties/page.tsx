import { Suspense } from 'react';
import { createServerClient } from '@/lib/supabase/server';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertyFilters from '@/components/properties/PropertyFilters';
import PropertySkeleton from '@/components/properties/PropertySkeleton';
import AdBanner from '@/components/shared/AdBanner';
import { Property } from '@/types';

export const revalidate = 3600; // ISR

interface PropertiesPageProps {
  searchParams: {
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    beds?: string;
    property_type?: string;
    purpose?: string;
    search?: string;
    premium?: string;
  };
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const supabase = createServerClient();
  
  let query = supabase
    .from('properties')
    .select(`
      *,
      city:cities(*),
      owner:users(*)
    `)
    .eq('status', 'active');

  // Apply filters
  if (searchParams.city) {
    query = query.eq('city_id', searchParams.city);
  }

  if (searchParams.purpose) {
    query = query.eq('purpose', searchParams.purpose);
  }

  if (searchParams.property_type) {
    query = query.eq('property_type', searchParams.property_type);
  }

  if (searchParams.minPrice) {
    query = query.gte('price', parseInt(searchParams.minPrice));
  }

  if (searchParams.maxPrice) {
    query = query.lte('price', parseInt(searchParams.maxPrice));
  }

  if (searchParams.beds) {
    query = query.gte('beds', parseInt(searchParams.beds));
  }

  if (searchParams.search) {
    query = query.ilike('title', `%${searchParams.search}%`);
  }

  // Premium filter
  if (searchParams.premium === 'true') {
    query = query
      .eq('is_premium', true)
      .gte('premium_until', new Date().toISOString());
  }

  // Order: premium first, then featured, then newest
  query = query
    .order('is_premium', { ascending: false })
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  const { data: properties, error } = await query;

  if (error) {
    console.error('Error fetching properties:', error);
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error loading properties</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar with filters */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <PropertyFilters />
            
            {/* Ad Banner in sidebar */}
            <div className="mt-6">
              <AdBanner slot="1234567890" format="vertical" />
            </div>
          </div>
        </aside>

        {/* Property Grid */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              Properties {properties?.length ? `(${properties.length})` : ''}
            </h1>
          </div>

          <Suspense fallback={<PropertySkeleton count={9} />}>
            {properties && properties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {properties.map((property: Property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Ad between grid items */}
                <div className="my-8">
                  <AdBanner slot="1234567891" format="horizontal" />
                </div>
              </>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl bg-gray-50">
                <div className="text-center">
                  <p className="text-lg text-muted-foreground">No properties found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters
                  </p>
                </div>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
