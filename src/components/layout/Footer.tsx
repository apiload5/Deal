import React from 'react';
import { ShieldCheck, Phone, Mail, MapPin, Download, Heart, ArrowUpRight } from 'lucide-react';
import { PAKISTAN_CITIES } from '../../data/mockData';
import { store } from '../../lib/store';
import { DealLogo } from '../common/DealLogo';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenGuide: (topic?: string) => void;
  onOpenFeatures?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenGuide, onOpenFeatures }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 pt-12 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* PRE-FOOTER COMPREHENSIVE NAVIGATION SECTION */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-8 bg-gradient-to-b from-slate-900/60 to-slate-950">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white flex items-center">
                <ShieldCheck className="w-5 h-5 text-orange-400 mr-2" />
                DealFast Ecosystem & Popular Property Directory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Explore top societies, commercial plazas, and verified agent networks across Pakistan
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenGuide()}
                className="gradient-btn text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 flex items-center space-x-1"
              >
                <span>Complete Escrow Manual</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
            
            {/* Column 1: Lahore Top Societies */}
            <div className="space-y-3">
              <h4 className="font-bold text-orange-400 uppercase tracking-wider text-[11px] flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1" /> Top Societies - Lahore
              </h4>
              <ul className="space-y-1.5 text-slate-300">
                {['DHA Phase 5 & 6 Plots', 'DHA Phase 8 & 9 Prism', 'Gulberg Commercial Plazas', 'Bahria Town Sector C & E', 'Askari 11 Apartments', 'Lake City Golf Estate'].map((loc, i) => (
                  <li key={i}>
                    <button onClick={() => setActiveTab('properties')} className="hover:text-orange-400 transition-colors flex items-center">
                      <span className="text-[10px] text-slate-500 mr-1.5">•</span>
                      <span>{loc}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Islamabad & Rawalpindi */}
            <div className="space-y-3">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1" /> Islamabad & Pindi
              </h4>
              <ul className="space-y-1.5 text-slate-300">
                {['DHA Phase 2 & 5 Islamabad', 'Gulberg Greens Farmhouses', 'Bahria Enclave Sector N', 'B-17 Multi Gardens', 'F-10 / F-11 Luxury Houses', 'Bahria Town Rawalpindi'].map((loc, i) => (
                  <li key={i}>
                    <button onClick={() => setActiveTab('properties')} className="hover:text-amber-400 transition-colors flex items-center">
                      <span className="text-[10px] text-slate-500 mr-1.5">•</span>
                      <span>{loc}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Karachi & Coastal */}
            <div className="space-y-3">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1" /> Karachi & Coastal
              </h4>
              <ul className="space-y-1.5 text-slate-300">
                {['Clifton Block 5 & 8 Flats', 'DHA Phase 8 & Creek Vistas', 'Scheme 33 Residential Plots', 'PECHS Commercial Units', 'Bahria Town Karachi Sports City', 'Malir Cantt Villas'].map((loc, i) => (
                  <li key={i}>
                    <button onClick={() => setActiveTab('properties')} className="hover:text-emerald-400 transition-colors flex items-center">
                      <span className="text-[10px] text-slate-500 mr-1.5">•</span>
                      <span>{loc}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Platform Portals */}
            <div className="space-y-3">
              <h4 className="font-bold text-purple-400 uppercase tracking-wider text-[11px] flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Platform Features
              </h4>
              <ul className="space-y-1.5 text-slate-300">
                <li>
                  <button onClick={() => setActiveTab('hiring')} className="hover:text-orange-400 text-orange-400 font-bold flex items-center">
                    <span>🎯 Earn & Stake Agent Hiring</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('projects')} className="hover:text-purple-300 transition-colors flex items-center">
                    <span>🏢 Mega Projects & Installments</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('agencies')} className="hover:text-purple-300 transition-colors flex items-center">
                    <span>🏬 Certified Agencies Directory</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('agents')} className="hover:text-purple-300 transition-colors flex items-center">
                    <span>👨‍💼 Verified Field Agents</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('blog')} className="hover:text-purple-300 transition-colors flex items-center">
                    <span>🧾 FBR Tax Filer Calculator</span>
                  </button>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* MAIN FOOTER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/60">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <DealLogo onClick={() => setActiveTab('properties')} variant="orange" size="lg" />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              DealFast is Pakistan's premier next-generation real estate technology ecosystem featuring 100% Escrow buyer protection, WebRTC video consultation, verified society NOC checks, and real-time agency collaboration.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-300">
              <span className="flex items-center text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                <ShieldCheck className="w-4 h-4 mr-1" /> Licensed Escrow Escort
              </span>
            </div>
          </div>

          {/* Quick Cities */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Top Cities</h4>
            <ul className="space-y-2 text-xs">
              {PAKISTAN_CITIES.slice(1, 7).map(c => (
                <li key={c}>
                  <button
                    onClick={() => setActiveTab('properties')}
                    className="hover:text-orange-400 transition-colors flex items-center"
                  >
                    <span>{c} Properties</span>
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 hover:opacity-100 transition-opacity text-orange-400" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Directory Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Ecosystem</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('properties')} className="hover:text-orange-400 transition-colors">
                  Buy House & Flats
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('projects')} className="hover:text-orange-400 transition-colors">
                  Commercial Mega Projects
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('agencies')} className="hover:text-orange-400 transition-colors">
                  Certified Agencies
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('builders')} className="hover:text-orange-400 transition-colors">
                  Top Developers
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('blog')} className="hover:text-orange-400 transition-colors">
                  FBR Tax & Legal Guides
                </button>
              </li>
              {onOpenFeatures && (
                <li>
                  <button onClick={onOpenFeatures} className="hover:text-orange-400 transition-colors text-orange-400 font-bold">
                    ★ All Platform Features
                  </button>
                </li>
              )}
              <li>
                <button onClick={() => onOpenGuide('comparison-matrix')} className="hover:text-amber-400 transition-colors text-amber-300 font-bold flex items-center gap-1 text-left">
                  <span>⚡ DealFast vs Top 10 World Portals (Comparison)</span>
                </button>
              </li>
              <li>
                <button onClick={() => onOpenGuide('faq-general')} className="hover:text-amber-400 transition-colors text-amber-200 font-medium text-left">
                  Frequently Asked Questions (FAQ & Escrow Manual)
                </button>
              </li>

            </ul>
          </div>

          {/* App & Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Headquarters</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 text-orange-400 shrink-0 mt-0.5" />
                <span>Level 8, Evacuee Trust Complex, F-5/1, Islamabad, Pakistan</span>
              </p>
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-orange-400 shrink-0" />
                <span>UAN: +92 (51) 111-332-575</span>
              </p>
              <p className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-orange-400 shrink-0" />
                <span>support@dealfast.pk</span>
              </p>
            </div>

            {/* PWA Install Button */}
            <div className="mt-5">
              <button
                onClick={() => alert('DealFast is PWA ready! Tap "Add to Home Screen" in your browser menu to install on iOS/Android.')}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-orange-400" />
                <span>Install Mobile App (PWA)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 DealFast. All rights reserved. Powered by DealFast Escrow & Smart Real Estate Infrastructure.</p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Audit</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
