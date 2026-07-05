// TEMPORARILY DISABLED - Agents list page

// import { createServerClient } from '@/lib/supabase/server';
// import Link from 'next/link';
// import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { Search, MapPin, Star } from 'lucide-react';
// import { getInitials } from '@/lib/utils/helper';
// import { Input } from '@/components/ui/input';

// export const revalidate = 3600;

// interface AgentsPageProps {
//   searchParams: {
//     search: string;
//   };
// }

// export default async function AgentsPage({ searchParams }: AgentsPageProps) {
//   const supabase = createServerClient();
  
//   let query = supabase
//     .from('agents')
//     .select(`
//       *,
//       user:users(*)
//     `)
//     .eq('is_verified', true);

//   if (searchParams.search) {
//     query = query.or(`company_name.ilike.%${searchParams.search}%,user.name.ilike.%${searchParams.search}%`);
//   }

//   const { data: agents } = await query
//     .order('rating', { ascending: false })
//     .limit(20);

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col gap-6">
//         <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//           <h1 className="text-3xl font-bold">Our Agents</h1>
//           <form className="flex w-full max-w-sm gap-2">
//             <Input
//               name="search"
//               placeholder="Search agents..."
//               defaultValue={searchParams.search || ''}
//               className="flex-1"
//             />
//             <Button type="submit">
//               <Search className="h-4 w-4" />
//             </Button>
//           </form>
//         </div>

//         {agents && agents.length > 0 ? (
//           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//             {agents.map((agent) => (
//               <Link key={agent.id} href={`/agent/${agent.id}`}>
//                 <Card className="hover:shadow-lg transition-shadow">
//                   <CardContent className="p-6">
//                     <div className="flex flex-col items-center text-center">
//                       <Avatar className="h-20 w-20">
//                         <AvatarFallback>
//                           {getInitials(agent.user?.name || agent.company_name || 'Agent')}
//                         </AvatarFallback>
//                       </Avatar>
//                       <h3 className="mt-3 font-semibold">
//                         {agent.company_name || agent.user?.name}
//                       </h3>
//                       {agent.is_verified && (
//                         <Badge className="mt-1 bg-green-500 text-xs">
//                           ✓ Verified
//                         </Badge>
//                       )}
//                       {agent.rating > 0 && (
//                         <div className="mt-2 flex items-center gap-1 text-sm">
//                           <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
//                           <span>{agent.rating} ★</span>
//                           <span className="text-muted-foreground">
//                             ({agent.total_listings || 0} listings)
//                           </span>
//                         </div>
//                       )}
//                       {agent.specialization && agent.specialization.length > 0 && (
//                         <div className="mt-2 flex flex-wrap justify-center gap-1">
//                           {agent.specialization.slice(0, 2).map((spec: string) => (
//                             <Badge key={spec} variant="secondary" className="text-xs">
//                               {spec}
//                             </Badge>
//                           ))}
//                           {agent.specialization.length > 2 && (
//                             <Badge variant="secondary" className="text-xs">
//                               +{agent.specialization.length - 2}
//                             </Badge>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </Link>
//             ))}
//           </div>
//         ) : (
//           <Card>
//             <CardContent className="flex flex-col items-center justify-center py-12">
//               <p className="text-center text-muted-foreground">No agents found.</p>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// }

export default function AgentsListDisabled() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold">Agents</h1>
      <p className="text-muted-foreground mt-2">This page is temporarily disabled.</p>
    </div>
  );
}
