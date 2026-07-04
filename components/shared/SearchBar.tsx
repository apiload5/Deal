'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Home, Building2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CITIES, PURPOSES, PROPERTY_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils/helpers';

interface SearchBarProps {
  className?: string;
}

export default function SearchBar({ className }: SearchBarProps) {
  const router = useRouter();
  const [city, setCity] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (purpose) params.append('purpose', purpose);
    if (propertyType) params.append('property_type', propertyType);
    if (searchQuery) params.append('search', searchQuery);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        'flex flex-col gap-3 rounded-lg bg-white p-4 shadow-xl md:flex-row md:items-end',
        className
      )}
    >
      <div className="flex-1 space-y-1">
        <label className="text-sm font-medium text-gray-700">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <label className="text-sm font-medium text-gray-700">City</label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger>
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Cities</SelectItem>
            {CITIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 space-y-1">
        <label className="text-sm font-medium text-gray-700">Purpose</label>
        <Select value={purpose} onValueChange={setPurpose}>
          <SelectTrigger>
            <SelectValue placeholder="Buy or Rent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            {PURPOSES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 space-y-1">
        <label className="text-sm font-medium text-gray-700">Property Type</label>
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {PROPERTY_TYPES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="md:h-10 md:px-8">
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </form>
  );
}
