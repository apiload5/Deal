import React, { useState } from 'react';
import {
  Globe,
  X,
  ShieldCheck,
  Building2,
  DollarSign,
  Video,
  FileCheck,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Calculator,
  Send,
  PhoneCall,
  Mail,
  Award,
  Lock,
  ArrowRight,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { DealLogo } from './DealLogo';
import { store } from '../../lib/store';

interface OverseasPakistaniModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEscrowGuide?: () => void;
  onOpenAuth?: () => void;
}

export const OverseasPakistaniModal: React.FC<OverseasPakistaniModalProps> = ({
  isOpen,
  onClose,
  onOpenEscrowGuide,
  onOpenAuth
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'GBP' | 'AED' | 'SAR' | 'EUR'>('USD');
  const [pkrAmount, setPkrAmount] = useState<number>(25000000); // 2.5 Crore default
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryCountry, setInquiryCountry] = useState('UAE (Dubai/Abu Dhabi)');
  const [inquiryWhatsapp, setInquiryWhatsapp] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  if (!isOpen) return null;

  const currentUser = store.currentUser;
  const isOverseasUser = currentUser?.isOverseasPakistani;

  // Approximate exchange rates
  const exchangeRates = {
    USD: 278.5,
    GBP: 358.2,
    AED: 75.8,
    SAR: 74.2,
    EUR: 302.4
  };

  const convertedValue = (pkrAmount / exchangeRates[selectedCurrency]).toLocaleString('en-US', {
    maximumFractionDigits: 0
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col">
        {/* Header - Fixed layout to prevent vertical circle warping */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 py-4 border-b border-slate-800 flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 shrink-0">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-lg font-black text-white leading-tight">Overseas Pakistani Investment Desk</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold whitespace-nowrap shrink-0">
                  SBP RDA & Escrow Certified
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                100% Bank Escrow Protected Real Estate Acquisition for Overseas Pakistanis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 space-y-6 text-xs">
          {/* Overseas User Registration / Status Banner */}
          <div className="bg-gradient-to-r from-emerald-900/60 via-slate-900 to-teal-900/60 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-xs flex items-center space-x-2">
                  <span>Overseas Investor Account Status</span>
                  {isOverseasUser && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
                      🇵🇰 Verified Overseas User ({currentUser?.overseasCountry || 'Global'})
                    </span>
                  )}
                </h4>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  {isOverseasUser
                    ? `Logged in as ${currentUser?.name}. RDA Status: ${currentUser?.hasRdaAccount ? 'Active SBP RDA Account Verified' : 'Standard Escrow Protection'}`
                    : 'Register an Overseas Pakistani account to gain tax immunity benefits & SBP Roshan Digital Account (RDA) escrow integration.'}
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              {isOverseasUser ? (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-center text-xs">
                  ✓ Active Overseas Membership
                </div>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenAuth) onOpenAuth();
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center space-x-1.5 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register as Overseas Investor</span>
                </button>
              )}
            </div>
          </div>
          {/* Executive Market Research Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-1">
                  🇵🇰 State Bank of Pakistan & Market Research Insights
                </span>
                <h3 className="text-sm font-extrabold text-white">
                  Overseas Pakistanis Power ~45-50% of High-Ticket Real Estate Capital
                </h3>
              </div>
              <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black shrink-0">
                $30 Billion+ Annual Remittances
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Overseas Pakistanis residing in the GCC (KSA, UAE, Qatar), UK, USA, Canada, and Europe drive nearly half of all premium real estate sales in Lahore, Islamabad, Karachi, Rawalpindi, and Peshawar. DealFast eliminates remote fraud risk through 100% digital Escrow accounts, Roshan Digital Account (RDA) integration, and SECP verified legal stamp agreements.
            </p>

            {/* Overseas Executive Guarantee Box */}
            <div className="pt-3 border-t border-emerald-500/20 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <p className="font-bold text-white text-xs flex items-center text-teal-300">
                  <ShieldCheck className="w-4 h-4 mr-1.5 text-teal-400" /> Roshan Digital Account (RDA) Repatriation
                </p>
                <p className="text-slate-400 text-[11px] mt-1">
                  <strong>100% SBP Capital Repatriation Guarantee!</strong> Overseas buyers investing via Roshan Digital Accounts enjoy full capital and gain repatriation permissions back to foreign accounts under State Bank of Pakistan regulations.
                </p>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <p className="font-bold text-white text-xs flex items-center text-emerald-300">
                  <Lock className="w-4 h-4 mr-1.5 text-emerald-400" /> Remote Escrow Title Transfer Guarantee
                </p>
                <p className="text-slate-400 text-[11px] mt-1">
                  Funds remain securely locked in DealFast Scheduled Bank Escrow (Meezan/HBL) till physical plot audit, LDA/CDA NOC check, and SECP verified e-Stamp registry completion.
                </p>
              </div>
            </div>
          </div>

          {/* 4 Key Pillars for Overseas Buyers */}
          <div>
            <h4 className="font-extrabold text-white text-sm mb-3">Core Pillars Dedicated to Overseas Buyers</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  1
                </div>
                <h5 className="font-bold text-white text-xs">Roshan Digital Account (RDA) Sync</h5>
                <p className="text-slate-400 text-[11px]">
                  Pay directly via RDA banking channels (State Bank of Pakistan compliant). Instant digital receipts provided for full tax immunity under FBR active taxpayer terms.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
                  2
                </div>
                <h5 className="font-bold text-white text-xs">4K Video Inspection & Live VR Walkthrough</h5>
                <p className="text-slate-400 text-[11px]">
                  Book a verified DealFast Field Agent to conduct a live HD video tour, plot boundary measurement, and society office verification before finalizing payments.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                  3
                </div>
                <h5 className="font-bold text-white text-xs">Remote Power of Attorney (POA) Assistance</h5>
                <p className="text-slate-400 text-[11px]">
                  Legal support for Embassy/Consulate attestation of Power of Attorney (POA), enabling trusted family members or DealFast attorneys to complete registry smoothly.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                  4
                </div>
                <h5 className="font-bold text-white text-xs">e-Stamp Paper & Biometric Verification</h5>
                <p className="text-slate-400 text-[11px]">
                  Punjab & Capital Territory e-Stamp paper generation with QR-coded verification, safeguarding against duplicate plot sales or forged documentation.
                </p>
              </div>
            </div>
          </div>

          {/* Real-Time Overseas Currency Converter */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-white text-xs flex items-center">
                <Calculator className="w-4 h-4 mr-1.5 text-amber-400" />
                Live Overseas Currency Converter (PKR to Foreign Exchange)
              </h4>
              <span className="text-[10px] text-slate-400">SBP Exchange Benchmark</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold text-[11px]">Property Price (PKR)</label>
                <input
                  type="number"
                  value={pkrAmount}
                  onChange={e => setPkrAmount(Number(e.target.value))}
                  step={500000}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold w-full outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold text-[11px]">Select Overseas Currency</label>
                <select
                  value={selectedCurrency}
                  onChange={e => setSelectedCurrency(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold w-full outline-none focus:border-amber-500"
                >
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="GBP">GBP (£) - British Pound Sterling</option>
                  <option value="AED">AED (AED) - UAE Dirham</option>
                  <option value="SAR">SAR (SAR) - Saudi Riyal</option>
                  <option value="EUR">EUR (€) - Euro</option>
                </select>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-amber-400 uppercase">Converted Value</span>
                <span className="text-base font-black text-white">
                  {selectedCurrency} {convertedValue}
                </span>
                <span className="text-[10px] text-slate-500">Rate: 1 {selectedCurrency} ≈ {exchangeRates[selectedCurrency]} PKR</span>
              </div>
            </div>
          </div>

          {/* Dedicated Overseas Advisory Contact Form */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-extrabold text-white text-xs flex items-center text-emerald-400">
              <PhoneCall className="w-4 h-4 mr-1.5" />
              Request Dedicated Overseas Investment Advisor (WhatsApp Call)
            </h4>
            <p className="text-slate-400 text-[11px]">
              Our specialized Overseas Relations desk will contact you via WhatsApp for personal assistance with RDA transfer, legal verification, or plot booking.
            </p>

            {inquirySubmitted ? (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-between">
                <span>✓ Request Received! Our Senior Overseas Manager will contact you on WhatsApp within 15 minutes.</span>
                <button
                  onClick={() => setInquirySubmitted(false)}
                  className="text-[11px] underline text-emerald-400 font-normal"
                >
                  Submit New Inquiry
                </button>
              </div>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!inquiryName || !inquiryWhatsapp) return;
                  setInquirySubmitted(true);
                }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={inquiryName}
                  onChange={e => setInquiryName(e.target.value)}
                  required
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-emerald-500"
                />
                <select
                  value={inquiryCountry}
                  onChange={e => setInquiryCountry(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-emerald-500"
                >
                  <option value="UAE">UAE (Dubai / Abu Dhabi)</option>
                  <option value="KSA">Saudi Arabia (Riyadh / Jeddah)</option>
                  <option value="UK">United Kingdom (London / Manchester)</option>
                  <option value="USA">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Other">Other International Country</option>
                </select>
                <input
                  type="tel"
                  placeholder="WhatsApp Number (e.g. +971 50 1234567)"
                  value={inquiryWhatsapp}
                  onChange={e => setInquiryWhatsapp(e.target.value)}
                  required
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="sm:col-span-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Connect with Overseas Investment Specialist</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>All investments secured by DealFast Escrow & SBP RDA Guidelines</span>
          </div>
          <div className="flex items-center space-x-3">
            {onOpenEscrowGuide && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEscrowGuide();
                }}
                className="text-amber-400 font-bold hover:underline text-xs flex items-center"
              >
                <span>Read Escrow FAQ Guide</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
            >
              Close Desk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
