// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import { AdSense } from '@/components/shared/AdSense'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFloat } from '@/components/shared/WhatsAppFloat'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563EB',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://deal.online'),
  title: {
    default: 'deal.online - Pakistan\'s Best Real Estate Platform',
    template: '%s | deal.online',
  },
  description: 'Find properties for sale and rent in Pakistan. Premium real estate listings with verified agents. Search houses, flats, plots, and commercial properties.',
  keywords: [
    'real estate Pakistan',
    'property for sale',
    'houses for rent',
    'real estate agents',
    'property listing',
    'buy property Pakistan',
    'rent property',
    'real estate platform',
    'deal.online',
    'property search',
  ],
  authors: [{ name: 'deal.online' }],
  creator: 'deal.online',
  publisher: 'deal.online',
  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://deal.online',
    siteName: 'deal.online',
    title: 'deal.online - Pakistan\'s Best Real Estate Platform',
    description: 'Find properties for sale and rent in Pakistan. Premium real estate listings with verified agents.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'deal.online - Real Estate Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'deal.online - Pakistan\'s Best Real Estate Platform',
    description: 'Find properties for sale and rent in Pakistan. Premium real estate listings with verified agents.',
    images: ['/og-image.jpg'],
    creator: '@dealonline',
    site: '@dealonline',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://deal.online',
    languages: {
      'en-US': 'https://deal.online',
      'ur-PK': 'https://deal.online/ur',
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  category: 'real estate',
  classification: 'Real Estate Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <AdSense />
        {/* Preconnect to external resources for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        
        {/* JSON-LD for organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'RealEstateAgent',
              name: 'deal.online',
              description: 'Pakistan\'s leading real estate platform',
              url: 'https://deal.online',
              logo: 'https://deal.online/logo.png',
              sameAs: [
                'https://facebook.com/dealonline',
                'https://twitter.com/dealonline',
                'https://instagram.com/dealonline',
              ],
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Karachi',
                addressCountry: 'PK',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '1250',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppFloat />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
