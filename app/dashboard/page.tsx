'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PropertyCard from '@/components/PropertyCard';
import { Property } from '@/types';
import { PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('properties').select('*').eq('owner_id', user.id);
        if (data) setProperties(data as any[]);
      }
      setLoading(false);
    }
    loadUserDashboard();
  }, []);

  if (loading) return <div className="text-center py-20 font-medium text-slate-400">Loading private portal metrics...</div>;

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-950">Property Agent Control Panel</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track and maintain active property assets published via your verified account.</p>
        </div>
        <Link href="/add-property" className="flex items-center gap-2 bg-blue-600 text-white font-bold h-11 px-5 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200">
          <PlusCircle className="w-4 h-4" /> Post New Ad
        </Link>
      </div>

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => <PropertyCard key={p.id} property={p} />)}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-400 text-md font-semibold">No active property entries found on this profile pipeline.</p>
        </div>
      )}
    </main>
  );
}
