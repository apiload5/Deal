// app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Update property premium status
      if (session.metadata?.propertyId) {
        await prisma.property.update({
          where: { id: session.metadata.propertyId },
          data: {
            isPremium: true,
            premiumExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      // Create payment record
      await prisma.payment.create({
        data: {
          agentId: session.metadata?.agentId || '',
          propertyId: session.metadata?.propertyId,
          amount: session.amount_total || 0,
          amountRs: session.currency || 'rs',
          type: session.metadata?.plan === 'featured_7' ? 'featured' : 'premium',
          stripePaymentId: session.id,
          status: 'completed',
        },
      });

      break;
    }
  }

  return NextResponse.json({ received: true });
}
