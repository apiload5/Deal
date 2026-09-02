import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, CheckCircle2, Lock, FileText, Smartphone, Building, ArrowRight, Zap } from 'lucide-react';
import { Property, BookingType, PaymentMethod } from '../../types';
import { store } from '../../lib/store';
import { downloadStampPaperPDF } from '../../utils/pdfGenerator';
import { DirectRaastPaymentModal } from '../escrow/DirectRaastPaymentModal';

interface BookingModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ property, isOpen, onClose }) => {
  const [bookingType, setBookingType] = useState<BookingType>('token');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('raast');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRaastModal, setShowRaastModal] = useState<boolean>(false);
  const [lastRrn, setLastRrn] = useState<string>('');

  if (!isOpen || !property) return null;

  const pct = bookingType === 'token' ? 0.1 : bookingType === 'booking' ? 0.2 : 1.0;
  const amountPaid = Math.round(property.price * pct);
  // Zero 3rd party surcharge on Raast
  const platformFee = paymentMethod === 'raast' ? 0 : Math.round(amountPaid * 0.02);
  const totalCharge = amountPaid + platformFee;

  const handleRaastSuccess = (raastData: {
    rrn: string;
    escrowRef: string;
    payerPhone: string;
    slipUrl?: string;
  }) => {
    setShowRaastModal(false);
    setLastRrn(raastData.rrn);

    const buyer = store.currentUser;
    store.createBooking({
      propertyId: property.id,
      propertyTitle: property.title,
      propertyPrice: property.price,
      propertyImage: property.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      buyerPhone: raastData.payerPhone || buyer.phone || '+92 321 8889900',
      sellerId: property.userId,
      sellerName: property.ownerName,
      sellerRole: property.userRole,
      bookingType,
      amountPaid,
      totalAmount: property.price,
      platformFee: 0,
      agentCommission: Math.round(property.price * 0.02),
      paymentMethod: 'raast',
      paymentStatus: 'escrow_held',
      bookingStatus: 'confirmed',
      raastRrn: raastData.rrn,
      raastEscrowRef: raastData.escrowRef,
      raastPayerPhone: raastData.payerPhone,
      raastSlipUrl: raastData.slipUrl,
      notes: `Secured via State Bank Direct Raast Escrow (RRN: ${raastData.rrn})`
    });

    setBookingSuccess(true);
  };

  const handlePayEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (paymentMethod === 'raast') {
      setShowRaastModal(true);
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          amount: totalCharge,
          paymentMethod,
          propertyId: property.id
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.referenceId) {
        throw new Error(data.error || 'Payment transaction rejected by escrow gateway.');
      }

      const buyer = store.currentUser;
      store.createBooking({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyPrice: property.price,
        propertyImage: property.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
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
        agentCommission: Math.round(property.price * 0.02),
        paymentMethod,
        paymentStatus: 'escrow_held',
        bookingStatus: 'confirmed'
      });

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
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
        <div className="glass-card-glow w-full max-w-lg rounded-3xl p-5 sm:p-6 border border-emerald-500/30 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">DealFast Escrow Token Booking</h2>
                <p className="text-[10px] text-emerald-400 font-medium">State Bank Raast Zero-Fee Escrow Vault</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!bookingSuccess ? (
            <form onSubmit={handlePayEscrow} className="mt-4 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center space-x-2">
                  <span>⚠️ {errorMessage}</span>
                </div>
              )}
              
              {/* Property & Seller Verification Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-3">
                  <img src={property.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'} alt="Prop" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white truncate">{property.title}</p>
                    <p className="text-emerald-400 font-black mt-0.5">{property.priceFormatted}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Seller Entity Type:</span>
                  {property.userRole === 'agency' || property.userRole === 'builder' ? (
                    <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center">
                      <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
                      Verified {property.userRole === 'builder' ? 'Developer / Builder' : 'Agency'} ({property.ownerName})
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
                          ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <p>{b.label}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{b.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gateway Selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-2">Select Escrow Payment Gateway</label>
                <div className="space-y-2">
                  
                  {/* Primary Option: State Bank Raast (0% Surcharge) */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('raast')}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      paymentMethod === 'raast'
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                          ⚡
                        </div>
                        <div>
                          <p className="font-black text-xs text-white flex items-center gap-1.5">
                            State Bank Direct Raast Escrow
                            <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded font-mono">
                              0% FEE (FREE)
                            </span>
                          </p>
                          <p className="text-[10px] text-emerald-300/80">
                            Pay from any Pakistani Bank / Nayapay / Sadapay / EasyPaisa / JazzCash
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                        Zero Gateway Surcharge
                      </span>
                    </div>
                  </button>

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
                      <p className="flex items-center font-bold text-xs">
                        <Building className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Manual Bank Transfer
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Meezan / HBL / Alfalah IBAN</p>
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
                      <p className="flex items-center font-bold text-xs">
                        <CreditCard className="w-3.5 h-3.5 mr-1.5 text-purple-400" /> International Card
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Overseas Pakistani USD/PKR</p>
                    </button>
                  </div>

                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Escrow Deposit Amount:</span>
                  <span className="font-bold text-white">PKR {amountPaid.toLocaleString('en-PK')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gateway Processing Surcharge:</span>
                  {paymentMethod === 'raast' ? (
                    <span className="font-bold text-emerald-400 font-mono">PKR 0 (100% Free via SBP Raast)</span>
                  ) : (
                    <span className="font-bold text-slate-300">PKR {platformFee.toLocaleString('en-PK')}</span>
                  )}
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-black text-sm text-emerald-400">
                  <span>Total Escrow Lock Amount:</span>
                  <span>PKR {totalCharge.toLocaleString('en-PK')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 rounded-2xl font-black flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 text-xs transition cursor-pointer"
              >
                {paymentMethod === 'raast' ? (
                  <>
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Proceed with 0% Fee Raast Escrow Lock</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{isProcessing ? 'Processing Gateway...' : 'Pay & Hold Money in Escrow'}</span>
                  </>
                )}
              </button>

            </form>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-lg font-black text-white">Token Secured in DealFast Escrow!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Your payment of <span className="font-bold text-emerald-400">PKR {totalCharge.toLocaleString('en-PK')}</span> is locked safely in DealFast Escrow. {lastRrn && `State Bank Raast RRN: ${lastRrn}.`} Auto-generated Invoice #INV-2026 is now available in your dashboard.
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
                  className="bg-slate-900 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Auto-Download Stamp Paper Agreement</span>
                </button>

                <button
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition"
                >
                  Done & View Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Embedded Direct Raast Escrow Modal */}
      {showRaastModal && (
        <DirectRaastPaymentModal
          isOpen={showRaastModal}
          onClose={() => setShowRaastModal(false)}
          amount={totalCharge}
          purposeTitle={`Escrow ${bookingType.toUpperCase()} - ${property.title}`}
          property={property}
          bookingType={bookingType}
          onSuccess={handleRaastSuccess}
        />
      )}
    </>
  );
};
