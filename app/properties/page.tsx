// app/properties/page.tsx - Simplified
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Sample properties data for demo
const properties = [
  {
    id: '1',
    title: 'Luxury Villa in DHA Phase 8',
    price: 'Rs 2,50,00,000',
    location: 'Karachi, DHA Phase 8',
    image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    beds: 5,
    baths: 6,
    sqft: 4500,
    type: 'Villa',
    isPremium: true,
  },
  {
    id: '2',
    title: 'Modern Apartment in Gulberg',
    price: 'Rs 85,00,000',
    location: 'Lahore, Gulberg',
    image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    beds: 3,
    baths: 2,
    sqft: 1800,
    type: 'Apartment',
    isPremium: false,
  },
  {
    id: '3',
    title: 'House in F-6 Islamabad',
    price: 'Rs 1,20,00,000',
    location: 'Islamabad, F-6',
    image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    beds: 4,
    baths: 4,
    sqft: 3000,
    type: 'House',
    isPremium: false,
  },
];

export default function PropertiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Link key={property.id} href={`/property/${property.id}`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
              <div className="relative h-48 bg-gray-200">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                {property.isPremium && (
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ⭐ Premium
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg truncate">{property.title}</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {property.price}
                </p>
                <p className="text-sm text-gray-500 mt-1">{property.location}</p>
                <div className="flex items-center justify-between mt-3 text-sm text-gray-600 dark:text-gray-400">
                  <span>{property.beds} Beds</span>
                  <span>{property.baths} Baths</span>
                  <span>{property.sqft} sqft</span>
                </div>
                <Button className="w-full mt-4">View Details</Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
