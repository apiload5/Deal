import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, ShieldCheck, Lock, RefreshCw, Info } from 'lucide-react';
import { Property } from '../../types';
import { store } from '../../lib/store';

interface DeletePropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeletePropertyModal: React.FC<DeletePropertyModalProps> = ({
  property,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !property) return null;

  const securityCode = property.deletionSecurityCode || `DF-${Math.floor(10000 + Math.random() * 90000)}`;

  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (inputCode.trim().toUpperCase() !== securityCode.toUpperCase()) {
      setErrorMessage(`Incorrect security code! Please type the exact code shown above: ${securityCode}`);
      return;
    }

    setIsDeleting(true);
    const res = store.moveToRecycleBin(property.id, inputCode);
    setIsDeleting(false);

    if (res.success) {
      setInputCode('');
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative text-xs">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Move Property to Recycle Bin</h3>
              <p className="text-[11px] text-slate-400">Security code verification required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleConfirmDelete} className="p-5 space-y-4">
          
          {/* Property Summary Card */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-3">
            <img
              src={property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=300'}
              alt={property.title}
              className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-white text-xs line-clamp-1">{property.title}</h4>
              <p className="text-[11px] text-orange-400 font-extrabold mt-0.5">{property.priceFormatted}</p>
              <p className="text-[10px] text-slate-400 truncate">{property.area}, {property.city}</p>
            </div>
          </div>

          {/* Explicit Instructions Box */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-amber-400">
              <Info className="w-4 h-4 shrink-0" />
              <span>15-Day Recycle Bin Policy & Instructions</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[10.5px] leading-relaxed text-amber-100/90 pl-1">
              <li>Moving to Recycle Bin removes this listing from public searches immediately.</li>
              <li>This listing will stay in your <strong>Recycle Bin for 15 days</strong>.</li>
              <li>You can restore or renew it anytime back to active live listings.</li>
              <li>After 15 days in the Recycle Bin, it will be <strong>permanently auto-erased</strong>.</li>
            </ul>
          </div>

          {/* Secret Security Code Display Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Secret Deletion Code for this Listing:
            </span>
            <div className="inline-block px-4 py-1.5 rounded-xl bg-orange-500/20 border border-orange-500/50 font-mono text-sm font-black text-orange-400 tracking-widest select-all">
              {securityCode}
            </div>
            <p className="text-[10px] text-slate-400">
              (Type or copy this exact code into the box below)
            </p>
          </div>

          {/* Code Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Enter Secret Security Code to Confirm <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={`Type ${securityCode}`}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-white outline-none focus:border-orange-500 transition-colors uppercase tracking-widest placeholder:normal-case placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-500"
            />
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-[11px] font-semibold flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting || inputCode.trim().toUpperCase() !== securityCode.toUpperCase()}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 shadow-lg ${
                inputCode.trim().toUpperCase() === securityCode.toUpperCase()
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Moving...' : 'Move to Recycle Bin'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
