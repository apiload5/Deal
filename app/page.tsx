'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/common/Button'
import { PropertyGrid } from '@/components/property/PropertyGrid'
import { ArrowRight, Search, Home, TrendingUp, Shield } from 'lucide-react'

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch featured properties from API
    setIsLoading(false)
    setFeaturedProperties([
      {
        id: '1',
        title: 'Modern 3 Bedroom Apartment',
        price: 5000000,
        location: 'DHA, Karachi',
        beds: 3,
        baths: 2,
        area: 2500,
        image: 'https://images.unsplash.com/photo-1580587771525-78991c7bde8d?w=500&h=400&fit=crop',
      },
      {
        id: '2',
        title: 'Luxury Villa with Pool',
        price: 15000000,
        location: 'F-7, Islamabad',
        beds: 5,
        baths: 4,
        area: 5000,
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=400&fit=crop',
      },
      {
        id: '3',
        title: 'Commercial Space',
        price: 2000000,
        location: 'Main Boulevard, Lahore',
        beds: 0,
        baths: 1,
        area: 1500,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=400&fit=crop',
      },
    ])
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-5xl font-bold mb-4">Find Your Dream Property</h1>
            <p className="text-lg text-primary-100 mb-8">
              Search millions of properties across Pakistan. Buy, sell, or rent with confidence.
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-2 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by location, city, or property type..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <Button variant="secondary" size="lg">
                Search
              </Button>
            </div>

            {/* Quick Links */}
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/properties?type=residential">
                <Button variant="secondary">Buy Properties</Button>
              </Link>
              <Link href="/properties?type=rent">
                <Button variant="secondary">Rent Properties</Button>
              </Link>
              <Link href="/sell">
                <Button variant="secondary">Sell Your Property</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Deal.pk?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                <Home className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Verified Properties</h3>
              <p className="text-gray-600 dark:text-gray-400">
                All properties are verified and authenticated by our team.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Best Deals</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Find the best prices and deals from thousands of listings.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Transactions</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your transactions are protected with our secure platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Properties</h2>
              <p className="text-gray-600 dark:text-gray-400">Discover our latest listings</p>
            </div>
            <Link href="/properties">
              <Button>
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <PropertyGrid properties={featuredProperties} isLoading={isLoading} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to List Your Property?</h2>
          <p className="text-lg text-primary-100 mb-8">
            Join thousands of sellers and reach millions of buyers on Deal.pk
          </p>
          <Link href="/sell">
            <Button size="lg" variant="secondary">
              Start Listing Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
