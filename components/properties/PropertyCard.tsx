'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, MapPin, Play, Eye } from 'lucide-react';
import { Property } from '@/types';
import { formatPrice, truncateText, isPremiumActive } from '@/lib/utils/helpers';
import PremiumBadge from '@/components/shared/PremiumBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  property: Property;
  featured?: boolean;
}

export default function PropertyCard({ property, featured = false }: PropertyCardProps) {
  const isPremium = isPremiumActive(property.premium_until);
  const imageUrl = property.images && property.images.length > 0 
    ? property.images[0] 
    : '/placeholder-property.jpg';

  return (
    <Card className={`group overflow-hidden transition-all hover:shadow-xl ${
      isPremium ? 'premium-border' : ''
    }`}>
      <Link href={`/property/${property.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imageUrl}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1">
            {isPremium && <PremiumBadge />}
            {property.is_featured && (
              <Badge className="bg-primary text-white">Featured</Badge>
            )}
            <Badge className="bg-green-500 text-white capitalize">
              {property.purpose}
            </Badge>
          </div>

          {/* TikTok badge */}
          {property.tiktok_video_url && (
            <div className="absolute right-3 top-3">
              <div className="rounded-full bg-black/70 p-2">
                <Play className="h-4 w-4 fill-white text-white" />
              </div>
            </div>
          )}

          {/* View count */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-xs text-white">
            <Eye className="h-3 w-3" />
            {property.views || 0}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary">
              {truncateText(property.title, 40)}
            </h3>
          </div>

          <p className="mb-2 text-2xl font-bold text-primary">
            {formatPrice(property.price)}
          </p>

          <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {property.beds > 0 && (
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                {property.beds}
              </span>
            )}
            {property.baths > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                {property.baths}
              </span>
            )}
            {property.area_sqft && (
              <span>{property.area_sqft} sqft</span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {property.city?.name || 'Unknown'}
            </span>
          </div>

          <div className="text-xs text-muted-foreground">
            {new Date(property.created_at).toLocaleDateString('en-PK', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
