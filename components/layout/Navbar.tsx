'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
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
import ThemeToggle from './ThemeToggle'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Search, 
  MapPin, 
  Menu, 
  X, 
  User, 
  Bell, 
  Heart, 
  LogOut, 
  Settings, 
  PlusCircle,
  Building2,
  ChevronDown
} from 'lucide-react'

const Navbar = () => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Properties', href: '/properties', icon: Search },
    { name: 'Map View', href: '/map', icon: MapPin },
  ]

  const isActive = (path: string) => {
    if (path === '/') return pathname === path
    return pathname?.startsWith(path)
  }

  const userInitial = session?.user?.name?.[0]?.toUpperCase() || 'U'

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled 
          ? 'bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-lg' 
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">Deal.pk</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300',
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-primary'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-primary'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {session ? (
              <>
                <Link href="/wishlist" className="hidden sm:block">
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Heart className="h-5 w-5" />
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-[10px] text-white">
                      0
                    </span>
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-orange-500/50">
                      <Avatar className="h-10 w-10 border-2 border-orange-500/30">
                        <AvatarImage src={session.user?.image || ''} />
                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-2xl border-white/10 bg-white/10 backdrop-blur-xl" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link href="/wishlist" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Wishlist
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link href="/alerts" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Alerts
                      </Link>
                    </DropdownMenuItem>
                    {session.user?.role === 'agent' && (
                      <>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                          <Link href="/agent/dashboard" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Agent Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                          <Link href="/agent/properties/new" className="flex items-center gap-2 text-orange-500">
                            <PlusCircle className="h-4 w-4" />
                            Add Property
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {session.user?.role === 'admin' && (
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link href="/admin-panel/dashboard" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="rounded-xl cursor-pointer text-red-500 hover:text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/signin">
                  <Button variant="ghost" className="rounded-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="rounded-full btn-premium">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 border-t border-white/10 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300',
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-primary'
                        : 'text-muted-foreground hover:bg-white/5'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
                {!session && (
                  <div className="pt-4 space-y-2">
                    <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full rounded-full btn-premium">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navbar
