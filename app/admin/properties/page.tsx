import * as React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminPropertiesPage() {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (user?.role !== 'admin') {
    redirect('/unauthorized')
  }

  const properties = await prisma.property.findMany({
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
        <h1 className="text-3xl font-bold gradient-text">Manage Properties</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full">Filter</Button>
          <Link href="/agent/properties/new">
            <Button className="btn-premium">Add New</Button>
          </Link>
        </div>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>All Properties ({properties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">City</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Agent</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{property.title}</td>
                    <td className="py-3 px-4 font-medium">{formatPrice(property.price)}</td>
                    <td className="py-3 px-4">{property.city}</td>
                    <td className="py-3 px-4">
                      <Badge variant={
                        property.status === 'approved' ? 'success' :
                        property.status === 'pending' ? 'warning' :
                        'destructive'
                      }>
                        {property.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{property.agent?.user.name || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" className="rounded-full">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
