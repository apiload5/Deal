// app/dashboard/admin/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './AdminDashboardClient';

// This is a Server Component for initial auth check
export default async function AdminPage() {
  const supabase = createServerClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || userData.role !== 'admin') {
    redirect('/dashboard');
  }

  // Render the client component with admin data
  return <AdminDashboardClient />;
}
