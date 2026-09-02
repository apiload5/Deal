import { MetadataRoute } from 'next';
import { INITIAL_PROPERTIES, INITIAL_PROJECTS, INITIAL_AGENCIES, INITIAL_AGENTS, INITIAL_BLOGS } from '@/src/data/mockData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dealfast.pk';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/?tab=properties`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=projects`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=agencies`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/?tab=agents`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/?tab=blogs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/?tab=hiring`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // City specific SEO landing pages
  const cityRoutes: MetadataRoute.Sitemap = ['Islamabad', 'Lahore', 'Karachi', 'Rawalpindi', 'Peshawar'].map((city) => ({
    url: `${baseUrl}/?city=${encodeURIComponent(city)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  // Property listings dynamic URLs
  const propertyRoutes: MetadataRoute.Sitemap = INITIAL_PROPERTIES.map((property) => ({
    url: `${baseUrl}/?property=${property.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.95,
  }));

  // Project dynamic URLs
  const projectRoutes: MetadataRoute.Sitemap = INITIAL_PROJECTS.map((project) => ({
    url: `${baseUrl}/?project=${project.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Agency dynamic URLs
  const agencyRoutes: MetadataRoute.Sitemap = INITIAL_AGENCIES.map((agency) => ({
    url: `${baseUrl}/?agency=${agency.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Agent dynamic URLs
  const agentRoutes: MetadataRoute.Sitemap = INITIAL_AGENTS.map((agent) => ({
    url: `${baseUrl}/?agent=${agent.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Blog post dynamic URLs
  const blogRoutes: MetadataRoute.Sitemap = INITIAL_BLOGS.map((blog) => ({
    url: `${baseUrl}/?blog=${blog.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...cityRoutes,
    ...propertyRoutes,
    ...projectRoutes,
    ...agencyRoutes,
    ...agentRoutes,
    ...blogRoutes,
  ];
}
