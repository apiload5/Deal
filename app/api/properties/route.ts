import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: 'approved',
      },
      include: {
        agent: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { message: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        agentProfile: true,
      },
    })

    if (!user?.agentProfile) {
      return NextResponse.json(
        { message: 'Agent profile required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    const property = await prisma.property.create({
      data: {
        title: body.title,
        description: body.description,
        price: body.price,
        priceFormatted: `Rs ${body.price.toLocaleString()}`,
        city: body.city,
        area: body.area,
        propertyType: body.propertyType,
        purpose: body.purpose,
        beds: body.beds,
        baths: body.baths,
        areaSqft: body.areaSqft,
        furnished: body.furnished,
        floor: body.floor,
        builtYear: body.builtYear,
        images: body.images || ['/placeholder-property.jpg'],
        latitude: body.latitude,
        longitude: body.longitude,
        agentId: user.agentProfile.id,
        ownerId: user.id,
        status: 'pending',
      },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error: any) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to create property' },
      { status: 500 }
    )
  }
}
