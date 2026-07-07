'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { User, FileText, Heart, Plus } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {session.user?.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your properties and listings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Active Listings</p>
                  <p className="text-3xl font-bold">5</p>
                </div>
                <FileText className="w-10 h-10 text-primary-600 opacity-50" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Saved Properties</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <Heart className="w-10 h-10 text-red-600 opacity-50" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Views</p>
                  <p className="text-3xl font-bold">243</p>
                </div>
                <div className="w-10 h-10 bg-gradient-primary rounded-full opacity-50" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Inquiries</p>
                  <p className="text-3xl font-bold">8</p>
                </div>
                <div className="w-10 h-10 bg-gradient-primary rounded-full opacity-50" />
              </div>
            </div>
          </Card>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Listings */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">My Listings</h2>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Listing
                  </Button>
                </div>

                <div className="space-y-4">
                  {[1, 2, 3].map((listing) => (
                    <div
                      key={listing}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                    >
                      <div>
                        <h3 className="font-semibold">Modern Apartment in DHA</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Karachi • Rs 5,000,000</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">12 Views</p>
                        <p className="text-xs text-green-600">Active</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-semibold">{session.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                    <p className="font-semibold">January 2024</p>
                  </div>
                  <Button className="w-full mt-4">Edit Profile</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
