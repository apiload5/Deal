import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Building,
  HelpCircle,
  FileCheck,
  CheckCircle2,
  Scale,
  Award,
  BookOpen,
  Camera,
  Lock,
  Search,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  Printer,
  Sparkles,
  ShieldAlert,
  Key,
  Users,
  Building2,
  DollarSign,
  PhoneCall,
  MapPin,
  ExternalLink,
  Shield,
  ArrowLeft,
  FileSpreadsheet,
  Video,
  Download,
  Percent,
  Check
} from 'lucide-react';
import { store } from '../../lib/store';
import { DealLogo } from './DealLogo';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose, initialTopic }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopic || 'getting-started');
  const [mobileView, setMobileView] = useState<'tree' | 'content'>(initialTopic ? 'content' : 'tree');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'faq': true,
    'getting-started': true,
    'escrow': true,
    'webrtc': true,
    'properties': true,
    'agencies': true,
    'projects': true,
    'pdf': true,
    'comparison': true,
    'admin': true
  });

  React.useEffect(() => {
    if (isOpen) {
      if (initialTopic) {
        setSelectedTopicId(initialTopic);
        setMobileView('content');
      } else {
        setSelectedTopicId('faq-general');
        setMobileView('tree');
      }
    }
  }, [isOpen, initialTopic]);

  if (!isOpen) return null;

  const currentRole = store.currentUser.role;
  const isAdminOrStaff = currentRole === 'admin' || currentRole === 'agency';

  // Topic Categories Definition
  const categories = [
    {
      id: 'faq',
      title: '❓ Frequently Asked Questions (FAQ & Escrow Manual)',
      topics: [
        { id: 'faq-general', title: 'Frequently Asked Questions & Ground Rules' },
        { id: 'faq-token-rules', title: 'Token Money, Bayana & Escrow Safety Rules' },
        { id: 'faq-hiring-bounty', title: 'Protected Agent Hiring & Bounty Escrow Rules' }
      ]
    },
    {
      id: 'getting-started',
      title: '🔰 Getting Started & Account Setup',
      topics: [
        { id: 'getting-started', title: 'Platform Overview & 100% Escrow Guarantee' },
        { id: 'user-roles', title: 'Buyer vs. Seller vs. Agent Role Differences' },
        { id: 'kyc-verification', title: 'CNIC & Phone KYC Verification Steps' }
      ]
    },
    {
      id: 'overseas-desk',
      title: '🌐 Overseas Pakistani Investment Desk & SBP RDA',
      topics: [
        { id: 'overseas-overview', title: 'Overseas Investor Registration & Benefits' },
        { id: 'overseas-rda', title: 'Roshan Digital Account (RDA) Escrow & Repatriation' },
        { id: 'overseas-poa', title: 'Embassy Attestation & Remote Power of Attorney (POA)' },
        { id: 'overseas-inspection', title: '4K Live Video Inspection & Field Verification' }
      ]
    },
    {
      id: 'escrow',
      title: '🔒 100% Escrow Protection (Bayana)',
      topics: [
        { id: 'escrow-flow', title: 'How Bayana Token Holding Works' },
        { id: 'bank-release', title: 'Seller Bank Release & 2-Way Lock Rules' },
        { id: 'buyer-refund', title: '100% Buyer Refund & Dispute Cancellation' }
      ]
    },
    {
      id: 'webrtc',
      title: '📹 Live WebRTC Video Consultations',
      topics: [
        { id: 'video-call-setup', title: 'Initiating 1-on-1 Video Call with Agents' },
        { id: 'camera-controls', title: 'Camera, Microphone & Speaker Controls' },
        { id: 'webrtc-troubleshoot', title: 'Resolving Camera Permission & Network Latency' }
      ]
    },
    {
      id: 'properties',
      title: '🏡 Property Search & Interactive Maps',
      topics: [
        { id: 'map-explorer', title: 'Google Maps GIS Sector Grid Explorer' },
        { id: 'noc-check', title: 'Verifying RDA/CDA/LDA Society NOC Approvals' },
        { id: 'mortgage-calc', title: 'Using the EMI Mortgage & Tax Calculator' }
      ]
    },
    {
      id: 'agencies',
      title: '💼 Agency Hub & Deal Rooms',
      topics: [
        { id: 'agency-verification', title: 'Verified Agency Badge & Registration' },
        { id: 'deal-rooms', title: 'Co-Braking Deal Rooms & Commission Splits' },
        { id: 'hiring-talents', title: 'Agent Talent Hiring & Staked Bounty Jobs' }
      ]
    },
    {
      id: 'projects',
      title: '🏗️ Projects & Off-Plan Installments',
      topics: [
        { id: 'project-booking', title: 'Booking Off-Plan Units & Builder Escrow' },
        { id: 'floor-plans', title: 'Downloading Approved Floor Plans & Layouts' }
      ]
    },
    {
      id: 'pdf',
      title: '📄 Legal E-Stamp & Invoices',
      topics: [
        { id: 'stamp-paper-pdf', title: 'Auto-Generating 100 PKR Stamp Paper Agreements' },
        { id: 'brochure-pdf', title: 'Generating High-Res Property Brochure PDFs' },
        { id: 'tax-invoice-pdf', title: 'Generating Official Escrow Receipts & Invoices' }
      ]
    },
    {
      id: 'comparison',
      title: '⚡ DealFast vs Top 10 World & Pakistan Portals',
      topics: [
        { id: 'comparison-matrix', title: 'Feature Matrix: DealFast vs Zameen, Zillow, Realtor & Bayut' },
        { id: 'top10-breakdown', title: 'Detailed Platform Breakdown (Top 10 Global & Local Portals)' }
      ]
    },

    ...(isAdminOrStaff ? [{
      id: 'admin',
      isSecret: true,
      title: '👑 CLASSIFIED: Super Admin & Staff Operating Manual',
      topics: [
        { id: 'admin-access', title: '1. Admin Command Center Passcode Login' },
        { id: 'moderation-queue', title: '2. Approving & Moderating Property Queue' },
        { id: 'escrow-override', title: '3. Manual Escrow Release & Refund Overrides' },
        { id: 'dispute-arbitration', title: '4. Dispute Panel Arbitration & Award Rules' },
        { id: 'staff-permissions', title: '5. Office Worker & Staff Role Permission Controls' }
      ]
    }] : [])
  ];

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const selectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setMobileView('content');
  };

  const filteredCategories = categories.map(cat => {
    const filteredTopics = cat.topics.filter(t =>
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...cat, topics: filteredTopics };
  }).filter(cat => cat.topics.length > 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-6xl h-[95vh] sm:h-[92vh] rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-slate-200 relative">
        
        {/* WINDOWS HELP TITLE BAR */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-3 sm:px-4 py-2 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center space-x-2 truncate">
            <DealLogo variant="white" size="xs" />
            <div className="h-4 w-px bg-slate-700 hidden sm:block" />
            <span className="text-[11px] sm:text-xs font-bold text-slate-300 truncate flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate">DealFast Official Operations & User Guide v5.0</span>
            </span>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0 z-10">
            {isAdminOrStaff ? (
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-extrabold items-center gap-1">
                <Lock className="w-3 h-3 text-purple-400" />
                ADMIN UNLOCKED
              </span>
            ) : (
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                CLIENT ACCESS
              </span>
            )}
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Print Documentation"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors"
              title="Close Manual"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SEARCH BAR & QUICK NAVIGATION TOOLBAR */}
        <div className="bg-slate-950 px-3 sm:px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search guide topics (Escrow, WebRTC, Stamp Paper, Admin Passcode)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-semibold overflow-x-auto no-scrollbar">
            <button onClick={() => selectTopic('faq-general')} className="px-2 py-1 rounded bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 font-bold whitespace-nowrap">
              ❓ FAQ Manual
            </button>
            <button onClick={() => selectTopic('getting-started')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-orange-400 whitespace-nowrap">
              Overview
            </button>
            <button onClick={() => selectTopic('overseas-overview')} className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold whitespace-nowrap">
              🌐 Overseas Desk
            </button>
            <button onClick={() => selectTopic('escrow-flow')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 whitespace-nowrap">
              Escrow
            </button>
            <button onClick={() => selectTopic('video-call-setup')} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 whitespace-nowrap">
              WebRTC
            </button>
            {isAdminOrStaff && (
              <button onClick={() => selectTopic('admin-access')} className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold whitespace-nowrap">
                👑 Admin
              </button>
            )}
          </div>
        </div>

        {/* MOBILE NAVIGATION TOGGLE BAR */}
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between shrink-0 text-xs">
          {mobileView === 'content' ? (
            <button
              onClick={() => setMobileView('tree')}
              className="flex items-center text-orange-400 font-bold gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Help Index ({filteredCategories.reduce((acc, c) => acc + c.topics.length, 0)} Topics)</span>
            </button>
          ) : (
            <span className="text-slate-400 font-bold">Select a topic from the list below:</span>
          )}
        </div>

        {/* WINDOWS DUAL-PANE LAYOUT */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT SIDEBAR: EXPANDABLE TREE VIEW */}
          <div className={`w-full md:w-80 bg-slate-950/90 border-r border-slate-800 overflow-y-auto p-3 space-y-2 shrink-0 ${
            mobileView === 'content' ? 'hidden md:block' : 'block'
          }`}>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 pb-1 border-b border-slate-800 flex justify-between items-center">
              <span>Documentation Tree</span>
              <span className="text-orange-400 font-mono">{filteredCategories.reduce((acc, c) => acc + c.topics.length, 0)} Topics</span>
            </p>

            {filteredCategories.map(category => {
              const isExpanded = expandedCategories[category.id];
              return (
                <div key={category.id} className="space-y-1">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
                      category.isSecret
                        ? 'bg-purple-950/40 text-purple-300 border border-purple-800/60 hover:bg-purple-900/40'
                        : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <Folder className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                      <span className="truncate">{category.title}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform shrink-0 ${isExpanded ? 'rotate-90 text-amber-400' : 'text-slate-500'}`} />
                  </button>

                  {/* Category Topics */}
                  {isExpanded && (
                    <div className="pl-3 sm:pl-4 space-y-0.5 border-l border-slate-800 ml-2.5 sm:ml-3">
                      {category.topics.map(topic => {
                        const isSelected = selectedTopicId === topic.id;
                        return (
                          <button
                            key={topic.id}
                            onClick={() => selectTopic(topic.id)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
                              isSelected
                                ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                          >
                            <FileText className={`w-3 h-3 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                            <span className="truncate">{topic.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT DISPLAY PANE: TOPIC CONTENT */}
          <div className={`flex-1 bg-slate-900/90 p-4 sm:p-6 overflow-y-auto space-y-6 ${
            mobileView === 'tree' ? 'hidden md:block' : 'block'
          }`}>
            
            {/* FAQ TOPIC 1: GENERAL & GROUND RULES */}
            {selectedTopicId === 'faq-general' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">FAQ Section 1</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Frequently Asked Questions & Ground Rules</h1>
                  <p className="text-xs text-slate-400 mt-1">Official answers to key rules regarding Escrow, Guest access, and Role permissions.</p>
                </div>

                <div className="space-y-4">
                  
                  {/* Q1 */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-xs sm:text-sm font-bold text-orange-400 flex items-start gap-2">
                      <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-[10px] font-black shrink-0">Q1</span>
                      <span>Guest Visitor Access: Kya Guest user bina login property Kharid ya Bech sakta he?</span>
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed pl-8">
                      <strong>Nahi.</strong> Guest users (bina sign in kiye) sirf public properties dekh sakte hen, mega projects browse kar sakte hen, aor map grid search explore kar sakte hen. Property list karna, Escrow token payment karna, wallet manage karna, ya job bounty post karna ke liye <strong>CNIC & Phone KYC Sign-in mandatory</strong> he.
                    </p>
                  </div>

                  {/* Q2 */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-xs sm:text-sm font-bold text-amber-400 flex items-start gap-2">
                      <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[10px] font-black shrink-0">Q2</span>
                      <span>Token Money & Escrow: Token money kahan hold hoti he? Kya seller ko direct chali jati he?</span>
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed pl-8">
                      Token payment (Bayana) direct kisi fard ya private account me nahi jati. Token money <strong>DealFast Corporate Escrow Banking Account</strong> me Mehfooz hold hoti he. Seller ya Agency ko funds tab hi release hote hen jab physical inspection mukammal ho jaye ya RDA/CDA/LDA society transfer approve ho jaye.
                    </p>
                  </div>

                  {/* Q3 */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-xs sm:text-sm font-bold text-emerald-400 flex items-start gap-2">
                      <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-black shrink-0">Q3</span>
                      <span>Individual Owner Listings: Agar koi User Owner ban kar sale kare, to security kaise hoti he?</span>
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed pl-8">
                      Aam user (Individual Owner) property list kar sakta he, lekin buyer ki payment seller ke paas nahi rehti, balke DealFast Escrow me hold hoti he. Transacting se pehle seller ki CNIC verification, PLRA e-Fard registry document, aor Physical Inspection verified ki jati he. Agar inspection fail ho, to buyer ko 100% money back refund mil jata he.
                    </p>
                  </div>

                  {/* Q4 */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-xs sm:text-sm font-bold text-purple-400 flex items-start gap-2">
                      <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-[10px] font-black shrink-0">Q4</span>
                      <span>Job Bounties & Field Agents: Kya Agent job bounty post kar sakta he?</span>
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed pl-8">
                      <strong>Nahi.</strong> Field Sales Agents job bounties post nahi kar sakte. Bounties sirf <strong>Registered Real Estate Agencies, Property Builders/Developers, ya Property Owners</strong> hi post kar sakte hen un agents ko hire karne ke liye jo sale karwayen. Agents in posted jobs par apply kar ke pre-funded bounty earn karte hen.
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* FAQ TOPIC 2: TOKEN RULES */}
            {selectedTopicId === 'faq-token-rules' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">FAQ Section 2</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Token Money, Bayana & Escrow Safety Rules</h1>
                  <p className="text-xs text-slate-400 mt-1">Rules on Down payments, Legal E-Stamp agreements, and 24-hour Refund policy.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <h3 className="text-xs font-bold text-amber-300">100% Refund Guarantee on Dispute</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Agar LDA/CDA/RDA dwara society transfer reject ho jaye, ya PLRA e-Fard document me koi ghalti/frawd nikle, to buyer dashboard me <strong>Raise Escrow Dispute</strong> par click kare. Legal panel verification ke baad 24 ghante ke andar 100% payment buyer ke bank ya wallet me refund kar di jati he.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold text-white">Auto Legal Stamp Paper (100 PKR)</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Har booking par system automatic 100 PKR E-Stamp paper contract generator run karta he jisme buyer, seller, property detail, aor Escrow serial number watermarked hota he.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ TOPIC 3: HIRING & BOUNTY */}
            {selectedTopicId === 'faq-hiring-bounty' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">FAQ Section 3</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Protected Agent Hiring & Bounty Escrow Rules</h1>
                  <p className="text-xs text-slate-400 mt-1">How agencies and builders post pre-funded bounty jobs and hire verified agents.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold text-emerald-400">Pre-Funded Bounty Lock (PKR 3,000 - 15,000)</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Job post karte waqt Agency/Builder upfront bounty amount + FBR taxes DealFast wallet me deposit kar ke lock karte hen. Is se Agent ko guaranteed commission ka yaqeen hota he.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold text-white">4-Step Deal Room Proof Milestones</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Agent job accept karne ke baad 4 milestones upload karta he (Buyer Contact Proof, Site Visit Geo-tag, Token Receipt, Transfer Verification). Final milestone approve hone par system agent wallet me bounty release kar deta he.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TOPIC 1: GETTING STARTED */}
            {selectedTopicId === 'getting-started' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">Chapter 1.1</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Platform Overview & 100% Escrow Guarantee</h1>
                  <p className="text-xs text-slate-400 mt-1">How DealFast protects buyers and sellers in Pakistan’s real estate ecosystem.</p>
                </div>

                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 space-y-2">
                  <h3 className="text-sm font-bold text-orange-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-400" />
                    Core Platform Objective
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Buying property in Pakistan traditionally involves risks like token forfeiture, fake title deeds, and unverified agencies. DealFast eliminates title risk through corporate escrow holding, verified CNIC KYC, and real-time WebRTC video consultations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-black">1</div>
                    <h4 className="text-xs font-bold text-white">Find & Verify Property</h4>
                    <p className="text-[11px] text-slate-400">Search verified CDA, RDA, and LDA listings mapped on Google Maps GIS grid.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">2</div>
                    <h4 className="text-xs font-bold text-white">100% Escrow Bayana</h4>
                    <p className="text-[11px] text-slate-400">Lock token payment in corporate escrow bank holding with auto-generated E-Stamp contracts.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">3</div>
                    <h4 className="text-xs font-bold text-white">Transfer & Release</h4>
                    <p className="text-[11px] text-slate-400">Funds released to seller only after verified society transfer or buyer confirmation.</p>
                  </div>
                </div>
              </div>
            )}

            {/* OVERSEAS DESK TOPICS */}
            {selectedTopicId === 'overseas-overview' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Overseas Guide 1.1</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Overseas Investor Registration & Benefits</h1>
                  <p className="text-xs text-slate-400 mt-1">Dedicated real estate desk designed for Pakistanis residing in GCC, UK, USA, Canada & Europe.</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    State Bank & Regulatory Compliance
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Overseas Pakistanis contribute nearly half of premium real estate capital in Pakistan. DealFast provides full institutional security, NICOP profile verification, and seamless integration with Roshan Digital Accounts (RDA).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-white flex items-center text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> FBR Active Taxpayer Privileges
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      Access lower withholding tax rates under active tax filer laws for non-resident Pakistanis when purchasing approved societal land.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-white flex items-center text-teal-400">
                      <Lock className="w-4 h-4 mr-1.5" /> Zero Token Risk Guarantee
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      Your token deposit (Bayana) remains locked in DealFast bank escrow until land registry documents and society NOCs are independently verified.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedTopicId === 'overseas-rda' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Overseas Guide 1.2</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Roshan Digital Account (RDA) Escrow & Repatriation</h1>
                  <p className="text-xs text-slate-400 mt-1">State Bank of Pakistan guidelines for transferring and repatriating real estate capital.</p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold text-emerald-400">SBP RDA Repatriation Flexibility</h3>
                    <p className="text-xs text-slate-300">
                      When purchasing property through certified RDA channels, principal funds and capital appreciation can be legally repatriated back to your foreign bank account without administrative hassle.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold text-teal-400">Automated RDA Escrow Receipts</h3>
                    <p className="text-xs text-slate-300">
                      Every payment generates an official digital transaction receipt containing bank reference codes required for State Bank record-keeping.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedTopicId === 'overseas-poa' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Overseas Guide 1.3</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Embassy Attestation & Remote Power of Attorney (POA)</h1>
                  <p className="text-xs text-slate-400 mt-1">Legal execution of property transfer without requiring physical travel to Pakistan.</p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold text-white">1. Consulate / Embassy Attestation</h3>
                    <p className="text-xs text-slate-300">
                      Execute Power of Attorney (POA) at your local Pakistan Embassy or Consulate (Dubai, Riyadh, London, Washington, etc.).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold text-white">2. MOFA Verification & Land Registry</h3>
                    <p className="text-xs text-slate-300">
                      Our legal team guides Ministry of Foreign Affairs (MOFA) attestation in Islamabad or provincial capitals to ensure seamless transfer.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedTopicId === 'overseas-inspection' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Overseas Guide 1.4</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">4K Live Video Inspection & Field Verification</h1>
                  <p className="text-xs text-slate-400 mt-1">Live WebRTC walkthroughs and on-ground plot boundary verification by DealFast agents.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold text-amber-400">On-Site Plot Measurement & Soil Audit</h3>
                  <p className="text-xs text-slate-300">
                    Book a live video tour with a field officer to inspect corner plot markers, street width, possession status, and surrounding utility connections before authorizing escrow release.
                  </p>
                </div>
              </div>
            )}

            {/* TOPIC 2: USER ROLES */}
            {selectedTopicId === 'user-roles' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">Chapter 1.2</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Buyer vs. Seller vs. Agent Role Differences</h1>
                  <p className="text-xs text-slate-400 mt-1">Permissions and capabilities assigned to each account type on DealFast.</p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold text-orange-400 flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-400" /> Standard Buyer / Client User
                    </h3>
                    <p className="text-xs text-slate-300">
                      Can search listings, initiate WebRTC video calls, schedule physical site visits, place token bayana deposits in Escrow, and generate E-Stamp agreement PDFs.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" /> Property Agent & Agency Admin
                    </h3>
                    <p className="text-xs text-slate-300">
                      Can publish properties, manage lead inquiries, hire field agents with staked bounty rewards, inspect deal room milestones, and request escrow bank releases.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold text-purple-400 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" /> Super Admin & Office Staff
                    </h3>
                    <p className="text-xs text-slate-300">
                      Full administrative access to moderation queue, manual escrow bank overrides, dispute panel arbitration, and office staff role permission management.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TOPIC 3: KYC VERIFICATION */}
            {selectedTopicId === 'kyc-verification' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">Chapter 1.3</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">CNIC & Phone KYC Verification Steps</h1>
                  <p className="text-xs text-slate-400 mt-1">NADRA style identity clearance for fraud prevention.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" /> Step-by-step KYC Process
                  </h3>
                  <ol className="text-xs text-slate-300 space-y-2 list-decimal pl-5">
                    <li>Go to User Profile modal and click <strong>Submit CNIC Verification</strong>.</li>
                    <li>Upload clear front and back photos of your 13-digit NADRA CNIC.</li>
                    <li>Provide active Pakistani phone number (e.g. 0300-1234567) for OTP authentication.</li>
                    <li>Verification Officer reviews documents within 15 minutes to award the <strong>Verified KYC Badge</strong>.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* TOPIC 4: ESCROW FLOW */}
            {selectedTopicId === 'escrow-flow' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Chapter 2.1</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">How Bayana Token Holding Works</h1>
                  <p className="text-xs text-slate-400 mt-1">Step-by-step corporate escrow payment protection mechanism.</p>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    Escrow Banking Protocol (Statutory Protection)
                  </h3>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
                    <li>Token Bayana deposit is transferred directly to DealFast Escrow Account (Meezan Bank / HBL).</li>
                    <li>Funds remain locked in neutral holding and CANNOT be accessed by seller or agent until title verification completes.</li>
                    <li>Auto-generates a legally binding 100 PKR Stamp Paper Agreement with QR Code verification.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TOPIC 5: BANK RELEASE */}
            {selectedTopicId === 'bank-release' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Chapter 2.2</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Seller Bank Release & 2-Way Lock Rules</h1>
                  <p className="text-xs text-slate-400 mt-1">Conditions required to disburse escrow funds to the seller's account.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Disbursal Verification Checklist
                  </h3>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
                    <li>Buyer approves physical NOC inspection receipt in their dashboard.</li>
                    <li>Alternatively, 7 days elapse without buyer dispute submission.</li>
                    <li>Escrow Finance Manager reviews bank IBAN and executes 1-click IBFT payout.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TOPIC 6: BUYER REFUND */}
            {selectedTopicId === 'buyer-refund' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Chapter 2.3</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">100% Buyer Refund & Dispute Cancellation</h1>
                  <p className="text-xs text-slate-400 mt-1">Guaranteed money-back protection if title or NOC fails verification.</p>
                </div>

                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
                  <h3 className="text-xs font-bold text-red-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-red-400" /> Immediate Refund Triggers
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    If society transfer is rejected by RDA/CDA/LDA or property details fail physical inspection, click <strong>Raise Escrow Dispute</strong> in your booking panel. Escrow funds are refunded 100% back to buyer's bank or JazzCash/Easypaisa within 24 hours.
                  </p>
                </div>
              </div>
            )}

            {/* TOPIC 7: WEBRTC CALL */}
            {selectedTopicId === 'video-call-setup' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Chapter 3.1</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Initiating Live WebRTC Video Consultations</h1>
                  <p className="text-xs text-slate-400 mt-1">Direct peer-to-peer audio/video streaming with verified agents and agency leads.</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                  <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-emerald-400" />
                    How WebRTC Streaming Works
                  </h3>
                  <p className="text-xs text-slate-300">
                    Click "Live Video Call" or "Voice Call" on any property detail page or agent profile. The browser connects via `getUserMedia` and PeerJS streaming with camera, microphone, and speaker toggles.
                  </p>
                </div>
              </div>
            )}

            {/* TOPIC 8: CAMERA CONTROLS */}
            {selectedTopicId === 'camera-controls' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Chapter 3.2</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Camera, Microphone & Speaker Controls</h1>
                  <p className="text-xs text-slate-400 mt-1">Managing media device streams during live video walkthroughs.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs text-slate-300">
                  <p>• <strong>Mute Mic:</strong> Toggle audio stream on/off during consultation.</p>
                  <p>• <strong>Toggle Camera:</strong> Switch between front selfie camera and rear environment camera on mobile devices.</p>
                  <p>• <strong>Screen Share:</strong> Share floor plans or allotment letters live during call.</p>
                </div>
              </div>
            )}

            {/* TOPIC 9: WEBRTC TROUBLESHOOT */}
            {selectedTopicId === 'webrtc-troubleshoot' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Chapter 3.3</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Resolving Camera Permission & Network Latency</h1>
                  <p className="text-xs text-slate-400 mt-1">Fixing media stream permissions and WebRTC ICE candidate connection issues.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <p className="font-bold text-amber-400">Browser Permission Fix:</p>
                  <p>Click lock icon next to website URL in browser address bar and set Camera and Microphone permissions to <strong>Allow</strong>, then reload page.</p>
                </div>
              </div>
            )}

            {/* TOPIC 10: MAP EXPLORER */}
            {selectedTopicId === 'map-explorer' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">Chapter 4.1</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Google Maps GIS Sector Grid Explorer</h1>
                  <p className="text-xs text-slate-400 mt-1">Locating plot boundaries and sector maps across major Pakistani cities.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <p>Explore exact sector grids for DHA, Bahria Town, Gulberg, and Clifton. Click any map pin to preview property price and virtual tour.</p>
                </div>
              </div>
            )}

            {/* TOPIC 11: NOC CHECK */}
            {selectedTopicId === 'noc-check' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">Chapter 4.2</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Verifying RDA/CDA/LDA Society NOC Approvals</h1>
                  <p className="text-xs text-slate-400 mt-1">Government society approval verification guide.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <p>All listings feature an official <strong>NOC Verification Badge</strong> indicating approval status from Capital Development Authority (CDA), Rawalpindi Development Authority (RDA), or Lahore Development Authority (LDA).</p>
                </div>
              </div>
            )}

            {/* TOPIC 12: MORTGAGE CALC */}
            {selectedTopicId === 'mortgage-calc' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">Chapter 4.3</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Using the EMI Mortgage & Tax Calculator</h1>
                  <p className="text-xs text-slate-400 mt-1">Calculating monthly bank financing installments and FBR property taxes.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <p>Use the built-in EMI Mortgage Calculator on any property listing to simulate 5-year to 20-year bank home financing rates (Meezan Bank, HBL Islamic, Bank Alfalah).</p>
                </div>
              </div>
            )}

            {/* TOPIC 13: AGENCY VERIFICATION */}
            {selectedTopicId === 'agency-verification' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Chapter 5.1</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Verified Agency Badge & Registration</h1>
                  <p className="text-xs text-slate-400 mt-1">Requirements for registering estate agencies and obtaining verified badge.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <p>Submit SECP company registration and FBR NTN certificate to unlock verified agency badge and publish unlimited listings.</p>
                </div>
              </div>
            )}

            {/* TOPIC 14: DEAL ROOMS */}
            {selectedTopicId === 'deal-rooms' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Chapter 5.2</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Co-Braking Deal Rooms & Commission Splits</h1>
                  <p className="text-xs text-slate-400 mt-1">Collaborative agency deals with locked milestone bounty splits.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <p>Co-braking deal rooms lock commission splits in escrow. When field agent completes site visit or offer letter milestone, funds are auto-released.</p>
                </div>
              </div>
            )}

            {/* TOPIC 15: HIRING TALENTS */}
            {selectedTopicId === 'hiring-talents' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Chapter 5.3</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Agent Talent Hiring & Staked Bounty Jobs</h1>
                  <p className="text-xs text-slate-400 mt-1">Hiring freelance field agents for site visits and document verifications.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <p>Agencies post bounty jobs (e.g. PKR 10,000 for DHA site check). Agents lock stake and earn bounty upon uploading geo-tagged photo proof.</p>
                </div>
              </div>
            )}

            {/* TOPIC 16: PROJECT BOOKING */}
            {selectedTopicId === 'project-booking' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Chapter 6.1</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Booking Off-Plan Units & Builder Escrow</h1>
                  <p className="text-xs text-slate-400 mt-1">Reserving apartments and plots on easy quarterly installment plans.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <p>Book off-plan units with 10% down payment protected in Builder Escrow account until slab construction milestone completion.</p>
                </div>
              </div>
            )}

            {/* TOPIC 17: FLOOR PLANS */}
            {selectedTopicId === 'floor-plans' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Chapter 6.2</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Downloading Approved Floor Plans & Layouts</h1>
                  <p className="text-xs text-slate-400 mt-1">Accessing architectural 2D & 3D layout maps.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <p>Click "Download Approved Floor Plan" on project pages to get official PDF layouts approved by local housing authorities.</p>
                </div>
              </div>
            )}

            {/* TOPIC 18: STAMP PAPER PDF */}
            {selectedTopicId === 'stamp-paper-pdf' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Chapter 7.1</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Auto-Generating 100 PKR Stamp Paper Agreements</h1>
                  <p className="text-xs text-slate-400 mt-1">Official Legal E-Stamp Paper PDF Generator powered by `@react-pdf/renderer`.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-white">Features Included in Generated PDF:</h4>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
                    <li>Government of Punjab / Sindh E-Stamp Header Watermark.</li>
                    <li>CNIC numbers of Buyer, Seller, and Witness 1 & 2.</li>
                    <li>QR Code verification link pointing to DealFast Escrow portal.</li>
                    <li>Auto-downloads formatted PDF directly to user’s device.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TOPIC 19: BROCHURE PDF */}
            {selectedTopicId === 'brochure-pdf' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Chapter 7.2</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Generating High-Res Property Brochure PDFs</h1>
                  <p className="text-xs text-slate-400 mt-1">Printing or saving high-definition property marketing sheets.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <p>Click printer icon on any property page to instantly generate and download a multi-page PDF brochure featuring photos, specs, and agent contact info.</p>
                </div>
              </div>
            )}

            {/* TOPIC 20: TAX INVOICE PDF */}
            {selectedTopicId === 'tax-invoice-pdf' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Chapter 7.3</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Generating Official Escrow Receipts & Invoices</h1>
                  <p className="text-xs text-slate-400 mt-1">Official GST and FBR compliant tax receipt generator.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <p>Every token payment generates an instant PDF receipt showing transaction reference number, bank account details, and escrow clearance date.</p>
                </div>
              </div>
            )}

            {/* TOPIC 21: COMPARISON MATRIX */}
            {selectedTopicId === 'comparison-matrix' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">Competitive Benchmark 8.1</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Feature Matrix: DealFast vs Top 10 World & Pakistan Real Estate Portals
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    An objective feature comparison between DealFast and global & regional portals (<span className="text-slate-300 font-bold">Zameen.com</span>, <span className="text-slate-300 font-bold">Zillow.com</span>, <span className="text-slate-300 font-bold">Realtor.com</span>, <span className="text-slate-300 font-bold">Bayut.com</span>, <span className="text-slate-300 font-bold">Rightmove.co.uk</span>, <span className="text-slate-300 font-bold">PropertyFinder.ae</span>, <span className="text-slate-300 font-bold">Redfin.com</span>, <span className="text-slate-300 font-bold">Trulia.com</span>, <span className="text-slate-300 font-bold">Graana.com</span>, <span className="text-slate-300 font-bold">Idealista.com</span>).
                  </p>
                </div>

                {/* HIGHLIGHT BANNER */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/60 via-slate-900 to-slate-950 border border-orange-500/40 space-y-2">
                  <div className="flex items-center space-x-2 text-orange-400">
                    <Award className="w-5 h-5 text-orange-400" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Why DealFast Outperforms Traditional Classified Portals
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Traditional portals (like <span className="font-bold text-white">Zameen.com</span> or <span className="font-bold text-white">Zillow.com</span>) operate strictly as ad bulletin boards that charge listing fees without protecting buyers against token forfeiture or title fraud. DealFast bridges fintech and real estate by offering 100% Scheduled Bank Escrow, automated legal PDF generation, live WebRTC video inspection, and a B2B agent hiring marketplace.
                  </p>
                </div>

                {/* COMPARISON TABLE */}
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 font-black">
                        <th className="p-3 min-w-[200px]">Core Capability / Feature</th>
                        <th className="p-3 text-center min-w-[130px] bg-orange-950/40 text-orange-400 border-x border-slate-800">
                          ⚡ DealFast (Pakistan)
                        </th>
                        <th className="p-3 text-center min-w-[120px]">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">Zameen.com</span>
                        </th>
                        <th className="p-3 text-center min-w-[120px]">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">Zillow.com</span>
                        </th>
                        <th className="p-3 text-center min-w-[120px]">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">Bayut.com</span>
                        </th>
                        <th className="p-3 text-center min-w-[140px]">
                          Top 10 Global Portals
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      
                      <tr>
                        <td className="p-3 font-bold text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
                          100% Scheduled Bank Escrow (Bayana Protection)
                        </td>
                        <td className="p-3 text-center bg-orange-950/20 border-x border-slate-800 font-black text-emerald-400">
                          ✅ FULLY INTEGRATED
                        </td>
                        <td className="p-3 text-center text-rose-400 font-bold">❌ None (0% Risk Cover)</td>
                        <td className="p-3 text-center text-rose-400 font-bold">❌ None</td>
                        <td className="p-3 text-center text-rose-400 font-bold">❌ None</td>
                        <td className="p-3 text-center text-rose-400 font-bold">❌ Ad Classified Only</td>
                      </tr>

                      <tr>
                        <td className="p-3 font-bold text-white">
                          Overseas Pakistani Desk & SBP RDA Repatriation
                        </td>
                        <td className="p-3 text-center bg-orange-950/20 border-x border-slate-800 font-black text-emerald-400">
                          ✅ SBP RDA Escrow + POA
                        </td>
                        <td className="p-3 text-center text-amber-400">⚠️ Ads Only (No RDA Escrow)</td>
                        <td className="p-3 text-center text-slate-500">N/A (US domestic)</td>
                        <td className="p-3 text-center text-amber-400">⚠️ Dubai Transfer Only</td>
                        <td className="p-3 text-center text-rose-400">❌ No SBP Escrow</td>
                      </tr>

                      <tr>
                        <td className="p-3 font-bold text-white">
                          Direct WhatsApp & Unmasked Contact Access
                        </td>
                        <td className="p-3 text-center bg-orange-950/20 border-x border-slate-800 font-black text-emerald-400">
                          ✅ 100% Direct & Free
                        </td>
                        <td className="p-3 text-center text-amber-400">⚠️ Form Gated / Paywalled</td>
                        <td className="p-3 text-center text-amber-400">⚠️ Agent Premier Leads</td>
                        <td className="p-3 text-center text-amber-400">⚠️ WhatsApp Form</td>
                        <td className="p-3 text-center text-amber-400">⚠️ Paywalled Leads</td>
                      </tr>

                      <tr>
                        <td className="p-3 font-bold text-white">
                          Auto Legal PDF Generator (E-Stamp Contracts)
                        </td>
                        <td className="p-3 text-center bg-orange-950/20 border-x border-slate-800 font-black text-emerald-400">
                          ✅ Instant PDF Generator
                        </td>
                        <td className="p-3 text-center text-rose-400">❌ Offline Manual Paperwork</td>
                        <td className="p-3 text-center text-amber-400">⚠️ 3rd Party eSign Link</td>
                        <td className="p-3 text-center text-rose-400">❌ Offline Manual Paperwork</td>
                        <td className="p-3 text-center text-rose-400">❌ Manual Paperwork</td>
                      </tr>

                      <tr>
                        <td className="p-3 font-bold text-white">
                          4K Live Video WebRTC Inspection Calls
                        </td>
                        <td className="p-3 text-center bg-orange-950/20 border-x border-slate-800 font-black text-emerald-400">
                          ✅ Native WebRTC Module
                        </td>
                        <td className="p-3 text-center text-rose-400">❌ Photos Only</td>
                        <td className="p-3 text-center text-amber-400">⚠️ Pre-recorded 3D Only</td>
                        <td className="p-3 text-center text-amber-400">⚠️ Pre-recorded Video</td>
                        <td className="p-3 text-center text-rose-400">❌ Pre-recorded Only</td>
                      </tr>

                      <tr>
                        <td className="p-3 font-bold text-white">
                          Agent Talent & Freelance Hiring Hub (DealRoom)
                        </td>
                        <td className="p-3 text-center bg-orange-950/20 border-x border-slate-800 font-black text-emerald-400">
                          ✅ Staked Bounty Marketplace
                        </td>
                        <td className="p-3 text-center text-rose-400">❌ No B2B Agent Hiring</td>
                        <td className="p-3 text-center text-rose-400">❌ No B2B Hiring Hub</td>
                        <td className="p-3 text-center text-rose-400">❌ No B2B Hiring Hub</td>
                        <td className="p-3 text-center text-rose-400">❌ None</td>
                      </tr>

                      <tr>
                        <td className="p-3 font-bold text-white">
                          Zero Commission Direct Owner-Buyer Portal
                        </td>
                        <td className="p-3 text-center bg-orange-950/20 border-x border-slate-800 font-black text-emerald-400">
                          ✅ 0% Commission Direct
                        </td>
                        <td className="p-3 text-center text-rose-400">❌ Agency Paid Listings</td>
                        <td className="p-3 text-center text-amber-400">⚠️ FSBO Limited</td>
                        <td className="p-3 text-center text-rose-400">❌ Mandatory Agent Cut</td>
                        <td className="p-3 text-center text-rose-400">❌ Heavy Agent Cuts</td>
                      </tr>

                      <tr>
                        <td className="p-3 font-bold text-white">
                          2026 FBR Tax Filer & CVT Calculator Engine
                        </td>
                        <td className="p-3 text-center bg-orange-950/20 border-x border-slate-800 font-black text-emerald-400">
                          ✅ Built-in Section 236K/7E
                        </td>
                        <td className="p-3 text-center text-amber-400">⚠️ Static Blog Table</td>
                        <td className="p-3 text-center text-slate-500">N/A (US tax only)</td>
                        <td className="p-3 text-center text-slate-500">N/A (UAE 4% DLD only)</td>
                        <td className="p-3 text-center text-rose-400">❌ No Live Tax Engine</td>
                      </tr>

                      <tr>
                        <td className="p-3 font-bold text-white">
                          CNIC / NICOP NADRA Verified Badges
                        </td>
                        <td className="p-3 text-center bg-orange-950/20 border-x border-slate-800 font-black text-emerald-400">
                          ✅ Automated Verification
                        </td>
                        <td className="p-3 text-center text-amber-400">⚠️ Agency Phone Only</td>
                        <td className="p-3 text-center text-amber-400">⚠️ Agent License Check</td>
                        <td className="p-3 text-center text-amber-400">⚠️ TruCheck Badge</td>
                        <td className="p-3 text-center text-amber-400">⚠️ Phone Check Only</td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TOPIC 22: TOP 10 BREAKDOWN */}
            {selectedTopicId === 'top10-breakdown' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">Competitive Benchmark 8.2</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Detailed Comparison: Top 10 World & Regional Real Estate Platforms
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Detailed review of how DealFast improves upon features offered by the world’s leading 10 real estate platforms.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  
                  {/* Platform 1: Zameen */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-sm bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                        1. Zameen.com (Pakistan)
                      </span>
                      <span className="text-emerald-400 font-bold text-[11px]">DealFast Advantage: +100% Escrow Protection</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-200">Zameen.com</span> is Pakistan's largest traditional ad listing portal. However, it functions solely as an advertising classified bulletin. It does not hold token money in escrow, leaving buyers vulnerable to advance deposit forfeiture. DealFast locks Bayana token payments in State Bank regulated escrow until physical verification.
                    </p>
                  </div>

                  {/* Platform 2: Zillow */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-sm bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                        2. Zillow.com (USA)
                      </span>
                      <span className="text-emerald-400 font-bold text-[11px]">DealFast Advantage: Free Direct Seller Chat</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-200">Zillow.com</span> is the USA's leading real estate marketplace. It monetization strategy relies on premier agent lead selling, which hides direct property owners behind paywalled lead generation forms. DealFast allows direct 1-click WhatsApp and phone calls between buyers, sellers, and agents with zero hidden paywalls.
                    </p>
                  </div>

                  {/* Platform 3: Realtor.com */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-sm bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                        3. Realtor.com (USA)
                      </span>
                      <span className="text-emerald-400 font-bold text-[11px]">DealFast Advantage: B2B Agent Talent Marketplace</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-200">Realtor.com</span> focuses on licensed broker listings. DealFast goes beyond listing inventory by providing the <span className="font-bold text-orange-400">DealRoom B2B Hiring Hub</span>, where established real estate agencies can hire freelance field agents with staked bounty escrow guarantees.
                    </p>
                  </div>

                  {/* Platform 4: Bayut */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-sm bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                        4. Bayut.com (UAE / Middle East)
                      </span>
                      <span className="text-emerald-400 font-bold text-[11px]">DealFast Advantage: Overseas SBP RDA Repatriation</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-200">Bayut.com</span> dominates the UAE market with verified property listings. For Overseas Pakistanis investing from UAE and GCC, DealFast provides native integration with State Bank Roshan Digital Accounts (RDA), enabling capital repatriation and embassy Power of Attorney (POA) support.
                    </p>
                  </div>

                  {/* Platform 5: Rightmove */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-sm bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                        5. Rightmove.co.uk (United Kingdom)
                      </span>
                      <span className="text-emerald-400 font-bold text-[11px]">DealFast Advantage: Instant Legal E-Stamp Generator</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-200">Rightmove.co.uk</span> is the UK's top portal. Rightmove requires offline conveyancing solicitors to execute contracts. DealFast generates instant, court-admissible 100 PKR Legal E-Stamp Paper agreement PDFs directly in the browser with embedded QR codes.
                    </p>
                  </div>

                  {/* Platform 6: PropertyFinder */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-sm bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                        6. PropertyFinder.ae (GCC & UAE)
                      </span>
                      <span className="text-emerald-400 font-bold text-[11px]">DealFast Advantage: Live WebRTC 4K Video Walkthrough</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-200">PropertyFinder.ae</span> features 360-degree virtual tours. DealFast enhances remote property verification by embedding live 4K WebRTC video calls, enabling buyers to conduct live interactive walkthroughs with verified field officers in real time.
                    </p>
                  </div>

                  {/* Platform 7: Redfin */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-sm bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                        7. Redfin.com (USA)
                      </span>
                      <span className="text-emerald-400 font-bold text-[11px]">DealFast Advantage: Multi-Role Single Sign-On</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-200">Redfin.com</span> operates a full-service discount brokerage model. DealFast offers a multi-role single sign-on architecture that allows users to instantly toggle between Buyer, Field Agent, Certified Agency, Developer/Builder, and Super Admin modes.
                    </p>
                  </div>

                  {/* Platform 8: Trulia */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-sm bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                        8. Trulia.com (USA)
                      </span>
                      <span className="text-emerald-400 font-bold text-[11px]">DealFast Advantage: FBR Tax & Valuation Engine</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-200">Trulia.com</span> excels in neighborhood statistics and crime maps. DealFast provides a specialized Pakistani FBR tax engine that auto-calculates Active Filer vs. Non-Filer tax obligations under Section 236K, Capital Value Tax (CVT), and stamp duties for all major Pakistani cities.
                    </p>
                  </div>

                  {/* Platform 9: Graana */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-sm bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                        9. Graana.com (Pakistan)
                      </span>
                      <span className="text-emerald-400 font-bold text-[11px]">DealFast Advantage: OpenStreetMap Interactive GIS Grid</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-200">Graana.com</span> is a Pakistani property portal focusing on verified properties. DealFast includes an interactive OpenStreetMap GIS sector grid with custom marker clusters and high-resolution sector layout maps.
                    </p>
                  </div>

                  {/* Platform 10: Idealista */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-sm bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                        10. Idealista.com (Europe / Spain & Italy)
                      </span>
                      <span className="text-emerald-400 font-bold text-[11px]">DealFast Advantage: 100% Free Owner Direct Posting</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-200">Idealista.com</span> is Southern Europe's largest portal, charging individual property owners heavy fees per listing. DealFast provides 100% free direct owner property posting with zero listing fees.
                    </p>
                  </div>

                </div>
              </div>
            )}


            {/* SUPER ADMIN & OFFICE MANUAL TOPICS */}
            {selectedTopicId.startsWith('admin') && (
              <div className="space-y-6 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/50 space-y-2">
                  <div className="flex items-center space-x-2 text-purple-300">
                    <ShieldAlert className="w-5 h-5 text-purple-400" />
                    <span className="text-xs font-extrabold uppercase tracking-widest">
                      CLASSIFIED: SUPER ADMIN & OFFICE WORKER OPERATING MANUAL
                    </span>
                  </div>
                  <p className="text-xs text-purple-200">
                    This section contains internal operational procedures for DealFast Super Administrators, Office Workers, and Moderation Officers.
                  </p>
                </div>

                {selectedTopicId === 'admin-access' && (
                  <div className="space-y-4 text-xs">
                    <h2 className="text-lg font-black text-white">1. Admin Command Center Credentials & PIN Login</h2>
                    <p className="text-slate-300">
                      Access the Admin Command Center by clicking the "Admin" button in the top navigation bar or entering Admin mode.
                    </p>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="text-amber-400 font-bold">Super Admin Access Notice:</div>
                      <div className="text-slate-300 space-y-1 leading-relaxed">
                        <p>• Access is restricted to authorized platform administrators only.</p>
                        <p>• Multi-Factor Authentication (2FA) and dual PIN verification are enforced on all admin logins.</p>
                        <p>• Contact the chief platform administrator if you require staff credentials.</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTopicId === 'moderation-queue' && (
                  <div className="space-y-4 text-xs">
                    <h2 className="text-lg font-black text-white">2. Property Listing Moderation Queue</h2>
                    <p className="text-slate-300">
                      All new listings submitted by standard users are placed in the Moderation Queue. Staff with `canManageListings` permission can approve or reject properties after inspecting NOC documents.
                    </p>
                  </div>
                )}

                {selectedTopicId === 'escrow-override' && (
                  <div className="space-y-4 text-xs">
                    <h2 className="text-lg font-black text-white">3. Manual Escrow Release & Refund Overrides</h2>
                    <p className="text-slate-300">
                      In case of verified society transfer or buyer dispute, the Super Admin or Escrow Finance Manager (`canManageEscrow`) can trigger immediate bank disbursement or 100% refund to the buyer’s account.
                    </p>
                  </div>
                )}

                {selectedTopicId === 'dispute-arbitration' && (
                  <div className="space-y-4 text-xs">
                    <h2 className="text-lg font-black text-white">4. Dispute Panel Arbitration & Award Rules</h2>
                    <p className="text-slate-300">
                      When a deal room dispute is opened between agencies or agents, the 10-Day Dispute Panel reviews proof photos and votes to award the staked escrow deposit to the winning party.
                    </p>
                  </div>
                )}

                {selectedTopicId === 'staff-permissions' && (
                  <div className="space-y-4 text-xs">
                    <h2 className="text-lg font-black text-white">5. Office Worker & Staff Role Permission Controls</h2>
                    <p className="text-slate-300">
                      Super Admin can create granular office staff accounts (e.g. Verification Officer, Finance Manager) with individual PIN codes and targeted permission toggles.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* STATUS FOOTER */}
        <div className="bg-slate-950 px-3 sm:px-4 py-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">System Status: All Services Operational (Firestore + WebRTC + PDF Engine)</span>
          </span>
          <span className="hidden sm:inline">Format: Windows 11 Interactive Manual</span>
        </div>

      </div>
    </div>
  );
};
