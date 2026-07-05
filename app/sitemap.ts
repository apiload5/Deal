// app/sitemap.ts
import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deal.online'
  
  // Fetch all properties
  const { data: properties } = await supabase
    .from('properties')
    .select('id, updated_at')
    .eq('status', 'active')
  
  // Fetch all cities
  const { data: cities } = await supabase
    .from('cities')
    .select('slug, updated_at')
  
  // Fetch all agents
  const { data: agents } = await supabase
    .from('agents')
    .select('id, updated_at')
    .eq('is_verified', true)

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/premium`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/add-property`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Property routes
  const propertyRoutes = properties?.map((property) => ({
    url: `${baseUrl}/property/${property.id}`,
    lastModified: new Date(property.updated_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || []

  // City routes
  const cityRoutes = cities?.map((city) => ({
    url: `${baseUrl}/properties?city=${city.slug}`,
    lastModified: new Date(city.updated_at || Date.now()),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  })) || []

  // Agent routes
  const agentRoutes = agents?.map((agent) => ({
    url: `${baseUrl}/agent/${agent.id}`,
    lastModified: new Date(agent.updated_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  })) || []

  return [...staticRoutes, ...propertyRoutes, ...cityRoutes, ...agentRoutes]
}
