import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Fingerprint,
  Building2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Globe,
  FileCheck,
  ArrowRight,
  Clock,
  UserCheck
} from 'lucide-react';

interface HomePageExplanationsProps {
  onOpenGuide?: (topic?: string) => void;
  onOpenNadraVerification?: () => void;
}

export const HomePageExplanations: React.FC<HomePageExplanationsProps> = ({
  onOpenGuide,
  onOpenNadraVerification
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How is my property token payment protected in DealFast Escrow? (اسکرو ٹوکن کس طرح محفوظ رہتا ہے؟)",
      answer: "When you book a property on DealFast, your token money is deposited directly into a bank-secured corporate Escrow Account—not sent to the seller or agent. Funds remain locked until physical site verification, NADRA biometric CNIC check, and title deed clearance are complete. If the property documents are flawed, your deposit is 100% refunded instantly."
    },
    {
      question: "Can anyone post or register as an Agent, Agency, or Builder without approval? (کیا بغیر منظوری کوئی ایجنٹ یا ایجنسی رجسٹر ہو سکتی ہے؟)",
      answer: "No! DealFast enforces strict Admin Approval. Every Agent, Real Estate Agency, Housing Project Builder, and Marketing Company must submit mandatory NADRA 13-Digit CNIC papers and official business licenses. Unapproved accounts are held in pending status and CANNOT list properties or show up in public directories."
    },
    {
      question: "How do Overseas Pakistanis book properties remotely? (بیرون ملک مقیم پاکستانی کس طرح پراپرٹی بُک کر سکتے ہیں؟)",
      answer: "Overseas Pakistanis can submit their NICOP / Passport and pay via Roshan Digital Account (RDA), Credit/Debit Cards, or International Wire Transfer. A certified local DealFast field agent will record live WebRTC site video and upload drone footage for total transparency."
    },
    {
      question: "What is NADRA Biometric Verification and why is it mandatory? (نادرا بائیو میٹرک تصدیق کیوں ضروری ہے؟)",
      answer: "NADRA Biometric verification matches the seller's and buyer's 13-Digit Smart CNIC against central record databases to eliminate fake property listings, duplicate plot allocations, and unauthorized impersonation."
    },
    {
      question: "What are the platform fee charges? (ویب سائٹ کے چارجز کتنے ہیں؟)",
      answer: "Browsing, searching, map navigation, and contacting agents is 100% FREE. A minimal 0.5% - 1.0% escrow processing fee applies strictly on successful deal settlement to cover bank escrow handling and legal document audits."
    }
  ];

  return (
    <section className="space-y-10 my-10 font-sans text-slate-100">
      
      {/* 1. Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-orange-400" />
          <span>Pakistan's 1st Escrow Protected Real Estate Ecosystem</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          How DealFast Safeguards Your Property Investment
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          مکمل ہدایات اور طریقہ کار: پراپرٹی کی خرید و فروخت، اسکرو ٹوکن کی حفاظت اور نادرا بائیو میٹرک تصدیق کی تمام تفصیلات نیچے ملاحظہ فرمائیں۔
        </p>
      </div>

      {/* 2. Step-by-Step Escrow Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            step: "01",
            title: "Verified Search & Map",
            titleUrdu: "پراپرٹی تلاش کریں",
            desc: "Explore RDA, CDA, and KDA verified properties across Pakistan with interactive OpenStreetMap location pins.",
            icon: <Globe className="w-5 h-5 text-orange-400" />
          },
          {
            step: "02",
            title: "Token via Escrow",
            titleUrdu: "ٹوکن رقم کی محفوظ منتقلی",
            desc: "Pay booking deposit into bank escrow via EasyPaisa, JazzCash, or 1Link. Funds remain locked until you approve.",
            icon: <Lock className="w-5 h-5 text-amber-400" />
          },
          {
            step: "03",
            title: "NADRA CNIC Verification",
            titleUrdu: "نادرا شناختی تصدیق",
            desc: "Seller & buyer CNIC records undergo biometric verisys verification to ensure 100% genuine title ownership.",
            icon: <Fingerprint className="w-5 h-5 text-emerald-400" />
          },
          {
            step: "04",
            title: "Safe Transfer & Possession",
            titleUrdu: "حتمی قبضہ اور فنڈز کی منتقلی",
            desc: "Escrow funds are disbursed to the seller only after physical site handover and transfer letter confirmation.",
            icon: <CheckCircle2 className="w-5 h-5 text-blue-400" />
          }
        ].map((st, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-orange-500/50 transition-all space-y-3 relative group overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                {st.icon}
              </div>
              <span className="text-2xl font-black text-slate-800 group-hover:text-orange-500/20 transition-colors">
                {st.step}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm group-hover:text-orange-400 transition-colors">
                {st.title}
              </h3>
              <p className="text-[11px] font-semibold text-orange-400/90 mt-0.5">
                {st.titleUrdu}
              </p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {st.desc}
            </p>
          </div>
        ))}
      </div>

      {/* 3. Platform Key Guarantees & On-Page Summary Box */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-orange-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Strict Superadmin Verification & Protection Rules (ضوابط اور اصول)
            </h3>
            <p className="text-xs text-slate-300">
              DealFast operates under corporate governance to protect buyers from fraud, double booking, and fake agencies.
            </p>
          </div>
          {onOpenGuide && (
            <button
              onClick={() => onOpenGuide('faq-general')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shrink-0 transition-all"
            >
              <span>Full User Manual</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Admin Role Approval Required</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              No individual can self-list as an Agency, Builder, Marketing Company, or Field Agent without submitting CNIC & business licenses for explicit Superadmin verification. Unapproved profiles remain hidden.
            </p>
          </div>

          <div className="space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
              <Lock className="w-4 h-4 shrink-0" />
              <span>100% Refund Guarantee</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If an owner or agency fails to provide verified property transfer documentation or society NOC clearance within 14 days, your escrow token is refunded in full automatically.
            </p>
          </div>

          <div className="space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs">
              <Globe className="w-4 h-4 shrink-0" />
              <span>Overseas Pakistani Remote Desk</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Non-resident Pakistanis can track site progress via live WebRTC video calls, receive verified site inspection reports, and transfer funds through Roshan Digital Accounts securely.
            </p>
          </div>
        </div>
      </div>

      {/* 4. On-Page FAQ Accordion */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl border border-orange-500/30">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              Frequently Asked Questions & Detailed Instructions (اہم سوالات و جوابات)
            </h3>
            <p className="text-xs text-slate-400">
              Clear on-page guidelines for buyers, sellers, agents, and investors
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-white hover:text-orange-400 transition-colors"
                >
                  <span className="flex-1">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-orange-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-900 bg-slate-900/40">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
};
