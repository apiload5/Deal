import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, MapPin, Star } from 'lucide-react';
import { getInitials } from '@/lib/utils/helpers';
import { Input } from '@/components/ui/input';

export const revalidate = 3600;

interface AgentsPageProps {
  searchParams: {
    search?: string;
  };
}

export default async function AgentsPage({ searchParams }: AgentsPageProps) {
  const supabase = createServerClient();
  
  let query = supabase
    .from('agents')
    .select(`
      *,
      user:users(*)
    `)
    .eq('is_verified', true)
    .order('rating', { ascending: false });

  if (searchParams.search) {
    query = query.ilike('company_name', `%${searchParams.search}%`);
  }

  const { data: agents } = await query;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Real Estate Agents</h1>
        <p className="text-muted-foreground">
          Connect with verified real estate agents across Pakistan
        </p>
      </div>

      {/* Search */}
      <form className="mb-8 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search agents by name or company..."
            className="pl-9"
            defaultValue={searchParams.search || ''}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Agents Grid */}
      {agents && agents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Link key={agent.id} href={`/agent/${agent.id}`}>
              <Card className="transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg">
                        {getInitials(agent.user?.name || agent.company_name || 'Agent')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {agent.company_name || agent.user?.name || 'Agent'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {agent.user?.name || 'Real Estate Agent'}
                          </p>
                        </div>
                        {agent.is_verified && (
                          <Badge className="bg-green-500">Verified</Badge>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        {agent.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {agent.rating}
                          </span>
                        )}
                        <span>
                          {agent.total_listings} listings
                        </span>
                        {agent.experience_years && (
                          <span>
                            {agent.experience_years} years experience
                          </span>
                        )}
                      </div>

                      {agent.specialization && agent.specialization.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {agent.specialization.map((spec: string) => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No agents found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
