// app/add-property/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ImageUpload } from "@/components/forms/ImageUpload"
import { ChevronLeft, ChevronRight, Check, Upload, MapPin, Home, Phone, Video, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const steps = [
  { id: 1, title: "Basic Info", icon: Home },
  { id: 2, title: "Details", icon: MapPin },
  { id: 3, title: "Media", icon: Upload },
  { id: 4, title: "Contact", icon: Phone },
  { id: 5, title: "Review", icon: Check },
]

export default function AddPropertyPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [cities, setCities] = useState<any[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city_id: "",
    property_type: "house",
    purpose: "sale",
    area_sqft: "",
    beds: "",
    baths: "",
    address: "",
    lat: "",
    lng: "",
    images: [] as string[],
    tiktok_video_url: "",
    owner_whatsapp: "",
    is_premium: false,
  })

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      const { data } = await supabase.from("cities").select("*").order("name")
      setCities(data || [])
    }
    fetchCities()
  }, [])

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Validate required fields
      const required = ["title", "price", "city_id", "owner_whatsapp"]
      for (const field of required) {
        if (!formData[field as keyof typeof formData]) {
          toast({
            title: "Missing field",
            description: `Please fill in all required fields`,
            variant: "destructive",
          })
          return
        }
      }

      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price),
        city_id: formData.city_id,
        property_type: formData.property_type,
        purpose: formData.purpose,
        area_sqft: parseInt(formData.area_sqft) || 0,
        beds: parseInt(formData.beds) || 0,
        baths: parseInt(formData.baths) || 0,
        address: formData.address,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        images: formData.images,
        tiktok_video_url: formData.tiktok_video_url,
        owner_id: user?.id,
        owner_whatsapp: formData.owner_whatsapp,
        status: "active",
      }

      const { data, error } = await supabase
        .from("properties")
        .insert([propertyData])
        .select()
        .single()

      if (error) throw error

      // If premium, create premium entry
      if (formData.is_premium && data) {
        // In production, this would redirect to payment
        await supabase
          .from("properties")
          .update({
            is_premium: true,
            premium_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq("id", data.id)
      }

      toast({
        title: "Success! 🎉",
        description: "Your property has been listed successfully",
      })

      // Send email notification
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: data.id,
          title: formData.title,
          price: formData.price,
        }),
      })

      router.push(`/property/${data.id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Luxury 3 Bedroom House in DHA"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your property in detail..."
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (PKR) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="50,000,000"
                  value={formData.price}
                  onChange={(e) => updateFormData("price", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <Select
                  value={formData.city_id}
                  onValueChange={(value) => updateFormData("city_id", value)}
                >
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property_type">Property Type</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value) => updateFormData("property_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="flat">Flat/Apartment</SelectItem>
                    <SelectItem value="plot">Plot</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Select
                  value={formData.purpose}
                  onValueChange={(value) => updateFormData("purpose", value)}
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
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="area_sqft">Area (sqft)</Label>
                <Input
                  id="area_sqft"
                  type="number"
                  placeholder="2000"
                  value={formData.area_sqft}
                  onChange={(e) => updateFormData("area_sqft", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="beds">Bedrooms</Label>
                <Input
                  id="beds"
                  type="number"
                  placeholder="3"
                  value={formData.beds}
                  onChange={(e) => updateFormData("beds", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="baths">Bathrooms</Label>
                <Input
                  id="baths"
                  type="number"
                  placeholder="2"
                  value={formData.baths}
                  onChange={(e) => updateFormData("baths", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                placeholder="House #12, Street 5, Sector DHA"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  placeholder="24.8607"
                  value={formData.lat}
                  onChange={(e) => updateFormData("lat", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  placeholder="67.0011"
                  value={formData.lng}
                  onChange={(e) => updateFormData("lng", e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              You can get coordinates from Google Maps by right-clicking on the location
            </p>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Property Images</Label>
              <p className="text-sm text-gray-500 mb-2">
                Upload 5-10 images of your property (JPG, PNG, WebP)
              </p>
              <ImageUpload
                images={formData.images}
                onUpload={(urls) => updateFormData("images", urls)}
                maxImages={10}
              />
            </div>
            <div>
              <Label htmlFor="tiktok_video_url">TikTok Video URL</Label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="tiktok_video_url"
                  placeholder="https://www.tiktok.com/@user/video/1234567890"
                  value={formData.tiktok_video_url}
                  onChange={(e) => updateFormData("tiktok_video_url", e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Paste the TikTok video URL. It will be embedded on your property page.
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="owner_whatsapp">WhatsApp Number *</Label>
              <Input
                id="owner_whatsapp"
                type="tel"
                placeholder="300-1234567"
                value={formData.owner_whatsapp}
                onChange={(e) => updateFormData("owner_whatsapp", e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Buyers will contact you on this WhatsApp number
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Upgrade to Premium Listing</h4>
                  <p className="text-sm text-gray-600">
                    Get 10x more views with a premium listing. Your property will appear at the top of search results with a gold badge.
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    <Badge variant="premium" className="text-sm py-1 px-3">
                      PKR 999 for 30 days
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFormData("is_premium", !formData.is_premium)}
                      className={formData.is_premium ? "bg-yellow-50 border-yellow-500" : ""}
                    >
                      {formData.is_premium ? "✓ Selected" : "Select Premium"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Review Your Listing</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b">
                  <dt className="text-gray-500">Title</dt>
                  <dd>{formData.title || "Not provided"}</dd>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <dt className="text-gray-500">Price</dt>
                  <dd>{formData.price ? `PKR ${parseInt(formData.price).toLocaleString()}` : "Not provided"}</dd>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <dt className="text-gray-500">City</dt>
                  <dd>{cities.find(c => c.id === formData.city_id)?.name || "Not selected"}</dd>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <dt className="text-gray-500">Type</dt>
                  <dd className="capitalize">{formData.property_type}</dd>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <dt className="text-gray-500">Purpose</dt>
                  <dd className="capitalize">{formData.purpose}</dd>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <dt className="text-gray-500">Images</dt>
                  <dd>{formData.images.length} uploaded</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-gray-500">Premium</dt>
                  <dd>{formData.is_premium ? "✅ Yes" : "❌ No"}</dd>
                </div>
              </dl>
            </div>
            
            {formData.is_premium && (
              <div className="bg-premium/10 border border-premium rounded-lg p-3 text-center">
                <p className="text-sm font-medium">✨ Premium Listing - PKR 999</p>
                <p className="text-xs text-gray-500">Valid for 30 days from listing</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">List Your Property</h1>
        <p className="text-gray-500">Fill in the details to list your property</p>
      </div>

      {/* Steps Progress */}
      <div className="flex justify-between mb-8">
        {steps.map((step) => {
          const Icon = step.icon
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep
          return (
            <div key={step.id} className="flex items-center flex-col flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive
                    ? "bg-primary text-white"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className={`text-xs mt-1 ${isActive ? "text-primary font-medium" : "text-gray-500"}`}>
                {step.title}
              </span>
            </div>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-6">
          {renderStep()}

          <div className="flex justify-between mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            {currentStep === steps.length ? (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Submit Listing"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
