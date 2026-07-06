// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@deal.pk' },
    update: {},
    create: {
      email: 'admin@deal.pk',
      name: 'Admin',
      password: adminPassword,
      role: 'admin',
    },
  });

  // Sample properties
  const properties = [
    {
      title: 'Luxury 5 Bedroom Villa in DHA Phase 8',
      slug: 'luxury-5-bedroom-villa-dha-phase-8',
      description: 'Stunning luxury villa with modern amenities, pool, and garden in DHA Phase 8, Karachi.',
      price: 25000000,
      priceFormatted: 'Rs 2,50,00,000',
      city: 'Karachi',
      area: 'DHA Phase 8',
      propertyType: 'Villa',
      beds: 5,
      baths: 6,
      areaSqft: 4500,
      furnished: true,
      floor: 2,
      builtYear: 2023,
      images: [
        'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg',
        'https://res.cloudinary.com/demo/image/upload/v2/sample.jpg',
      ],
      latitude: 24.8607,
      longitude: 67.0011,
      isPremium: true,
      isFeatured: true,
      status: 'approved',
    },
    {
      title: 'Modern 3 Bedroom Apartment in Gulberg',
      slug: 'modern-3-bedroom-apartment-gulberg',
      description: 'Contemporary apartment with city views in the heart of Gulberg, Lahore.',
      price: 8500000,
      priceFormatted: 'Rs 85,00,000',
      city: 'Lahore',
      area: 'Gulberg',
      propertyType: 'Apartment',
      beds: 3,
      baths: 2,
      areaSqft: 1800,
      furnished: true,
      floor: 7,
      builtYear: 2022,
      images: [
        'https://res.cloudinary.com/demo/image/upload/v3/sample.jpg',
      ],
      latitude: 31.5204,
      longitude: 74.3587,
      status: 'approved',
    },
    {
      title: '4 Bedroom House in F-6 Islamabad',
      slug: '4-bedroom-house-f6-islamabad',
      description: 'Spacious house with garden in the prestigious F-6 sector, Islamabad.',
      price: 12000000,
      priceFormatted: 'Rs 1,20,00,000',
      city: 'Islamabad',
      area: 'F-6',
      propertyType: 'House',
      beds: 4,
      baths: 4,
      areaSqft: 3000,
      furnished: false,
      floor: 1,
      builtYear: 2021,
      images: [
        'https://res.cloudinary.com/demo/image/upload/v4/sample.jpg',
      ],
      latitude: 33.6844,
      longitude: 73.0479,
      status: 'approved',
    },
    {
      title: '2 Bedroom Apartment in Clifton',
      slug: '2-bedroom-apartment-clifton',
      description: 'Sea view apartment in Clifton, Karachi with all modern facilities.',
      price: 4500000,
      priceFormatted: 'Rs 45,00,000',
      city: 'Karachi',
      area: 'Clifton',
      propertyType: 'Apartment',
      beds: 2,
      baths: 2,
      areaSqft: 1200,
      furnished: true,
      floor: 12,
      builtYear: 2023,
      images: [
        'https://res.cloudinary.com/demo/image/upload/v5/sample.jpg',
      ],
      latitude: 24.8103,
      longitude: 67.0311,
      status: 'approved',
    },
    {
      title: 'Luxury Farmhouse in Bahria Town',
      slug: 'luxury-farmhouse-bahria-town',
      description: 'Exclusive farmhouse with pool and large garden in Bahria Town, Rawalpindi.',
      price: 35000000,
      priceFormatted: 'Rs 3,50,00,000',
      city: 'Rawalpindi',
      area: 'Bahria Town',
      propertyType: 'Farmhouse',
      beds: 6,
      baths: 7,
      areaSqft: 8000,
      furnished: true,
      floor: 1,
      builtYear: 2023,
      images: [
        'https://res.cloudinary.com/demo/image/upload/v6/sample.jpg',
      ],
      latitude: 33.5651,
      longitude: 73.0169,
      isPremium: true,
      status: 'approved',
    },
    {
      title: '3 Bedroom House in Model Town',
      slug: '3-bedroom-house-model-town',
      description: 'Well-maintained house in Model Town, Lahore with modern interiors.',
      price: 6500000,
      priceFormatted: 'Rs 65,00,000',
      city: 'Lahore',
      area: 'Model Town',
      propertyType: 'House',
      beds: 3,
      baths: 3,
      areaSqft: 2200,
      furnished: false,
      floor: 1,
      builtYear: 2020,
      images: [
        'https://res.cloudinary.com/demo/image/upload/v7/sample.jpg',
      ],
      latitude: 31.4737,
      longitude: 74.3505,
      status: 'approved',
    },
    {
      title: '2 Bedroom Flat in G-10 Islamabad',
      slug: '2-bedroom-flat-g10-islamabad',
      description: 'Affordable flat in G-10 sector, Islamabad with easy access to city center.',
      price: 3800000,
      priceFormatted: 'Rs 38,00,000',
      city: 'Islamabad',
      area: 'G-10',
      propertyType: 'Flat',
      beds: 2,
      baths: 2,
      areaSqft: 1000,
      furnished: false,
      floor: 5,
      builtYear: 2021,
      images: [
        'https://res.cloudinary.com/demo/image/upload/v8/sample.jpg',
      ],
      latitude: 33.6844,
      longitude: 73.0479,
      status: 'approved',
    },
    {
      title: 'Penthouse in E-11 Islamabad',
      slug: 'penthouse-e11-islamabad',
      description: 'Luxury penthouse with rooftop access and city views in E-11, Islamabad.',
      price: 18000000,
      priceFormatted: 'Rs 1,80,00,000',
      city: 'Islamabad',
      area: 'E-11',
      propertyType: 'Penthouse',
      beds: 4,
      baths: 4,
      areaSqft: 3500,
      furnished: true,
      floor: 10,
      builtYear: 2023,
      images: [
        'https://res.cloudinary.com/demo/image/upload/v9/sample.jpg',
      ],
      latitude: 33.6844,
      longitude: 73.0479,
      isFeatured: true,
      status: 'approved',
    },
    {
      title: 'Commercial Shop in Saddar',
      slug: 'commercial-shop-saddar',
      description: 'Prime commercial shop in Saddar, Karachi with high foot traffic.',
      price: 22000000,
      priceFormatted: 'Rs 2,20,00,000',
      city: 'Karachi',
      area: 'Saddar',
      propertyType: 'Commercial',
      beds: 0,
      baths: 1,
      areaSqft: 500,
      furnished: false,
      floor: 0,
      builtYear: 2019,
      images: [
        'https://res.cloudinary.com/demo/image/upload/v10/sample.jpg',
      ],
      latitude: 24.8607,
      longitude: 67.0011,
      status: 'approved',
    },
    {
      title: '4 Bedroom Villa in DHA Lahore',
      slug: '4-bedroom-villa-dha-lahore',
      description: 'Beautiful villa in DHA Lahore with park view and modern amenities.',
      price: 15000000,
      priceFormatted: 'Rs 1,50,00,000',
      city: 'Lahore',
      area: 'DHA Lahore',
      propertyType: 'Villa',
      beds: 4,
      baths: 4,
      areaSqft: 3500,
      furnished: true,
      floor: 2,
      builtYear: 2022,
      images: [
        'https://res.cloudinary.com/demo/image/upload/v11/sample.jpg',
      ],
      latitude: 31.4737,
      longitude: 74.3505,
      isPremium: true,
      status: 'approved',
    },
  ];

  for (const prop of properties) {
    await prisma.property.upsert({
      where: { slug: prop.slug },
      update: {},
      create: {
        ...prop,
        ownerId: admin.id,
      },
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
