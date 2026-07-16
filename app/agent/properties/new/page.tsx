'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

const cities = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi',
  'Faisalabad', 'Multan', 'Peshawar', 'Quetta'
]

const propertyTypes = [
  'HOUSE', 'APARTMENT', 'PLOT', 'COMMERCIAL', 'PORTION', 'FARM_HOUSE'
]

export default function NewPropertyPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    price: '',
    city: '',
    area: '',
    propertyType: '',
    purpose: 'sale',
    beds: '',
    baths: '',
    areaSqft: '',
    furnished: '',
    floor: '',
    builtYear: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          beds: parseInt(formData.beds) || null,
          baths: parseInt(formData.baths) || null,
          areaSqft: parseInt(formData.areaSqft),
          floor: parseInt(formData.floor) || null,
          builtYear: parseInt(formData.builtYear) || null,
          images: ['/placeholder-property.jpg'],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create property')
      }

      toast({
        title: 'Success',
        description: 'Property created successfully!',
      })

      router.push('/agent/properties')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create property',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-3xl font-bold gradient-text">Add New Property</CardTitle>
            <CardDescription>
              Fill in the details to list your property
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="e.g., Luxury Villa in DHA"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Price (PKR) *</Label>
                  <Input
                    type="number"
                    placeholder="45000000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>City *</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Area *</Label>
                  <Input
                    placeholder="DHA Phase 8"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Property Type *</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Purpose *</Label>
                  <Select
                    value={formData.purpose}
                    onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Beds</Label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={formData.beds}
                    onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Baths</Label>
                  <Input
                    type="number"
                    placeholder="6"
                    value={formData.baths}
                    onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Area (sq ft) *</Label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={formData.areaSqft}
                    onChange={(e) => setFormData({ ...formData, areaSqft: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Furnished</Label>
                  <Select
                    value={formData.furnished}
                    onValueChange={(value) => setFormData({ ...formData, furnished: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
                      <SelectItem value="Semi Furnished">Semi Furnished</SelectItem>
                      <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Floor</Label>
                  <Input
                    type="number"
                    placeholder="2"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Built Year</Label>
                  <Input
                    type="number"
                    placeholder="2022"
                    value={formData.builtYear}
                    onChange={(e) => setFormData({ ...formData, builtYear: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  placeholder="Describe your property..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full btn-premium" disabled={loading}>
                {loading ? 'Creating...' : 'Create Property'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
