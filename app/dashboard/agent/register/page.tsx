// app/dashboard/agent/register/page.tsx
"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Building, Award, CheckCircle } from "lucide-react"

export default function AgentRegistrationPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const data = {
      user_id: user.id,
      company_name: formData.get("company_name") as string,
      license_number: formData.get("license_number") as string,
      experience_years: parseInt(formData.get("experience_years") as string) || 0,
      specialization: (formData.get("specialization") as string)?.split(",").map(s => s.trim()) || [],
      is_verified: false,
    }

    try {
      // Check if already registered
      const { data: existing } = await supabase
        .from("agents")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (existing) {
        toast({
          title: "Already Registered",
          description: "You have already applied to be an agent",
        })
        return
      }

      const { error } = await supabase
        .from("agents")
        .insert([data])

      if (error) throw error

      // Update user role
      await supabase
        .from("users")
        .update({ role: "agent" })
        .eq("id", user.id)

      setSubmitted(true)
      toast({
        title: "Application Submitted! 🎉",
        description: "Your agent application is under review. We'll notify you once verified.",
      })

      // Send notification to admin
      await fetch("/api/notify-admin", {
        method: "POST",
        body: JSON.stringify({
          type: "agent_application",
          userId: user.id,
          companyName: data.company_name,
        }),
      })

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

  if (submitted) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-gray-500 mb-4">
              Your application to become an agent has been submitted successfully.
              Our team will review your application and verify your profile.
            </p>
            <Button asChild>
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Become an Agent</CardTitle>
              <CardDescription>
                Join our network of verified real estate agents
              </CardDescription>
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
              <li>✓ Access to agent dashboard with analytics</li>
              <li>✓ Commission tracking and reports</li>
              <li>✓ Higher visibility for your listings</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                name="company_name"
                placeholder="e.g., ABC Real Estate Agency"
                required
              />
            </div>
            <div>
              <Label htmlFor="license_number">License Number *</Label>
              <Input
                id="license_number"
                name="license_number"
                placeholder="e.g., REA-12345"
                required
              />
            </div>
            <div>
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Input
                id="experience_years"
                name="experience_years"
                type="number"
                placeholder="5"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="specialization">Specializations</Label>
              <Input
                id="specialization"
                name="specialization"
                placeholder="Residential, Commercial, Luxury, etc."
              />
              <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Apply as Agent"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
