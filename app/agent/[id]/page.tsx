import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Phone, Mail, Building, Star } from 'lucide-react'

const sampleAgents = {
  '1': {
    id: '1',
    name: 'Ahmed Khan',
    company: 'ABC Real Estate',
    phone: '03001234567',
    email: 'ahmed@example.com',
    specialization: ['Residential', 'Luxury'],
    is_verified: true,
    experience: 10,
    rating: 4.8,
    totalListings: 25,
  },
}

interface AgentPageProps {
  params: {
    id: string
  }
}

export default function AgentPage({ params }: AgentPageProps) {
  const agent = sampleAgents[params.id as keyof typeof sampleAgents]
  
  if (!agent) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {agent.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{agent.name}</h1>
                <p className="text-gray-500">{agent.company}</p>
                <div className="flex items-center gap-2 mt-2">
                  {agent.is_verified && (
                    <Badge variant="secondary">Verified Agent</Badge>
                  )}
                  <Badge variant="outline">{agent.experience} years experience</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className="text-lg font-semibold">{agent.rating}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{agent.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{agent.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-400" />
              <span>{agent.specialization.join(', ')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Properties by {agent.name}</h2>
        <p className="text-gray-500">No properties listed yet.</p>
      </div>
    </div>
  )
}
