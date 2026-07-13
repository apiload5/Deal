'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')
  const type = searchParams.get('type')

  useEffect(() => {
    // Verify payment status
    const verifyPayment = async () => {
      if (!orderId) {
        setStatus('error')
        setMessage('Invalid payment session')
        return
      }

      try {
        // In production, verify with your backend
        // const response = await fetch(`/api/payment/verify?orderId=${orderId}`)
        // const data = await response.json()
        
        // Mock verification
        await new Promise(resolve => setTimeout(resolve, 1500))
        setStatus('success')
        setMessage(`Payment of ${amount} PKR for ${type} completed successfully!`)
      } catch (error) {
        setStatus('error')
        setMessage('Payment verification failed. Please contact support.')
      }
    }

    verifyPayment()
  }, [orderId, amount, type])

  if (status === 'loading') {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Verifying your payment...</p>
            <p className="text-sm text-muted-foreground">Please wait while we confirm your transaction</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            {status === 'success' ? (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            ) : (
              <AlertCircle className="h-16 w-16 text-destructive" />
            )}
          </div>
          <CardTitle className="mt-4">
            {status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'success'
              ? 'Your payment has been processed successfully'
              : 'There was an issue with your payment'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono text-sm">{orderId || 'N/A'}</span>
            </div>
            {amount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">Rs {parseInt(amount).toLocaleString('en-PK')}</span>
              </div>
            )}
            {type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={status === 'success' ? 'success' : 'destructive'}>
                {status === 'success' ? 'Completed' : 'Failed'}
              </Badge>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">{message}</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href={status === 'success' ? '/agent/dashboard' : '/agent/properties/new'}>
              {status === 'success' ? 'Go to Dashboard' : 'Try Again'}
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
