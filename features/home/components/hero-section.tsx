// features/home/components/hero-section.tsx
'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="hero-gradient relative overflow-hidden min-h-[600px] flex items-center">
      <div className="absolute inset-0 bg-black/30" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Dream Property in Pakistan
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Explore thousands of properties for sale and rent across Pakistan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by city, area, or property name..."
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Search
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
            <span>🏠 10,000+ Properties</span>
            <span>🔒 Secure Deals</span>
            <span>⭐ Trusted by 50,000+ Users</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
