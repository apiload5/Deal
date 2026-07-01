import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'deal.pk | Premium Video-First Real Estate Platform',
  description: 'Discover homes, apartments, and plots across Pakistan with authentic TikTok mobile walkthroughs.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50 text-slate-900`}>
        <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl declare items-center justify-between px-4">
            <Link href="/" className="text-2xl font-black tracking-tight text-blue-600">
              deal<span className="text-slate-800">.pk</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/properties" className="text-sm font-semibold text-slate-600 hover:text-blue-600">Browse</Link>
              <Link href="/dashboard" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-blue-700">Dashboard</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
