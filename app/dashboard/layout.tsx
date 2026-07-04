// app/dashboard/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Home, PlusCircle, 
  Users, Shield, Settings, BarChart3,
  Building2, Heart, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const supabase = createClient();
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        setIsAdmin(data?.role === 'admin');
      }
    };
    checkAdmin();
  }, [user]);

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-white md:block">
        <div className="flex h-full flex-col">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold text-primary">Dashboard</h2>
            <p className="text-sm text-muted-foreground">{user?.phone}</p>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive('/dashboard')
                  ? 'bg-primary-50 text-primary'
                  : 'hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Link>

            <Link
              href="/dashboard/agent"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive('/dashboard/agent')
                  ? 'bg-primary-50 text-primary'
                  : 'hover:bg-gray-100'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Agent Dashboard
            </Link>

            <Link
              href="/add-property"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive('/add-property')
                  ? 'bg-primary-50 text-primary'
                  : 'hover:bg-gray-100'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              Add Property
            </Link>

            <Link
              href="/premium"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive('/premium')
                  ? 'bg-primary-50 text-primary'
                  : 'hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Premium
            </Link>

            {/* Admin link - ONLY visible to admin users */}
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive('/dashboard/admin')
                    ? 'bg-red-50 text-red-600'
                    : 'hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin Panel
                <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  Secure
                </span>
              </Link>
            )}
          </nav>

          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
