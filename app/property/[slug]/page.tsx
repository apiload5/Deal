// app/property/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PropertyDetail } from '@/features/property/components/property-detail';
import { PropertyGallery } from '@/features/property/components/property-gallery';
import { PropertyInfo } from '@/features/property/components/property-info';
import { AgentContact } from '@/features/property/components/agent-contact';
import { MortgageCalculator } from '@/features/property/components/mortgage-calculator';
import { PropertyMap } from '@/features/property/components/property-map';
import { SimilarProperties } from '@/features/property/components/similar-properties';
import { PropertyReviews } from '@/features/property/components/property-reviews';
import { VideoPlayer } from '@/features/video-embed/components/video-player';
import { SocialShare } from '@/features/property/components/social-share';
import { QRCode } from '@/features/property/components/qr-code';
import { AdBanner } from '@/features/ads/components/ad-banner';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const property = await prisma.property.findUnique({
    where: { slug: params.slug, status: 'approved' },
    include: {
      agent: {
        include: {
          user: true,
        },
      },
      owner: true,
      reviews: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!property) {
    notFound();
  }

  // Increment view count
  await prisma.property.update({
    where: { id: property.id },
    data: { views: { increment: 1 } },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PropertyGallery images={property.images} />
          
          <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <div className="flex items-center space-x-4">
              <SocialShare url={`https://deal.pk/property/${property.slug}`} />
              <QRCode url={`https://deal.pk/property/${property.slug}`} />
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-4">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {property.priceFormatted}
            </span>
            {property.isPremium && (
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                ⭐ Premium
              </span>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <span className="text-sm text-gray-500">Property Type</span>
              <p className="font-semibold">{property.propertyType}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <span className="text-sm text-gray-500">Area</span>
              <p className="font-semibold">{property.areaSqft} sqft</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <span className="text-sm text-gray-500">Bedrooms</span>
              <p className="font-semibold">{property.beds}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <span className="text-sm text-gray-500">Bathrooms</span>
              <p className="font-semibold">{property.baths}</p>
            </div>
          </div>

          {property.videoUrl && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Virtual Tour</h2>
              <VideoPlayer url={property.videoUrl} platform={property.videoPlatform || 'youtube'} />
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {property.description}
            </p>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <span className="text-sm text-gray-500">Furnished</span>
                <p className="font-semibold">{property.furnished ? 'Yes' : 'No'}</p>
              </div>
              {property.floor !== null && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <span className="text-sm text-gray-500">Floor</span>
                  <p className="font-semibold">{property.floor}</p>
                </div>
              )}
              {property.builtYear && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <span className="text-sm text-gray-500">Built Year</span>
                  <p className="font-semibold">{property.builtYear}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div className="h-96 rounded-lg overflow-hidden">
              <PropertyMap latitude={property.latitude || 33.6844} longitude={property.longitude || 73.0479} />
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            <PropertyReviews reviews={property.reviews} propertyId={property.id} />
          </div>

          <div className="mt-6">
            <SimilarProperties propertyId={property.id} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <AgentContact agent={property.agent} />
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="font-semibold mb-4">Mortgage Calculator</h3>
              <MortgageCalculator price={property.price} />
            </div>

            <AdBanner placement="sidebar" />
          </div>
        </div>
      </div>
    </div>
  );
}
