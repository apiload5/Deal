'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, Check, Star, Zap, Crown,
  Shield, TrendingUp, Users
} from 'lucide-react';

export default function PremiumPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const supabase = createClient();
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [propertyTitle, setPropertyTitle] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (propertyId) {
      supabase
        .from('properties')
        .select('title')
        .eq('id', propertyId)
        .single()
        .then(({ data }) => {
          if (data) setPropertyTitle(data.title);
        });
    }
  }, [user, loading, router, propertyId]);

  const handleUpgrade = async () => {
    if (!user || !propertyId) return;

    setLoadingPayment(true);

    // Mark property as premium
    const premiumUntil = new Date();
    premiumUntil.setDate(premiumUntil.getDate() + 30); // 30 days

    const { error } = await supabase
      .from('properties')
      .update({
        is_premium: true,
        premium_until: premiumUntil.toISOString(),
      })
      .eq('id', propertyId)
      .eq('owner_id', user.id);

    if (!error) {
      router.push(`/property/${propertyId}`);
    } else {
      alert('Failed to upgrade. Please try again.');
    }

    setLoadingPayment(false);
  };

  const features = [
    { icon: <Award className="h-5 w-5" />, title: 'Gold Badge', description: 'Premium badge on your listing' },
    { icon: <TrendingUp className="h-5 w-5" />, title: 'Top Search Results', description: 'Appear at the top of searches' },
    { icon: <Star className="h-5 w-5" />, title: 'Featured Listing', description: 'Highlighted as featured property' },
    { icon: <Zap className="h-5 w-5" />, title: 'Priority Support', description: 'Get priority customer support' },
    { icon: <Shield className="h-5 w-5" />, title: 'Premium Analytics', description: 'Advanced property insights' },
    { icon: <Users className="h-5 w-5" />, title: 'More Views', description: 'Get up to 5x more views' },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <Crown className="h-16 w-16 text-premium" />
          </div>
          <h1 className="mt-4 text-4xl font-bold">Premium Listings</h1>
          <p className="text-muted-foreground">
            Get your property seen by thousands of potential buyers
          </p>
        </div>

        {propertyTitle && (
          <Card className="mb-8 bg-premium-light/20">
            <CardContent className="p-4">
              <p className="text-center">
                Upgrading: <strong>"{propertyTitle}"</strong> to Premium
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          {/* Premium Plan */}
          <Card className="premium-border md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Premium Plan</CardTitle>
                <Badge className="bg-premium text-premium-dark">Best Value</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">PKR 999</span>
                <span className="text-muted-foreground"> / month</span>
              </div>

              <ul className="mb-6 space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 text-premium">{feature.icon}</div>
                    <div>
                      <p className="font-medium">{feature.title}</p>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full bg-premium text-premium-dark hover:bg-premium/90"
                onClick={handleUpgrade}
                disabled={loadingPayment || !propertyId}
                size="lg"
              >
                {loadingPayment ? (
                  'Processing...'
                ) : propertyId ? (
                  'Upgrade to Premium'
                ) : (
                  'Add a property first'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <h3 className="mb-4 text-center text-lg font-semibold">
                Why Choose Premium?
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="mb-2 text-3xl">🚀</div>
                  <p className="font-medium">5x More Views</p>
                  <p className="text-sm text-muted-foreground">
                    Premium listings get significantly more visibility
                  </p>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-3xl">⭐</div>
                  <p className="font-medium">Top Rankings</p>
                  <p className="text-sm text-muted-foreground">
                    Appear at the top of search results
                  </p>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-3xl">🏆</div>
                  <p className="font-medium">Trust & Credibility</p>
                  <p className="text-sm text-muted-foreground">
                    Premium badge builds trust with buyers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
