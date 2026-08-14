import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, CreditCard, Wallet, Smartphone, ArrowRight, Zap, TrendingUp, Target } from 'lucide-react';
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

  const boostFee = 1999; // PKR 1,999 for 30 Days OLX Top Ad Placement

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
              ⭐ Listing Successfully Upgraded!
            </span>
            <h3 className="text-xl font-black text-white mt-3">{property.title}</h3>
            <p className="text-xs text-slate-300 mt-1">
              Your listing is now an <span className="text-amber-400 font-bold">OLX-Style Premium Featured Top Ad</span>! It will appear pinned at the very top of search feeds and matched directly to buyers.
            </p>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-1.5 text-left">
            <div className="flex justify-between text-slate-400">
              <span>Payment Amount:</span>
              <span className="font-bold text-emerald-400">PKR {boostFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Status:</span>
              <span className="font-bold text-amber-300">⭐ FEATURED ACTIVE (30 Days)</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsSuccess(false);
              onClose();
            }}
            className="w-full gradient-btn text-white py-3 rounded-xl font-black text-xs shadow-lg shadow-orange-500/20"
          >
            Close & View Featured Listing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="glass-card-glow w-full max-w-lg rounded-3xl p-6 border border-orange-500/30 shadow-2xl relative space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Upgrade to OLX Top Featured</h3>
              <p className="text-[11px] text-amber-400 font-medium">Pin Your Ad #1 On Top & Facebook AI Matching</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Property Preview */}
        <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center space-x-3">
          <img
            src={property.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=200'}
            alt={property.title}
            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-700"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">{property.title}</h4>
            <p className="text-xs font-black text-amber-400 mt-0.5">{property.priceFormatted}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{property.area}, {property.city}</p>
          </div>
        </div>

        {/* OLX Premium Features List */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 space-y-2">
          <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
            ⭐ OLX-Style Featured Package Perks (30 Days)
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-200">
            <div className="flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Always Pinned at TOP</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Facebook Interest Targeted</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>5x More Buyer Calls</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Gold Highlight Badge</span>
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
                className={`p-3 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  paymentMethod === 'jazzcash'
                    ? 'bg-orange-500/20 border-orange-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4 text-red-500" />
                <span>JazzCash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('easypaisa')}
                className={`p-3 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  paymentMethod === 'easypaisa'
                    ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>EasyPaisa</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-blue-500/20 border-blue-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>Debit / Credit Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  paymentMethod === 'wallet'
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Wallet className="w-4 h-4 text-amber-400" />
                <span>DealFast Wallet</span>
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

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 gradient-btn text-white py-3 rounded-xl font-black text-xs shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Pay PKR {boostFee.toLocaleString()} & Pin Ad #1</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
