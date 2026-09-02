import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  ShieldCheck,
  MapPin,
  Building2,
  CheckCircle2,
  Camera,
  FileText,
  AlertCircle,
  Fingerprint,
  Eye,
  EyeOff,
  Lock,
  Shield
} from 'lucide-react';
import { store } from '../../lib/store';
import { ImageUpload } from './ImageUpload';
import { ProfilePhotoCropModal } from '../profile/ProfilePhotoCropModal';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNadraVerification?: () => void;
  onOpenKYC?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenNadraVerification,
  onOpenKYC
}) => {
  const user = store.currentUser;

  const [name, setName] = useState(user.name || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [city, setCity] = useState(user.city || 'Islamabad');
  const [cnic, setCnic] = useState(user.cnic || '');
  const [agencyName, setAgencyName] = useState(user.agencyName || '');
  const [isFiler, setIsFiler] = useState(user.isFiler ?? true);
  
  const [showPhoneOnListings, setShowPhoneOnListings] = useState(user.listerPreferences?.showPhoneNumber ?? true);
  const [showEmailOnListings, setShowEmailOnListings] = useState(true);

  const [cnicFrontUrl, setCnicFrontUrl] = useState(user.kycDocuments?.cnicFront || '');
  const [cnicBackUrl, setCnicBackUrl] = useState(user.kycDocuments?.cnicBack || '');

  const [isOverseasPakistani, setIsOverseasPakistani] = useState(user.isOverseasPakistani ?? false);
  const [overseasCountry, setOverseasCountry] = useState(user.overseasCountry || 'UAE (Dubai/Abu Dhabi)');
  const [nicopNumber, setNicopNumber] = useState(user.nicopNumber || '');
  const [hasRdaAccount, setHasRdaAccount] = useState(user.hasRdaAccount ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Photo Crop State (Facebook Style)
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedRawImage, setSelectedRawImage] = useState<string>('');

  // Sync state whenever modal opens or store.currentUser updates
  React.useEffect(() => {
    if (isOpen) {
      const u = store.currentUser;
      setName(u.name || '');
      setAvatar(u.avatar || '');
      setPhone(u.phone || '');
      setEmail(u.email || '');
      setCity(u.city || 'Islamabad');
      setCnic(u.cnic || '');
      setAgencyName(u.agencyName || '');
      setIsFiler(u.isFiler ?? true);
      setShowPhoneOnListings(u.listerPreferences?.showPhoneNumber ?? true);
      setCnicFrontUrl(u.kycDocuments?.cnicFront || '');
      setCnicBackUrl(u.kycDocuments?.cnicBack || '');
      setIsOverseasPakistani(u.isOverseasPakistani ?? false);
      setOverseasCountry(u.overseasCountry || 'UAE (Dubai/Abu Dhabi)');
      setNicopNumber(u.nicopNumber || '');
      setHasRdaAccount(u.hasRdaAccount ?? true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isVerified = user.kycStatus === 'verified' || user.isVerified;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateUserProfile({
      name,
      avatar,
      phone,
      email,
      city,
      cnic,
      agencyName,
      isFiler,
      isOverseasPakistani: !!isOverseasPakistani,
      ...(isOverseasPakistani ? {
        overseasCountry: overseasCountry || 'UAE (Dubai/Abu Dhabi)',
        nicopNumber: nicopNumber || '',
        hasRdaAccount: !!hasRdaAccount
      } : {}),
      kycDocuments: {
        ...(user.kycDocuments || {}),
        cnicFront: cnicFrontUrl || user.kycDocuments?.cnicFront,
        cnicBack: cnicBackUrl || user.kycDocuments?.cnicBack
      }
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl my-auto relative text-xs">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors"
              title="Back to Home"
            >
              <X className="w-4 h-4" />
              <span className="hidden xs:inline text-[11px]">Back</span>
            </button>

            <div className="p-2 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm sm:text-base">User Profile Settings</h3>
              <p className="text-[11px] text-slate-400">Manage personal details, photo & privacy preferences</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-red-600/80 border border-slate-700 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {savedSuccess && (
          <div className="m-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile & privacy settings saved successfully!</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Avatar Header & Dynamic Verification Badge */}
          <div className="flex items-center space-x-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="relative group shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name || 'User'}
                  className="w-18 h-18 rounded-full object-cover border-2 border-orange-500/50 shadow-md aspect-square"
                />
              ) : (
                <div className="w-18 h-18 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/20 text-orange-400 font-black text-2xl flex items-center justify-center border-2 border-orange-500/50 shadow-md aspect-square">
                  {(name || 'M').charAt(0).toUpperCase()}
                </div>
              )}
              <label
                htmlFor="profile-photo-upload"
                className="absolute -bottom-1 -right-1 p-1.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-white cursor-pointer shadow-lg transition-transform hover:scale-110"
                title="Upload New Profile Picture"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  id="profile-photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (uploadEvent) => {
                        if (uploadEvent.target?.result) {
                          setSelectedRawImage(uploadEvent.target.result as string);
                          setCropModalOpen(true);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-white text-sm truncate">{name || 'Member'}</h4>
                <label
                  htmlFor="profile-photo-upload"
                  className="text-[10px] font-bold text-orange-400 hover:text-orange-300 underline cursor-pointer"
                >
                  Change Photo
                </label>
              </div>
              <p className="text-[11px] text-slate-400 capitalize">Role: <span className="text-orange-400 font-bold">{user.role}</span></p>
              
              {/* Dynamic Badge Logic */}
              {isVerified ? (
                <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 mt-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Biometric & Escrow Status</span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-1 mt-1.5 pt-1 border-t border-slate-800">
                  <span className="flex items-center space-x-1 text-[10px] text-amber-400 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Unverified (NADRA Biometric KYC Pending)</span>
                  </span>
                  {onOpenNadraVerification && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenNadraVerification();
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] flex items-center space-x-1 shadow transition-all"
                    >
                      <Fingerprint className="w-3 h-3" />
                      <span>Verify Now via NADRA</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Full Name <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Phone / WhatsApp Number <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="+92 300 1234567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Email & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                City / Primary Base
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Privacy & Field Controls Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Contact & Privacy Visibility Options</span>
            </span>

            <div className="space-y-2 pt-1">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPhoneOnListings}
                  onChange={e => setShowPhoneOnListings(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 bg-slate-900 border-slate-700"
                />
                <span className="text-slate-300 text-[11px]">Show phone / WhatsApp number on my published property listings</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEmailOnListings}
                  onChange={e => setShowEmailOnListings(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 bg-slate-900 border-slate-700"
                />
                <span className="text-slate-300 text-[11px]">Show email address on my published property listings</span>
              </label>
            </div>
          </div>

          {/* CNIC with Privacy Badge & Optional Agency Field */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  CNIC Number
                </label>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Hidden & Encrypted
                </span>
              </div>
              <input
                type="text"
                placeholder="37405-XXXXXXX-X (Kept strictly private)"
                value={cnic}
                onChange={e => setCnic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-orange-500"
              />
              <p className="text-[9px] text-slate-500 mt-1">Your CNIC is never displayed on listings or publicly.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {user.role === 'agency' || user.role === 'builder'
                  ? 'Agency / Corporate Business Name'
                  : 'Associated Agency / Office Name (Optional)'}
              </label>
              <input
                type="text"
                placeholder={user.role === 'agency' ? 'Premier Estate Group / SECP Registered' : 'Independent / None (Optional)'}
                value={agencyName}
                onChange={e => setAgencyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Standalone KYC Portal Link */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-slate-900 border border-emerald-500/30 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>CNIC & SECP KYC Verification</span>
              </h4>
              <p className="text-[11px] text-slate-300">
                Submit CNIC scans, business licenses & run automated NADRA biometric checks in the separate KYC Portal.
              </p>
            </div>
            {onOpenKYC && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenKYC();
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 transition-all shadow-md"
              >
                Open KYC Portal
              </button>
            )}
          </div>

          {/* Tax Filer Radio */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              FBR Tax Filer Status (236K / 236C Discount Rate)
            </label>
            <div className="flex items-center space-x-3 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="filerStatus"
                  checked={isFiler === true}
                  onChange={() => setIsFiler(true)}
                  className="accent-orange-500"
                />
                <span className="text-white font-bold">Active Tax Filer (Standard FBR Tax)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="filerStatus"
                  checked={isFiler === false}
                  onChange={() => setIsFiler(false)}
                  className="accent-orange-500"
                />
                <span className="text-slate-400">Non-Filer</span>
              </label>
            </div>
          </div>

          {/* Overseas Pakistani Settings */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isOverseasPakistani}
                onChange={e => setIsOverseasPakistani(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
              />
              <span className="font-bold text-emerald-300 text-xs">
                🇵🇰 Overseas Pakistani Investor Profile
              </span>
            </label>

            {isOverseasPakistani && (
              <div className="space-y-2.5 pt-2 border-t border-emerald-500/20 text-[11px]">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1">Country of Residence Abroad</label>
                  <select
                    value={overseasCountry}
                    onChange={e => setOverseasCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-medium outline-none focus:border-emerald-500"
                  >
                    <option value="UAE (Dubai/Abu Dhabi)">UAE (Dubai / Abu Dhabi / Sharjah)</option>
                    <option value="KSA (Riyadh/Jeddah)">Saudi Arabia (Riyadh / Jeddah / Dammam)</option>
                    <option value="UK (London/Manchester)">United Kingdom (London / Manchester)</option>
                    <option value="USA">United States (USA)</option>
                    <option value="Canada">Canada</option>
                    <option value="Qatar / Kuwait / Oman">GCC (Qatar / Kuwait / Oman / Bahrain)</option>
                    <option value="Europe / Australia">Europe / Australia / New Zealand</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1">NICOP / Passport #</label>
                  <input
                    type="text"
                    placeholder="NICOP-37405-XXXXXXX-1"
                    value={nicopNumber}
                    onChange={e => setNicopNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <label className="flex items-center space-x-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={hasRdaAccount}
                    onChange={e => setHasRdaAccount(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-700"
                  />
                  <span className="text-slate-300 text-[10px] font-medium">
                    Active State Bank Roshan Digital Account (RDA) Holder
                  </span>
                </label>
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
              className="gradient-btn text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-orange-500/20"
            >
              Save Profile Changes
            </button>
          </div>

        </form>

        {/* Facebook-style Crop & Reposition Modal */}
        <ProfilePhotoCropModal
          isOpen={cropModalOpen}
          imageSrc={selectedRawImage}
          onClose={() => setCropModalOpen(false)}
          onCropComplete={(croppedUrl) => {
            setAvatar(croppedUrl);
            setCropModalOpen(false);
          }}
        />

      </div>
    </div>
  );
};
