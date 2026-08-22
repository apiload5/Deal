import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  ArrowRight,
  AlertTriangle,
  FileText,
  Lock,
  Building,
  Smartphone,
  Info,
  X,
  Upload,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';
import { store } from '../../lib/store';
import { Property } from '../../types';

interface DirectRaastPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  purposeTitle: string;
  property?: Property | null;
  bookingType?: 'token' | 'booking' | 'full';
  onSuccess: (raastData: {
    rrn: string;
    escrowRef: string;
    payerPhone: string;
    slipUrl?: string;
  }) => void;
}

export const DirectRaastPaymentModal: React.FC<DirectRaastPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  purposeTitle,
  property,
  bookingType = 'token',
  onSuccess
}) => {
  // Generated Reference Code
  const [escrowRef, setEscrowRef] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form Fields
  const [payerPhone, setPayerPhone] = useState<string>(store.currentUser.phone || '');
  const [rrnInput, setRrnInput] = useState<string>('');
  const [slipFile, setSlipFile] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>('Meezan Bank / HBL / Digital Wallet');
  
  // UI State
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [step, setStep] = useState<'instructions' | 'submit_rrn' | 'confirmed'>('instructions');

  const bankDetails = store.bankDetails || {
    bankName: 'Meezan Bank Islamic / HBL Corporate',
    accountTitle: 'DealFast Real Estate Escrow (Pvt) Ltd',
    iban: 'PK92MEZN0001020304050607',
    raastId: '03182055632',
    raastIban: 'PK92MEZN0001020304050607',
    easypaisaTill: '0318-2055632 (DealFast Escrow Till)'
  };

  const raastId = bankDetails.raastId || '03182055632';
  const raastIban = bankDetails.raastIban || bankDetails.iban || 'PK92MEZN0001020304050607';
  const accountTitle = bankDetails.accountTitle || 'DealFast Real Estate Escrow (Pvt) Ltd';

  useEffect(() => {
    if (isOpen) {
      const generatedCode = `DF-RAAST-${Math.floor(100000 + Math.random() * 900000)}`;
      setEscrowRef(generatedCode);
      setStep('instructions');
      setErrorMsg(null);
      setRrnInput('');
      setSlipFile(null);
    }
  }, [isOpen, amount]);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Receipt slip size must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSlipFile(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitRrn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanRrn = rrnInput.trim().toUpperCase();
    if (!cleanRrn || cleanRrn.length < 8) {
      setErrorMsg('Please enter a valid State Bank Raast RRN (Retrieval Reference Number) from your bank slip / SMS (at least 8-18 digits/alphanumeric).');
      return;
    }

    if (!payerPhone.trim()) {
      setErrorMsg('Please provide your sender phone number or Raast ID for verification.');
      return;
    }

    setIsVerifying(true);

    try {
      // Direct call to our zero-fee verification API
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          amount,
          paymentMethod: 'raast',
          raastRrn: cleanRrn,
          raastEscrowRef: escrowRef,
          payerPhone: payerPhone.trim(),
          propertyId: property?.id
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Raast verification failed. Please ensure RRN is correct.');
      }

      setStep('confirmed');

      // Trigger Confetti Celebration dynamically
      import('canvas-confetti').then((confettiModule: any) => {
        const confettiFn = typeof confettiModule === 'function' ? confettiModule : confettiModule.default;
        if (typeof confettiFn === 'function') {
          confettiFn({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
      }).catch(err => console.error('Confetti error:', err));

      setTimeout(() => {
        onSuccess({
          rrn: cleanRrn,
          escrowRef,
          payerPhone: payerPhone.trim(),
          slipUrl: slipFile || undefined
        });
      }, 1800);

    } catch (err: any) {
      setErrorMsg(err.message || 'Verification submission error. Please re-check your RRN.');
    } finally {
      setIsVerifying(false);
    }
  };

  // State Bank Raast QR Code Link (EMVCo payload representation)
  const raastQrData = `RAAST:00020101021226580016pk.gov.sbp.raast01${raastId.length.toString().padStart(2, '0')}${raastId}52040000530358654${amount.toString().length.toString().padStart(2, '0')}${amount}5802PK59${accountTitle.length.toString().padStart(2, '0')}${accountTitle}6009ISLAMABAD62${escrowRef.length.toString().padStart(2, '0')}${escrowRef}6304`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=2&data=${encodeURIComponent(raastQrData)}`;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[#090f1d] border-2 border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col text-slate-100">
        
        {/* State Bank Raast Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 px-5 py-4 border-b border-emerald-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-black text-lg shadow-inner">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  State Bank Direct Raast Escrow
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/40">
                  0% Fee (Free)
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80">
                Official SBP Instant P2M Payment • Direct Escrow Vault Lock
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-red-600/80 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[82vh] text-xs">
          
          {/* Zero-Fee Highlights Card */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Payable Escrow Amount
              </span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                PKR {amount.toLocaleString('en-PK')}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                Purpose: <strong className="text-white">{purposeTitle}</strong>
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/40">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Zero API Surcharge
              </span>
              <p className="text-[9px] text-slate-500 mt-1">Saved 2.5% 3rd-party fee</p>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: INSTRUCTIONS & COPY RAAST CREDENTIALS */}
          {step === 'instructions' && (
            <div className="space-y-4">
              
              {/* Raast Escrow Credentials Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <Building className="w-4 h-4 text-emerald-400" />
                    DealFast Official Raast Escrow Account
                  </span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    Escrow Vault Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  
                  {/* Raast ID */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Official Raast ID (Mobile):</span>
                      {copiedField === 'raastId' && <span className="text-emerald-400 font-bold">Copied!</span>}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-sm text-emerald-400">{raastId}</span>
                      <button
                        onClick={() => handleCopy(raastId, 'raastId')}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                        title="Copy Raast ID"
                      >
                        {copiedField === 'raastId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Escrow Ref */}
                  <div className="p-3 bg-slate-900 border border-emerald-500/30 rounded-xl space-y-1 bg-emerald-950/20">
                    <div className="flex items-center justify-between text-[10px] text-emerald-300">
                      <span>Unique Escrow Ref (Purpose):</span>
                      {copiedField === 'escrowRef' && <span className="text-emerald-400 font-bold">Copied!</span>}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-sm text-amber-300">{escrowRef}</span>
                      <button
                        onClick={() => handleCopy(escrowRef, 'escrowRef')}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                        title="Copy Escrow Ref"
                      >
                        {copiedField === 'escrowRef' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Account Title */}
                  <div className="sm:col-span-2 p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Account Title:</span>
                      {copiedField === 'title' && <span className="text-emerald-400 font-bold">Copied!</span>}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white text-xs">{accountTitle}</span>
                      <button
                        onClick={() => handleCopy(accountTitle, 'title')}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                      >
                        {copiedField === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Raast IBAN */}
                  <div className="sm:col-span-2 p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Raast / 1LINK IBAN (Meezan / HBL):</span>
                      {copiedField === 'iban' && <span className="text-emerald-400 font-bold">Copied!</span>}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-slate-200 text-xs truncate">{raastIban}</span>
                      <button
                        onClick={() => handleCopy(raastIban, 'iban')}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition shrink-0"
                      >
                        {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* QR Code & Banking App instructions */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-2 rounded-xl shadow-lg shrink-0">
                  <img
                    src={qrCodeUrl}
                    alt="Raast QR"
                    className="w-28 h-28 object-contain"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    How to Pay via any Pakistani Banking App:
                  </h4>
                  <ol className="text-[11px] text-slate-300 space-y-1 list-decimal list-inside leading-relaxed">
                    <li>Open <strong>HBL, Meezan, Nayapay, SadaPay, Alfalah, or JazzCash</strong> app.</li>
                    <li>Select <strong>Raast Payment / Send Money</strong>.</li>
                    <li>Enter Raast ID <code className="text-emerald-400 font-mono font-bold">{raastId}</code> or IBAN.</li>
                    <li>Enter Amount <strong className="text-white">PKR {amount.toLocaleString()}</strong> and Ref <code className="text-amber-300 font-mono font-bold">{escrowRef}</code>.</li>
                  </ol>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                onClick={() => setStep('submit_rrn')}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <span>I Have Sent Payment — Submit Raast RRN / Slip</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

          {/* STEP 2: SUBMIT 12-DIGIT SBP RRN & SLIP */}
          {step === 'submit_rrn' && (
            <form onSubmit={handleSubmitRrn} className="space-y-4">
              
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    State Bank Raast RRN Verification Step
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep('instructions')}
                    className="text-[10px] text-slate-400 hover:text-white underline"
                  >
                    View Account Details Again
                  </button>
                </div>

                {/* RRN input */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    State Bank Raast RRN (12 to 18 Digits Retrieval Reference Number) *
                  </label>
                  <input
                    type="text"
                    value={rrnInput}
                    onChange={e => setRrnInput(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
                    placeholder="e.g. 408291039821 or 202608209812"
                    required
                    className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-4 py-3 text-sm font-mono text-emerald-400 font-bold tracking-widest focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    You can find this RRN in your Bank Transfer SMS or Receipt Slip (e.g. "RRN / SBP Ref: 408291039821").
                  </span>
                </div>

                {/* Payer Phone / Raast ID */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Your Sending Phone / Account Title *
                  </label>
                  <input
                    type="text"
                    value={payerPhone}
                    onChange={e => setPayerPhone(e.target.value)}
                    placeholder="e.g. 0321-8889900 (Muhammad Ali)"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Bank / App Name */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Sending Bank / App
                  </label>
                  <select
                    value={selectedBank}
                    onChange={e => setSelectedBank(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Meezan Bank">Meezan Bank</option>
                    <option value="HBL (Habib Bank Limited)">HBL (Habib Bank Limited)</option>
                    <option value="Bank Alfalah">Bank Alfalah</option>
                    <option value="Nayapay / Sadapay">Nayapay / Sadapay</option>
                    <option value="EasyPaisa / JazzCash">EasyPaisa / JazzCash Raast</option>
                    <option value="Standard Chartered / UBL / MCB / Allied">Standard Chartered / UBL / MCB / Allied</option>
                    <option value="Other Pakistani Bank">Other Pakistani Bank</option>
                  </select>
                </div>

                {/* Optional Screenshot / Slip Upload */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Upload Payment Screenshot / Slip (Optional)
                  </label>
                  <div className="border border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-3 text-center bg-slate-900/50 transition">
                    {slipFile ? (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Slip Attached Successfully
                        </span>
                        <button
                          type="button"
                          onClick={() => setSlipFile(null)}
                          className="text-[10px] text-rose-400 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center space-y-1">
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-[11px] text-slate-300 font-medium">Click to select receipt image</span>
                        <span className="text-[9px] text-slate-500">JPG, PNG up to 5MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('instructions')}
                  className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold text-xs"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-2/3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validating Raast RRN...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirm & Lock in Escrow Vault</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* STEP 3: CONFIRMED */}
          {step === 'confirmed' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-lg font-black text-white">Raast Payment Verified & Escrow Held!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Your payment of <span className="font-bold text-emerald-400">PKR {amount.toLocaleString('en-PK')}</span> with SBP RRN <code className="font-mono text-amber-300">{rrnInput}</code> is safely locked in DealFast Escrow.
              </p>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 max-w-xs mx-auto text-left space-y-1">
                <p><strong>Escrow Ref:</strong> {escrowRef}</p>
                <p><strong>Status:</strong> <span className="text-emerald-400 font-bold">100% Escrow Protected</span></p>
                <p><strong>Release:</strong> Upon biometric transfer / buyer approval</p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>State Bank of Pakistan (SBP) Raast Verified Engine</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">Zero Fee Escrow</span>
        </div>

      </div>
    </div>
  );
};
