// TEMPORARILY DISABLED - Admin Dashboard

// import { createServerClient } from '@/lib/supabase/server';
// import { redirect } from 'next/navigation';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Users, Home, Eye, DollarSign } from 'lucide-react';

// export default async function AdminDashboardPage() {
//   const supabase = createServerClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   const { data: profile } = await supabase
//     .from('users')
//     .select('role')
//     .eq('id', user?.id)
//     .single();

//   if (profile?.role !== 'admin') {
//     redirect('/dashboard');
//   }

//   const [
//     { count: totalUsers },
//     { count: totalProperties },
//     { count: totalViews },
//   ] = await Promise.all([
//     supabase.from('users').select('*', { count: 'exact', head: true }),
//     supabase.from('properties').select('*', { count: 'exact', head: true }),
//     supabase.from('property_views').select('*', { count: 'exact', head: true }),
//   ]);

//   const stats = [
//     { title: 'Total Users', value: totalUsers || 0, icon: Users },
//     { title: 'Properties', value: totalProperties || 0, icon: Home },
//     { title: 'Total Views', value: totalViews || 0, icon: Eye },
//     { title: 'Revenue', value: 'PKR 0', icon: DollarSign },
//   ];

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat) => (
//           <Card key={stat.title}>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
//               <stat.icon className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stat.value}</div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

export default function AdminDashboardDisabled() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground mt-2">This page is temporarily disabled.</p>
    </div>
  );
}
