'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, Award, Star, Users, 
  BarChart3, CheckCircle, XCircle 
} from 'lucide-react';
import { Agent } from '@/types';

export default function AgentDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isAgent, setIsAgent] = useState(false);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [formData, setFormData] = useState({
    company_name: '',
    license_number: '',
    experience_years: '',
    specialization: [] as string[],
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const fetchAgent = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setAgent(data);
      setIsAgent(!!data);
      setLoadingAgent(false);
    };

    fetchAgent();
  }, [user, loading, router]);

  const handleBecomeAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from('agents')
      .insert({
        user_id: user.id,
        company_name: formData.company_name,
        license_number: formData.license_number,
        experience_years: parseInt(formData.experience_years) || 0,
        specialization: formData.specialization,
        is_verified: false,
      });

    if (!error) {
      // Update user role
      await supabase
        .from('users')
        .update({ role: 'agent' })
        .eq('id', user.id);

      setIsAgent(true);
      setAgent({
        id: 'temp',
        user_id: user.id,
        company_name: formData.company_name,
        license_number: formData.license_number,
        experience_years: parseInt(formData.experience_years) || 0,
        specialization: formData.specialization,
        is_verified: false,
        rating: 0,
        total_listings: 0,
        created_at: new Date().toISOString(),
      });
    }
  };

  if (loading || loadingAgent) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="skeleton h-12 w-12 rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAgent) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Become an Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBecomeAgent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Your real estate company"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="Your real estate license number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                  placeholder="5"
                  min="0"
                />
              </div>

              <Button type="submit" className="w-full">
                Become an Agent
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your real estate business
        </p>
      </div>

      {/* Agent Profile */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {agent?.is_verified ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agent?.is_verified ? 'Verified' : 'Pending Verification'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent?.rating || 0} ★</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent?.total_listings || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Info */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <span className="text-sm text-muted-foreground">Company</span>
              <p className="font-medium">{agent?.company_name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">License</span>
              <p className="font-medium">{agent?.license_number || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Experience</span>
              <p className="font-medium">{agent?.experience_years || 0} years</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Specialization</span>
              <p className="font-medium">
                {agent?.specialization?.join(', ') || 'General'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <p>Agent analytics coming soon</p>
            <p className="text-sm">Track your property views, leads, and commissions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
