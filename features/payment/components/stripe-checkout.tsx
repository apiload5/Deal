// features/payment/components/stripe-checkout.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface StripeCheckoutProps {
  plan: 'premium_7' | 'premium_30' | 'featured_7';
  amount: number;
  propertyId: string;
  agentId: string;
}

const PLANS = {
  premium_7: { label: 'Premium (7 days)', amount: 3000 },
  premium_30: { label: 'Premium (30 days)', amount: 8000 },
  featured_7: { label: 'Featured (7 days)', amount: 1500 },
};

export function StripeCheckout({ plan, amount, propertyId, agentId }: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          amount,
          propertyId,
          agentId,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Stripe checkout error:', error);
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={loading}
      className="w-full bg-gradient-to-r from-blue-600 to-blue-800"
    >
      {loading ? 'Processing...' : `Pay ${formatPrice(amount)}`}
    </Button>
  );
}
