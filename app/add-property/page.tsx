'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import AddPropertyForm from '@/components/forms/AddPropertyForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AddPropertyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  if (!loading && !user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (formData: any) => {
    const supabase = createClient();
    setError(null);

    try {
      // Insert property
      const { data, error: insertError } = await supabase
        .from('properties')
        .insert({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          city_id: formData.city_id,
          area_sqft: formData.area_sqft,
          beds: formData.beds,
          baths: formData.baths,
          property_type: formData.property_type,
          purpose: formData.purpose,
          address: formData.address,
          images: formData.images,
          tiktok_video_url: formData.tiktok_video_url,
          owner_id: user.id,
          owner_whatsapp: formData.owner_whatsapp,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Send admin email notification via Resend
      try {
        await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId: data.id,
            title: data.title,
            price: data.price,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }

      // If premium is selected, redirect to premium page
      if (formData.upgradeToPremium) {
        router.push(`/premium?propertyId=${data.id}`);
      } else {
        router.push(`/property/${data.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add property. Please try again.');
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add Your Property</CardTitle>
          <CardDescription>
            List your property on deal.online and reach thousands of potential buyers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <AddPropertyForm onSubmit={handleSubmit} userId={user?.id || ''} />
        </CardContent>
      </Card>
    </div>
  );
}
