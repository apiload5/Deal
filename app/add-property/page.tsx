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
          owner_id: user.id,
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Add New Property</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Property Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Luxury Villa in DHA"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your property..."
                rows={4}
                required
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price (PKR)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="50,000,000"
                required
              />
            </div>

            {/* City */}
            <div>
              <Label htmlFor="city_id">City</Label>
              <Select
                value={formData.city_id}
                onValueChange={(value) => setFormData({ ...formData, city_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Karachi</SelectItem>
                  <SelectItem value="2">Lahore</SelectItem>
                  <SelectItem value="3">Islamabad</SelectItem>
                  <SelectItem value="4">Peshawar</SelectItem>
                  <SelectItem value="5">Quetta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property Type & Purpose */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property_type">Property Type</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value) => setFormData({ ...formData, property_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="plot">Plot</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Select
                  value={formData.purpose}
                  onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Area, Beds, Baths */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="area_sqft">Area (sqft)</Label>
                <Input
                  id="area_sqft"
                  type="number"
                  value={formData.area_sqft}
                  onChange={(e) => setFormData({ ...formData, area_sqft: e.target.value })}
                  placeholder="2000"
                />
              </div>
              <div>
                <Label htmlFor="beds">Beds</Label>
                <Input
                  id="beds"
                  type="number"
                  value={formData.beds}
                  onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                  placeholder="3"
                />
              </div>
              <div>
                <Label htmlFor="baths">Baths</Label>
                <Input
                  id="baths"
                  type="number"
                  value={formData.baths}
                  onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                  placeholder="2"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full property address"
                required
              />
            </div>

            {/* Images */}
            <div>
              <Label>Property Images</Label>
              <ImageUpload
                images={formData.images}
                onUpload={(url) => setFormData({ ...formData, images: [...formData.images, url] })}
                onRemove={(index) => {
                  const newImages = [...formData.images];
                  newImages.splice(index, 1);
                  setFormData({ ...formData, images: newImages });
                }}
              />
            </div>

            {/* TikTok Video URL */}
            <div>
              <Label htmlFor="tiktok_video_url">TikTok Video URL (Optional)</Label>
              <Input
                id="tiktok_video_url"
                value={formData.tiktok_video_url}
                onChange={(e) => setFormData({ ...formData, tiktok_video_url: e.target.value })}
                placeholder="https://www.tiktok.com/@user/video/1234567890"
              />
              <p className="text-sm text-gray-500 mt-1">
                پہلے TikTok پر video بنائیں۔ Caption: Property Title #dealpk۔ پھر link یہاں paste کریں
              </p>
            </div>

            {/* WhatsApp */}
            <div>
              <Label htmlFor="owner_whatsapp">WhatsApp Number</Label>
              <Input
                id="owner_whatsapp"
                value={formData.owner_whatsapp}
                onChange={(e) => setFormData({ ...formData, owner_whatsapp: e.target.value })}
                placeholder="923001234567"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Format: 92XXXXXXXXXX (without + or 0)</p>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Property'}
        </Button>
      </form>
    </div>
  );
}
