import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { rapidGateway } from '@/lib/rapidgateway'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { amount, propertyId, customerEmail, customerName, customerPhone } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        agentProfile: true,
      },
    })

    if (!user?.agentProfile) {
      return NextResponse.json(
        { message: 'Agent profile not found' },
        { status: 400 }
      )
    }

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const payment = await prisma.payment.create({
      data: {
        agentId: user.agentProfile.id,
        propertyId: propertyId || null,
        amountRs: amount,
        orderId,
        type: propertyId ? 'featured' : 'premium',
        status: 'pending',
      },
    })

    const paymentResponse = await rapidGateway.createPayment({
      merchantId: process.env.RAPID_MERCHANT_ID || '',
      orderId,
      amount,
      currency: 'PKR',
      returnUrl: process.env.RAPID_RETURN_URL || '',
      cancelUrl: `${process.env.NEXTAUTH_URL}/payment/cancel`,
      customerEmail,
      customerName,
      customerPhone,
    })

    return NextResponse.json({
      orderId,
      paymentUrl: paymentResponse.paymentUrl,
    })
  } catch (error: any) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { message: error.message || 'Payment creation failed' },
      { status: 500 }
    )
  }
}
