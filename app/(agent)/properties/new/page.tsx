'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { RapidCheckout } from '@/features/payment/components/RapidCheckout'
import { formatPKR } from '@/lib/utils'
import { Loader2, Upload, X, Plus, Image as ImageIcon } from 'lucide-react'

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().positive('Price must be positive'),
  city: z.string().min(1, 'City is required'),
  area: z.string().min(1, 'Area is required'),
  propertyType: z.string().min(1, 'Property type is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  beds: z.number().optional(),
  baths: z.number().optional(),
  areaSqft: z.number().positive('Area is required'),
  furnished: z.string().optional(),
  floor: z.number().optional(),
  builtYear: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

type PropertyFormData = z.infer<typeof propertySchema>

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Hyderabad', 'Peshawar', 'Quetta']
const PROPERTY_TYPES = ['HOUSE', 'APARTMENT', 'PLOT', 'COMMERCIAL', 'PORTION', 'FARM_HOUSE']
const PURPOSES = ['sale', 'rent']
const FURNISHED_OPTIONS = ['Fully Furnished', 'Semi Furnished', 'Unfurnished']

export default function NewPropertyPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{ type: string; amount: number } | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      purpose: 'sale',
      furnished: 'Unfurnished',
    },
  })

  const propertyType = watch('propertyType')
  const purpose = watch('purpose')

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true)
    try {
      // Save property to database
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          images,
          videoUrl: videoUrl || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to create property')
      
      const property = await response.json()
      router.push(`/agent/properties/${property.id}`)
    } catch (error) {
      console.error('Error creating property:', error)
      alert('Failed to create property. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    // In production, upload to Cloudinary/Supabase
    // For now, use fake URLs
    const newImages = files.map((file) => 
      `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=800`
    )
    setImages([...images, ...newImages])
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const plans = [
    { type: 'premium_7', label: 'Premium (7 Days)', amount: 3000, description: 'Boost visibility with premium badge for 7 days' },
    { type: 'premium_30', label: 'Premium (30 Days)', amount: 8000, description: 'Extended premium visibility for 30 days' },
    { type: 'featured_7', label: 'Featured (7 Days)', amount: 1500, description: 'Feature property on homepage for 7 days' },
  ]

  const handlePlanSelect = (plan: typeof plans[0]) => {
    setSelectedPlan(plan)
    setShowPayment(true)
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Property</h1>
        <p className="text-muted-foreground">List your property on Deal.pk</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Provide the key details about your property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title</Label>
              <Input
                id="title"
                placeholder="e.g., Luxury Villa with Ocean View"
                {...register('title')}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your property in detail..."
                rows={4}
                {...register('description')}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (Rs)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="45000000"
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaSqft">Area (Sq. Ft.)</Label>
                <Input
                  id="areaSqft"
                  type="number"
                  placeholder="5000"
                  {...register('areaSqft', { valueAsNumber: true })}
                />
                {errors.areaSqft && <p className="text-sm text-destructive">{errors.areaSqft.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select
                  onValueChange={(value) => setValue('city', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area/Locality</Label>
                <Input
                  id="area"
                  placeholder="e.g., Clifton"
                  {...register('area')}
                />
                {errors.area && <p className="text-sm text-destructive">{errors.area.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select
                  onValueChange={(value) => setValue('propertyType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.propertyType && <p className="text-sm text-destructive">{errors.propertyType.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Select
                  onValueChange={(value) => setValue('purpose', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSES.map((purpose) => (
                      <SelectItem key={purpose} value={purpose}>
                        {purpose.charAt(0).toUpperCase() + purpose.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.purpose && <p className="text-sm text-destructive">{errors.purpose.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features & Specifications</CardTitle>
            <CardDescription>Additional details about your property</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="beds">Bedrooms</Label>
              <Input
                id="beds"
                type="number"
                placeholder="5"
                {...register('beds', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="baths">Bathrooms</Label>
              <Input
                id="baths"
                type="number"
                placeholder="6"
                {...register('baths', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="furnished">Furnishing</Label>
              <Select
                onValueChange={(value) => setValue('furnished', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select furnishing" />
                </SelectTrigger>
                <SelectContent>
                  {FURNISHED_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                type="number"
                placeholder="2"
                {...register('floor', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="builtYear">Built Year</Label>
              <Input
                id="builtYear"
                type="number"
                placeholder="2022"
                {...register('builtYear', { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Media Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Upload images and video tour</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Property Images</Label>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                    <img src={image} alt={`Property ${index + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:border-primary">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                  <span className="mt-1 text-xs text-muted-foreground">Add Images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video Tour URL</Label>
              <Input
                id="videoUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Support YouTube, Vimeo, Facebook, TikTok, and more
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Premium & Featured Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Boost Your Listing</CardTitle>
            <CardDescription>Make your property stand out with premium features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.type}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedPlan?.type === plan.type ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.label}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">{formatPKR(plan.amount)}</p>
                    <Button
                      type="button"
                      variant={selectedPlan?.type === plan.type ? 'default' : 'outline'}
                      className="mt-4 w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlanSelect(plan)
                      }}
                    >
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedPlan && (
              <div className="mt-6">
                <RapidCheckout
                  amount={selectedPlan.amount}
                  type={selectedPlan.type}
                  onSuccess={() => {
                    setShowPayment(false)
                    alert('Payment successful! Your property will be boosted.')
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Property...
              </>
            ) : (
              'Create Property'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
