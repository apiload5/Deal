'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, Search, Heart, MessageSquare, User } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold">
              D
            </div>
            <span className="font-bold text-xl hidden sm:inline">Deal.pk</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-sm mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search properties..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/properties" className="hover:text-primary-600 transition">
              Browse
            </Link>
            <Link href="/sell" className="hover:text-primary-600 transition">
              Sell
            </Link>
            <Link href="/rent" className="hover:text-primary-600 transition">
              Rent
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/wishlist" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link href="/messages" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition">
                  <MessageSquare className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 rounded-lg bg-gradient-primary text-white hover:shadow-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                  Login
                </Link>
                <Link href="/signup" className="px-4 py-2 rounded-lg bg-gradient-primary text-white hover:shadow-lg transition">
                  Sign Up
                </Link>
              </>
            )}
            <ThemeToggle />
            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/properties" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
              Browse
            </Link>
            <Link href="/sell" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
              Sell
            </Link>
            <Link href="/rent" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
              Rent
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
