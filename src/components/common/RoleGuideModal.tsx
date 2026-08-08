import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Building2,
  HardHat,
  Megaphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Fingerprint,
  PhoneCall,
  MessageSquare,
  Briefcase,
  FileText,
  DollarSign,
  PlusCircle,
  HelpCircle,
  Users
} from 'lucide-react';
import { UserRole } from '../../types';
import { store } from '../../lib/store';

interface RoleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const RoleGuideModal: React.FC<RoleGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth
}) => {
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('user');

  if (!isOpen) return null;

  const roleCapabilities: Record<UserRole, {
    title: string;
    icon: React.ReactNode;
    color: string;
    badge: string;
    description: string;
    features: { title: string; desc: string; icon: React.ReactNode; isVerifiedOnly?: boolean }[];
    canDo: string[];
    guestRequirement?: string;
  }> = {
    guest: {
      title: 'Guest Visitor (Aam Visitor)',
      icon: <User className="w-5 h-5 text-slate-400" />,
      color: 'from-slate-800 to-slate-950 border-slate-700',
      badge: 'Public Visitor',
      description: 'Public guests can explore properties, search maps, view prices, and check government NOC & e-Fard public verification previews.',
      canDo: [
        'Browse all verified properties & mega project listings',
        'Use interactive map search & price filter calculators',
        'View government NOC & PLRA e-Fard verification tools',
        'Read real estate guides & market insights'
      ],
      features: [
        { title: 'Property Search', desc: 'Filter by city, area, beds, price, and category', icon: <FileText className="w-4 h-4 text-orange-400" /> },
        { title: 'Map Explorer', desc: 'Geo-spatial property mapping across Pakistan', icon: <FileText className="w-4 h-4 text-amber-400" /> },
        { title: 'Public Government Verification', desc: 'Preview CDA/RDA/LDA NOC status and PLRA e-Fard sample records', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> }
      ],
      guestRequirement: 'To chat with agents, make live video calls, book site visits, or submit escrow tokens, guests must create a free user account.'
    },
    user: {
      title: 'Buyer / Seller / End User',
      icon: <User className="w-5 h-5 text-blue-400" />,
      color: 'from-blue-950/80 via-slate-900 to-slate-950 border-blue-500/40',
      badge: 'Registered User',
      description: 'Standard account for individuals buying, selling, or renting properties securely in Pakistan.',
      canDo: [
        'Chat directly with verified field agents & agencies',
        'Initiate 1-on-1 WebRTC video calls with agents',
        'Book site inspection appointments & escrow token deposits',
        'Post free property listings (Sale / Rent)',
        'Run automated NADRA E-Sahulat Biometric CNIC verification'
      ],
      features: [
        { title: 'Direct Agent Chat & Calls', desc: 'Instant real-time messaging & WebRTC audio/video calling', icon: <MessageSquare className="w-4 h-4 text-blue-400" /> },
        { title: 'Token Escrow Vault', desc: 'Secure token deposit held safely in DealFast Escrow', icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
        { title: 'NADRA Biometric Badge', desc: 'Instant 13-digit CNIC E-Sahulat auto-verification', icon: <Fingerprint className="w-4 h-4 text-emerald-400" />, isVerifiedOnly: true }
      ]
    },
    agent: {
      title: 'Field Agent / Realtor',
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-950/80 via-slate-900 to-slate-950 border-amber-500/40',
      badge: 'Verified Field Agent',
      description: 'Freelance or agency-affiliated real estate agent carrying out site visits, field verification, and client deals.',
      canDo: [
        'Claim agency job bounties (site visits, token collection)',
        'Earn commission payouts & escrow rewards into digital wallet',
        'Manage client inquiries, schedule appointments, and host video calls',
        'Get official "NADRA Verisys Verified Agent" trust badge'
      ],
      features: [
        { title: 'Bounty Hiring Hub', desc: 'Claim site visit tasks from agencies with guaranteed payouts', icon: <Briefcase className="w-4 h-4 text-amber-400" /> },
        { title: 'Digital Agent Wallet', desc: 'Instant bank transfer & escrow commission settlements', icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
        { title: 'Verified Agent Profile', desc: 'Public agent directory card with ratings & active listings', icon: <Users className="w-4 h-4 text-amber-400" /> }
      ]
    },
    agency: {
      title: 'Real Estate Agency',
      icon: <Building2 className="w-5 h-5 text-orange-400" />,
      color: 'from-orange-950/80 via-slate-900 to-slate-950 border-orange-500/40',
      badge: 'Corporate Agency',
      description: 'Licensed real estate firm with field agents, property inventory, and bounty hiring budgets.',
      canDo: [
        'Post field job bounties (e.g. "Visit Park View City Lot") with fixed rewards',
        'List agency commercial & residential properties with team tags',
        'Upload SECP & FBR NTN tax registration for verified corporate badge',
        'Manage agent teams & escrow transaction logs'
      ],
      features: [
        { title: 'Bounty Manager', desc: 'Create tasks for freelance agents with escrow budget locking', icon: <PlusCircle className="w-4 h-4 text-orange-400" /> },
        { title: 'SECP & NTN Badge', desc: 'Corporate legal verification badge on agency directory', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, isVerifiedOnly: true },
        { title: 'Lead Management', desc: 'Centralized client chat & booking request dashboard', icon: <Users className="w-4 h-4 text-orange-400" /> }
      ]
    },
    builder: {
      title: 'Property Builder / Developer',
      icon: <HardHat className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-950/80 via-slate-900 to-slate-950 border-purple-500/40',
      badge: 'Project Developer',
      description: 'Real estate developer constructing mega housing societies, apartment towers, and shopping plazas.',
      canDo: [
        'Launch & feature Mega Projects with installment plans',
        'Attach RDA / CDA / LDA NOC approval certificates & payment plans',
        'Broadcast project marketing campaigns to agency network',
        'Direct online booking & escrow down-payment processing'
      ],
      features: [
        { title: 'Mega Project Portal', desc: 'Showcase housing schemes, payment plan PDF downloads, & construction updates', icon: <Building2 className="w-4 h-4 text-purple-400" /> },
        { title: 'Authority NOC Verification', desc: 'Display official RDA/CDA NOC status to boost buyer trust', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
        { title: 'Installment Manager', desc: 'Collect buyer booking token & installment payments via Escrow', icon: <DollarSign className="w-4 h-4 text-emerald-400" /> }
      ]
    },
    marketing_company: {
      title: 'Marketing Company',
      icon: <Megaphone className="w-5 h-5 text-cyan-400" />,
      color: 'from-cyan-950/80 via-slate-900 to-slate-950 border-cyan-500/40',
      badge: 'Promotions & Media',
      description: 'Real estate marketing agency running promotional drives, society launches, and digital lead generation.',
      canDo: [
        'Promote housing society launches & commercial plazas',
        'Post agent bounties for marketing material distribution & site leads',
        'Manage digital promotional campaigns across DealFast portal',
        'Track lead conversions & agency affiliate commissions'
      ],
      features: [
        { title: 'Promotional Campaign Hub', desc: 'Run targeted marketing campaigns for developers & societies', icon: <Megaphone className="w-4 h-4 text-cyan-400" /> },
        { title: 'Agent Affiliate Bounties', desc: 'Reward agents for bringing verified site visit leads', icon: <Briefcase className="w-4 h-4 text-cyan-400" /> },
        { title: 'Lead Analytics', desc: 'Track buyer inquiry metrics & campaign ROI', icon: <Sparkles className="w-4 h-4 text-cyan-300" /> }
      ]
    },
    admin: {
      title: 'Platform Super Admin',
      icon: <Lock className="w-5 h-5 text-red-400" />,
      color: 'from-red-950/80 via-slate-900 to-slate-950 border-red-500/40',
      badge: 'System Admin',
      description: 'DealFast platform administrator governing escrow compliance, KYC verification, and dispute resolution.',
      canDo: [
        'Audit & approve manual KYC CNIC & SECP submissions',
        'Release escrow funds on verified agreement completion',
        'Manage platform properties, agents, and bounties',
        'Monitor system logs & security verification registries'
      ],
      features: [
        { title: 'KYC & NADRA Audit Desk', desc: 'Review user submissions & E-Sahulat logs', icon: <ShieldCheck className="w-4 h-4 text-red-400" /> },
        { title: 'Escrow Control Center', desc: 'Oversee wallet deposits & dispute resolutions', icon: <DollarSign className="w-4 h-4 text-emerald-400" /> }
      ]
    }
  };

  const currentRoleInfo = roleCapabilities[activeRoleTab];

  const handleTestThisRole = (role: UserRole) => {
    onClose();
    if (store.currentUser.role === 'guest' || store.currentUser.id === 'user-guest') {
      onOpenAuth();
    } else {
      store.switchRole(role);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0c1322] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col text-slate-100">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-4 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-500/20 border border-orange-500/40 rounded-xl text-orange-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>DealFast Platform Role & Capability Matrix</span>
                <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-500/30">
                  User Guide
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Understand what each account type can do on Pakistan's #1 Escrow Real Estate Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selection Tabs */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-thin shrink-0">
          {[
            { role: 'user' as UserRole, label: '👤 Buyer / Seller', badge: 'User' },
            { role: 'agent' as UserRole, label: '👔 Field Agent', badge: 'Agent' },
            { role: 'agency' as UserRole, label: '🏢 Agency', badge: 'Agency' },
            { role: 'builder' as UserRole, label: '🏗️ Builder', badge: 'Developer' },
            { role: 'marketing_company' as UserRole, label: '🚀 Marketing Co.', badge: 'Marketing' },
            { role: 'guest' as UserRole, label: '👁️ Guest Visitor', badge: 'Public' }
          ].map(tab => (
            <button
              key={tab.role}
              onClick={() => setActiveRoleTab(tab.role)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeRoleTab === tab.role
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/20 border border-orange-400/30'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[72vh]">
          
          {/* Active Role Card Overview */}
          <div className={`p-5 rounded-2xl bg-gradient-to-r ${currentRoleInfo.color} border space-y-4 shadow-xl`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-md">
                  {currentRoleInfo.icon}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>{currentRoleInfo.title}</span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 border border-slate-700">
                      {currentRoleInfo.badge}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {currentRoleInfo.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleTestThisRole(activeRoleTab)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Activate {currentRoleInfo.badge} Role</span>
              </button>
            </div>

            {/* Guest Requirement Note if Guest Tab */}
            {currentRoleInfo.guestRequirement && (
              <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-300">Guest Visitor Professional Rule:</p>
                  <p className="text-slate-300 mt-0.5">{currentRoleInfo.guestRequirement}</p>
                </div>
              </div>
            )}

            {/* Capabilities Check List */}
            <div>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                Key Operations & Features Available:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentRoleInfo.canDo.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-slate-200 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Feature Cards */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Core Tools & Workflows for {currentRoleInfo.title}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentRoleInfo.features.map((feat, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                      {feat.icon}
                    </div>
                    {feat.isVerifiedOnly && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Verified Only
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-white">{feat.title}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Banner for Guests */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-700 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-white">Ready to operate on DealFast?</p>
              <p className="text-slate-400 text-[11px]">Sign in or register to activate verified features and direct agent communication.</p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-xl text-xs transition-colors shadow-lg flex items-center gap-1.5"
            >
              <span>Sign In / Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Pakistani Escrow Real Estate Portal</span>
          <button onClick={onClose} className="hover:text-white font-bold">Close Guide</button>
        </div>

      </div>
    </div>
  );
};
