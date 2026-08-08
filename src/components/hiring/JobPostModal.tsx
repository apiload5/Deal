import React, { useState } from 'react';
import { Briefcase, DollarSign, Calculator, AlertCircle, Sparkles } from 'lucide-react';
import { PAKISTAN_CITIES, CITY_AREAS } from '../../data/mockData';
import { store } from '../../lib/store';

interface JobPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const JobPostModal: React.FC<JobPostModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [propertyTitle, setPropertyTitle] = useState('');
  const [city, setCity] = useState('Lahore');
  const [society, setSociety] = useState('DHA Phase 6');
  const [propertyType, setPropertyType] = useState('Villa');
  const [bountyAmount, setBountyAmount] = useState<number>(10000); // Default 10k
  const [maxAgents, setMaxAgents] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const currentUser = store.currentUser;
  const isAgent = currentUser.role === 'agent';

  if (!isOpen) return null;

  // Calculate Taxes live
  const whtAmount = Math.round(bountyAmount * 0.02); // 2% WHT
  const gstAmount = Math.round(bountyAmount * 0.034); // ~17% GST on service charge
  const totalUpfront = bountyAmount + whtAmount + gstAmount;

  const currentWallet = store.getUserWallet();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isAgent) {
      setError('Ground Reality Role Enforcement: Field Sales Agents cannot post job bounties. Bounties are created by Agencies, Builders, or Property Owners to hire Agents.');
      return;
    }

    if (bountyAmount < 3000 || bountyAmount > 15000) {
      setError('Bounty must be between PKR 3,000 and PKR 15,000 as per DealFast Protected Hiring Rules.');
      return;
    }

    const result = store.postJobWithBounty({
      title,
      propertyTitle,
      city,
      society,
      propertyType,
      bountyAmount,
      maxAgents,
      description
    });

    if ('error' in result) {
      setError(result.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Post Protected Job with Bounty Escrow</h2>
              <p className="text-xs text-slate-500">Hire Verified Field Agents with Stake Protection (Earn & Stake v4)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Headline</label>
              <input
                type="text"
                placeholder="e.g. DHA Phase 6 - 1 Kanal Corner Villa Agent Mandate"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Property Title / ID</label>
              <input
                type="text"
                placeholder="e.g. MB Block 1 Kanal Smart Villa"
                value={propertyTitle}
                onChange={(e) => setPropertyTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  const areas = CITY_AREAS[e.target.value] || [];
                  if (areas.length > 0) setSociety(areas[0]);
                }}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {PAKISTAN_CITIES.filter(c => c !== 'All Cities').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Society / Area</label>
              <select
                value={society}
                onChange={(e) => setSociety(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {(CITY_AREAS[city] || ['General Area']).map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Villa">Villa / House</option>
                <option value="Apartment">Apartment / Penthouse</option>
                <option value="Commercial Plot">Commercial Plot</option>
                <option value="Residential Plot">Residential Plot</option>
              </select>
            </div>
          </div>

          {/* BOUNTY SLIDER & CO-AGENT SELECTION */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Set Agent Bounty (3,000 - 15,000 PKR)
              </span>
              <span className="text-lg font-extrabold text-emerald-600">
                PKR {bountyAmount.toLocaleString()}
              </span>
            </div>

            <input
              type="range"
              min="3000"
              max="15000"
              step="500"
              value={bountyAmount}
              onChange={(e) => setBountyAmount(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hiring Mode</label>
                <select
                  value={maxAgents}
                  onChange={(e) => setMaxAgents(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value={1}>Single Exclusive Agent (100% Bounty)</option>
                  <option value={2}>Co-Agent Team (60% / 40% Split)</option>
                  <option value={3}>Co-Agent Team (50% / 30% / 20% Split)</option>
                </select>
              </div>

              {/* FBR TAX BREAKDOWN */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Upfront Bounty:</span>
                  <span className="font-bold">PKR {bountyAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>FBR 2% WHT Tax:</span>
                  <span className="font-bold">PKR {whtAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>17% GST Service Tax:</span>
                  <span className="font-bold">PKR {gstAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-emerald-700 pt-1 border-t border-slate-100">
                  <span>Total Escrow Deposit:</span>
                  <span>PKR {totalUpfront.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Job Description & Milestones Requirement</label>
            <textarea
              rows={3}
              placeholder="Describe property details, client requirement, and required milestone proof uploads..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          {/* WALLET BALANCE CHECK NOTICE */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between text-emerald-800">
            <div>
              <span className="font-bold">Agency Wallet Balance:</span> PKR {currentWallet.availableBalance.toLocaleString()}
            </div>
            {currentWallet.availableBalance < totalUpfront && (
              <span className="text-rose-600 font-bold">Top-up required!</span>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" /> Fund Escrow & Post Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
