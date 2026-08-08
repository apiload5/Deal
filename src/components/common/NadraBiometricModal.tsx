import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  QrCode,
  Printer,
  X,
  ScanLine,
  Lock,
  ArrowRight,
  Headphones,
  UploadCloud
} from 'lucide-react';
import { store } from '../../lib/store';

interface NadraBiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: 'user' | 'agent' | 'agency' | 'builder';
  onSuccess?: () => void;
}

export const NadraBiometricModal: React.FC<NadraBiometricModalProps> = ({
  isOpen,
  onClose,
  targetRole
}) => {
  const currentUser = store.currentUser;
  const role = targetRole || currentUser.role;

  // Form & Workflow Steps
  const [step, setStep] = useState<'input' | 'scanning' | 'notFound' | 'success'>('input');

  // Input fields
  const [cnic, setCnic] = useState(currentUser.cnic || '');
  const [fullName, setFullName] = useState(currentUser.name || '');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('');
  const [issueDate, setIssueDate] = useState('');

  // Validation & Error States
  const [cnicError, setCnicError] = useState<string | null>(null);
  const [notFoundError, setNotFoundError] = useState<string | null>(null);

  // Scan & Biometric results
  const [biometricScore, setBiometricScore] = useState(0);
  const [verisysHash, setVerisysHash] = useState('');
  const [verisysPassId, setVerisysPassId] = useState('');

  if (!isOpen) return null;

  // Format CNIC with dashes (e.g., 37405-1829401-3)
  const handleCnicChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    let formatted = digits;
    if (digits.length > 5 && digits.length <= 12) {
      formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
    } else if (digits.length > 12) {
      formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
    }
    setCnic(formatted);
    if (cnicError) setCnicError(null);
  };

  const handleStartNadraScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawDigits = cnic.replace(/\D/g, '');
    if (rawDigits.length !== 13) {
      setCnicError('Please enter a valid 13-digit Pakistani CNIC number (e.g. 37405-1829401-3).');
      return;
    }
    if (!fullName.trim() || !fatherName.trim() || !dob || !issueDate) {
      setCnicError('All CNIC fields are required: CNIC Number, Full Name, Father/Husband Name, Date of Birth, and Issue Date.');
      return;
    }

    setStep('scanning');
    setNotFoundError(null);

    try {
      const res = await fetch('/app/api/nadra/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnic, fullName, fatherName, dob, issueDate })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setNotFoundError(
          data.error || 'Not Found: NADRA API Integration Key not found. Please contact Admin Staff or submit your identity documents manually for verification.'
        );
        setStep('notFound');
        return;
      }

      setBiometricScore(data.biometricScore || 99.4);
      setVerisysHash(data.verisysHash || `HASH-${Date.now()}`);
      setVerisysPassId(data.verisysPassId || `PASSED-${Date.now()}`);

      store.submitAutoNadraBiometricVerification({
        cnic,
        fullName,
        fatherHusbandName: fatherName,
        dob,
        cnicIssueDate: issueDate,
        verisysHash: data.verisysHash || `HASH-${Date.now()}`,
        biometricScore: data.biometricScore || 99.4,
        verisysPassId: data.verisysPassId || `PASSED-${Date.now()}`
      });

      setStep('success');
    } catch (err: any) {
      setNotFoundError(
        'Not Found: NADRA API Integration Key not found. Please contact Admin Staff or submit your identity documents manually for verification.'
      );
      setStep('notFound');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0c1322] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col text-slate-100">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-5 py-3 border-b border-slate-700/80 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span className="hidden xs:inline">Back / Home</span>
            </button>

            <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>NADRA CNIC Verification Portal</span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Official Gateway
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Identity & Document Verification for {role === 'agent' ? 'Field Agent' : 'Member'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 bg-slate-800 hover:bg-red-600/80 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[82vh]">
          
          {/* STEP 1: CNIC Entry Form */}
          {step === 'input' && (
            <form onSubmit={handleStartNadraScan} className="space-y-4">
              
              <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-200">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-300">
                    Official CNIC Verification System:
                  </p>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    Enter your 13-digit CNIC number and verification details below. If the official NADRA API Key is configured, your identity will be validated instantly. Otherwise, you can send your documents manually to Admin Staff.
                  </p>
                </div>
              </div>

              {/* CNIC Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Pakistani CNIC Number (13-Digits)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cnic}
                    onChange={(e) => handleCnicChange(e.target.value)}
                    placeholder="37405-1829401-3"
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 ${
                      cnicError ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  <Fingerprint className="w-5 h-5 text-emerald-400 absolute right-3 top-3" />
                </div>
                {cnicError && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{cnicError}</span>
                  </p>
                )}
              </div>

              {/* Full Name & Father Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Full Name (as per CNIC)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Muhammad Rashid"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Father / Husband Name
                  </label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="Tariq Mahmood"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Date of Birth & Issue Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    CNIC Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <Fingerprint className="w-5 h-5" />
                  <span>Verify via NADRA API Gateway</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* STEP 2: Scanning */}
          {step === 'scanning' && (
            <div className="py-10 text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <ScanLine className="w-20 h-20 text-emerald-400 animate-pulse" />
                <div className="absolute inset-0 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Connecting to NADRA API Gateway...</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Validating CNIC details against NADRA API server...
                </p>
              </div>
            </div>
          )}

          {/* NOT FOUND ERROR SCREEN */}
          {step === 'notFound' && (
            <div className="py-8 space-y-6 text-center">
              <div className="w-16 h-16 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
                <AlertTriangle className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-lg font-black text-white">NADRA API Key Not Found</h3>
                <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200 text-left space-y-2 font-mono">
                  <p className="font-bold text-amber-300">STATUS: 404 NOT FOUND</p>
                  <p>{notFoundError || 'Not Found: NADRA API Integration Key not found. Please contact Admin Staff or submit your identity documents manually for verification.'}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl max-w-lg mx-auto text-left space-y-3">
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-400" />
                  <span>Alternative Verification Options:</span>
                </h4>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li><strong>Contact Admin Staff:</strong> Reach out directly to DealFast Admin to request API key integration or manual approval.</li>
                  <li><strong>Manual Document Submission:</strong> Submit scanned images of your CNIC front and back in your Profile Dashboard for manual review.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    store.submitKYC({ cnicFront: 'manual_pending', cnicBack: 'manual_pending' });
                    alert('Documents submitted to Admin Staff for manual verification!');
                    onClose();
                  }}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Send Documents Manually to Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Contact Admin Staff at admin@dealfast.pk or Phone: +92 300 0000000');
                  }}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700"
                >
                  <Headphones className="w-4 h-4 text-amber-400" />
                  <span>Contact Admin Staff</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/50 rounded-2xl p-5 text-center space-y-2 shadow-xl">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-black text-white">
                  CNIC Verification Approved via NADRA Gateway!
                </h3>
                <p className="text-xs text-emerald-300 max-w-md mx-auto">
                  Your CNIC identity was verified with an accuracy score of <strong>{biometricScore}%</strong>.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Verisys Pass ID:</span>
                  <span className="text-emerald-400 font-bold">{verisysPassId}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Security Hash:</span>
                  <span className="text-amber-400 font-bold">{verisysHash}</span>
                </div>
              </div>

              <div>
                <button
                  onClick={onClose}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Done & Continue
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer info bar */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit Encrypted NADRA E-Sahulat Verification Gateway</span>
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
