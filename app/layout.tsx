// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'deal.online - Find Your Dream Property in Pakistan',
  description: 'Discover thousands of properties for sale and rent across Pakistan. The better alternative to Zameen.com.',
  keywords: 'real estate, Pakistan, properties, buy property, rent property, deal.online',
  authors: [{ name: 'deal.online' }],
  openGraph: {
    title: 'deal.online - Find Your Dream Property in Pakistan',
    description: 'Discover thousands of properties for sale and rent across Pakistan',
    url: 'https://deal.online',
    siteName: 'deal.online',
    images: [
      {
        url: 'https://deal.online/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'deal.online - Find Your Dream Property in Pakistan',
    description: 'Discover thousands of properties for sale and rent across Pakistan',
    images: ['https://deal.online/og-image.jpg'],
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
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
