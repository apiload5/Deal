'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFilterStore } from '@/lib/store';
import { City } from '@/types';

export default function SearchBar({ cities }: { cities: City[] }) {
  const router = useRouter();
  const store = useFilterStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (store.city) params.append('city', store.city);
    if (store.purpose) params.append('purpose', store.purpose);
    if (store.minPrice) params.append('minPrice', store.minPrice);
    if (store.maxPrice) params.append('maxPrice', store.maxPrice);
    
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-4 md:p-6 border grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Purpose</label>
        <select value={store.purpose} onChange={(e) => store.setFilter('purpose', e.target.value)} className="w-full h-11 border rounded-xl px-3 bg-slate-50 font-medium text-sm">
          <option value="sale">Buy</option>
          <option value="rent">Rent</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">City</label>
        <select value={store.city} onChange={(e) => store.setFilter('city', e.target.value)} className="w-full h-11 border rounded-xl px-3 bg-slate-50 font-medium text-sm">
          <option value="">All Cities</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Min Price</label>
          <input type="number" placeholder="Any" value={store.minPrice} onChange={(e) => store.setFilter('minPrice', e.target.value)} className="w-full h-11 border rounded-xl px-2.5 bg-slate-50 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Max Price</label>
          <input type="number" placeholder="Any" value={store.maxPrice} onChange={(e) => store.setFilter('maxPrice', e.target.value)} className="w-full h-11 border rounded-xl px-2.5 bg-slate-50 text-sm" />
        </div>
      </div>
      <button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-md shadow-blue-200">
        Search Now
      </button>
    </form>
  );
}
