import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'deal.online - Best Real Estate Platform in Pakistan',
  description: 'Find your dream property with deal.online. Buy, sell, and rent properties across Pakistan. Better than Zameen.com.',
  keywords: 'real estate, property, Pakistan, buy house, sell property, rent, deal.online',
  authors: [{ name: 'deal.online' }],
  openGraph: {
    title: 'deal.online - Best Real Estate Platform in Pakistan',
    description: 'Find your dream property with deal.online. Buy, sell, and rent properties across Pakistan.',
    url: 'https://deal.online',
    siteName: 'deal.online',
    images: [
      {
        url: 'https://deal.online/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_PK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'deal.online - Best Real Estate Platform',
    description: 'Find your dream property with deal.online',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="adsense-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({
                google_ad_client: "${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || ''}",
                enable_page_level_ads: true
              });
            `,
          }}
        />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
          strategy="afterInteractive"
        />
        <link rel="canonical" href="https://deal.online" />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppButton />
          </div>
        </Providers>
      </body>
    </html>
  );
}
