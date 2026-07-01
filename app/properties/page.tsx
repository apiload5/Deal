import React from 'react';
import { supabase } from '@/lib/supabase';
import PropertyCard from '@/components/PropertyCard';

export const revalidate = 3600;

interface PropertiesPageProps {
  searchParams: Promise<{
    city?: string;
    purpose?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const resolvedParams = await searchParams;
  let builder = supabase.from('properties').select('*').eq('status', 'active');

  if (resolvedParams.city) builder = builder.eq('city_id', resolvedParams.city);
  if (resolvedParams.purpose) builder = builder.eq('purpose', resolvedParams.purpose);
  if (resolvedParams.minPrice) builder = builder.gte('price', parseInt(resolvedParams.minPrice));
  if (resolvedParams.maxPrice) builder = builder.lte('price', parseInt(resolvedParams.maxPrice));

  const { data: properties } = await builder.order('created_at', { ascending: false });

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-slate-950">Property Search Results</h1>
      <p className="text-slate-500 text-sm mt-1">Found {properties?.length || 0} matching listings across monitored grids.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {(properties || []).map(p => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </main>
  );
}
