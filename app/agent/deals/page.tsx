import * as React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'

export default async function AgentDealsPage() {
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

  const deals = await prisma.deal.findMany({
    where: { agentId: user.agentProfile.id },
    include: {
      property: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 gradient-text">My Deals</h1>

      {deals.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">No deals yet</p>
            <p className="text-sm text-muted-foreground">Your deals will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass">
          <CardHeader>
            <CardTitle>All Deals ({deals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Property</th>
                    <th className="text-left py-3 px-4">Sale Price</th>
                    <th className="text-left py-3 px-4">Commission</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{deal.property.title}</td>
                      <td className="py-3 px-4 font-medium">{formatPrice(deal.salePriceRs)}</td>
                      <td className="py-3 px-4">{formatPrice(deal.commissionRs)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={
                          deal.status === 'completed' ? 'success' :
                          deal.status === 'approved' ? 'warning' :
                          deal.status === 'paid' ? 'default' :
                          'destructive'
                        }>
                          {deal.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{formatDate(deal.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
