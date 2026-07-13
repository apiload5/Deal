// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFloat } from '@/components/shared/WhatsAppFloat'
import { PWAInstall } from '@/components/shared/PWAInstall'
import { AuthProvider } from '@/hooks/useAuth'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin', 'arabic'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563EB',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://deal.vercel.app'),
  title: {
    default: 'deal.pk - Pakistan\'s Largest Real Estate Portal',
    template: '%s | deal.pk',
  },
  description: 'Find properties for sale and rent in Pakistan. Premium real estate listings with verified agents. Buy, sell, or rent properties across Pakistan.',
  keywords: [
    'real estate Pakistan',
    'property for sale',
    'houses for rent',
    'real estate agents',
    'property listing',
    'buy property Pakistan',
    'rent property',
    'real estate platform',
    'deal.pk',
    'property search',
  ],
  authors: [{ name: 'deal.pk' }],
  creator: 'deal.pk',
  publisher: 'deal.pk',
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://deal.vercel.app',
    siteName: 'deal.pk',
    title: 'deal.pk - Pakistan\'s Largest Real Estate Portal',
    description: 'Find properties for sale and rent in Pakistan. Premium real estate listings with verified agents.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'deal.pk - Real Estate Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'deal.pk - Pakistan\'s Largest Real Estate Portal',
    description: 'Find properties for sale and rent in Pakistan. Premium real estate listings with verified agents.',
    images: ['/og-image.jpg'],
    creator: '@dealpk',
    site: '@dealpk',
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
    canonical: 'https://deal.vercel.app',
    languages: {
      'en-US': 'https://deal.vercel.app',
      'ur-PK': 'https://deal.vercel.app/ur',
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  category: 'real estate',
  classification: 'Real Estate Platform',
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()

  return (
    <html lang={locale || 'en'} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <NextIntlClientProvider messages={messages}>
            <AuthProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <WhatsAppFloat />
              <PWAInstall />
              <Toaster />
            </AuthProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
