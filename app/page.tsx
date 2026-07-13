// app/page.tsx
import { Suspense } from 'react'
import { SearchBar } from '@/features/search/components/SearchBar'
import { PropertyGrid } from '@/features/search/components/PropertyGrid'
import { CityGrid } from '@/features/search/components/CityGrid'
import { BlogSection } from '@/features/blog/components/BlogSection'
import { AdBanner } from '@/components/shared/AdBanner'
import { StatsBar } from '@/components/shared/StatsBar'
import { PropertyCardSkeleton } from '@/components/shared/PropertyCardSkeleton'

export default async function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Find Your Dream Property
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Pakistan's Largest Real Estate Portal
            </p>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <StatsBar />

      {/* Premium Properties */}
      <section className="py-12 bg-gradient-to-b from-yellow-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-yellow-500">✦</span> Premium Listings
            </h2>
            <a href="/properties?premium=true" className="text-blue-600 hover:underline">
              View All
            </a>
          </div>
          <Suspense fallback={<PropertyCardSkeleton count={4} />}>
            <PropertyGrid 
              type="premium" 
              limit={4} 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            />
          </Suspense>
        </div>
      </section>

      {/* Ad Banner */}
      <AdBanner position="homepage" />

      {/* Featured Properties */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Properties</h2>
            <a href="/properties" className="text-blue-600 hover:underline">
              View All
            </a>
          </div>
          <Suspense fallback={<PropertyCardSkeleton count={4} />}>
            <PropertyGrid 
              type="featured" 
              limit={4}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            />
          </Suspense>
        </div>
      </section>

      {/* City Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Popular Cities
          </h2>
          <CityGrid limit={8} />
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Latest Real Estate Insights</h2>
            <a href="/blog" className="text-blue-600 hover:underline">
              View All
            </a>
          </div>
          <BlogSection limit={3} />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold text-lg">Safe Deal</h3>
              <p className="text-gray-600">Secure escrow payment system</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-semibold text-lg">Best Prices</h3>
              <p className="text-gray-600">Competitive market rates</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-semibold text-lg">Trusted Agents</h3>
              <p className="text-gray-600">Verified real estate agents</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-lg">Fast Deals</h3>
              <p className="text-gray-600">Quick property transactions</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
