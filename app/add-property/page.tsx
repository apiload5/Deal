'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ImageUpload';

export default function AddPropertyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    city_id: '',
    area_sqft: '',
    beds: '0',
    baths: '0',
    property_type: 'house',
    purpose: 'sale',
    address: '',
    images: [] as string[],
    tiktok_video_url: '',
    owner_whatsapp: '',
  });

  // Agar user nahi hai toh redirect karo
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...formData,
          price: parseInt(formData.price),
          area_sqft: parseInt(formData.area_sqft) || 0,
          beds: parseInt(formData.beds) || 0,
          baths: parseInt(formData.baths) || 0,
          images: formData.images,
          owner_id: user.id, // ✅ Ab user null nahi ho sakta
          status: 'active',
        })
        .select();

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Property added successfully',
      });

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add property',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ... baqi JSX
}
