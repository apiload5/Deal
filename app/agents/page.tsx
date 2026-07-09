import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Building, Phone, Mail } from 'lucide-react'

const sampleAgents = [
  {
    id: '1',
    name: 'Ahmed Khan',
    company: 'ABC Real Estate',
    phone: '03001234567',
    email: 'ahmed@example.com',
    specialization: ['Residential', 'Luxury'],
    is_verified: true,
  },
  {
    id: '2',
    name: 'Sarah Ali',
    company: 'XYZ Properties',
    phone: '03007654321',
    email: 'sarah@example.com',
    specialization: ['Commercial', 'Investment'],
    is_verified: false,
  },
]

export default function AgentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Real Estate Agents</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleAgents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription>{agent.company}</CardDescription>
                  </div>
                </div>
                {agent.is_verified && (
                  <Badge variant="secondary">Verified</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{agent.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{agent.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span>{agent.specialization.join(', ')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
