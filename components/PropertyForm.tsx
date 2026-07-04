'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { ImageUpload } from './ImageUpload'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { PropertyFormData } from '@/types'
import { toast } from '@/hooks/use-toast'

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().min(1000, 'Price must be at least 1,000'),
  city_id: z.string().uuid('Please select a city'),
  area_sqft: z.number().min(1, 'Area must be at least 1 sqft'),
  beds: z.number().min(0),
  baths: z.number().min(0),
  property_type: z.enum(['house', 'flat', 'plot', 'commercial']),
  purpose: z.enum(['sale', 'rent']),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  images: z.array(z.string()).min(1, 'Please upload at least 1 image'),
  tiktok_video_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  owner_whatsapp: z.string().regex(/^92\d{10}$/, 'WhatsApp number must be in 92XXXXXXXXXX format'),
})

type PropertyFormValues = z.infer<typeof propertySchema>

export function PropertyForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      property_type: 'house',
      purpose: 'sale',
      beds: 0,
      baths: 0,
      images: [],
      tiktok_video_url: '',
    }
  })

  const images = watch('images') || []

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const onSubmit = async (data: PropertyFormValues) => {
    if (step < 5) {
      nextStep()
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('properties')
        .insert({
          ...data,
          owner_id: user?.id,
          status: 'active',
        })
      
      if (error) throw error

      toast({
        title: 'Success!',
        description: 'Your property has been listed successfully.',
      })
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Error submitting property:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit property. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              i <= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {i < step ? <Check className="w-5 h-5" /> : i}
            </div>
            {i < 5 && (
              <div className={`w-12 h-1 ${
                i < step ? 'bg-primary' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Basic Information</h2>
              <div>
                <Label htmlFor="title">Property Title</Label>
                <Input {...register('title')} placeholder="e.g., Luxury Villa in DHA" />
                {errors.title && <p className="text-red-500 text-sm">{String(errors.title.message)}</p>}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea {...register('description')} rows={4} placeholder="Describe your property..." />
                {errors.description && <p className="text-red-500 text-sm">{String(errors.description.message)}</p>}
              </div>
              <div>
                <Label htmlFor="price">Price (PKR)</Label>
                <Input {...register('price', { valueAsNumber: true })} type="number" placeholder="50,000,000" />
                {errors.price && <p className="text-red-500 text-sm">{String(errors.price.message)}</p>}
              </div>
              <div>
                <Label htmlFor="city_id">City</Label>
                <Select onValueChange={(value) => setValue('city_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Cities will be fetched */}
                  </SelectContent>
                </Select>
                {errors.city_id && <p className="text-red-500 text-sm">{String(errors.city_id.message)}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="property_type">Property Type</Label>
                  <Select onValueChange={(value: any) => setValue('property_type', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
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
                  <Select onValueChange={(value: any) => setValue('purpose', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Property Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="area_sqft">Area (sqft)</Label>
                  <Input {...register('area_sqft', { valueAsNumber: true })} type="number" />
                </div>
                <div>
                  <Label htmlFor="beds">Beds</Label>
                  <Input {...register('beds', { valueAsNumber: true })} type="number" />
                </div>
                <div>
                  <Label htmlFor="baths">Baths</Label>
                  <Input {...register('baths', { valueAsNumber: true })} type="number" />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea {...register('address')} rows={3} placeholder="Full property address..." />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Media</h2>
              <div>
                <Label>Property Images</Label>
                <ImageUpload
                  images={images}
                  onUpload={(url) => setValue('images', [...images, url])}
                  onRemove={(index) => {
                    const newImages = [...images]
                    newImages.splice(index, 1)
                    setValue('images', newImages)
                  }}
                />
                {errors.images && <p className="text-red-500 text-sm">{String(errors.images.message)}</p>}
              </div>
              <div>
                <Label htmlFor="tiktok_video_url">TikTok Video URL (Optional)</Label>
                <Input {...register('tiktok_video_url')} placeholder="https://www.tiktok.com/@user/video/1234567890" />
                <p className="text-sm text-gray-500 mt-1">
                  پہلے TikTok پر video بنائیں۔ Caption: Property Title #dealpk۔ پھر link یہاں paste کریں
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Contact Information</h2>
              <div>
                <Label htmlFor="owner_whatsapp">WhatsApp Number</Label>
                <Input {...register('owner_whatsapp')} placeholder="92XXXXXXXXXX" />
                <p className="text-sm text-gray-500 mt-1">Format: 92XXXXXXXXXX (without + or 0)</p>
                {errors.owner_whatsapp && <p className="text-red-500 text-sm">{String(errors.owner_whatsapp.message)}</p>}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Review Your Listing</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><strong>Title:</strong> {watch('title')}</p>
                <p><strong>Price:</strong> {watch('price')}</p>
                <p><strong>Type:</strong> {watch('property_type')}</p>
                <p><strong>Purpose:</strong> {watch('purpose')}</p>
                <p><strong>Images:</strong> {images.length} uploaded</p>
                {watch('tiktok_video_url') && (
                  <p><strong>Video:</strong> TikTok video included</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={step === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {step === 5 ? (
            <>
              {isSubmitting ? 'Submitting...' : 'Submit Listing'}
              {!isSubmitting && <Check className="w-4 h-4 ml-2" />}
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
