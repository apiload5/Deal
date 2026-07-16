import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Home, Building, Star } from 'lucide-react'

const areaGuides = [
  {
    city: 'Islamabad',
    description: 'The capital city of Pakistan, known for its beautiful landscapes and modern infrastructure.',
    areas: ['DHA Phase 1-8', 'Bahria Town', 'F-6', 'F-7', 'F-8', 'G-10', 'Blue Area'],
    averagePrice: 'Rs 35,000,000',
    propertyTypes: ['HOUSE', 'APARTMENT', 'PLOT'],
    highlights: ['Secure gated communities', 'Modern amenities', 'Excellent schools'],
  },
  {
    city: 'Karachi',
    description: 'The economic hub of Pakistan, offering diverse property options for all budgets.',
    areas: ['DHA Phase 1-8', 'Clifton', 'Defence View', 'Bahria Town Karachi', 'North Karachi'],
    averagePrice: 'Rs 25,000,000',
    propertyTypes: ['HOUSE', 'APARTMENT', 'PLOT', 'COMMERCIAL'],
    highlights: ['Coastal living', 'Business opportunities', 'Premium real estate'],
  },
  {
    city: 'Lahore',
    description: 'The cultural heart of Pakistan, rich in history and modern development.',
    areas: ['DHA Phase 1-9', 'Gulberg', 'Model Town', 'Johar Town', 'Bahria Town'],
    averagePrice: 'Rs 28,000,000',
    propertyTypes: ['HOUSE', 'APARTMENT', 'PLOT', 'PORTION'],
    highlights: ['Historical sites', 'Food capital', 'Educational institutions'],
  },
]

export default function AreaGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold gradient-text mb-4">Area Guides</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore the best neighborhoods and areas across Pakistan's top cities
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {areaGuides.map((guide) => (
          <Card key={guide.city} className="glass">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-2xl">{guide.city}</CardTitle>
              </div>
              <CardDescription>{guide.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Home className="h-4 w-4 text-orange-500" />
                  Popular Areas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {guide.areas.map((area) => (
                    <Badge key={area} variant="outline">{area}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4 text-orange-500" />
                  Property Types
                </h4>
                <div className="flex flex-wrap gap-2">
                  {guide.propertyTypes.map((type) => (
                    <Badge key={type} variant="secondary">{type.toLowerCase()}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4 text-orange-500" />
                  Highlights
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {guide.highlights.map((highlight, index) => (
                    <li key={index}>• {highlight}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Average Price</p>
                <p className="text-2xl font-bold gradient-text">{guide.averagePrice}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
