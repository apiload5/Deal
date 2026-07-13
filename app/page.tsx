// app/page.tsx - ZAMEEN.COM STYLE
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { SearchBar } from '@/components/shared/SearchBar'
import { PropertyCard } from '@/components/shared/PropertyCard'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Home, Building2, Store, Calculator, 
  Ruler, TrendingUp, Star, ArrowRight,
  Download, AppStore, PlayCircle
} from 'lucide-react'

export default async function HomePage() {
  // Fetch properties
  const { data: properties } = await supabase
    .from('properties')
    .select('*, cities(name)')
    .eq('status', 'active')
    .limit(6)

  // Fetch cities
  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .order('total_properties', { ascending: false })
    .limit(8)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section with Tabs */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Search properties for sale in Pakistan
          </h1>
          
          <Tabs defaultValue="buy" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 bg-white/20 backdrop-blur-sm">
              <TabsTrigger value="buy" className="text-white data-[state=active]:bg-white data-[state=active]:text-green-600">
                <Home className="h-4 w-4 mr-2" />
                BUY
              </TabsTrigger>
              <TabsTrigger value="rent" className="text-white data-[state=active]:bg-white data-[state=active]:text-green-600">
                <Building2 className="h-4 w-4 mr-2" />
                RENT
              </TabsTrigger>
              <TabsTrigger value="projects" className="text-white data-[state=active]:bg-white data-[state=active]:text-green-600">
                <TrendingUp className="h-4 w-4 mr-2" />
                PROJECTS
              </TabsTrigger>
            </TabsList>
            <TabsContent value="buy" className="mt-4">
              <SearchBar />
            </TabsContent>
            <TabsContent value="rent" className="mt-4">
              <SearchBar />
            </TabsContent>
            <TabsContent value="projects" className="mt-4">
              <SearchBar />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Browse Properties Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Browse Properties</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Homes */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Home className="h-8 w-8 text-green-600" />
                <h3 className="text-xl font-semibold">Homes</h3>
              </div>
              <div className="space-y-2">
                <Link href="/properties?type=house&size=5-marla" className="block text-gray-600 hover:text-green-600">
                  5 Marla Houses →
                </Link>
                <Link href="/properties?type=house&size=10-marla" className="block text-gray-600 hover:text-green-600">
                  10 Marla Houses →
                </Link>
                <Link href="/properties?type=house&size=1-kanal" className="block text-gray-600 hover:text-green-600">
                  1 Kanal Houses →
                </Link>
              </div>
            </div>

            {/* Plots */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
                <h3 className="text-xl font-semibold">Plots</h3>
              </div>
              <div className="space-y-2">
                <Link href="/properties?type=plot&size=5-marla" className="block text-gray-600 hover:text-green-600">
                  5 Marla Residential →
                </Link>
                <Link href="/properties?type=plot&size=10-marla" className="block text-gray-600 hover:text-green-600">
                  10 Marla Residential →
                </Link>
                <Link href="/properties?type=plot&size=1-kanal" className="block text-gray-600 hover:text-green-600">
                  1 Kanal Residential →
                </Link>
              </div>
            </div>

            {/* Commercial */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Store className="h-8 w-8 text-orange-600" />
                <h3 className="text-xl font-semibold">Commercial</h3>
              </div>
              <div className="space-y-2">
                <Link href="/properties?type=commercial&purpose=shop" className="block text-gray-600 hover:text-green-600">
                  New Shops →
                </Link>
                <Link href="/properties?type=commercial&purpose=office" className="block text-gray-600 hover:text-green-600">
                  New Offices →
                </Link>
                <Link href="/properties?type=commercial&purpose=rent" className="block text-gray-600 hover:text-green-600">
                  Running Shops →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Explore more on deal.pk</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/tools/area-converter" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition flex items-center gap-3">
              <Ruler className="h-6 w-6 text-green-600" />
              <span>Area Unit Converter</span>
            </Link>
            <Link href="/tools/construction-cost" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition flex items-center gap-3">
              <Calculator className="h-6 w-6 text-blue-600" />
              <span>Construction Cost Calculator</span>
            </Link>
            <Link href="/tools/loan-calculator" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition flex items-center gap-3">
              <Calculator className="h-6 w-6 text-orange-600" />
              <span>Home Loan Calculator</span>
            </Link>
            <Link href="/properties/plots" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition flex items-center gap-3">
              <Building2 className="h-6 w-6 text-purple-600" />
              <span>Plot Finder</span>
            </Link>
            <Link href="/projects/new" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-red-600" />
              <span>New Projects</span>
            </Link>
            <Link href="/agents/top" className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition flex items-center gap-3">
              <Star className="h-6 w-6 text-yellow-600" />
              <span>Top Agents</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Top Real Estate Agents</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Agent 1', 'Agent 2', 'Agent 3', 'Agent 4'].map((agent, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-4 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-600">A</span>
                </div>
                <h4 className="font-semibold">{agent}</h4>
                <p className="text-sm text-gray-500">Islamabad</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm">4.8</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Banner */}
      <section className="py-12 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">📱 deal.pk Mobile App Launched!</h2>
          <p className="text-lg mb-8 opacity-90">Download the app now for the best real estate experience</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-green-700 hover:bg-gray-100 h-12 px-8">
              <AppStore className="h-5 w-5 mr-2" />
              App Store
            </Button>
            <Button className="bg-white text-green-700 hover:bg-gray-100 h-12 px-8">
              <PlayCircle className="h-5 w-5 mr-2" />
              Google Play
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
