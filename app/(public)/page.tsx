'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SearchFilters } from '@/features/search/components/SearchFilters'
import { PropertyCard } from '@/features/search/components/PropertyCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, TrendingUp, MapPin, Home, Building2, LandPlot, Store } from 'lucide-react'
import Link from 'next/link'
import { formatPKR } from '@/lib/utils'

// Mock data - will be replaced with real data from API
const featuredProperties = [
  {
    id: '1',
    title: 'Luxury Villa with Ocean View',
    price: 45000000,
    city: 'Karachi',
    area: 'Clifton',
    propertyType: 'HOUSE',
    beds: 5,
    baths: 6,
    areaSqft: 5000,
    images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
    isPremium: true,
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Modern Apartment in DHA',
    price: 12000000,
    city: 'Lahore',
    area: 'DHA Phase 5',
    propertyType: 'APARTMENT',
    beds: 3,
    baths: 2,
    areaSqft: 2500,
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
    isPremium: true,
  },
  {
    id: '3',
    title: 'Commercial Plaza for Sale',
    price: 25000000,
    city: 'Islamabad',
    area: 'Blue Area',
    propertyType: 'COMMERCIAL',
    beds: 0,
    baths: 0,
    areaSqft: 8000,
    images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'],
    isPremium: false,
    isFeatured: true,
  },
]

const stats = [
  { label: 'Properties Listed', value: '12,500+', icon: Home },
  { label: 'Happy Buyers', value: '8,000+', icon: TrendingUp },
  { label: 'Cities Covered', value: '50+', icon: MapPin },
  { label: 'Agent Partners', value: '1,200+', icon: Store },
]

const propertyTypes = [
  { icon: Home, label: 'Houses', value: 'HOUSE' },
  { icon: Building2, label: 'Apartments', value: 'APARTMENT' },
  { icon: LandPlot, label: 'Plots', value: 'PLOT' },
  { icon: Store, label: 'Commercial', value: 'COMMERCIAL' },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Analytics or any client-side initialization
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl text-center"
          >
            <Badge className="mb-4 bg-primary/10 text-primary">#1 Real Estate Platform in Pakistan</Badge>
            <h1 className="mb-4 text-4xl font-extrabold md:text-5xl lg:text-6xl">
              Find Your <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Dream Property</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Discover thousands of properties across Pakistan. Buy, sell, or rent with confidence.
            </p>
            <SearchFilters />
          </motion.div>
        </div>
      </section>

      {/* Quick Property Type Filter */}
      <section className="container mx-auto -mt-8 px-4">
        <div className="glass-card grid grid-cols-2 gap-4 p-4 md:grid-cols-4 md:p-6">
          {propertyTypes.map((type) => (
            <Button
              key={type.value}
              variant="ghost"
              className="flex h-auto flex-col items-center gap-2 p-4 hover:bg-primary/10 hover:text-primary"
            >
              <type.icon className="h-8 w-8" />
              <span className="text-sm font-medium">{type.label}</span>
            </Button>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card flex flex-col items-center gap-2 p-6 text-center"
            >
              <stat.icon className="h-8 w-8 text-primary" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Premium Listings Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Premium Listings</h2>
            <p className="text-muted-foreground">Handpicked luxury properties with premium features</p>
          </div>
          <Link href="/properties?filter=premium">
            <Button variant="ghost" className="gap-2">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProperties
            .filter((p) => p.isPremium)
            .map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
        </div>
      </section>

      {/* Featured Properties Slider */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Featured Properties</h2>
            <p className="text-muted-foreground">Most popular properties with extra visibility</p>
          </div>
          <Link href="/properties?filter=featured">
            <Button variant="ghost" className="gap-2">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProperties
            .filter((p) => p.isFeatured)
            .map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="glass-card bg-gradient-to-r from-primary/20 to-purple-600/20 p-8 md:p-12">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <h3 className="text-2xl font-bold">Ready to buy or sell?</h3>
              <p className="text-muted-foreground">
                Join thousands of satisfied customers on Deal.pk
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg">Start Your Search</Button>
              <Button size="lg" variant="outline">
                List Your Property
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
