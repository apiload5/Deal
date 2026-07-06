// components/header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Menu, X, Sun, Moon, User, LogOut, Home, Building, MapPin, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from './language-switcher';

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/properties', label: 'Properties', icon: Building },
    { href: '/map', label: 'Map View', icon: MapPin },
    { href: '/area-guide', label: 'Area Guide', icon: MapPin },
    { href: '/blog', label: 'Blog', icon: MapPin },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Deal.pk
            </span>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
              PAKISTAN
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-blue-600 ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hidden md:inline-flex"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <UserCircle className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  {session.user?.role === 'agent' && (
                    <DropdownMenuItem>
                      <Building className="w-4 h-4 mr-2" />
                      Agent Dashboard
                    </DropdownMenuItem>
                  )}
                  {session.user?.role === 'admin' && (
                    <DropdownMenuItem>
                      <Building className="w-4 h-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}

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
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            {!session && (
              <div className="pt-4 space-y-2">
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="block">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
