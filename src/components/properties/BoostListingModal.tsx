import React, { useState } from 'react';
import { X, Star, CheckCircle2, ShieldCheck, CreditCard, Wallet, Smartphone, ArrowRight, Zap, TrendingUp, Target } from 'lucide-react';
import { Property } from '../../types';
import { store } from '../../lib/store';

interface BoostListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onBoostSuccess?: (updatedProp: Property) => void;
}

export const BoostListingModal: React.FC<BoostListingModalProps> = ({
  isOpen,
  onClose,
  property,
  onBoostSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'jazzcash' | 'easypaisa' | 'card' | 'wallet'>('jazzcash');
  const [accountNumber, setAccountNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !property) return null;

  const boostFee = 1999; // PKR 1,999 for 30 Days Top Spot Ad Placement

  const handlePayAndBoost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate real gateway payment latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Perform real store update
    const updated = store.updateProperty(property.id, {
      isFeatured: true,
      isPremium: true
    });

    setIsProcessing(false);
    setIsSuccess(true);

    if (updated && onBoostSuccess) {
      onBoostSuccess(updated);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
        <div className="glass-card-glow w-full max-w-md rounded-3xl p-6 border border-emerald-500/40 text-center space-y-4 shadow-2xl relative">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              ⭐ Listing Upgraded to Top Spot!
            </span>
            <h3 className="text-xl font-black text-white mt-3">{property.title}</h3>
            <p className="text-xs text-slate-300 mt-1">
              Your listing is now an active <span className="text-amber-400 font-bold">DealFast Premium Top Spot Ad</span>! It will appear pinned at the very top of search feeds and matched directly to high-intent buyers.
            </p>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-1.5 text-left">
            <div className="flex justify-between text-slate-400">
              <span>Payment Amount:</span>
              <span className="font-bold text-emerald-400">PKR {boostFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Status:</span>
              <span className="font-bold text-amber-300">⭐ TOP SPOT ACTIVE (30 Days)</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsSuccess(false);
              onClose();
            }}
            className="w-full gradient-btn text-white py-3 rounded-xl font-black text-xs shadow-lg shadow-orange-500/20 flex items-center justify-center"
          >
            Close & View Featured Listing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="glass-card-glow w-full max-w-lg rounded-3xl p-5 sm:p-6 border border-orange-500/30 shadow-2xl relative space-y-4 my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg shrink-0">
              <Star className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Upgrade to DealFast Top Spot</h3>
              <p className="text-[11px] text-amber-400 font-medium">Pin Your Ad #1 On Top & AI Buyer Matching</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Property Preview */}
        <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center space-x-3">
          <img
            src={property.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=200'}
            alt={property.title}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0 border border-slate-700"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">{property.title}</h4>
            <p className="text-xs font-black text-amber-400 mt-0.5">{property.priceFormatted}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{property.area}, {property.city}</p>
          </div>
        </div>

        {/* Premium Features List */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 space-y-2">
          <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
            ⭐ DealFast Top Spot Package Perks (30 Days)
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-200">
            <div className="flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Always Pinned #1 Top</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">AI Interest Targeted</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">5x More Buyer Calls</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
              <span className="truncate">Gold Top Badge</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePayAndBoost} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Select Payment Method (PKR {boostFee.toLocaleString()})</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('jazzcash')}
                className={`min-h-[42px] px-3 py-2 rounded-xl border inline-flex items-center justify-start gap-2 transition-all leading-none ${
                  paymentMethod === 'jazzcash'
                    ? 'bg-orange-500/20 border-orange-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4 text-red-500 shrink-0" />
                <span className="truncate text-[11px] sm:text-xs">JazzCash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('easypaisa')}
                className={`min-h-[42px] px-3 py-2 rounded-xl border inline-flex items-center justify-start gap-2 transition-all leading-none ${
                  paymentMethod === 'easypaisa'
                    ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate text-[11px] sm:text-xs">EasyPaisa</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`min-h-[42px] px-3 py-2 rounded-xl border inline-flex items-center justify-start gap-2 transition-all leading-none ${
                  paymentMethod === 'card'
                    ? 'bg-blue-500/20 border-blue-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate text-[11px] sm:text-xs">Card / Bank</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`min-h-[42px] px-3 py-2 rounded-xl border inline-flex items-center justify-start gap-2 transition-all leading-none ${
                  paymentMethod === 'wallet'
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate text-[11px] sm:text-xs">DealFast Wallet</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              {paymentMethod === 'card' ? 'Card Number / Holder Name' : 'Mobile Account Number'}
            </label>
            <input
              type="text"
              required
              placeholder={paymentMethod === 'card' ? '4111 2222 3333 4444' : '0300 1234567'}
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
            />
          </div>

          {/* Action Buttons: Responsive & Professionally Sized */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 shrink-0 inline-flex items-center justify-center transition-colors leading-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 min-h-[42px] gradient-btn text-white px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/20 inline-flex items-center justify-center gap-2 whitespace-nowrap leading-none"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="truncate">Pay PKR {boostFee.toLocaleString()} • Pin to Top</span>
                  <ArrowRight className="w-4 h-4 shrink-0 hidden xs:inline" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
