import React from 'react';
import { Building2, ShieldCheck, Phone, Mail, MapPin, Download, Heart, ArrowUpRight } from 'lucide-react';
import { PAKISTAN_CITIES } from '../../data/mockData';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenGuide }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/60">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 p-0.5">
                <div className="w-full h-full bg-[#0a0e1a] rounded-[10px] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Deal<span className="text-orange-500">.pk</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Deal.pk is Pakistan's premier next-generation real estate technology ecosystem featuring 100% Escrow buyer protection, WebRTC video consultation, verified society NOC checks, and real-time agency collaboration.
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
              <li>
                <button onClick={onOpenGuide} className="hover:text-orange-400 transition-colors text-amber-400 font-medium">
                  Escrow How-It-Works
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
                <span>support@deal.pk</span>
              </p>
            </div>

            {/* PWA Install Button */}
            <div className="mt-5">
              <button
                onClick={() => alert('Deal.pk is PWA ready! Tap "Add to Home Screen" in your browser menu to install on iOS/Android.')}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-orange-400" />
                <span>Install Mobile App (PWA)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Deal.pk. All rights reserved. Powered by Deal.pk Escrow & Smart Real Estate Infrastructure.</p>
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
