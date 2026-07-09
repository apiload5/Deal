'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Home, TrendingUp, Star } from 'lucide-react'

export default function AgentDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Agent Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Listings</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <Home className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Views</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <p className="text-2xl font-bold">0 ★</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Commission</p>
              <p className="text-2xl font-bold">PKR 0</p>
            </div>
            <Building className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Agent dashboard coming soon. All agent features will be available here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
