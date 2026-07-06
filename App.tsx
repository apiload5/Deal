/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { ListingsView } from './components/ListingsView';
import { PropertyDetail } from './features/search/PropertyDetail';
import { DashboardLayout } from './components/DashboardLayout';
import { AdminPanel } from './components/AdminPanel';
import { PropertyCompare } from './features/compare/PropertyCompare';
import { BlogSection } from './features/blog/BlogSection';
import { AreaGuideSection } from './features/blog/AreaGuideSection';
import { motion, AnimatePresence } from 'motion/react';

const AppContent: React.FC = () => {
  const { activeView } = useApp();

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'listings':
        return <ListingsView />;
      case 'property-detail':
        return <PropertyDetail />;
      case 'dashboard':
        return <DashboardLayout />;
      case 'admin':
        return <AdminPanel />;
      case 'compare':
        return <PropertyCompare />;
      case 'blog':
        return <BlogSection />;
      case 'area-guides':
        return <AreaGuideSection />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Platform Notifications banner alerts */}
      <Navbar />

      {/* Main viewport with fade entry transitions */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* AdSense bottom and footer credits */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
