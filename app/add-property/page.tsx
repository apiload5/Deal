// app/add-property/page.tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { PropertyForm } from '@/components/PropertyForm'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AddPropertyPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Add New Property</h1>
      <PropertyForm />
    </div>
  )
}
