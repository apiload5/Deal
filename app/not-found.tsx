import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold gradient-text">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link href="/">
          <Button className="gap-2 btn-premium">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </Link>
        <Link href="/properties">
          <Button variant="outline" className="gap-2 rounded-full">
            <Search className="h-4 w-4" />
            Browse Properties
          </Button>
        </Link>
      </div>
    </div>
  )
}
