// app/premium/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Star, Check, Crown, Sparkles, Shield, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PremiumPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string>("")
  const [premiumPrice, setPremiumPrice] = useState(999)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchProperties()
    fetchPremiumPrice()
  }, [user])

  const fetchProperties = async () => {
    const { data } = await supabase
      .from("properties")
      .select("id, title, is_premium, premium_until")
      .eq("owner_id", user?.id)
      .eq("status", "active")

    setProperties(data || [])
  }

  const fetchPremiumPrice = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "premium_price")
      .single()

    if (data) {
      setPremiumPrice(parseInt(data.value) || 999)
    }
  }

  const handleUpgrade = async () => {
    if (!selectedProperty) {
      toast({
        title: "Select Property",
        description: "Please select a property to upgrade",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // In production, this would integrate with a payment gateway
      // For now, we'll simulate the upgrade
      const { error } = await supabase
        .from("properties")
        .update({
          is_premium: true,
          premium_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", selectedProperty)

      if (error) throw error

      toast({
        title: "Premium Activated! ✨",
        description: "Your property is now premium for 30 days",
      })

      // Notify admin
      await fetch("/api/notify-admin", {
        method: "POST",
        body: JSON.stringify({
          type: "premium_activation",
          propertyId: selectedProperty,
        }),
      })

      router.push("/dashboard")
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

  const eligibleProperties = properties.filter(
    p => !p.is_premium || new Date(p.premium_until) < new Date()
  )

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full mb-4">
          <Crown className="h-5 w-5 text-yellow-500" />
          <span className="text-sm font-medium text-yellow-700">Premium Listing</span>
        </div>
        <h1 className="text-3xl font-bold">Boost Your Property</h1>
        <p className="text-gray-500 mt-2">Get 10x more views with premium listing</p>
      </div>

      {/* Pricing Card */}
      <Card className="border-2 border-premium mb-8">
        <CardHeader className="text-center bg-gradient-to-b from-yellow-50 to-white">
          <Badge variant="premium" className="mx-auto text-sm px-4 py-1">
            Best Value
          </Badge>
          <CardTitle className="text-3xl">Premium Listing</CardTitle>
          <CardDescription>30 days of premium visibility</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <span className="text-4xl font-bold">PKR {premiumPrice}</span>
            <span className="text-gray-500">/month</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>Top of search results</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>Gold premium badge</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>10x more visibility</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>Featured in newsletter</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>Social media promotion</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                Select Property to Upgrade
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
              >
                <option value="">Select a property...</option>
                {eligibleProperties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              {eligibleProperties.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  You don't have any eligible properties. Add a property first!
                </p>
              )}
            </div>

            <Button
              className="w-full bg-premium hover:bg-yellow-600 text-black"
              onClick={handleUpgrade}
              disabled={loading || eligibleProperties.length === 0}
            >
              {loading ? "Processing..." : "Upgrade to Premium"}
              <Sparkles className="h-4 w-4 ml-2" />
            </Button>

            <p className="text-xs text-gray-400 text-center">
              Premium listing valid for 30 days. Auto-renewal available.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h4 className="font-medium">Standard</h4>
            <p className="text-sm text-gray-500">Free</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-premium">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h4 className="font-medium">Premium</h4>
            <p className="text-sm text-yellow-600 font-semibold">PKR {premiumPrice}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h4 className="font-medium">Enterprise</h4>
            <p className="text-sm text-gray-500">Contact us</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
