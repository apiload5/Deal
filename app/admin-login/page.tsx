// TEMPORARILY DISABLED - Admin login page

// 'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { createClient } from '@/lib/supabase/client';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { toast } from '@/hooks/use-toast';

// export default function AdminLoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();
//   const supabase = createClient();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const { error } = await supabase.auth.signInWithPassword({ email, password });
//       if (error) throw error;
//       router.push('/admin');
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Invalid credentials',
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle>Admin Login</CardTitle>
//           <CardDescription>Enter your admin credentials</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleLogin} className="space-y-4">
//             <div>
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="admin@deal.pk"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? 'Logging in...' : 'Login'}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

export default function AdminLoginDisabled() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold">Admin Login</h1>
      <p className="text-muted-foreground mt-2">This page is temporarily disabled.</p>
    </div>
  );
}
