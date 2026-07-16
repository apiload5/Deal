import * as React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'

export default async function AdminTransactionsPage() {
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

  const transactions = await prisma.payment.findMany({
    include: {
      agent: {
        include: {
          user: true,
        },
      },
      property: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 gradient-text">Transactions</h1>

      <Card className="glass">
        <CardHeader>
          <CardTitle>All Transactions ({transactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Agent</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono text-xs">{transaction.orderId}</td>
                    <td className="py-3 px-4">{transaction.agent.user.name}</td>
                    <td className="py-3 px-4 font-medium">{formatPrice(transaction.amountRs)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={
                        transaction.type === 'premium' ? 'success' :
                        transaction.type === 'featured' ? 'warning' :
                        'default'
                      }>
                        {transaction.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={
                        transaction.status === 'completed' ? 'success' :
                        transaction.status === 'pending' ? 'warning' :
                        'destructive'
                      }>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{formatDate(transaction.createdAt)}</td>
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
