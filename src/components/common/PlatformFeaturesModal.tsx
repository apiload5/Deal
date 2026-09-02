import React, { useState } from 'react';
import { X, ShieldCheck, Layers, Video, FileText, Building2, UserCheck, Calculator, Smartphone, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react';

interface PlatformFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const PlatformFeaturesModal: React.FC<PlatformFeaturesModalProps> = ({ isOpen, onClose, onNavigateTab }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'escrow' | 'tools' | 'agents' | 'projects'>('all');

  if (!isOpen) return null;

  const features = [
    {
      id: 'escrow',
      category: 'escrow',
      title: '100% Escrow Protection & 10% Online Bayana (بیعانہ سیکورٹی)',
      badge: 'Active & Verified',
      icon: ShieldCheck,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      description: 'Protects buyers from double allotment or fake sellers. 10% token deposit is securely locked in DealFast Escrow until RDA/CDA title verification and clearance.',
      actionLabel: 'Try Token Booking',
      actionTab: 'properties'
    },
    {
      id: 'stamp-pdf',
      category: 'escrow',
      title: 'Auto PDF Government E-Stamp Paper Agreement Generator',
      badge: 'Automated Instant PDF',
      icon: FileText,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      description: 'Generates legally valid Government of Pakistan E-Stamp certified agreement to sell (اقرار نامہ بیعانہ) with unique verification code, seller/buyer CNIC, and custom clauses.',
      actionLabel: 'View Sample Agreement',
      actionTab: 'bookings'
    },
    {
      id: 'webrtc-calls',
      category: 'agents',
      title: 'Live WebRTC 1-on-1 Audio & Video Calling',
      badge: 'In-Browser Secure',
      icon: Video,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Direct HD video and voice calls between buyers, sellers, and verified agents without sharing personal mobile numbers. Includes ringers and call logs.',
      actionLabel: 'Call an Agent',
      actionTab: 'agents'
    },
    {
      id: 'bounty-tasks',
      category: 'agents',
      title: 'On-Ground Plot File & Verification Bounty System',
      badge: 'Agent Field Network',
      icon: UserCheck,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      description: 'Agencies can post bounty tasks (e.g. PKR 3,000) for local agents in any city to physically inspect plots, take live site videos, and check RDA/CDA records.',
      actionLabel: 'View Task Bounties',
      actionTab: 'dashboard'
    },
    {
      id: 'builder-projects',
      category: 'projects',
      title: 'Builder & Developer Mega Project Portals',
      badge: 'Installment Plans & Approvals',
      icon: Building2,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      description: 'Dedicated portals for mega projects featuring floor plans, Meezan/HBL Islamic home loan integrations, and downloadable payment schedule PDFs.',
      actionLabel: 'Explore Projects',
      actionTab: 'projects'
    },
    {
      id: 'fbr-calculator',
      category: 'tools',
      title: 'FBR Filer vs Non-Filer Property Tax Calculator',
      badge: '2026 Budget Updated',
      icon: Calculator,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      description: 'Calculates FBR 236K (purchaser tax), 236C (seller tax), and 7E wealth tax rates instantly based on filer status, property value, and holding period.',
      actionLabel: 'Calculate Taxes',
      actionTab: 'blog'
    },
    {
      id: 'pwa-app',
      category: 'escrow',
      title: 'Progressive Web App (PWA) Android & iOS Mobile App',
      badge: 'Home Screen Ready',
      icon: Smartphone,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      description: 'Install DealFast directly to your phone home screen without app store downloads. Supports fast loading, offline mode, and instant push notification banners.',
      actionLabel: 'Install App',
      actionTab: 'install'
    }
  ];

  const filtered = activeCategory === 'all' 
    ? features 
    : features.filter(f => f.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Layers className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">DealFast Platform Capabilities & Features Directory</h2>
              <p className="text-xs text-slate-400">All 100% active, fully functional systems built into DealFast</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto shrink-0 no-scrollbar">
          {[
            { id: 'all', label: 'All Capabilities (7)' },
            { id: 'escrow', label: 'Escrow & Legal' },
            { id: 'tools', label: 'Tax Calculators' },
            { id: 'agents', label: 'Agent & WebRTC' },
            { id: 'projects', label: 'Builders & Projects' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Features List Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(f => {
            const IconComp = f.icon;
            return (
              <div key={f.id} className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-orange-500/40 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl border ${f.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="font-black text-white text-sm">{f.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{f.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold flex items-center text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Live & Ready
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      if (f.actionTab === 'ai') {
                        // Handled by parent trigger
                        onNavigateTab('properties');
                      } else {
                        onNavigateTab(f.actionTab);
                      }
                    }}
                    className="text-orange-400 hover:text-amber-300 font-bold flex items-center space-x-1 group"
                  >
                    <span>{f.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Bottom CTA */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <span>DealFast Platform is certified for real estate transactions across Pakistan.</span>
          </div>
          <button onClick={onClose} className="gradient-btn text-white px-5 py-2 rounded-xl text-xs font-bold">
            Close Features Guide
          </button>
        </div>

      </div>
    </div>
  );
};
