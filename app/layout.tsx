// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import { AdSense } from '@/components/shared/AdSense'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'deal.online - Pakistan\'s Best Real Estate Platform',
  description: 'Find properties for sale and rent in Pakistan. Premium real estate listings with verified agents.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <AdSense />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
