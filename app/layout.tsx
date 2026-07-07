'use client'

import { ReactNode } from 'react'
import { Metadata } from 'next'
import { Providers } from '@/app/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Deal.pk - Real Estate Portal',
  description: 'Pakistan\'s leading real estate marketplace. Buy, sell, and rent properties across Pakistan.',
  keywords: ['real estate', 'properties', 'pakistan', 'buy', 'sell', 'rent', 'zameen'],
  authors: [{ name: 'Deal.pk' }],
  creator: 'Deal.pk',
  publisher: 'Deal.pk',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://deal.pk',
    siteName: 'Deal.pk',
    title: 'Deal.pk - Real Estate Portal',
    description: 'Pakistan\'s leading real estate marketplace',
    images: [
      {
        url: 'https://deal.pk/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deal.pk - Real Estate Portal',
    description: 'Pakistan\'s leading real estate marketplace',
    creator: '@dealpk',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Pakistan's leading real estate marketplace" />
        <link rel="canonical" href="https://deal.pk" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
