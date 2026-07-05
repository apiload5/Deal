// TEMPORARILY DISABLED - Premium page

// import { createServerClient } from '@/lib/supabase/server';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Crown, Check } from 'lucide-react';
// import Link from 'next/link';

// export default async function PremiumPage() {
//   const supabase = createServerClient();
//   const { data: settings } = await supabase
//     .from('site_settings')
//     .select('value')
//     .eq('key', 'premium_price')
//     .single();

//   const price = settings?.value || '999';

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-4xl">
//       <div className="text-center mb-8">
//         <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
//         <h1 className="text-3xl font-bold">Premium Listing</h1>
//         <p className="text-muted-foreground">Get your property featured at the top</p>
//       </div>

//       <Card className="border-2 border-yellow-400">
//         <CardHeader>
//           <CardTitle className="text-center text-2xl">
//             Premium Package
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center mb-6">
//             <span className="text-4xl font-bold">PKR {price}</span>
//             <span className="text-muted-foreground"> / month</span>
//           </div>
//           <ul className="space-y-3">
//             <li className="flex items-center gap-2">
//               <Check className="h-5 w-5 text-green-500" />
//               Featured badge on listing
//             </li>
//             <li className="flex items-center gap-2">
//               <Check className="h-5 w-5 text-green-500" />
//               Priority in search results
//             </li>
//             <li className="flex items-center gap-2">
//               <Check className="h-5 w-5 text-green-500" />
//               Premium gold border
//             </li>
//             <li className="flex items-center gap-2">
//               <Check className="h-5 w-5 text-green-500" />
//               Top of category listings
//             </li>
//           </ul>
//           <Button className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600">
//             Upgrade to Premium
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

export default function PremiumDisabled() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold">Premium</h1>
      <p className="text-muted-foreground mt-2">This page is temporarily disabled.</p>
    </div>
  );
}
