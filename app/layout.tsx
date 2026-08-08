import React, { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "DealFast - Pakistan's Premier Escrow Protected Real Estate Platform",
  description: "Buy, sell, rent & invest in verified houses, plots, commercial buildings, housing projects & societies across Islamabad, Lahore, Karachi & Rawalpindi with 100% Escrow Protection.",
  keywords: ["real estate pakistan", "properties for sale islamabad", "dha lahore plots", "bahria town karachi", "escrow real estate", "property verification pakistan"],
  authors: [{ name: "DealFast Real Estate" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://dealfast.pk'),
  openGraph: {
    title: "DealFast - Pakistan's Premier Escrow Protected Real Estate Platform",
    description: "Buy, sell, rent & invest in verified houses, plots, commercial buildings, housing projects with 100% Escrow Protection.",
    url: "https://dealfast.pk",
    siteName: "DealFast Pakistan",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "DealFast Premier Real Estate Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DealFast - Pakistan's Premier Escrow Protected Real Estate Platform",
    description: "Buy, sell, rent & invest in verified properties with 100% Escrow Protection.",
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"],
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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0e1a',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="antialiased bg-[#0a0e1a] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}

