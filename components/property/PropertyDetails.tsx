'use client'

import { useState } from 'react'
import { ImageGallery } from './ImageGallery'
import { MapPin, BedDouble, Bath, Ruler, Share2, Heart, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/common/Button'

interface PropertyDetailsProps {
  id: string
  title: string
  price: number
  location: string
  beds: number
  baths: number
  area: number
  images: string[]
  description: string
  amenities: string[]
  agentName: string
  agentPhone: string
  agentEmail: string
}

export function PropertyDetails({
  title,
  price,
  location,
  beds,
  baths,
  area,
  images,
  description,
  amenities,
  agentName,
  agentPhone,
  agentEmail,
}: PropertyDetailsProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <ImageGallery images={images} />

          {/* Property Info */}
          <div className="mt-8 bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{title}</h1>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{location}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition">
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <Heart
                    className="w-5 h-5"
                    fill={isFavorite ? 'currentColor' : 'none'}
                    color={isFavorite ? '#ef4444' : '#999'}
                  />
                </button>
              </div>
            </div>

            <p className="text-4xl font-bold text-gradient-primary mb-6">
              Rs {price.toLocaleString()}
            </p>

            {/* Key Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-200 dark:border-gray-700">
              <div>
                <BedDouble className="w-6 h-6 text-primary-600 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Bedrooms</p>
                <p className="text-2xl font-bold">{beds}</p>
              </div>
              <div>
                <Bath className="w-6 h-6 text-primary-600 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Bathrooms</p>
                <p className="text-2xl font-bold">{baths}</p>
              </div>
              <div>
                <Ruler className="w-6 h-6 text-primary-600 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Area</p>
                <p className="text-2xl font-bold">{area} sqft</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{description}</p>
            </div>

            {/* Amenities */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Agent Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 sticky top-20">
            <h3 className="text-xl font-bold mb-4">Agent Information</h3>
            
            <div className="mb-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-full mb-3"></div>
              <h4 className="text-lg font-semibold">{agentName}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Property Agent</p>
            </div>

            <div className="space-y-3 mb-6">
              <a
                href={`tel:${agentPhone}`}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <Phone className="w-5 h-5" />
                <span>{agentPhone}</span>
              </a>
              <a
                href={`mailto:${agentEmail}`}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <Mail className="w-5 h-5" />
                <span>{agentEmail}</span>
              </a>
            </div>

            <Button className="w-full mb-3">Contact Agent</Button>
            <Button variant="secondary" className="w-full">Request Viewing</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
