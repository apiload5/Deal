import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, CheckCircle2, Lock, FileText } from 'lucide-react';
import { Property, BookingType, PaymentMethod } from '../../types';
import { store } from '../../lib/store';
import { downloadStampPaperPDF } from '../../utils/pdfGenerator';

interface BookingModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ property, isOpen, onClose }) => {
  const [bookingType, setBookingType] = useState<BookingType>('token');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('rapidpaisa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!isOpen || !property) return null;

  const pct = bookingType === 'token' ? 0.1 : bookingType === 'booking' ? 0.2 : 1.0;
  const amountPaid = Math.round(property.price * pct);
  const platformFee = Math.round(amountPaid * 0.02); // 2% platform fee
  const totalCharge = amountPaid + platformFee;

  const handlePayEscrow = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const buyer = store.currentUser;
      store.createBooking({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyPrice: property.price,
        propertyImage: property.images[0],
        buyerId: buyer.id,
        buyerName: buyer.name,
        buyerEmail: buyer.email,
        buyerPhone: buyer.phone || '+92 321 8889900',
        sellerId: property.userId,
        sellerName: property.ownerName,
        sellerRole: property.userRole,
        bookingType,
        amountPaid,
        totalAmount: property.price,
        platformFee,
        agentCommission: Math.round(property.price * 0.05), // 5% commission
        paymentMethod,
        paymentStatus: 'escrow_held',
        bookingStatus: 'confirmed'
      });

      setIsProcessing(false);
      setBookingSuccess(true);

      // Trigger Confetti Celebration dynamically
      import('canvas-confetti').then((confettiModule: any) => {
        const confettiFn = typeof confettiModule === 'function' ? confettiModule : confettiModule.default;
        if (typeof confettiFn === 'function') {
          confettiFn({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }).catch(err => console.error('Confetti error:', err));
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card-glow w-full max-w-lg rounded-3xl p-6 border border-orange-500/30 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">DealFast Escrow Token Booking</h2>
              <p className="text-[10px] text-slate-400">100% Money-Back Guaranteed Token Protection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!bookingSuccess ? (
          <form onSubmit={handlePayEscrow} className="mt-4 space-y-4 text-xs">
            
            {/* Property & Seller Verification Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-3">
                <img src={property.images[0]} alt="Prop" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white truncate">{property.title}</p>
                  <p className="text-orange-400 font-black mt-0.5">{property.priceFormatted}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Seller Entity Type:</span>
                {property.userRole === 'agency' || property.userRole === 'builder' ? (
                  <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
                    Verified {property.userRole === 'builder' ? 'Developer / Builder' : 'Real Estate Agency'} ({property.ownerName})
                  </span>
                ) : (
                  <span className="font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-1 text-amber-300" />
                    Individual Owner ({property.ownerName}) — Escrow Safeguarded
                  </span>
                )}
              </div>
            </div>

            {/* Booking Type Options */}
            <div>
              <label className="block text-slate-300 font-bold mb-2">Select Booking Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'token', label: '10% Token', desc: 'Site Inspection' },
                  { id: 'booking', label: '20% Down', desc: 'Agency / Builder Booking' },
                  { id: 'full', label: 'Full Payment', desc: 'Immediate Allotment' }
                ].map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBookingType(b.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      bookingType === b.id
                        ? 'bg-orange-500/20 border-orange-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <p>{b.label}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{b.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Official DealFast Escrow Bank Vault Account Notice */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-orange-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-orange-400 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> DealFast Official Escrow Bank Vault
                </span>
                <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Website Commission: 2%</span>
              </div>
              <p className="text-[10px] text-slate-300">
                Bank: <strong className="text-white">Bank Alfalah / Meezan Bank</strong> | Account Title: <strong className="text-white">DealFast Escrow Pvt Ltd</strong>
              </p>
              <p className="text-[10px] text-slate-400">
                IBAN: <code className="text-amber-300 font-mono">PK36ALFH00010023456789</code> (Funds locked until Agency/Builder completes NOC & biometric transfer)
              </p>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-slate-300 font-bold mb-2">Select Gateway</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('rapidpaisa')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'rapidpaisa'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <p className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-1.5 text-amber-400" /> RapidPaisa Gateway
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Debit/Credit & IBAN Direct Transfer</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'stripe'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <p className="flex items-center">
                    <Lock className="w-4 h-4 mr-1.5 text-purple-400" /> Stripe International
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Overseas Pakistani USD/PKR Cards</p>
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Escrow Deposit Amount:</span>
                <span className="font-bold text-white">PKR {amountPaid.toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Platform Escrow Fee (2%):</span>
                <span className="font-bold text-slate-300">PKR {platformFee.toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-black text-sm text-orange-400">
                <span>Total Due Now:</span>
                <span>PKR {totalCharge.toLocaleString('en-PK')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full gradient-btn text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20"
            >
              <Lock className="w-4 h-4" />
              <span>{isProcessing ? 'Processing Gateway Security...' : 'Pay & Hold Money in Escrow'}</span>
            </button>

          </form>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-lg font-black text-white">Token Secured in DealFast Escrow!</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Your payment of <span className="font-bold text-amber-400">PKR {totalCharge.toLocaleString('en-PK')}</span> is locked safely in DealFast Escrow. Auto-generated Invoice #INV-2026 is now available in your dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  downloadStampPaperPDF({
                    stampNumber: `PK-ESTAMP-${Math.floor(10000000 + Math.random() * 90000000)}`,
                    agreementDate: new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }),
                    propertyTitle: property.title,
                    propertyAddress: `${property.address}, ${property.area}, ${property.city}`,
                    priceFormatted: property.priceFormatted || `PKR ${property.price.toLocaleString()}`,
                    sellerName: property.ownerName || 'Verified Agent',
                    buyerName: store.currentUser.name || 'Verified Buyer',
                    tokenAmount: amountPaid
                  });
                }}
                className="bg-slate-900 border border-orange-500/40 text-orange-400 hover:bg-orange-500 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Auto-Download Stamp Paper Agreement</span>
              </button>

              <button
                onClick={onClose}
                className="gradient-btn text-white px-6 py-2.5 rounded-xl text-xs font-bold"
              >
                Done & View Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
