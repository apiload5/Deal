'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { CITIES, PROPERTY_TYPES, PURPOSES, BEDS_OPTIONS } from '@/lib/constants';
import { Filter, X } from 'lucide-react';

export default function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    purpose: searchParams.get('purpose') || '',
    propertyType: searchParams.get('property_type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    beds: searchParams.get('beds') || '',
  });

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    router.push(`/properties?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      purpose: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      beds: '',
    });
    router.push('/properties');
  };

  return (
    <>
      {/* Mobile Filter Toggle */}
      <Button
        variant="outline"
        className="mb-4 w-full lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter className="mr-2 h-4 w-4" />
        {isOpen ? 'Hide Filters' : 'Show Filters'}
      </Button>

      <Card className={isOpen ? 'block' : 'hidden lg:block'}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filters</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-sm text-muted-foreground"
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* City */}
          <div className="space-y-2">
            <Label>City</Label>
            <Select
              value={filters.city}
              onValueChange={(value) => setFilters({ ...filters, city: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cities</SelectItem>
                {CITIES.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label>Purpose</Label>
            <Select
              value={filters.purpose}
              onValueChange={(value) => setFilters({ ...filters, purpose: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
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

          {/* Property Type */}
          <div className="space-y-2">
            <Label>Property Type</Label>
            <Select
              value={filters.propertyType}
              onValueChange={(value) => setFilters({ ...filters, propertyType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label>Price Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>

          {/* Beds */}
          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <Select
              value={filters.beds}
              onValueChange={(value) => setFilters({ ...filters, beds: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {BEDS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Apply Button */}
          <Button className="w-full" onClick={applyFilters}>
            Apply Filters
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
