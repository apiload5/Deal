'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

export default function AgentProfilePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    phone: '',
    company: '',
    officeAddress: '',
    officePhone: '',
    cnic: '',
  })

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/agent/profile')
        const data = await response.json()
        if (data) {
          setFormData(data)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/agent/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
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
            <CardTitle className="text-3xl font-bold gradient-text">Agent Profile</CardTitle>
            <CardDescription>
              Update your agent profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Company *</Label>
                <Input
                  placeholder="Deal.pk Real Estate"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Office Address</Label>
                <Input
                  placeholder="Office address"
                  value={formData.officeAddress}
                  onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Office Phone</Label>
                <Input
                  placeholder="+92 51 1234567"
                  value={formData.officePhone}
                  onChange={(e) => setFormData({ ...formData, officePhone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>CNIC *</Label>
                <Input
                  placeholder="12345-1234567-1"
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full btn-premium" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
