import * as React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export default async function AgentPropertiesPage() {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      agentProfile: true,
    },
  })

  if (!user?.agentProfile) {
    redirect('/agent/profile/setup')
  }

  const properties = await prisma.property.findMany({
    where: { agentId: user.agentProfile.id },
    include: {
      agent: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">My Properties</h1>
        <Link href="/agent/properties/new">
          <Button className="btn-premium">Add New Property</Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">No properties listed</p>
            <p className="text-sm text-muted-foreground">Start by adding your first property</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="glass">
              <CardHeader>
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <img
                    src={property.images[0] || '/placeholder-property.jpg'}
                    alt={property.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardTitle className="mt-4 line-clamp-1">{property.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold gradient-text">
                    {formatPrice(property.price)}
                  </span>
                  <Badge variant={
                    property.status === 'approved' ? 'success' :
                    property.status === 'pending' ? 'warning' :
                    'destructive'
                  }>
                    {property.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {property.city}, {property.area}
                </p>
                <div className="flex gap-2">
                  <Link href={`/property/${property.id}`} className="flex-1">
                    <Button variant="outline" className="w-full rounded-full">View</Button>
                  </Link>
                  <Button variant="outline" className="rounded-full">Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
