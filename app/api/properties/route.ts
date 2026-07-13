import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const propertySchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  price: z.number().positive(),
  city: z.string().min(1),
  area: z.string().min(1),
  propertyType: z.string().min(1),
  purpose: z.string().min(1),
  beds: z.number().optional(),
  baths: z.number().optional(),
  areaSqft: z.number().positive(),
  furnished: z.string().optional(),
  floor: z.number().optional(),
  builtYear: z.number().optional(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validated = propertySchema.parse(body)

    // Check if user is an agent
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json(
        { error: 'Only agents can list properties' },
        { status: 403 }
      )
    }

    const property = await prisma.property.create({
      data: {
        ...validated,
        priceFormatted: `Rs ${validated.price.toLocaleString('en-PK')}`,
        agentId: agent.id,
        ownerId: session.user.id,
        images: validated.images || [],
        status: 'pending',
      },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city')
    const type = searchParams.get('type')
    const purpose = searchParams.get('purpose')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const q = searchParams.get('q')

    const where: any = {
      status: 'approved',
    }

    if (city && city !== 'All Cities') {
      where.city = city
    }

    if (type && type !== 'All Types') {
      where.propertyType = type
    }

    if (purpose && purpose !== 'All Purposes') {
      where.purpose = purpose.toLowerCase()
    }

    if (minPrice) {
      where.price = { gte: parseInt(minPrice) }
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: parseInt(maxPrice) }
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { area: { contains: q, mode: 'insensitive' } },
      ]
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        agent: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
