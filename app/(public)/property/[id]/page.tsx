'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  Calendar, 
  Home,
  Building2,
  Phone,
  Mail,
  MessageCircle,
  QrCode,
  Download,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPKR, formatDate } from '@/lib/utils'
import { MortgageCalculator } from '@/features/mortgage/components/MortgageCalculator'
import dynamic from 'next/dynamic'

// Dynamic imports for client-side only components
const VideoPlayer = dynamic(
  () => import('@/features/video-embed/components/VideoPlayer'),
  { ssr: false, loading: () => <div className="aspect-video animate-pulse bg-muted rounded-lg" /> }
)

const MapView = dynamic(
  () => import('@/features/map/components/MapView'),
  { ssr: false, loading: () => <div className="h-[400px] animate-pulse bg-muted rounded-lg" /> }
)

// Mock data - will be replaced with real API call
const mockProperty = {
  id: '1',
  title: 'Luxury Villa with Ocean View',
  description: 'Stunning 5-bedroom villa with panoramic ocean views, private pool, and modern amenities. Located in the heart of Clifton, this property offers the perfect blend of luxury and comfort. The villa features high-end finishes, spacious rooms, and state-of-the-art security systems.',
  price: 45000000,
  city: 'Karachi',
  area: 'Clifton',
  propertyType: 'HOUSE',
  purpose: 'sale',
  beds: 5,
  baths: 6,
  areaSqft: 5000,
  furnished: 'Fully Furnished',
  floor: 2,
  builtYear: 2022,
  images: [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200',
    'https://images.unsplash.com/photo-1600607687920-4e2a09a6d8b6?w=1200',
  ],
  videoUrl: 'https://www.youtube.com/watch?v=example',
  videoPlatform: 'youtube',
  latitude: 24.8138,
  longitude: 67.0294,
  isPremium: true,
  isFeatured: true,
  views: 1234,
  whatsappClicks: 56,
  agent: {
    id: 'agent1',
    name: 'Ali Khan',
    email: 'ali@deal.pk',
    phone: '+92 300 1234567',
    company: 'Deal Real Estate',
    rating: 4.8,
    totalReviews: 45,
    totalDealsCompleted: 128,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  createdAt: '2024-01-15',
}

export default function PropertyDetailPage() {
  const params = useParams()
  const [property, setProperty] = useState(mockProperty)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    // Fetch property data
    const fetchProperty = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProperty(mockProperty)
      setIsLoading(false)
    }
    fetchProperty()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="h-[500px] animate-pulse bg-muted rounded-lg" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-12 w-3/4 animate-pulse bg-muted rounded" />
              <div className="h-6 w-1/2 animate-pulse bg-muted rounded" />
              <div className="h-32 animate-pulse bg-muted rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-48 animate-pulse bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const shareProperty = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const getWhatsAppMessage = () => {
    return `Hi! I'm interested in this property:\n${property.title}\nPrice: ${formatPKR(property.price)}\nLocation: ${property.area}, ${property.city}\nLink: ${window.location.href}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Image Gallery */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative mb-8 overflow-hidden rounded-2xl glass-card"
      >
        <div className="relative h-[500px] w-full">
          <Image
            src={property.images[selectedImage] || property.images[0]}
            alt={property.title}
            fill
            className="object-cover"
            priority
          />
          {property.isPremium && (
            <Badge className="premium-badge absolute left-4 top-4 z-10 text-sm">
              Premium
            </Badge>
          )}
          {property.isFeatured && (
            <Badge className="featured-badge absolute right-4 top-4 z-10 text-sm">
              Featured
            </Badge>
          )}
          <div className="absolute right-4 top-20 z-10 flex flex-col gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={isLiked ? 'fill-red-500 text-red-500' : ''} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
              onClick={shareProperty}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto p-4">
          {property.images.map((image, index) => (
            <button
              key={index}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                selectedImage === index ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
              }`}
              onClick={() => setSelectedImage(index)}
            >
              <Image src={image} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title & Price */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{property.title}</h1>
                <p className="flex items-center gap-1 text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4" />
                  {property.area}, {property.city}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{formatPKR(property.price)}</p>
                <p className="text-sm text-muted-foreground">For {property.purpose}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{property.propertyType.replace('_', ' ')}</Badge>
              <Badge variant="outline">Built {property.builtYear}</Badge>
              <Badge variant="outline">{property.furnished}</Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {property.views} views
              </Badge>
            </div>
          </motion.div>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Bed className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Beds</p>
                  <p className="font-semibold">{property.beds}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Bath className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Baths</p>
                  <p className="font-semibold">{property.baths}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Maximize className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Area</p>
                  <p className="font-semibold">{property.areaSqft.toLocaleString()} sqft</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Built</p>
                  <p className="font-semibold">{property.builtYear}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="mb-4 text-2xl font-semibold">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{property.description}</p>
          </motion.div>

          {/* Video Tour */}
          {property.videoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="mb-4 text-2xl font-semibold">Video Tour</h2>
              <VideoPlayer url={property.videoUrl} platform={property.videoPlatform} />
            </motion.div>
          )}

          {/* Map */}
          {property.latitude && property.longitude && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="mb-4 text-2xl font-semibold">Location</h2>
              <MapView
                latitude={property.latitude}
                longitude={property.longitude}
                title={property.title}
              />
            </motion.div>
          )}

          {/* Mortgage Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MortgageCalculator price={property.price} />
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <h3 className="mb-4 font-semibold">Agent Information</h3>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full">
                <Image
                  src={property.agent.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'}
                  alt={property.agent.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-semibold">{property.agent.name}</p>
                <p className="text-sm text-muted-foreground">{property.agent.company}</p>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-yellow-500">★</span>
                  <span>{property.agent.rating}</span>
                  <span className="text-muted-foreground">
                    ({property.agent.totalReviews} reviews)
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Button className="w-full gap-2" asChild>
                <a href={`tel:${property.agent.phone}`}>
                  <Phone className="h-4 w-4" /> Call Now
                </a>
              </Button>
              <Button variant="outline" className="w-full gap-2" asChild>
                <a href={`mailto:${property.agent.email}`}>
                  <Mail className="h-4 w-4" /> Email Agent
                </a>
              </Button>
              <Button
                variant="default"
                className="w-full gap-2 bg-green-500 hover:bg-green-600"
                asChild
              >
                <a
                  href={`https://wa.me/${property.agent.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    getWhatsAppMessage()
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="mb-4 font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full gap-2" onClick={shareProperty}>
                <Share2 className="h-4 w-4" /> Share Property
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <QrCode className="h-4 w-4" /> Show QR Code
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" /> Download Brochure
              </Button>
            </div>
          </motion.div>

          {/* AdSense */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="h-[250px] w-full bg-muted rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">AdSpace</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
