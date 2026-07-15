'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-300" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment has been processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderId && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono text-sm">{orderId}</p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Link href="/">
              <Button className="w-full">Go to Home</Button>
            </Link>
            <Link href="/properties">
              <Button variant="outline" className="w-full">
                Browse Properties
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
