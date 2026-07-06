// features/search/components/property-search.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Grid3x3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'];
const PROPERTY_TYPES = ['All', 'Apartment', 'House', 'Villa', 'Farmhouse', 'Commercial', 'Flat', 'Penthouse'];
const SORT_OPTIONS = [
  { value: 'premium', label: 'Premium First' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export function PropertySearch() {
  const router = useRouter();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    city: '',
    area: '',
    propertyType: '',
    minPrice: 0,
    maxPrice: 100000000,
    beds: '',
    baths: '',
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 glass-card">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          value={filters.city}
          onValueChange={(value) => setFilters({ ...filters, city: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent>
            {CITIES.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.propertyType}
          onValueChange={(value) => setFilters({ ...filters, propertyType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-2">
          <label className="text-sm font-medium">Price Range (Rs)</label>
          <Slider
            min={0}
            max={100000000}
            step={100000}
            value={[filters.minPrice, filters.maxPrice]}
            onValueChange={([min, max]) => setFilters({ ...filters, minPrice: min, maxPrice: max })}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Rs {filters.minPrice.toLocaleString()}</span>
            <span>Rs {filters.maxPrice.toLocaleString()}</span>
          </div>
        </div>

        <Button onClick={handleSearch} className="w-full">
          <Search className="w-4 h-4 mr-2" />
          Search Properties
        </Button>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('grid')}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <Select defaultValue="newest">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
