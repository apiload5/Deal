import * as React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function AdminAgentsPage() {
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

  const agents = await prisma.agent.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">Manage Agents</h1>
        <Button className="btn-premium">Add Agent</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id} className="glass">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={agent.user.image || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                    {agent.user.name?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{agent.user.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{agent.company}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phone</span>
                <span>{agent.phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Verified</span>
                <Badge variant={agent.verified ? 'success' : 'destructive'}>
                  {agent.verified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rating</span>
                <span>{agent.rating.toFixed(1)} ★</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deals</span>
                <span>{agent.totalDealsCompleted}</span>
              </div>
              <Button className="w-full mt-4">Manage Agent</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
