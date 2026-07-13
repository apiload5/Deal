// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@deal.pk' },
    update: {},
    create: {
      email: 'admin@deal.pk',
      name: 'Admin',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  console.log(`✅ Created admin: ${admin.email}`)

  // 2. Create sample agent
  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@deal.pk' },
    update: {},
    create: {
      email: 'agent@deal.pk',
      name: 'Ahmed Khan',
      role: 'AGENT',
      emailVerified: new Date(),
      agent: {
        create: {
          phone: '03001234567',
          company: 'ABC Real Estate Agency',
          officeAddress: 'DHA Phase 6, Karachi',
          officePhone: '021-1234567',
          cnic: '42101-1234567-8',
          verified: true,
          rating: 4.8,
          totalReviews: 120,
        },
      },
    },
  })

  console.log(`✅ Created agent: ${agentUser.name}`)

  // 3. Create sample properties
  const sampleProperties = [
    {
      title: 'Luxury Villa in DHA Phase 6',
      description: 'Beautiful 4-bedroom luxury villa with pool and garden. Located in the heart of DHA Phase 6, Karachi.',
      price: 25000000,
      city: 'Karachi',
      area: 'DHA Phase 6',
      propertyType: 'HOUSE' as const,
      beds: 4,
      baths: 3,
      areaSqft: 5000,
      furnished: true,
      floor: 2,
      builtYear: 2023,
      latitude: 24.8000,
      longitude: 67.0400,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
      isPremium: true,
      premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isFeatured: true,
      status: 'APPROVED',
      agentId: agentUser.agent?.[0]?.id,
      views: 350,
    },
    {
      title: '3 Bedroom Flat in Clifton',
      description: 'Spacious 3-bedroom flat with sea view in Clifton Block 4, Karachi.',
      price: 15000000,
      city: 'Karachi',
      area: 'Clifton',
      propertyType: 'FLAT' as const,
      beds: 3,
      baths: 2,
      areaSqft: 2000,
      furnished: true,
      floor: 5,
      builtYear: 2021,
      latitude: 24.8130,
      longitude: 67.0300,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
      isPremium: false,
      isFeatured: false,
      status: 'APPROVED',
      agentId: agentUser.agent?.[0]?.id,
      views: 150,
    },
    {
      title: 'Commercial Plot in DHA Phase 8',
      description: 'Prime commercial plot in DHA Phase 8, Karachi. Perfect for retail or office space.',
      price: 35000000,
      city: 'Karachi',
      area: 'DHA Phase 8',
      propertyType: 'COMMERCIAL' as const,
      beds: 0,
      baths: 0,
      areaSqft: 1000,
      furnished: false,
      floor: 0,
      builtYear: 2024,
      latitude: 24.8700,
      longitude: 67.0750,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
      isPremium: true,
      premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'APPROVED',
      agentId: agentUser.agent?.[0]?.id,
      views: 200,
    },
  ]

  for (const prop of sampleProperties) {
    const property = await prisma.property.create({
      data: prop,
    })
    console.log(`✅ Created property: ${property.title}`)
  }

  // 4. Create blog posts
  const blogPost = await prisma.blog.create({
    data: {
      title: 'How to Buy Property in Pakistan',
      slug: 'how-to-buy-property-in-pakistan',
      content: 'Complete guide to buying property in Pakistan. Learn about legal requirements, documentation, and best practices.',
      image: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg',
      authorId: admin.id,
      status: 'PUBLISHED',
    },
  })
  console.log(`✅ Created blog: ${blogPost.title}`)

  // 5. Create area guide
  const areaGuide = await prisma.areaGuide.create({
    data: {
      city: 'Karachi',
      slug: 'karachi-area-guide',
      title: 'Karachi Area Guide',
      description: 'Everything you need to know about living in Karachi, Pakistan\'s largest city.',
      content: 'Comprehensive guide to Karachi\'s neighborhoods, real estate trends, and lifestyle.',
      image: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg',
      status: 'PUBLISHED',
    },
  })
  console.log(`✅ Created area guide: ${areaGuide.title}`)

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
