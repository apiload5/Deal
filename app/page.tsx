import React from 'react';
import { supabase } from '@/lib/supabase';
import SearchBar from '@/components/SearchBar';
import PropertyCard from '@/components/PropertyCard';
import Link from 'next/link';

export const revalidate = 3600;

export default async function HomePage() {
  const { data: cities } = await supabase.from('cities').select('*').order('total_properties', { ascending: false });
  const { data: properties } = await supabase.from('properties').select('*').eq('is_featured', true).eq('status', 'active').limit(6);

  return (
    <main className="pb-16">
      <div className="relative bg-gradient-to-b from-blue-900 to-blue-700 py-20 px-4 flex flex-col items-center justify-center text-center text-white">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl leading-tight">
          Pakistan's Next-Gen Video Property Marketplace
        </h1>
        <p className="mt-4 text-blue-100 text-lg md:text-xl max-w-xl font-medium mb-10">
          Say goodbye to fake photos. Watch direct mobile video walkthroughs before your visit.
        </p>
        <SearchBar cities={cities || []} />
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-16">
        <h2 className="text-2xl font-black text-slate-900">Featured Premium Listings</h2>
        <p className="text-slate-500 text-sm mt-0.5">Handpicked properties with validated video tours.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {(properties || []).map(p => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </div>
    </main>
  );
}
