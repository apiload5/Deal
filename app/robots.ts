import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dealfast.pk';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/admin/', '/api/private/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
