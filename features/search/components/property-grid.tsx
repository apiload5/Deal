// features/search/components/property-grid.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, MapPin, Bath, Bed, Square } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Property {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceFormatted: string;
  city: string;
  area: string;
  propertyType: string;
  beds: number;
  baths: number;
  areaSqft: number;
  images: string[];
  isPremium: boolean;
  isFeatured: boolean;
}

interface PropertyGridProps {
  filters: any;
  page: number;
}

export function PropertyGrid({ filters, page }: PropertyGridProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          ...filters,
          page: page.toString(),
          limit: '20',
        });
        const response = await fetch(`/api/properties?${params.toString()}`);
        const data = await response.json();
        setProperties(data.properties || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [filters, page]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48" />
            <div className="mt-3 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => (
        <Link key={property.id} href={`/property/${property.slug}`}>
          <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={property.images[0] || '/placeholder-property.jpg'}
                alt={property.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {property.isPremium && (
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0">
                  ⭐ Premium
                </Badge>
              )}
              {property.isFeatured && (
                <Badge className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white border-0">
                  Featured
                </Badge>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="absolute bottom-3 right-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:bg-white dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  // Add to wishlist
                }}
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">{property.title}</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(property.price)}
              </p>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{property.area}, {property.city}</span>
              </div>
              <div className="flex items-center justify-between mt-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Bed className="w-4 h-4 mr-1" />
                    {property.beds}
                  </span>
                  <span className="flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    {property.baths}
                  </span>
                  <span className="flex items-center">
                    <Square className="w-4 h-4 mr-1" />
                    {property.areaSqft} sqft
                  </span>
                </div>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {property.propertyType}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
