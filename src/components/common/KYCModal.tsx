import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  Lock,
  Building2,
  Clock,
  Upload,
  ArrowRight
} from 'lucide-react';
import { store } from '../../lib/store';
import { ImageUpload } from './ImageUpload';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNadraVerification?: () => void;
}

export const KYCModal: React.FC<KYCModalProps> = ({
  isOpen,
  onClose,
  onOpenNadraVerification
}) => {
  const user = store.currentUser;

  const [cnic, setCnic] = useState(user.cnic || '');
  const [cnicFront, setCnicFront] = useState(user.kycDocuments?.cnicFront || '');
  const [cnicBack, setCnicBack] = useState(user.kycDocuments?.cnicBack || '');
  const [secpDoc, setSecpDoc] = useState(user.kycDocuments?.secpDoc || '');
  const [agencyNtn, setAgencyNtn] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isAgencyOrBuilder = user.role === 'agency' || user.role === 'builder';
  const isVerified = user.kycStatus === 'verified' || user.isVerified;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isAgencyOrBuilder) {
      if (!secpDoc && !cnicFront) {
        setErrorMsg('Please upload SECP Registration or FBR NTN document for Corporate Verification.');
        return;
      }
      setSubmitting(true);
      try {
        store.submitKYC({ cnicFront, cnicBack, secpDoc });
        if (cnic) {
          store.updateUserProfile({ cnic });
        }
        setSuccessMsg('Agency Corporate SECP KYC submitted to DealFast Admin for verification!');
        setTimeout(() => {
          setSubmitting(false);
          setSuccessMsg('');
          onClose();
        }, 1500);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to submit KYC.');
        setSubmitting(false);
      }
    } else {
      if (!cnicFront) {
        setErrorMsg('Please upload your CNIC Front image to proceed with manual KYC verification.');
        return;
      }
      setSubmitting(true);
      try {
        store.submitKYC({ cnicFront, cnicBack });
        if (cnic) {
          store.updateUserProfile({ cnic });
        }
        setSuccessMsg('Your CNIC KYC documents have been submitted to DealFast Admin!');
        setTimeout(() => {
          setSubmitting(false);
          setSuccessMsg('');
          onClose();
        }, 1500);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to submit KYC.');
        setSubmitting(false);
      }
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl my-auto relative text-xs">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="hidden xs:inline text-[11px]">Back</span>
            </button>

            <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm sm:text-base">CNIC & SECP Document KYC</h3>
              <p className="text-[11px] text-slate-400">Identity verification & corporate credentials</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-red-600/80 border border-slate-700 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Current Status Badge Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isVerified
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : user.kycStatus === 'pending'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl ${
                isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current KYC Verification Status</span>
                <h4 className="font-extrabold text-sm text-white capitalize">
                  {user.kycStatus === 'verified'
                    ? 'Verified Member (CNIC & Escrow Compliant)'
                    : user.kycStatus === 'pending'
                    ? 'Pending Review (Submitted to Admin)'
                    : 'Unverified (Identity Document Required)'}
                </h4>
              </div>
            </div>
            {isVerified && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                Active Verified
              </span>
            )}
          </div>

          {/* Instant Automated NADRA Biometric Check CTA */}
          {onOpenNadraVerification && !isVerified && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs">
                  <Fingerprint className="w-4 h-4" />
                  <span>Automated NADRA 13-Digit Smart CNIC Verification</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Instant biometric matching with NADRA e-Sahulat database in under 30 seconds.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNadraVerification();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20 shrink-0 transition-all"
              >
                <span>Launch NADRA Check</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Manual Document Submission Section */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-orange-400" />
                <span>Manual CNIC & Document Upload</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Encrypted 256-Bit</span>
            </h4>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                13-Digit Smart CNIC Number <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="37405-XXXXXXX-X"
                value={cnic}
                onChange={e => setCnic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-orange-500"
              />
            </div>

            {isAgencyOrBuilder && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  FBR NTN / SECP Corporate License Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. NTN-7492019-2 or SECP-2023-ISB"
                  value={agencyNtn}
                  onChange={e => setAgencyNtn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-orange-500"
                />
              </div>
            )}

            {/* Document Scans */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CNIC Front Scan</span>
                <ImageUpload
                  label="Upload CNIC Front"
                  multiple={false}
                  onUploadComplete={urls => setCnicFront(urls[0] || '')}
                />
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CNIC Back Scan</span>
                <ImageUpload
                  label="Upload CNIC Back"
                  multiple={false}
                  onUploadComplete={urls => setCnicBack(urls[0] || '')}
                />
              </div>
            </div>

            {isAgencyOrBuilder && (
              <div className="pt-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SECP Corporate License / FBR Document</span>
                <ImageUpload
                  label="Upload SECP Registration Doc"
                  multiple={false}
                  onUploadComplete={urls => setSecpDoc(urls[0] || '')}
                />
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="gradient-btn text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-orange-500/20 flex items-center space-x-2"
            >
              {submitting ? (
                <span>Submitting KYC...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Submit KYC for Verification</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
