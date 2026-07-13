'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from './ThemeToggle'
import { Menu, X, Home, Search, Map, Heart, Bell, User, PlusCircle, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const userRole = session?.user?.role

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/properties', label: 'Properties', icon: Search },
    { href: '/map', label: 'Map', icon: Map },
    { href: '/compare', label: 'Compare', icon: Search },
  ]

  const userLinks = [
    { href: '/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/alerts', label: 'Alerts', icon: Bell },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  const agentLinks = [
    { href: '/agent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/agent/properties', label: 'My Properties', icon: Search },
    { href: '/agent/properties/new', label: 'Add Property', icon: PlusCircle },
    { href: '/agent/deals', label: 'Deals', icon: Home },
    { href: '/agent/profile', label: 'Profile', icon: User },
  ]

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/properties', label: 'Properties', icon: Search },
    { href: '/admin/agents', label: 'Agents', icon: User },
    { href: '/admin/deals', label: 'Deals', icon: Home },
    { href: '/admin/transactions', label: 'Transactions', icon: Search },
    { href: '/admin/settings', label: 'Settings', icon: User },
  ]

  const getLinks = () => {
    if (userRole === 'admin') return adminLinks
    if (userRole === 'agent') return agentLinks
    return userLinks
  }

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        isScrolled ? 'glass-morphism shadow-lg' : 'bg-transparent'
      )}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Deal.pk
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />

          {status === 'loading' ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                    <AvatarFallback>{session.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {getLinks().map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="flex items-center gap-2">
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={() => signIn()}>
                Sign In
              </Button>
              <Button onClick={() => signIn('google')}>Sign Up</Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="glass-morphism border-t md:hidden">
          <div className="container mx-auto space-y-4 px-4 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium hover:bg-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <hr className="border-border" />
            {session ? (
              <>
                {getLinks().map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium hover:bg-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    signOut()
                  }}
                  className="flex w-full items-center gap-2 rounded-lg p-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    signIn()
                  }}
                  className="flex w-full items-center gap-2 rounded-lg p-2 text-sm font-medium hover:bg-accent"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    signIn('google')
                  }}
                  className="flex w-full items-center gap-2 rounded-lg p-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign Up
                </button>
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
