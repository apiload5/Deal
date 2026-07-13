'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPKR, formatDate } from '@/lib/utils'
import { Check, X, Loader2, Eye } from 'lucide-react'

// Mock data
const mockDeals = [
  {
    id: '1',
    property: {
      id: '1',
      title: 'Luxury Villa with Ocean View',
      price: 45000000,
    },
    agent: {
      id: '1',
      name: 'Ali Khan',
    },
    buyerId: 'user1',
    sellerId: 'user2',
    salePriceRs: 42000000,
    sellerAmountRs: 38000000,
    commissionRs: 4000000,
    platformFeePercent: 1.0,
    platformFeeRs: 420000,
    status: 'pending',
    createdAt: '2024-01-15',
    completedAt: null,
  },
  {
    id: '2',
    property: {
      id: '2',
      title: 'Modern Apartment in DHA',
      price: 12000000,
    },
    agent: {
      id: '2',
      name: 'Sara Ahmed',
    },
    buyerId: 'user3',
    sellerId: 'user4',
    salePriceRs: 11500000,
    sellerAmountRs: 10500000,
    commissionRs: 1000000,
    platformFeePercent: 1.0,
    platformFeeRs: 115000,
    status: 'approved',
    createdAt: '2024-01-10',
    completedAt: null,
  },
]

const statusColors = {
  pending: 'warning',
  approved: 'secondary',
  paid: 'info',
  completed: 'success',
  cancelled: 'destructive',
}

export default function AdminDealsPage() {
  const [deals, setDeals] = useState(mockDeals)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch deals from API
    const fetchDeals = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setDeals(mockDeals)
      setIsLoading(false)
    }
    fetchDeals()
  }, [])

  const handleApproveInvoice = async (dealId: string) => {
    // API call to approve invoice
    console.log('Approving invoice for deal:', dealId)
    setDeals(deals.map(deal => 
      deal.id === dealId ? { ...deal, status: 'approved' } : deal
    ))
  }

  const handleMarkCompleted = async (dealId: string) => {
    // API call to mark deal as completed
    console.log('Marking deal as completed:', dealId)
    setDeals(deals.map(deal => 
      deal.id === dealId ? { ...deal, status: 'completed', completedAt: new Date().toISOString() } : deal
    ))
  }

  const handleCancelDeal = async (dealId: string) => {
    if (confirm('Are you sure you want to cancel this deal?')) {
      // API call to cancel deal
      console.log('Cancelling deal:', dealId)
      setDeals(deals.map(deal => 
        deal.id === dealId ? { ...deal, status: 'cancelled' } : deal
      ))
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals Management</h1>
          <p className="text-muted-foreground">Manage all property deals and transactions</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            Total Deals: {deals.length}
          </Badge>
          <Badge variant="success" className="text-sm">
            Completed: {deals.filter(d => d.status === 'completed').length}
          </Badge>
          <Badge variant="warning" className="text-sm">
            Pending: {deals.filter(d => d.status === 'pending').length}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPKR(deals.reduce((sum, d) => sum + d.salePriceRs, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatPKR(deals.reduce((sum, d) => sum + d.commissionRs, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatPKR(deals.reduce((sum, d) => sum + d.platformFeeRs, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Deal Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPKR(deals.length > 0 
                ? deals.reduce((sum, d) => sum + d.salePriceRs, 0) / deals.length 
                : 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Sale Price</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{deal.property.title}</p>
                        <p className="text-sm text-muted-foreground">#{deal.property.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>{deal.agent.name}</TableCell>
                    <TableCell className="font-medium">{formatPKR(deal.salePriceRs)}</TableCell>
                    <TableCell className="text-primary">{formatPKR(deal.commissionRs)}</TableCell>
                    <TableCell className="text-purple-600">{formatPKR(deal.platformFeeRs)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[deal.status as keyof typeof statusColors] as any}>
                        {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(deal.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {deal.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-green-600 hover:text-green-700"
                              onClick={() => handleApproveInvoice(deal.id)}
                            >
                              <Check className="h-3 w-3" /> Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-destructive hover:text-destructive"
                              onClick={() => handleCancelDeal(deal.id)}
                            >
                              <X className="h-3 w-3" /> Cancel
                            </Button>
                          </>
                        )}
                        {deal.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-primary hover:text-primary"
                            onClick={() => handleMarkCompleted(deal.id)}
                          >
                            <Check className="h-3 w-3" /> Mark Completed
                          </Button>
                        )}
                        {deal.status === 'completed' && (
                          <Badge variant="success">Completed</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
