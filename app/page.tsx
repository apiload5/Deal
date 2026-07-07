// app/page.tsx - Simplified for deployment
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Find Your Dream Property
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Pakistan's #1 Real Estate Portal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Search Properties
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                List Your Property
              </Button>
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <div className="text-3xl font-bold">10,000+</div>
              <div className="text-sm opacity-80">Properties Listed</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <div className="text-3xl font-bold">50,000+</div>
              <div className="text-sm opacity-80">Happy Users</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <div className="text-3xl font-bold">Rs 1B+</div>
              <div className="text-sm opacity-80">Deals Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
