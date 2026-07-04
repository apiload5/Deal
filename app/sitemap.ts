import { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient();
  const baseUrl = 'https://deal.online';

  // Fetch all properties
  const { data: properties } = await supabase
    .from('properties')
    .select('id, updated_at')
    .eq('status', 'active');

  // Fetch all cities
  const { data: cities } = await supabase
    .from('cities')
    .select('slug');

  const propertyUrls = properties?.map((property) => ({
    url: `${baseUrl}/property/${property.id}`,
    lastModified: property.updated_at || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || [];

  const cityUrls = cities?.map((city) => ({
    url: `${baseUrl}/properties?city=${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  })) || [];

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  return [...staticUrls, ...propertyUrls, ...cityUrls];
}
