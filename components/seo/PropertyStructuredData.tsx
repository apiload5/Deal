// components/seo/PropertyStructuredData.tsx
"use client"

interface PropertyStructuredDataProps {
  property: {
    id: string
    title: string
    description: string
    price: number
    images: string[]
    beds: number
    baths: number
    area_sqft: number
    address: string
    lat: string
    lng: string
    created_at: string
    purpose: string
    property_type: string
    cities: {
      name: string
    }
  }
}

export function PropertyStructuredData({ property }: PropertyStructuredDataProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: property.title,
    description: property.description || `${property.beds} bed, ${property.baths} bath ${property.property_type} in ${property.cities?.name}`,
    image: property.images || [],
    brand: {
      '@type': 'Brand',
      name: 'deal.online',
    },
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'PKR',
      availability: 'https://schema.org/InStock',
      url: `https://deal.online/property/${property.id}`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '10',
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Bedrooms',
        value: property.beds,
      },
      {
        '@type': 'PropertyValue',
        name: 'Bathrooms',
        value: property.baths,
      },
      {
        '@type': 'PropertyValue',
        name: 'Area',
        value: `${property.area_sqft} sqft`,
      },
      {
        '@type': 'PropertyValue',
        name: 'Property Type',
        value: property.property_type,
      },
      {
        '@type': 'PropertyValue',
        name: 'Purpose',
        value: property.purpose === 'sale' ? 'For Sale' : 'For Rent',
      },
      {
        '@type': 'PropertyValue',
        name: 'Location',
        value: property.cities?.name,
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.cities?.name,
      addressCountry: 'PK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: property.lat,
      longitude: property.lng,
    },
    datePublished: property.created_at,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
