import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
        { message: 'Agent profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user.agentProfile)
  } catch (error) {
    console.error('Error fetching agent profile:', error)
    return NextResponse.json(
      { message: 'Failed to fetch agent profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        agentProfile: true,
      },
    })

    if (!user?.agentProfile) {
      return NextResponse.json(
        { message: 'Agent profile not found' },
        { status: 404 }
      )
    }

    const agent = await prisma.agent.update({
      where: { id: user.agentProfile.id },
      data: {
        phone: body.phone,
        company: body.company,
        officeAddress: body.officeAddress,
        officePhone: body.officePhone,
        cnic: body.cnic,
      },
    })

    return NextResponse.json(agent)
  } catch (error: any) {
    console.error('Error updating agent profile:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to update agent profile' },
      { status: 500 }
    )
  }
}
