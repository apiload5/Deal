import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://deal.pk';

  const { data: properties } = await supabase
    .from('properties')
    .select('id, created_at')
    .eq('status', 'active');

  const propertyUrls = (properties || []).map((p) => ({
    url: `${baseUrl}/property/${p.id}`,
    lastModified: new Date(p.created_at),
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/properties`, lastModified: new Date() },
    ...propertyUrls,
  ];
}
