import { createServerClient } from '@/lib/supabase/server';
import SearchBar from '@/components/shared/SearchBar';
import PropertyCard from '@/components/properties/PropertyCard';
import { Property } from '@/types';
import Link from 'next/link';
import { ArrowRight, Home, Building2, MapPin, Award } from 'lucide-react';
import Image from 'next/image';

export const revalidate = 3600; // ISR

export default async function HomePage() {
  const supabase = createServerClient();

  // Fetch featured properties
  const { data: featuredProperties } = await supabase
    .from('properties')
    .select(`
      *,
      city:cities(*),
      owner:users(*)
    `)
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  // Fetch premium properties
  const { data: premiumProperties } = await supabase
    .from('properties')
    .select(`
      *,
      city:cities(*),
      owner:users(*)
    `)
    .eq('status', 'active')
    .eq('is_premium', true)
    .gte('premium_until', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(6);

  // Fetch cities with property count
  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .order('total_properties', { ascending: false })
    .limit(8);

  const citiesData = cities || [];

  return (
    <div>
      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-r from-primary-600 to-secondary-600 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center text-white">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
              Find Your Dream Property
            </h1>
            <p className="mb-8 text-xl text-white/90">
              Discover thousands of properties across Pakistan. Buy, sell, or rent with confidence.
            </p>
            <SearchBar />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 70C840 80 960 100 1080 105C1200 110 1320 110 1380 110L1440 110V0H0V120Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Premium Listings */}
      {premiumProperties && premiumProperties.length > 0 && (
        <section className="py-16 bg-premium-light/20">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-3xl font-bold">
                  <Award className="h-8 w-8 text-premium" />
                  Premium Listings
                </h2>
                <p className="text-muted-foreground">
                  Featured premium properties with exclusive benefits
                </p>
              </div>
              <Link
                href="/properties?premium=true"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {premiumProperties.map((property: Property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Properties */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Featured Properties</h2>
              <p className="text-muted-foreground">
                Handpicked properties for your consideration
              </p>
            </div>
            <Link
              href="/properties"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProperties && featuredProperties.length > 0 ? (
              featuredProperties.map((property: Property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                No featured properties available at the moment.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-3xl font-bold text-center">Popular Cities</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {citiesData.map((city) => (
              <Link
                key={city.id}
                href={`/properties?city=${city.id}`}
                className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-transform hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary-100 p-2">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary">
                      {city.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {city.total_properties || 0} properties
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-3xl font-bold text-center">How It Works</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <SearchBar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Search</h3>
              <p className="text-muted-foreground">
                Find properties that match your criteria with our advanced search
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">View</h3>
              <p className="text-muted-foreground">
                Explore detailed property listings with photos, videos, and maps
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Connect</h3>
              <p className="text-muted-foreground">
                Contact property owners directly via WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
