import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Bed, Bath, MapPin, Eye, Calendar, 
  Home, Building2, ArrowLeft, Phone,
  Mail, Share2, Heart
} from 'lucide-react';
import { formatPrice, formatDate, isPremiumActive } from '@/lib/utils/helpers';
import TikTokPlayer from '@/components/shared/TikTokPlayer';
import Map from '@/components/shared/Map';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import PremiumBadge from '@/components/shared/PremiumBadge';
import AdBanner from '@/components/shared/AdBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Metadata } from 'next';

interface PropertyPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const supabase = createServerClient();
  const { data: property } = await supabase
    .from('properties')
    .select('title, description, images, price, city: cities(name)')
    .eq('id', params.id)
    .single();

  if (!property) {
    return {
      title: 'Property Not Found',
    };
  }

  return {
    title: `${property.title} - deal.online`,
    description: property.description || `Property in ${property.city?.name || 'Pakistan'}`,
    openGraph: {
      title: property.title,
      description: property.description || '',
      images: property.images && property.images.length > 0 
        ? [property.images[0]] 
        : ['/og-image.jpg'],
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const supabase = createServerClient();
  
  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      city:cities(*),
      owner:users(*)
    `)
    .eq('id', params.id)
    .single();

  if (error || !property) {
    notFound();
  }

  const isPremium = isPremiumActive(property.premium_until);
  const imageUrl = property.images && property.images.length > 0 
    ? property.images[0] 
    : '/placeholder-property.jpg';

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: property.title,
    description: property.description,
    image: property.images,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'PKR',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '10',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <Link
          href="/properties"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to properties
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Property title */}
            <div className="mb-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h1 className="text-2xl font-bold md:text-3xl">{property.title}</h1>
                <div className="flex gap-2">
                  {isPremium && <PremiumBadge size="lg" />}
                  {property.is_featured && (
                    <Badge className="bg-primary text-white">Featured</Badge>
                  )}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {property.city?.name}, {property.address || 'Pakistan'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Posted {formatDate(property.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {property.views || 0} views
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6 text-3xl font-bold text-primary">
              {formatPrice(property.price)}
              <span className="text-sm font-normal text-muted-foreground">
                {property.purpose === 'rent' ? ' / month' : ''}
              </span>
            </div>

            {/* TikTok Video */}
            {property.tiktok_video_url && (
              <div className="mb-6">
                <TikTokPlayer videoUrl={property.tiktok_video_url} />
              </div>
            )}

            {/* Image Gallery */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {property.images.map((image: string, index: number) => (
                  <div
                    key={index}
                    className={`relative aspect-[4/3] overflow-hidden rounded-lg ${
                      index === 0 ? 'col-span-2 row-span-2' : ''
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${property.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Property Details */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Property Details</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">{property.property_type}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Purpose</span>
                    <span className="font-medium capitalize">{property.purpose}</span>
                  </div>
                  {property.area_sqft && (
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Area</span>
                      <span className="font-medium">{property.area_sqft} sqft</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="font-medium capitalize">{property.status}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4">
                  {property.beds > 0 && (
                    <span className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
                      <Bed className="h-4 w-4" />
                      {property.beds} Beds
                    </span>
                  )}
                  {property.baths > 0 && (
                    <span className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
                      <Bath className="h-4 w-4" />
                      {property.baths} Baths
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {property.description && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-semibold">Description</h2>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {property.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Map */}
            {property.lat && property.lng && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-semibold">Location</h2>
                  <Map
                    lat={property.lat}
                    lng={property.lng}
                    title={property.title}
                  />
                </CardContent>
              </Card>
            )}

            {/* Ad Banner */}
            <div className="my-6">
              <AdBanner slot="1234567892" format="horizontal" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Owner info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Contact Owner</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary-100 p-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{property.owner?.name || 'Owner'}</p>
                      <p className="text-sm text-muted-foreground">
                        Member since {property.owner?.created_at ? formatDate(property.owner.created_at) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <Button asChild className="w-full bg-green-500 hover:bg-green-600">
                    <a
                      href={`https://wa.me/92${property.owner_whatsapp}?text=Hi, I am interested in ${property.title} on deal.online`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Contact on WhatsApp
                    </a>
                  </Button>

                  <Button variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Owner
                  </Button>

                  <Button variant="outline" className="w-full">
                    <Heart className="mr-2 h-4 w-4" />
                    Save to Favorites
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Share</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: property.title,
                          text: `Check out this property: ${property.title}`,
                          url: window.location.href,
                        });
                      }
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ad Banner */}
            <div>
              <AdBanner slot="1234567893" format="vertical" />
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Button */}
      <WhatsAppButton 
        phoneNumber={property.owner_whatsapp}
        message={`Hi, I am interested in ${property.title} on deal.online`}
      />
    </>
  );
}
