import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Search, MapPin, Building, Users, Shield, DollarSign, ArrowRight, Home, TrendingUp, Sparkles, Award, Clock } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'

export default async function HomePage() {
  const featuredProperties = await prisma.property.findMany({
    where: {
      isFeatured: true,
      status: 'approved',
    },
    take: 6,
    include: {
      agent: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const stats = {
    properties: await prisma.property.count(),
    agents: await prisma.agent.count(),
    cities: await prisma.property.groupBy({
      by: ['city'],
      _count: true,
    }),
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section - Premium */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-background to-background" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 px-4 py-1.5 text-sm font-medium text-orange-500 mb-6">
                <Sparkles className="h-4 w-4" />
                Pakistan's #1 Property Platform
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl"
            >
              Find Your Dream{' '}
              <span className="gradient-text">Property</span>
              <br />
              in Pakistan
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Discover thousands of properties for sale and rent across Pakistan. 
              Connect with trusted agents and find your perfect home.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap justify-center gap-4"
            >
              <Link href="/properties">
                <Button size="lg" className="btn-premium text-base gap-2">
                  <Search className="h-5 w-5" />
                  Browse Properties
                </Button>
              </Link>
              <Link href="/map">
                <Button size="lg" variant="outline" className="text-base gap-2 rounded-full border-2">
                  <MapPin className="h-5 w-5" />
                  Map View
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4 max-w-3xl mx-auto"
            >
              {[
                { label: 'Properties', value: stats.properties, icon: Home },
                { label: 'Trusted Agents', value: stats.agents, icon: Users },
                { label: 'Cities', value: stats.cities.length, icon: MapPin },
                { label: 'Satisfaction', value: '100%', icon: Award },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gradient-to-b from-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold gradient-text">Featured Properties</h2>
              <p className="mt-2 text-muted-foreground">
                Handpicked properties for your dream lifestyle
              </p>
            </div>
            <Link href="/properties">
              <Button variant="outline" className="rounded-full gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/property/${property.id}`}>
                  <Card className="group h-full overflow-hidden rounded-2xl border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/10">
                    <CardHeader className="p-0 relative">
                      <div className="aspect-video w-full overflow-hidden rounded-t-2xl">
                        <img
                          src={property.images[0] || '/placeholder-property.jpg'}
                          alt={property.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute top-3 left-3 flex gap-1">
                        {property.isFeatured && (
                          <span className="rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 px-3 py-1 text-xs font-medium text-white">
                            Featured
                          </span>
                        )}
                        {property.isPremium && (
                          <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-medium text-white">
                            Premium
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-5">
                      <h3 className="line-clamp-1 text-lg font-semibold group-hover:text-orange-500 transition-colors">
                        {property.title}
                      </h3>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {property.city}, {property.area}
                      </p>
                      <p className="mt-2 text-2xl font-bold gradient-text">
                        {formatPrice(property.price)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {property.beds && (
                          <span className="flex items-center gap-1">
                            <span>🛏️</span> {property.beds}
                          </span>
                        )}
                        {property.baths && (
                          <span className="flex items-center gap-1">
                            <span>🚿</span> {property.baths}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span>📐</span> {property.areaSqft} sqft
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 section-gradient text-white">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold gradient-text">Why Choose Deal.pk?</h2>
            <p className="mt-2 text-muted-foreground">
              We make property buying and selling simple and secure
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: 'Secure Transactions',
                description: 'All transactions are secured and verified through our platform',
                color: 'from-emerald-500 to-green-500'
              },
              {
                icon: Users,
                title: 'Trusted Agents',
                description: 'Work with verified and trusted real estate agents',
                color: 'from-blue-500 to-indigo-500'
              },
              {
                icon: DollarSign,
                title: 'Fair Pricing',
                description: 'Transparent pricing with no hidden fees',
                color: 'from-purple-500 to-pink-500'
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/5 border-white/10 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/10">
                  <CardHeader>
                    <div className={`rounded-2xl bg-gradient-to-r ${item.color} p-3 w-fit`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{item.title}</CardTitle>
                    <CardDescription className="text-white/60">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-yellow-500/20 p-8 md:p-12 border border-white/10"
          >
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-yellow-500/20 blur-3xl" />
            
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white">
                Ready to Find Your Dream Home?
              </h2>
              <p className="mt-4 text-white/70">
                Join thousands of satisfied customers who found their perfect property through Deal.pk
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/properties">
                  <Button size="lg" className="btn-premium text-base">
                    Browse Properties
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" variant="outline" className="text-base rounded-full border-white/20 text-white hover:bg-white/10">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
