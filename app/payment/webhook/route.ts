import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, status, amount, transactionId } = body

    // Verify webhook signature (implement your verification logic)
    // const isValid = verifyWebhookSignature(request)
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const payment = await prisma.payment.update({
      where: { orderId },
      data: {
        status: status === 'success' ? 'completed' : 'failed',
        rapidStatus: status,
      },
    })

    // If payment is for premium/featured property
    if (payment.propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: payment.propertyId },
      })

      if (property) {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

        await prisma.property.update({
          where: { id: payment.propertyId },
          data: {
            isPremium: payment.type === 'premium',
            isFeatured: payment.type === 'featured',
            premiumExpiresAt: payment.type === 'premium' ? expiresAt : undefined,
            featuredExpiresAt: payment.type === 'featured' ? expiresAt : undefined,
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
