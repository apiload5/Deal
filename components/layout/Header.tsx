// components/layout/Header.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, User, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils/helpers';

export default function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  const checkAdmin = useCallback(async () => {
    if (user) {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        setIsAdmin(data?.role === 'admin');
      } catch (error) {
        // If there's an error, user is not admin
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="text-primary">deal</span>
            <span className="text-secondary">.online</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/properties"
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary ${
                isActive('/properties') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Search className="h-4 w-4" />
              Properties
            </Link>
            <Link
              href="/agents"
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary ${
                isActive('/agents') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Agents
            </Link>
            {user && (
              <Link
                href="/add-property"
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/add-property') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                Add Property
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {getInitials(user.user_metadata?.full_name || user.phone || 'User')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.phone || user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/agent" className="cursor-pointer">
                      <Search className="mr-2 h-4 w-4" />
                      Agent Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/premium" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4 text-premium" />
                      Upgrade to Premium
                    </Link>
                  </DropdownMenuItem>
                  {/* Admin link - ONLY visible to admin users in dropdown */}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600">
                        <Link href="/dashboard/admin" className="cursor-pointer flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <span>Admin Panel</span>
                          <span className="ml-auto text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            Secure
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/login">Login</Link>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t bg-white p-4 shadow-lg md:hidden">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/properties"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Search className="h-4 w-4" />
              Properties
            </Link>
            <Link
              href="/agents"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              Agents
            </Link>
            {user && (
              <>
                <Link
                  href="/add-property"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Property
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/agent"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Search className="h-4 w-4" />
                  Agent Dashboard
                </Link>
                <Link
                  href="/premium"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield className="h-4 w-4 text-premium" />
                  Upgrade to Premium
                </Link>
                {/* Admin link in mobile menu - ONLY visible to admin users */}
                {isAdmin && (
                  <Link
                    href="/dashboard/admin"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                    <span className="ml-auto text-[10px] bg-red-200 text-red-700 px-2 py-0.5 rounded-full">
                      Secure
                    </span>
                  </Link>
                )}
                <div className="border-t pt-2">
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
