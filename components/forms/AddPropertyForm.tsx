'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';
import { PROPERTY_TYPES, PURPOSES } from '@/lib/constants';
import { validateWhatsApp, validateTikTokUrl } from '@/lib/utils/validators';
import ImageUpload from '@/components/shared/ImageUpload';
import { City, AddPropertyFormData } from '@/types';

interface AddPropertyFormProps {
  onSubmit: (data: any) => Promise<void>;
  userId: string;
}

const STEPS = [
  { id: 'basic', title: 'Basic Info' },
  { id: 'details', title: 'Property Details' },
  { id: 'media', title: 'Photos & Video' },
  { id: 'contact', title: 'Contact Info' },
  { id: 'review', title: 'Review & Submit' },
];

export default function AddPropertyForm({ onSubmit, userId }: AddPropertyFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [formData, setFormData] = useState<Partial<AddPropertyFormData>>({});
  const [images, setImages] = useState<string[]>([]);
  const [upgradeToPremium, setUpgradeToPremium] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchCities = async () => {
      const { data } = await supabase
        .from('cities')
        .select('*')
        .order('name');
      if (data) setCities(data);
    };
    fetchCities();
  }, [supabase]);

  const handleImageUpload = (urls: string[]) => {
    setImages([...images, ...urls]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = (data: any) => {
    setFormData({ ...formData, ...data });
    nextStep();
  };

  const handleSubmitForm = async () => {
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        images,
        upgradeToPremium,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1BasicInfo onNext={handleNext} defaultValues={formData} />;
      case 1:
        return <Step2Details onNext={handleNext} defaultValues={formData} />;
      case 2:
        return (
          <Step3Media
            onNext={(data) => {
              setFormData({ ...formData, ...data });
              nextStep();
            }}
            onPrev={prevStep}
            images={images}
            onImageUpload={handleImageUpload}
            removeImage={removeImage}
            defaultValues={formData}
          />
        );
      case 3:
        return (
          <Step4Contact
            onNext={(data) => {
              setFormData({ ...formData, ...data });
              nextStep();
            }}
            onPrev={prevStep}
            defaultValues={formData}
          />
        );
      case 4:
        return (
          <Step5Review
            data={formData}
            images={images}
            onPrev={prevStep}
            onSubmit={handleSubmitForm}
            loading={loading}
            upgradeToPremium={upgradeToPremium}
            setUpgradeToPremium={setUpgradeToPremium}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                index <= currentStep
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`hidden text-sm md:inline ${
                index === currentStep ? 'font-semibold' : 'text-muted-foreground'
              }`}
            >
              {step.title}
            </span>
            {index < STEPS.length - 1 && (
              <div className="hidden h-px w-4 bg-gray-300 md:block" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="mt-6">{renderStep()}</div>
    </div>
  );
}

// Step 1: Basic Info
function Step1BasicInfo({ onNext, defaultValues }: any) {
  const [title, setTitle] = useState(defaultValues?.title || '');
  const [description, setDescription] = useState(defaultValues?.description || '');
  const [price, setPrice] = useState(defaultValues?.price || '');
  const [cityId, setCityId] = useState(defaultValues?.city_id || '');
  const [propertyType, setPropertyType] = useState(defaultValues?.property_type || '');
  const [purpose, setPurpose] = useState(defaultValues?.purpose || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ title, description, price: parseFloat(price), city_id: cityId, property_type: propertyType, purpose });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Property Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Beautiful 3 Bedroom House in DHA"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your property in detail..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price (PKR) *</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="5000000"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Select value={cityId} onValueChange={setCityId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="property_type">Property Type *</Label>
          <Select value={propertyType} onValueChange={setPropertyType} required>
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose *</Label>
          <Select value={purpose} onValueChange={setPurpose} required>
            <SelectTrigger>
              <SelectValue placeholder="Sale or Rent" />
            </SelectTrigger>
            <SelectContent>
              {PURPOSES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Next <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}

// Step 2: Details
function Step2Details({ onNext, onPrev, defaultValues }: any) {
  const [areaSqft, setAreaSqft] = useState(defaultValues?.area_sqft || '');
  const [beds, setBeds] = useState(defaultValues?.beds || '0');
  const [baths, setBaths] = useState(defaultValues?.baths || '0');
  const [address, setAddress] = useState(defaultValues?.address || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ 
      area_sqft: areaSqft ? parseInt(areaSqft) : null, 
      beds: parseInt(beds), 
      baths: parseInt(baths),
      address 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="area">Area (sqft)</Label>
          <Input
            id="area"
            type="number"
            value={areaSqft}
            onChange={(e) => setAreaSqft(e.target.value)}
            placeholder="2000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="beds">Bedrooms</Label>
          <Input
            id="beds"
            type="number"
            value={beds}
            onChange={(e) => setBeds(e.target.value)}
            min="0"
            max="20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="baths">Bathrooms</Label>
          <Input
            id="baths"
            type="number"
            value={baths}
            onChange={(e) => setBaths(e.target.value)}
            min="0"
            max="20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Full Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="House #, Street, Sector, City"
        />
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

// Step 3: Media
function Step3Media({ onNext, onPrev, images, onImageUpload, removeImage, defaultValues }: any) {
  const [tiktokUrl, setTiktokUrl] = useState(defaultValues?.tiktok_video_url || '');
  const [tiktokError, setTiktokError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tiktokUrl && !validateTikTokUrl(tiktokUrl)) {
      setTiktokError('Please enter a valid TikTok video URL');
      return;
    }
    onNext({ tiktok_video_url: tiktokUrl });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Property Images (5-10 photos)</Label>
        <ImageUpload onUpload={onImageUpload} />
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((url: string, index: number) => (
            <div key={index} className="relative h-24 w-24">
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Upload at least 1 image. Max 10 images allowed.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tiktok">TikTok Video URL</Label>
        <Input
          id="tiktok"
          value={tiktokUrl}
          onChange={(e) => {
            setTiktokUrl(e.target.value);
            setTiktokError('');
          }}
          placeholder="https://www.tiktok.com/@username/video/123456789"
        />
        {tiktokError && (
          <p className="text-sm text-red-500">{tiktokError}</p>
        )}
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <p className="font-medium">How to add a TikTok video:</p>
          <ol className="mt-1 list-decimal pl-4">
            <li>Create a video on TikTok about your property</li>
            <li>Add caption with your property name and #dealpk</li>
            <li>Copy the video link and paste it here</li>
          </ol>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

// Step 4: Contact
function Step4Contact({ onNext, onPrev, defaultValues }: any) {
  const [whatsapp, setWhatsapp] = useState(defaultValues?.owner_whatsapp || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateWhatsApp(whatsapp)) {
      setError('Please enter a valid WhatsApp number (92XXXXXXXXXX)');
      return;
    }
    onNext({ owner_whatsapp: whatsapp });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="whatsapp">WhatsApp Number *</Label>
        <Input
          id="whatsapp"
          value={whatsapp}
          onChange={(e) => {
            setWhatsapp(e.target.value.replace(/\D/g, ''));
            setError('');
          }}
          placeholder="923001234567"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <p className="text-sm text-muted-foreground">
          Enter your WhatsApp number in 92XXXXXXXXXX format (without + or 0)
        </p>
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

// Step 5: Review
function Step5Review({ data, images, onPrev, onSubmit, loading, upgradeToPremium, setUpgradeToPremium }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Title</span>
              <p className="font-medium">{data.title}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Price</span>
              <p className="font-medium">PKR {data.price?.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">City</span>
              <p className="font-medium">{data.city_id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Type</span>
              <p className="font-medium capitalize">{data.property_type}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Purpose</span>
              <p className="font-medium capitalize">{data.purpose}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Beds</span>
              <p className="font-medium">{data.beds}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Baths</span>
              <p className="font-medium">{data.baths}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Images</span>
              <p className="font-medium">{images.length} uploaded</p>
            </div>
          </div>

          {data.tiktok_video_url && (
            <div>
              <span className="text-muted-foreground">TikTok Video</span>
              <p className="text-sm truncate">{data.tiktok_video_url}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="premium"
          checked={upgradeToPremium}
          onCheckedChange={(checked) => setUpgradeToPremium(checked)}
        />
        <Label htmlFor="premium" className="text-sm">
          Upgrade to Premium (⭐ Featured listing with gold badge)
        </Label>
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={handleSubmit}
          disabled={isSubmitting || loading}
        >
          {isSubmitting || loading ? (
            'Submitting...'
          ) : (
            'Submit Property'
          )}
        </Button>
      </div>
    </div>
  );
}
