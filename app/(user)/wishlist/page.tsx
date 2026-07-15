import * as React from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PropertyCard } from '@/features/search/components/PropertyCard'

export default async function WishlistPage() {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      wishlist: {
        include: {
          property: {
            include: {
              agent: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  })

  const wishlistItems = user?.wishlist || []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      
      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">Your wishlist is empty</p>
            <p className="text-sm text-muted-foreground">Start saving properties you love</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map((item) => (
            <PropertyCard key={item.id} property={item.property} />
          ))}
        </div>
      )}
    </div>
  )
}
