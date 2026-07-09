'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, Plus, User, Phone } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white font-bold text-xl p-2 rounded-lg">
              D
            </div>
            <span className="text-xl font-bold hidden sm:block">
              deal<span className="text-blue-600">.online</span>
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition">
              Home
            </Link>
            <Link href="/properties" className="text-gray-600 hover:text-blue-600 transition">
              Properties
            </Link>
            <Link href="/agents" className="text-gray-600 hover:text-blue-600 transition">
              Agents
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/add-property">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
