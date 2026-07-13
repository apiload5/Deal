'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createRapidPayment } from '../lib/rapidgateway'
import { formatPKR } from '@/lib/utils'

interface RapidCheckoutProps {
  amount: number
  type: string
  propertyId?: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function RapidCheckout({ amount, type, propertyId, onSuccess, onError }: RapidCheckoutProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if RapidGateway credentials are configured
  const isConfigured = process.env.RAPID_MERCHANT_ID && process.env.RAPID_API_KEY

  const handlePayment = async () => {
    if (!session?.user) {
      setError('Please sign in to make a payment')
      onError?.('Please sign in to make a payment')
      return
    }

    if (!isConfigured) {
      setError('Payment system is not configured. Please contact support.')
      onError?.('Payment system not configured')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await createRapidPayment(
        amount,
        type,
        session.user.id,
        propertyId
      )

      // Redirect to RapidGateway
      window.location.href = result.paymentUrl
      
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Mock payment for development when not configured
  const handleMockPayment = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onSuccess?.()
      alert('✅ Mock payment successful! (RapidGateway not configured)')
    }, 1500)
  }

  if (!isConfigured) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="h-5 w-5" />
            Setup Required
          </CardTitle>
          <CardDescription>
            RapidGateway payment system is not configured.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add RAPID_MERCHANT_ID, RAPID_API_KEY, and RAPID_SECRET_KEY to your environment variables.
            <br />
            <span className="text-xs">
              Note: Mock payments are available for development.
            </span>
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleMockPayment} className="w-full" variant="outline">
            Mock Payment (Dev)
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Secure Payment
        </CardTitle>
        <CardDescription>
          Pay securely via RapidGateway
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-bold text-primary">{formatPKR(amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
          </div>
          {propertyId && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property</span>
              <span className="font-medium">#{propertyId}</span>
            </div>
          )}
          <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            🔒 Your payment is secured by RapidGateway. We do not store your card details.
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handlePayment}
          disabled={isLoading || !session}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatPKR(amount)}`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
