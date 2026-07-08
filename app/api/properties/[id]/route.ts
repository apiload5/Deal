import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        agent: { select: { id: true, company: true, phone: true, officeAddress: true, rating: true } }
      }
    })
    
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    await prisma.property.update({
      where: { id: params.id },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json({ success: true, data: property })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const property = await prisma.property.update({
      where: { id: params.id },
      data: body
    })
    return NextResponse.json({ success: true, data: property })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
