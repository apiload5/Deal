import { PrismaClient, Role, PropertyType, PropertyStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@deal.pk' },
    update: {},
    create: {
      email: 'admin@deal.pk',
      name: 'Admin User',
      password: adminPassword,
      role: Role.admin,
    },
  })

  // Create agent user
  const agentPassword = await hash('agent123', 10)
  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@deal.pk' },
    update: {},
    create: {
      email: 'agent@deal.pk',
      name: 'Agent User',
      password: agentPassword,
      role: Role.agent,
      agentProfile: {
        create: {
          phone: '+923001234567',
          company: 'Deal.pk Real Estate',
          cnic: '12345-1234567-1',
          verified: true,
        },
      },
    },
  })

  // Create sample properties
  const sampleProperties = [
    {
      title: 'Luxury Villa in DHA Phase 8',
      description: 'Beautiful 5-bedroom villa with swimming pool and garden in DHA Phase 8. Modern amenities, security, and prime location.',
      price: 45000000,
      priceFormatted: 'Rs 45,000,000',
      city: 'Karachi',
      area: 'DHA Phase 8',
      propertyType: PropertyType.HOUSE,
      purpose: 'sale',
      beds: 5,
      baths: 6,
      areaSqft: 5000,
      furnished: 'Fully Furnished',
      floor: 2,
      builtYear: 2022,
      images: ['/placeholder-property.jpg'],
      isPremium: true,
      isFeatured: true,
      status: PropertyStatus.approved,
      agentId: agentUser.agentProfile?.id || null,
    },
    {
      title: 'Modern Apartment in Bahria Town',
      description: 'Spacious 3-bedroom apartment with city view in Bahria Town. Close to shopping malls and schools.',
      price: 25000000,
      priceFormatted: 'Rs 25,000,000',
      city: 'Islamabad',
      area: 'Bahria Town',
      propertyType: PropertyType.APARTMENT,
      purpose: 'sale',
      beds: 3,
      baths: 3,
      areaSqft: 2000,
      furnished: 'Semi Furnished',
      floor: 5,
      builtYear: 2021,
      images: ['/placeholder-property.jpg'],
      isPremium: false,
      isFeatured: false,
      status: PropertyStatus.approved,
      agentId: agentUser.agentProfile?.id || null,
    },
    {
      title: 'Commercial Plot in Blue Area',
      description: 'Prime commercial plot in Blue Area, Islamabad. Perfect for office building or commercial complex.',
      price: 55000000,
      priceFormatted: 'Rs 55,000,000',
      city: 'Islamabad',
      area: 'Blue Area',
      propertyType: PropertyType.COMMERCIAL,
      purpose: 'sale',
      beds: null,
      baths: null,
      areaSqft: 3000,
      builtYear: null,
      images: ['/placeholder-property.jpg'],
      isPremium: true,
      isFeatured: false,
      status: PropertyStatus.approved,
      agentId: agentUser.agentProfile?.id || null,
    },
  ]

  for (const property of sampleProperties) {
    await prisma.property.create({
      data: property,
    })
  }

  console.log('✅ Seeding completed!')
  console.log(`📊 Created admin: admin@deal.pk`)
  console.log(`📊 Created agent: agent@deal.pk`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
