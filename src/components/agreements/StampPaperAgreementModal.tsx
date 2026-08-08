import React, { useState, useRef } from 'react';
import { X, Printer, Download, ShieldCheck, FileText, CheckCircle2, Building2, UserCheck, Calendar } from 'lucide-react';
import { Property } from '../../types';
import { store } from '../../lib/store';
import { downloadStampPaperPDF } from '../../utils/pdfGenerator';

interface StampPaperAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  buyerName?: string;
  tokenAmount?: number;
}

export const StampPaperAgreementModal: React.FC<StampPaperAgreementModalProps> = ({
  isOpen,
  onClose,
  property,
  buyerName = store.currentUser.name || 'Muhammad Ali Khan',
  tokenAmount
}) => {
  const agreementRef = useRef<HTMLDivElement>(null);
  const [stampNumber] = useState(`PK-ESTAMP-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [agreementDate] = useState(new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }));

  if (!isOpen || !property) return null;

  const actualToken = tokenAmount || Math.round(property.price * 0.1);
  const sellerName = property.ownerName || 'Property Owner / Authorized Agent';
  const priceFormatted = property.priceFormatted || `PKR ${property.price.toLocaleString()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    downloadStampPaperPDF({
      stampNumber,
      agreementDate,
      propertyTitle: property.title,
      propertyAddress: `${property.address}, ${property.area}, ${property.city}`,
      priceFormatted,
      sellerName,
      buyerName,
      tokenAmount: actualToken
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative my-auto max-h-[90vh] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm">Escrow Legal Stamp Paper Agreement (Bayana)</h3>
              <p className="text-[11px] text-slate-400">Government of Pakistan E-Stamp Certified Document ID: {stampNumber}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-orange-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="gradient-btn text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-orange-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Stamp Paper Document Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-900 bg-amber-50/95 font-serif" ref={agreementRef}>
          
          {/* Government E-Stamp Header */}
          <div className="border-4 border-emerald-900 p-4 rounded-xl text-center space-y-2 bg-amber-100/60 relative">
            <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-800 text-white font-sans text-[9px] font-black uppercase tracking-widest rounded">
              Verified E-Stamp
            </div>
            
            <h2 className="text-xl font-black uppercase text-emerald-950 tracking-wider font-sans">
              GOVERNMENT OF PAKISTAN - STAMP DUTY ESCROW AGREEMENT
            </h2>
            <p className="text-xs font-sans font-bold text-slate-700">
              Issuing Authority: Treasury Office, {property.city} | Value: PKR 1,200 Stamp Paper
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-sans pt-2 border-t border-emerald-800/30 text-slate-800">
              <div><strong>Stamp Certificate #:</strong> {stampNumber}</div>
              <div><strong>Date of Issue:</strong> {agreementDate}</div>
              <div><strong>Escrow Portal:</strong> DealFast (Pvt) Ltd</div>
              <div><strong>Verification Status:</strong> Active & Valid</div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center font-sans">
            <h1 className="text-lg font-black text-slate-900 uppercase underline decoration-2 underline-offset-4">
              PROPERTY AGREEMENT TO SELL (اقرار نامہ بیعانہ)
            </h1>
          </div>

          {/* Agreement Clauses */}
          <div className="text-xs space-y-4 leading-relaxed font-sans text-slate-800">
            <p>
              This Agreement for Sale is executed on <strong>{agreementDate}</strong> by and between:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/80 p-3.5 rounded-xl border border-amber-200">
              <div className="space-y-1">
                <span className="font-bold text-orange-900 uppercase text-[10px]">FIRST PARTY (SELLER / AGENT):</span>
                <p className="font-bold text-slate-900 text-sm">{sellerName}</p>
                <p className="text-[11px] text-slate-600">Company / Agency: {property.agencyName || 'Independent Seller'}</p>
                <p className="text-[11px] text-slate-600">CNIC / Registration: 37405-XXXXXXX-1</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-emerald-900 uppercase text-[10px]">SECOND PARTY (BUYER):</span>
                <p className="font-bold text-slate-900 text-sm">{buyerName}</p>
                <p className="text-[11px] text-slate-600">CNIC / Passport: 61101-XXXXXXX-3</p>
                <p className="text-[11px] text-slate-600">Contact: Registered DealFast Verified Buyer</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-xs">1. PROPERTY DESCRIPTION:</h4>
              <p className="bg-white/80 p-3 rounded-xl border border-amber-200">
                Property Title: <strong>{property.title}</strong><br />
                Location: <strong>{property.address}, {property.area}, {property.city}</strong><br />
                Size/Area: <strong>{property.sqft} Sq. Ft. ({property.beds} Beds, {property.baths} Baths)</strong><br />
                Total Demand Price: <strong className="text-emerald-700">{priceFormatted}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-xs">2. ESCROW BAYANA PAYMENT & TERMS:</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li>
                  The Second Party has deposited <strong>10% Bayana Token amount of PKR {actualToken.toLocaleString()}</strong> into the <strong>DealFast Protected Escrow Bank Account</strong>.
                </li>
                <li>
                  The First Party hereby confirms the property is free from all encumbrances, legal disputes, litigation, tax dues, or unregistered mortgages.
                </li>
                <li>
                  The remaining payment balance shall be settled at the time of official registry/transfer in DHA / CDA / Society office within 45 days.
                </li>
                <li>
                  <strong>Escrow Security Guarantee:</strong> In case the Seller fails to provide clear title documents or NOC within 30 days, the full 10% Bayana amount shall be refunded to the Buyer automatically by DealFast.
                </li>
              </ul>
            </div>

            {/* Signatures Box */}
            <div className="pt-6 border-t-2 border-slate-400 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center font-sans text-xs">
              <div className="space-y-8">
                <div className="h-10 border-b border-dashed border-slate-600 flex items-end justify-center font-bold text-slate-800">
                  {sellerName}
                </div>
                <p className="font-bold text-slate-700 text-[11px]">Signature of Seller / Agent</p>
              </div>

              <div className="space-y-8">
                <div className="h-10 border-b border-dashed border-slate-600 flex items-end justify-center font-bold text-slate-800">
                  {buyerName}
                </div>
                <p className="font-bold text-slate-700 text-[11px]">Signature of Buyer</p>
              </div>

              <div className="space-y-8 col-span-2 sm:col-span-1">
                <div className="h-10 border-b border-dashed border-slate-600 flex items-end justify-center font-bold text-emerald-800">
                  [ DealFast Digital Escrow Stamp ]
                </div>
                <p className="font-bold text-emerald-900 text-[11px]">Verified Portal Seal</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
