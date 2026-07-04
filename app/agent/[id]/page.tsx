import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Star, MapPin, Phone, Mail, Award, 
  Building2, Calendar, Users 
} from 'lucide-react';
import PropertyCard from '@/components/properties/PropertyCard';
import { getInitials, formatDate } from '@/lib/utils/helpers';
import { Property } from '@/types';
import AdBanner from '@/components/shared/AdBanner';

interface AgentProfilePageProps {
  params: {
    id: string;
  };
}

export default async function AgentProfilePage({ params }: AgentProfilePageProps) {
  const supabase = createServerClient();

  // Fetch agent
  const { data: agent } = await supabase
    .from('agents')
    .select(`
      *,
      user:users(*)
    `)
    .eq('id', params.id)
    .single();

  if (!agent) {
    notFound();
  }

  // Fetch agent's properties
  const { data: properties } = await supabase
    .from('properties')
    .select(`
      *,
      city:cities(*),
      owner:users(*)
    `)
    .eq('owner_id', agent.user_id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">
                {getInitials(agent.user?.name || agent.company_name || 'Agent')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <h1 className="text-2xl font-bold">
                  {agent.company_name || agent.user?.name || 'Real Estate Agent'}
                </h1>
                {agent.is_verified && (
                  <Badge className="bg-green-500">
                    <Award className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground">{agent.user?.name || 'Professional Agent'}</p>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                {agent.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {agent.rating} ★
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {agent.total_listings || 0} Listings
                </span>
                {agent.experience_years && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {agent.experience_years} Years Experience
                  </span>
                )}
              </div>

              {agent.specialization && agent.specialization.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-1 md:justify-start">
                  {agent.specialization.map((spec: string) => (
                    <Badge key={spec} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button asChild>
                <a
                  href={`https://wa.me/92${agent.user?.phone || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Contact
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Details */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">License</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-medium">{agent.license_number || 'Not provided'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-medium">{formatDate(agent.created_at)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-medium">{agent.company_name || 'Independent'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Ad Banner */}
      <div className="mb-8">
        <AdBanner slot="1234567894" format="horizontal" />
      </div>

      {/* Properties List */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold">
          Properties by {agent.company_name || agent.user?.name || 'Agent'}
        </h2>
        {properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property: Property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                No properties listed yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
