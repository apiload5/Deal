import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRapidHash, validatePaymentStatus } from '@/features/payment/lib/rapidgateway'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { order_id, status, amount, signature } = body

    // Verify webhook signature
    const isValid = verifyRapidHash({ order_id, amount, status, signature })
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Find payment
    const payment = await prisma.payment.findUnique({
      where: { orderId: order_id },
      include: { agent: true },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Update payment status
    const isPaid = validatePaymentStatus(status)
    const paymentStatus = isPaid ? 'completed' : 'failed'

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        rapidStatus: status,
      },
    })

    // If payment is successful, update property
    if (isPaid && payment.propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: payment.propertyId },
      })

      if (property) {
        const updates: any = {}
        
        if (payment.type === 'premium' || payment.type === 'premium_7' || payment.type === 'premium_30') {
          updates.isPremium = true
          updates.premiumExpiresAt = new Date(
            Date.now() + (payment.type === 'premium_30' ? 30 : 7) * 24 * 60 * 60 * 1000
          )
        } else if (payment.type === 'featured' || payment.type === 'featured_7') {
          updates.isFeatured = true
          updates.featuredExpiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          )
        }

        await prisma.property.update({
          where: { id: property.id },
          data: updates,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
