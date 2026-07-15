import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

export default function SetupPage() {
  const envVars = {
    'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
    'DATABASE_URL': process.env.DATABASE_URL,
    'RAPID_MERCHANT_ID': process.env.RAPID_MERCHANT_ID,
    'RAPID_API_KEY': process.env.RAPID_API_KEY,
    'RAPID_SECRET_KEY': process.env.RAPID_SECRET_KEY,
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  const allSet = Object.values(envVars).every(val => val && val.length > 0)

  return (
    <div className="container mx-auto max-w-4xl py-16">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {allSet ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            )}
            Setup Required
          </CardTitle>
          <CardDescription>
            {allSet
              ? 'All environment variables are configured correctly!'
              : 'Please configure the following environment variables in your .env file'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  {value ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-mono text-sm">{key}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {value ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
            ))}
          </div>
          {!allSet && (
            <div className="mt-6 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Please copy the .env.example file to .env and fill in your credentials.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
