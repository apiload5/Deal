'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { formatPrice } from '@/lib/utils'

interface RapidCheckoutProps {
  amount: number
  propertyId?: string
  onSuccess?: () => void
}

export function RapidCheckout({ amount, propertyId, onSuccess }: RapidCheckoutProps) {
  const [loading, setLoading] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          propertyId,
          customerEmail: email,
          customerName: name,
          customerPhone: phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Payment failed')
      }

      // Redirect to RapidGateway
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: 'Payment Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay with RapidGateway</CardTitle>
        <CardDescription>
          Secure payment via RapidGateway PK
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 rounded-lg bg-primary/5 p-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(amount)}
            </span>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              placeholder="+92 300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Processing...' : `Pay ${formatPrice(amount)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
