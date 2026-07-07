import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city')
    const type = searchParams.get('type')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const where: any = { status: 'approved' }
    
    if (city) where.city = city
    if (type) where.propertyType = type
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = Number(minPrice)
      if (maxPrice) where.price.lte = Number(maxPrice)
    }

    const properties = await prisma.property.findMany({
      where,
      orderBy: [
        { isPremium: 'desc' },
        { premiumExpiresAt: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        agent: { select: { id: true, company: true, phone: true } }
      },
      take: 50
    })

    return NextResponse.json({ success: true, data: properties })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const property = await prisma.property.create({
      data: {
        ...body,
        status: 'pending',
        priceFormatted: `Rs ${Number(body.price).toLocaleString('en-PK')}`
      }
    })
    return NextResponse.json({ success: true, data: property })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 })
  }
}
