// app/page.tsx
import { Suspense } from 'react';
import { HeroSection } from '@/features/home/components/hero-section';
import { FeaturedProperties } from '@/features/home/components/featured-properties';
import { PremiumListings } from '@/features/home/components/premium-listings';
import { PropertySearch } from '@/features/search/components/property-search';
import { CitiesSection } from '@/features/home/components/cities-section';
import { WhyChooseUs } from '@/features/home/components/why-choose-us';
import { Testimonials } from '@/features/home/components/testimonials';

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <Suspense fallback={<div>Loading search...</div>}>
          <PropertySearch />
        </Suspense>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Premium Featured Properties</h2>
          <Suspense fallback={<div>Loading properties...</div>}>
            <PremiumListings />
          </Suspense>
        </div>
      </section>
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Properties</h2>
          <Suspense fallback={<div>Loading featured properties...</div>}>
            <FeaturedProperties />
          </Suspense>
        </div>
      </section>
      <CitiesSection />
      <WhyChooseUs />
      <Testimonials />
    </div>
  );
}
