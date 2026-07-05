// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/dashboard/admin/',
        '/dashboard/agent/',
        '/api/',
        '/login/',
        '/add-property/',
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://deal.online'}/sitemap.xml`,
  }
}
