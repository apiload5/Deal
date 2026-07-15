import * as React from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, X } from 'lucide-react'

export default async function AlertsPage() {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      alerts: true,
    },
  })

  const alerts = user?.alerts || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Search Alerts</h1>
        <Button>Create Alert</Button>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No alerts set</p>
            <p className="text-sm text-muted-foreground">
              Create alerts to get notified about new properties
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>Search Alert</CardTitle>
                  <CardDescription>
                    Created: {new Date(alert.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="rounded-lg bg-muted p-4 text-sm">
                  {JSON.stringify(alert.filters, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
