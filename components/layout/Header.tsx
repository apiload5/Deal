// components/layout/Header.tsx
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { 
  Menu, X, Home, Search, Plus, User, LogOut, 
  ChevronDown, LayoutDashboard, Building, Crown, Phone
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

export function Header() {
  const { user, profile, signOut, isAdmin, isAgent } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white shadow-sm'
      }`}
    >
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary text-white font-bold text-xl p-2 rounded-lg group-hover:bg-primary/90 transition">
              D
            </div>
            <span className="text-xl font-bold hidden sm:block">
              deal<span className="text-primary">.online</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-primary transition flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link href="/properties" className="text-gray-600 hover:text-primary transition flex items-center gap-1">
              <Search className="h-4 w-4" />
              Properties
            </Link>
            <Link href="/agents" className="text-gray-600 hover:text-primary transition flex items-center gap-1">
              <Building className="h-4 w-4" />
              Agents
            </Link>
            <Link href="/premium" className="text-gray-600 hover:text-primary transition flex items-center gap-1">
              <Crown className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-600 font-medium">Premium</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/add-property">
                  <Button size="sm" className="hidden sm:flex">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                        {profile?.name?.[0] || user.email?.[0] || 'U'}
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">{profile?.name || 'User'}</span>
                        <span className="text-xs text-gray-500">{user.email || user.phone}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {isAgent && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/agent" className="cursor-pointer">
                          <Building className="h-4 w-4 mr-2" />
                          Agent Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/admin" className="cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/add-property" className="cursor-pointer">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Property
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-red-600 cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t">
            <div className="flex flex-col gap-3">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-primary px-2 py-2 rounded-lg hover:bg-gray-50">
                <Home className="h-5 w-5" />
                Home
              </Link>
              <Link href="/properties" className="flex items-center gap-2 text-gray-600 hover:text-primary px-2 py-2 rounded-lg hover:bg-gray-50">
                <Search className="h-5 w-5" />
                Properties
              </Link>
              <Link href="/agents" className="flex items-center gap-2 text-gray-600 hover:text-primary px-2 py-2 rounded-lg hover:bg-gray-50">
                <Building className="h-5 w-5" />
                Agents
              </Link>
              <Link href="/premium" className="flex items-center gap-2 text-gray-600 hover:text-primary px-2 py-2 rounded-lg hover:bg-gray-50">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span className="text-yellow-600">Premium</span>
              </Link>
              {user && (
                <>
                  <Link href="/add-property" className="flex items-center gap-2 text-gray-600 hover:text-primary px-2 py-2 rounded-lg hover:bg-gray-50">
                    <Plus className="h-5 w-5" />
                    Add Property
                  </Link>
                  <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-primary px-2 py-2 rounded-lg hover:bg-gray-50">
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                  {isAgent && (
                    <Link href="/dashboard/agent" className="flex items-center gap-2 text-gray-600 hover:text-primary px-2 py-2 rounded-lg hover:bg-gray-50">
                      <Building className="h-5 w-5" />
                      Agent Panel
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/dashboard/admin" className="flex items-center gap-2 text-gray-600 hover:text-primary px-2 py-2 rounded-lg hover:bg-gray-50">
                      <User className="h-5 w-5" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={signOut}
                    className="flex items-center gap-2 text-red-600 px-2 py-2 rounded-lg hover:bg-red-50 text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              )}
              {!user && (
                <Link href="/login" className="flex items-center gap-2 text-primary px-2 py-2 rounded-lg hover:bg-gray-50">
                  <Phone className="h-5 w-5" />
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
