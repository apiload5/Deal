'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Building, Award } from 'lucide-react'

export default function AgentRegistrationPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      toast({
        title: 'Application Submitted! 🎉',
        description: 'Your agent application is under review.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Become an Agent</CardTitle>
              <CardDescription>Join our network of verified real estate agents</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Agent Benefits
            </h4>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>✓ Verified badge on your profile</li>
              <li>✓ Priority listing for your properties</li>
              <li>✓ Commission tracking and reports</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                placeholder="e.g., ABC Real Estate Agency"
                required
              />
            </div>
            <div>
              <Label htmlFor="license_number">License Number *</Label>
              <Input
                id="license_number"
                placeholder="e.g., REA-12345"
                required
              />
            </div>
            <div>
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Input
                id="experience_years"
                type="number"
                placeholder="5"
                min="0"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Apply as Agent'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
