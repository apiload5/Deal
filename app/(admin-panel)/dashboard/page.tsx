import * as React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Users, DollarSign, TrendingUp, Building, FileText } from 'lucide-react'

export default async function AdminDashboardPage() {
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

  const [
    totalProperties,
    totalUsers,
    totalAgents,
    totalDeals,
    totalTransactions,
    totalViews,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.user.count(),
    prisma.agent.count(),
    prisma.deal.count(),
    prisma.payment.count(),
    prisma.property.aggregate({
      _sum: { views: true },
    }),
  ])

  const stats = [
    {
      title: 'Total Properties',
      value: totalProperties,
      icon: Home,
      color: 'text-blue-500',
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-green-500',
    },
    {
      title: 'Total Agents',
      value: totalAgents,
      icon: Building,
      color: 'text-purple-500',
    },
    {
      title: 'Total Deals',
      value: totalDeals,
      icon: TrendingUp,
      color: 'text-yellow-500',
    },
    {
      title: 'Transactions',
      value: totalTransactions,
      icon: DollarSign,
      color: 'text-red-500',
    },
    {
      title: 'Total Views',
      value: totalViews._sum.views || 0,
      icon: FileText,
      color: 'text-orange-500',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 gradient-text">Admin Dashboard</h1>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.title} className="glass">
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
        <Card className="glass">
          <CardHeader>
            <CardTitle>Recent Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Recent properties will appear here</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader>
            <CardTitle>Recent Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Recent deals will appear here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
