// components/shared/PropertyCard.tsx - ALREADY EXISTS
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card' // ✅ UI component use kar raha hai
import { Badge } from '@/components/ui/badge' // ✅ UI component use kar raha hai

export function PropertyCard({ property }: any) {
  return (
    <Link href={`/property/${property.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent>
          {/* UI components render ho rahe hain */}
          <Badge variant="premium">Premium</Badge>
          <h3>{property.title}</h3>
          <p>{property.price}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
