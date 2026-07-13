import { PrismaClient, PropertyType, PropertyStatus, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const seedData = {
  users: [
    {
      email: 'admin@deal.pk',
      name: 'Admin User',
      role: Role.admin,
      password: 'admin123',
    },
    {
      email: 'agent1@deal.pk',
      name: 'Ali Khan',
      role: Role.agent,
      password: 'agent123',
    },
    {
      email: 'agent2@deal.pk',
      name: 'Sara Ahmed',
      role: Role.agent,
      password: 'agent123',
    },
  ],
  properties: [
    {
      title: 'Luxury Villa with Ocean View',
      description: 'Stunning 5-bedroom villa with panoramic ocean views, private pool, and modern amenities. Located in the heart of Clifton.',
      price: 45000000,
      city: 'Karachi',
      area: 'Clifton',
      propertyType: PropertyType.HOUSE,
      purpose: 'sale',
      beds: 5,
      baths: 6,
      areaSqft: 5000,
      furnished: 'Fully Furnished',
      floor: 2,
      builtYear: 2022,
      images: [
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800',
        'https://images.unsplash.com/photo-1600607687920-4e2a09a6d8b6?w=800',
      ],
      videoUrl: 'https://www.youtube.com/watch?v=example',
      videoPlatform: 'youtube',
      latitude: 24.8138,
      longitude: 67.0294,
      isPremium: true,
      isFeatured: true,
    },
    {
      title: 'Modern Apartment in DHA Phase 5',
      description: 'Spacious 3-bedroom apartment with premium finishes, 24/7 security, and access to community amenities.',
      price: 12000000,
      city: 'Lahore',
      area: 'DHA Phase 5',
      propertyType: PropertyType.APARTMENT,
      purpose: 'sale',
      beds: 3,
      baths: 2,
      areaSqft: 2500,
      furnished: 'Semi Furnished',
      floor: 4,
      builtYear: 2021,
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800',
      ],
      latitude: 31.4422,
      longitude: 74.2939,
      isPremium: true,
    },
    {
      title: 'Commercial Plaza in Blue Area',
      description: 'Prime commercial property with 8,000 sqft of space, ideal for retail, offices, or restaurant. High foot traffic area.',
      price: 25000000,
      city: 'Islamabad',
      area: 'Blue Area',
      propertyType: PropertyType.COMMERCIAL,
      purpose: 'sale',
      beds: 0,
      baths: 0,
      areaSqft: 8000,
      furnished: 'Unfurnished',
      builtYear: 2019,
      images: [
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
        'https://images.unsplash.com/photo-1560518883-5725e4f9b9e9?w=800',
      ],
      latitude: 33.6938,
      longitude: 73.0651,
      isFeatured: true,
    },
    {
      title: 'Beautiful Farm House in Bahria Town',
      description: 'Escape to luxury with this stunning farm house on 2 kanals of land. Perfect for weekend getaways and family gatherings.',
      price: 18000000,
      city: 'Lahore',
      area: 'Bahria Town',
      propertyType: PropertyType.FARM_HOUSE,
      purpose: 'sale',
      beds: 4,
      baths: 4,
      areaSqft: 12000,
      furnished: 'Fully Furnished',
      builtYear: 2020,
      images: [
        'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
        'https://images.unsplash.com/photo-1583608205724-50f9e36e5e2a?w=800',
      ],
      latitude: 31.4614,
      longitude: 74.2576,
    },
    {
      title: 'Luxury Apartment in Emaar',
      description: 'Premium 4-bedroom apartment with breathtaking views of the city skyline. Modern amenities and 24/7 concierge service.',
      price: 32000000,
      city: 'Karachi',
      area: 'Emaar',
      propertyType: PropertyType.APARTMENT,
      purpose: 'rent',
      beds: 4,
      baths: 3,
      areaSqft: 3200,
      furnished: 'Fully Furnished',
      floor: 15,
      builtYear: 2023,
      images: [
        'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800',
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
      ],
      latitude: 24.8124,
      longitude: 67.0348,
      isPremium: true,
    },
    {
      title: 'Residential Plot in Gulberg',
      description: 'Prime residential plot in the heart of Gulberg. Perfect for building your dream home. Close to schools, hospitals, and shopping malls.',
      price: 8500000,
      city: 'Lahore',
      area: 'Gulberg',
      propertyType: PropertyType.PLOT,
      purpose: 'sale',
      beds: 0,
      baths: 0,
      areaSqft: 2000,
      furnished: 'Unfurnished',
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      ],
      latitude: 31.5133,
      longitude: 74.3351,
    },
    {
      title: 'Modern Office Space in F-10',
      description: 'Contemporary office space ideal for startups and growing businesses. Fully equipped with high-speed internet and modern facilities.',
      price: 6500000,
      city: 'Islamabad',
      area: 'F-10',
      propertyType: PropertyType.COMMERCIAL,
      purpose: 'rent',
      beds: 0,
      baths: 2,
      areaSqft: 1500,
      furnished: 'Fully Furnished',
      floor: 2,
      builtYear: 2022,
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
      ],
      latitude: 33.7192,
      longitude: 73.0348,
    },
    {
      title: 'Luxury Penthouse in Karachi',
      description: 'Exclusive penthouse with panoramic views of the Arabian Sea. Features 5 bedrooms, private terrace, and infinity pool.',
      price: 55000000,
      city: 'Karachi',
      area: 'Defence',
      propertyType: PropertyType.HOUSE,
      purpose: 'sale',
      beds: 5,
      baths: 5,
      areaSqft: 6000,
      furnished: 'Fully Furnished',
      floor: 18,
      builtYear: 2023,
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800',
      ],
      latitude: 24.8055,
      longitude: 67.0394,
      isPremium: true,
      isFeatured: true,
    },
    {
      title: 'Spacious Family Home in Phase 7',
      description: 'Ideal family home with 4 bedrooms, large garden, and community facilities. Safe and family-friendly neighborhood.',
      price: 9500000,
      city: 'Lahore',
      area: 'Phase 7',
      propertyType: PropertyType.HOUSE,
      purpose: 'sale',
      beds: 4,
      baths: 3,
      areaSqft: 3500,
      furnished: 'Semi Furnished',
      builtYear: 2020,
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      ],
      latitude: 31.4562,
      longitude: 74.2835,
    },
    {
      title: 'Investment Plot in Sector I-8',
      description: 'Excellent investment opportunity in the growing sector I-8. Ideal for future residential or commercial development.',
      price: 7500000,
      city: 'Islamabad',
      area: 'I-8',
      propertyType: PropertyType.PLOT,
      purpose: 'sale',
      beds: 0,
      baths: 0,
      areaSqft: 1800,
      furnished: 'Unfurnished',
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      ],
      latitude: 33.6751,
      longitude: 73.0757,
    },
  ],
}

async function main() {
  console.log('🌱 Starting seed...')

  for (const userData of seedData.users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        password: hashedPassword,
      },
    })
  }
  console.log('✅ Users seeded')

  // Get agent users
  const agents = await prisma.user.findMany({
    where: { role: Role.agent },
  })

  for (const [index, propertyData] of seedData.properties.entries()) {
    const agent = agents[index % agents.length]
    
    await prisma.property.create({
      data: {
        ...propertyData,
        priceFormatted: `Rs ${propertyData.price.toLocaleString('en-PK')}`,
        agentId: agent?.id ? (await prisma.agent.findUnique({
          where: { userId: agent.id },
        }))?.id : undefined,
        ownerId: agent?.id,
        status: PropertyStatus.approved,
      },
    })
  }
  console.log('✅ Properties seeded')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
