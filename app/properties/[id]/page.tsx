'use client'

import { PropertyDetails } from '@/components/property/PropertyDetails'

interface PropertyPageProps {
  params: {
    id: string
  }
}

export default function PropertyPage({ params }: PropertyPageProps) {
  // TODO: Fetch property details from API using params.id
  const property = {
    id: params.id,
    title: 'Modern 3 Bedroom Apartment in DHA',
    price: 5000000,
    location: 'DHA Phase 5, Karachi',
    beds: 3,
    baths: 2,
    area: 2500,
    images: [
      'https://images.unsplash.com/photo-1580587771525-78991c7bde8d?w=1000&h=800&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1000&h=800&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&h=800&fit=crop',
      'https://images.unsplash.com/photo-1495882894008-e5488da97aee?w=1000&h=800&fit=crop',
    ],
    description:
      'Beautiful modern apartment located in the heart of DHA Phase 5. This luxurious 3-bedroom apartment features state-of-the-art amenities, spacious rooms, and a spectacular view of the city. Perfect for families looking for a premium lifestyle.',
    amenities: [
      'Air Conditioning',
      'Modern Kitchen',
      'Balcony',
      'Parking',
      'Security',
      'Gym',
      'Swimming Pool',
      'Garden',
      'Servant Quarters',
      'Study Room',
    ],
    agentName: 'Ahmed Khan',
    agentPhone: '+92-300-1234567',
    agentEmail: 'ahmed.khan@deal.pk',
  }

  return <PropertyDetails {...property} />
}
