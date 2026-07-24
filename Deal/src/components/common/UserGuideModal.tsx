import React from 'react';
import { X, ShieldCheck, UserCheck, PhoneCall, Building, HelpCircle, FileCheck, CheckCircle2 } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card-glow w-full max-w-3xl rounded-3xl p-6 border border-orange-500/30 max-h-[85vh] overflow-y-auto shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Deal.pk Complete User Manual & Escrow Guide</h2>
              <p className="text-xs text-slate-400">How our 100% Escrow security and role permissions protect your property deal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 text-xs text-slate-300">
          
          {/* Section 1: Escrow Explanation */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5" /> 100% Escrow Protection Workflow
            </h3>
            <p className="leading-relaxed">
              In traditional deals, token payments paid directly to sellers carry risks of double allotment or title dispute. With Deal.pk Escrow:
            </p>
            <ul className="space-y-1.5 pl-4 list-disc text-slate-200">
              <li>Buyer deposits 10% Token or 20% Booking into Deal.pk Escrow.</li>
              <li>Funds are safely held in Deal.pk designated escrow account.</li>
              <li>Agent / Seller provides society NOC and title deed verification.</li>
              <li>After physical inspection, buyer releases funds or requests 100% refund.</li>
            </ul>
          </div>

          {/* Section 2: Roles Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-orange-400">Role Permissions Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="font-bold text-white">1. Guest User</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Browse properties, projects, search with filters, read tax guides.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="font-bold text-white">2. Basic User</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Save wishlist, send property inquiries, list properties (pending review).</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="font-bold text-orange-400">3. Verified Agent</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Auto-approved listings, WebRTC voice/video call, generate escrow invoices.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="font-bold text-amber-400">4. Agency & Builder</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Manage team agents, megaproject unit matrix, bulk listings & commissions.</p>
              </div>
            </div>
          </div>

          {/* Section 3: WebRTC Calls */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center">
              <PhoneCall className="w-4 h-4 mr-1.5 text-orange-400" /> WebRTC One-on-One Voice & Video Calling
            </h3>
            <p className="leading-relaxed">
              Connect directly with verified agents without exposing personal phone numbers. Features live audio ringing, video feeds, mute controls, and call logs.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button onClick={onClose} className="gradient-btn text-white px-5 py-2 rounded-xl text-xs font-bold">
            Got it, thanks!
          </button>
        </div>

      </div>
    </div>
  );
};
