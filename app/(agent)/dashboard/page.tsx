import * as React from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, TrendingUp, Users, DollarSign } from 'lucide-react'

export default async function AgentDashboardPage() {
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

  const [properties, deals, stats] = await Promise.all([
    prisma.property.count({
      where: { agentId: user.agentProfile.id },
    }),
    prisma.deal.count({
      where: { agentId: user.agentProfile.id },
    }),
    prisma.property.aggregate({
      where: { agentId: user.agentProfile.id },
      _sum: { views: true },
    }),
  ])

  const dashboardData = [
    {
      title: 'Total Properties',
      value: properties,
      icon: Home,
      color: 'text-blue-500',
    },
    {
      title: 'Total Deals',
      value: deals,
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      title: 'Total Views',
      value: stats._sum.views || 0,
      icon: Users,
      color: 'text-purple-500',
    },
    {
      title: 'Rating',
      value: `${user.agentProfile.rating.toFixed(1)} ★`,
      icon: DollarSign,
      color: 'text-yellow-500',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Agent Dashboard</h1>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardData.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Your properties will appear here</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Your recent deals will appear here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
