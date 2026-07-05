// TEMPORARILY DISABLED - Agent Dashboard

// import { createServerClient } from '@/lib/supabase/server';
// import { redirect } from 'next/navigation';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Home, Users, Star, Calendar } from 'lucide-react';

// export default async function AgentDashboardPage() {
//   const supabase = createServerClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   const { data: profile } = await supabase
//     .from('users')
//     .select('role')
//     .eq('id', user?.id)
//     .single();

//   if (profile?.role !== 'agent') {
//     redirect('/dashboard');
//   }

//   const { data: agent } = await supabase
//     .from('agents')
//     .select('*')
//     .eq('user_id', user?.id)
//     .single();

//   const { count: totalListings } = await supabase
//     .from('properties')
//     .select('*', { count: 'exact', head: true })
//     .eq('owner_id', user?.id);

//   const stats = [
//     { title: 'Total Listings', value: totalListings || 0, icon: Home },
//     { title: 'Rating', value: agent?.rating || 'N/A', icon: Star },
//     { title: 'Experience', value: `${agent?.experience_years || 0} years`, icon: Calendar },
//     { title: 'Status', value: agent?.is_verified ? 'Verified' : 'Pending', icon: Users },
//   ];

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">Agent Dashboard</h1>
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

export default function AgentDashboardDisabled() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold">Agent Dashboard</h1>
      <p className="text-muted-foreground mt-2">This page is temporarily disabled.</p>
    </div>
  );
}
