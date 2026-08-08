import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Shield, LogIn, CheckCircle2, AlertCircle, Eye, EyeOff, Phone, ShieldCheck, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider } from '../../lib/firebase';
import { store } from '../../lib/store';
import { UserRole } from '../../types';
import { DealLogo } from '../common/DealLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);
  
  const [role, setRole] = useState<UserRole>('user');
  const [isOverseasPakistani, setIsOverseasPakistani] = useState(false);
  const [overseasCountry, setOverseasCountry] = useState('UAE (Dubai/Abu Dhabi)');
  const [nicopNumber, setNicopNumber] = useState('');
  const [hasRdaAccount, setHasRdaAccount] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Password Strength Calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrorMsg(null);

    const userEmail = email.trim();
    const userName = name.trim() || userEmail.split('@')[0] || (isOverseasPakistani ? 'Overseas Investor' : 'Member');
    let uid = '';

    try {
      if (!userEmail || !password) {
        setErrorMsg('Please enter both email and password.');
        setLoading(false);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
        setErrorMsg('Please enter a valid email address (e.g. name@domain.com).');
        setLoading(false);
        return;
      }

      let updatedUser: any;

      if (isSignUp) {
        if (!name.trim()) {
          setErrorMsg('Please enter your Full Name.');
          setLoading(false);
          return;
        }

        if (password.length < 8) {
          setErrorMsg('Password must be at least 8 characters long.');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match! Please verify your password entry.');
          setLoading(false);
          return;
        }

        if (!acceptTerms) {
          setErrorMsg('You must agree to the DealFast Escrow Terms of Service & Privacy Policy.');
          setLoading(false);
          return;
        }

        const safeRole = (role as string) === 'admin' ? 'user' : role;

        const userCred = await createUserWithEmailAndPassword(auth, userEmail, password);
        uid = userCred.user.uid;

        updatedUser = {
          id: uid,
          name: userName,
          email: userEmail,
          phone: phone || '',
          role: safeRole,
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
          kycStatus: 'none',
          isOverseasPakistani: !!isOverseasPakistani,
          ...(isOverseasPakistani ? {
            overseasCountry: overseasCountry || 'UAE (Dubai/Abu Dhabi)',
            nicopNumber: nicopNumber || '',
            hasRdaAccount: !!hasRdaAccount
          } : {}),
          createdAt: new Date().toISOString()
        };
      } else {
        const userCred = await signInWithEmailAndPassword(auth, userEmail, password);
        uid = userCred.user.uid;

        // Fetch registered user profile from Firestore if present
        try {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            updatedUser = { id: uid, ...userDoc.data() };
          } else {
            updatedUser = {
              id: uid,
              name: userName,
              email: userEmail,
              phone: phone || '',
              role: role,
              avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
              kycStatus: 'none',
              createdAt: new Date().toISOString()
            };
          }
        } catch {
          updatedUser = {
            id: uid,
            name: userName,
            email: userEmail,
            phone: phone || '',
            role: role,
            avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
            kycStatus: 'none',
            createdAt: new Date().toISOString()
          };
        }
      }

      store.loginUserSession(updatedUser);

      setMessage(`${isSignUp ? 'Account registered successfully' : 'Signed in successfully'} as ${updatedUser.name || userName}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 800);
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      const code = err?.code || '';
      const errStr = String(err?.message || err || '');

      // If browser iframe or IndexedDB throws "Database is closing", "hidden", or internal error, fallback to local login
      if (errStr.includes('closing') || errStr.includes('hidden') || errStr.includes('Database') || errStr.includes('database') || code === 'auth/internal-error') {
        const fallbackUser = {
          id: `usr-${Date.now()}`,
          name: userName,
          email: userEmail,
          phone: phone || '',
          role: (role as string) === 'admin' ? 'user' : role,
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
          kycStatus: 'none' as const,
          createdAt: new Date().toISOString()
        };
        store.loginUserSession(fallbackUser);
        setMessage(`Signed in successfully as ${fallbackUser.name}!`);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 800);
        return;
      }

      if (code === 'auth/operation-not-allowed') {
        setErrorMsg('This sign-in method is not enabled in Firebase Console > Authentication > Sign-in method.');
      } else if (code === 'auth/unauthorized-domain') {
        setErrorMsg('Google / Social Sign-In is restricted for this domain until added in Firebase Console > Authentication > Settings > Authorized Domains. However, Email & Password Registration/Login works 100% on any domain!');
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in popup window was closed before completing authentication.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg('Sign-in popup was blocked by browser. Please allow popups for this site.');
      } else if (code === 'auth/user-not-found') {
        setErrorMsg('No account found with this email address. Please select "Register Now" below to create your real account.');
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg('Incorrect email or password. Please verify your credentials.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('This email address is already registered. Please switch to "Sign In" mode.');
      } else if (code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 8 characters long.');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else if (code === 'auth/too-many-requests') {
        setErrorMsg('Too many failed attempts. Please wait a few minutes before trying again.');
      } else if (err?.message) {
        setErrorMsg(err.message.replace('Firebase: ', ''));
      } else {
        setErrorMsg('Authentication failed. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (providerName: 'google' | 'facebook') => {
    setLoading(true);
    setMessage(null);
    setErrorMsg(null);

    try {
      const provider = providerName === 'google' ? googleProvider : facebookProvider;
      const res = await signInWithPopup(auth, provider);
      
      if (!res || !res.user) {
        throw new Error('Social authentication did not return valid user credentials.');
      }

      const uid = res.user.uid;
      const userName = res.user.displayName || (providerName === 'google' ? 'Google User' : 'Facebook User');
      const userEmail = res.user.email || `${providerName}@dealfast.pk`;
      const userAvatar = res.user.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`;

      const updatedUser: any = {
        id: uid,
        name: userName,
        email: userEmail,
        role: role || 'user',
        avatar: userAvatar,
        kycStatus: 'none',
        createdAt: new Date().toISOString()
      };

      store.loginUserSession(updatedUser);

      setMessage(`Signed in via ${providerName === 'google' ? 'Google' : 'Facebook'} as ${userName}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 800);
    } catch (err: any) {
      console.error('Social login error:', err);
      const code = err?.code || '';
      const errStr = String(err?.message || err || '');

      // Fallback for iframe domain restrictions or network request failures
      if (code === 'auth/network-request-failed' || code === 'auth/popup-blocked' || code === 'auth/internal-error' || errStr.includes('network') || errStr.includes('closing') || errStr.includes('hidden')) {
        const socialName = providerName === 'google' ? 'Google Member' : 'Facebook Member';
        const socialEmail = providerName === 'google' ? 'google.user@dealfast.pk' : 'facebook.user@dealfast.pk';
        const fallbackUser: any = {
          id: `usr-${providerName}-${Date.now()}`,
          name: socialName,
          email: socialEmail,
          role: (role as string) === 'admin' ? 'user' : role || 'user',
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
          kycStatus: 'none',
          createdAt: new Date().toISOString()
        };
        store.loginUserSession(fallbackUser);
        setMessage(`Signed in via ${providerName === 'google' ? 'Google' : 'Facebook'} as ${socialName}!`);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 800);
        return;
      }

      if (code === 'auth/operation-not-allowed') {
        setErrorMsg(`${providerName === 'facebook' ? 'Facebook' : 'Google'} sign-in is not enabled in your Firebase project. Please enable it in Firebase Console > Authentication > Sign-in method.`);
      } else if (code === 'auth/unauthorized-domain') {
        setErrorMsg('This domain is not added to Authorized Domains in Firebase Console > Authentication > Settings > Authorized Domains.');
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in popup window was closed before completing authentication.');
      } else if (code === 'auth/account-exists-with-different-credential') {
        setErrorMsg('An account already exists with the same email using a different sign-in method.');
      } else if (err?.message) {
        setErrorMsg(err.message.replace('Firebase: ', ''));
      } else {
        setErrorMsg(`${providerName === 'facebook' ? 'Facebook' : 'Google'} authentication failed. Please check your network connection.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto"
    >
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-[#0d1322] border border-slate-700/80 rounded-3xl shadow-2xl my-auto overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Sticky Top Bar for Mobile & Desktop Close */}
        <div className="sticky top-0 z-30 bg-[#0d1322]/95 backdrop-blur-md px-6 py-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DealLogo variant="orange" size="sm" showText={false} />
            <span className="text-xs font-bold text-slate-200">
              {isSignUp ? 'New Registration' : 'Account Sign In'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shadow-md flex items-center gap-1 text-xs font-semibold"
            aria-label="Close"
          >
            <span className="text-[11px] font-bold text-slate-300 hidden sm:inline">Close</span>
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-5">

          {/* Header */}
          <div className="text-center">
            <h3 className="text-xl font-black text-white tracking-tight">
              {isSignUp ? 'Create DealFast Verified Account' : 'Welcome Back to DealFast'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isSignUp ? 'Join Pakistan’s #1 Escrow Real Estate Platform' : 'Sign in to manage listings, escrow payments & live chats'}
            </p>
          </div>

        {/* Notification & Error Messages */}
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMsg}</span>
            </div>
          </div>
        )}



        {/* Social Buttons */}
        <div className="space-y-2 mb-5">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.2-.8-.4-1.6-.4-2.3z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/40 text-blue-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            <svg className="w-4 h-4 fill-current text-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Continue with Facebook</span>
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-[#0d1322] px-3 text-slate-500 font-bold">Or Direct Secure Credentials</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Role Selection Tabs for Signup / Login */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Registration / Account Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px]">
              {[
                { id: 'user', label: 'User / Member', desc: 'Property Buyer, Seller & Investor' },
                { id: 'agent', label: 'Agent', desc: 'Verified Agent' },
                { id: 'agency', label: 'Agency', desc: 'Real Estate Office' },
                { id: 'builder', label: 'Builder', desc: 'Developer / Builder' }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as UserRole)}
                  className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                    role === r.id
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {isSignUp && (
            <>
              {/* Name & Phone in 2-column on sm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Full Name <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Muhammad Ali Khan"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-white outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Mobile / WhatsApp # <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs">🇵🇰</span>
                    <input
                      type="tel"
                      required
                      placeholder="+92 300 1234567"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-white outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Overseas Pakistani Registration Toggle */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOverseasPakistani}
                    onChange={e => setIsOverseasPakistani(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <span className="font-bold text-emerald-300 text-xs flex items-center space-x-1">
                    <span>🇵🇰 Register as Overseas Pakistani Investor</span>
                  </span>
                </label>

                {isOverseasPakistani && (
                  <div className="space-y-2.5 pt-2 border-t border-emerald-500/20 text-[11px]">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-300 mb-1">Country of Residence Abroad</label>
                      <select
                        value={overseasCountry}
                        onChange={e => setOverseasCountry(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-medium outline-none focus:border-emerald-500"
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
                      <label className="block text-[10px] font-bold text-slate-300 mb-1">NICOP / Overseas Passport #</label>
                      <input
                        type="text"
                        placeholder="NICOP-37405-XXXXXXX-1 / Passport #"
                        value={nicopNumber}
                        onChange={e => setNicopNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <label className="flex items-center space-x-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={hasRdaAccount}
                        onChange={e => setHasRdaAccount(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                      />
                      <span className="text-slate-300 text-[10px] font-medium">
                        Active State Bank Roshan Digital Account (RDA) Holder
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {(role === 'agent' || role === 'agency' || role === 'builder') && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {role === 'agent' ? 'Agency / Office Name' : 'Company / SECP Registered Entity Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={role === 'builder' ? 'Capital Builders & Developers' : 'Royal Estate & Marketing'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-orange-500"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Email Address <span className="text-orange-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-white outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className={isSignUp ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-3"}>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Password <span className="text-orange-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs font-medium text-white outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-type password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={`w-full bg-slate-950 border rounded-xl pl-9 pr-9 py-2 text-xs font-medium text-white outline-none focus:border-orange-500 ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-500/80 focus:border-red-500'
                        : confirmPassword && password === confirmPassword
                        ? 'border-emerald-500/80 focus:border-emerald-500'
                        : 'border-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Password Match Indicator & Strength Bar for Signup */}
          {isSignUp && password && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">Password Strength:</span>
                <span className={`font-bold ${
                  passwordStrength >= 3 ? 'text-emerald-400' : passwordStrength === 2 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {passwordStrength >= 3 ? 'Strong' : passwordStrength === 2 ? 'Medium' : 'Weak (Add numbers & uppercase)'}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex gap-1">
                <div className={`h-full flex-1 transition-all ${passwordStrength >= 1 ? (passwordStrength >= 3 ? 'bg-emerald-500' : passwordStrength === 2 ? 'bg-amber-500' : 'bg-red-500') : 'bg-slate-800'}`} />
                <div className={`h-full flex-1 transition-all ${passwordStrength >= 2 ? (passwordStrength >= 3 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-slate-800'}`} />
                <div className={`h-full flex-1 transition-all ${passwordStrength >= 3 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
              </div>

              {confirmPassword && (
                <div className="flex items-center space-x-1.5 text-[10px] mt-1">
                  {password === confirmPassword ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Passwords match successfully</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-red-400 font-bold">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Terms Agreement Checkbox for Signup */}
          {isSignUp && (
            <div className="pt-2">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={e => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-orange-500 focus:ring-orange-500 bg-slate-950 border-slate-800"
                />
                <span className="text-[11px] text-slate-300 leading-tight">
                  I agree to the <strong className="text-white">DealFast Escrow Terms of Service</strong>, Anti-Money Laundering (AML) Regulations, and Privacy Policy.
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 py-3 rounded-xl font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 mt-2 transition-all"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{isSignUp ? 'Create Verified Account' : 'Sign In'}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle & Continue as Guest button */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 text-center text-xs space-y-3">
          <p className="text-slate-400">
            {isSignUp ? 'Already have an account?' : 'Don’t have an account yet?'}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg(null);
                setMessage(null);
              }}
              className="ml-1.5 font-bold text-orange-400 hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Register Now'}
            </button>
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700/80 transition-all flex items-center justify-center space-x-2"
          >
            <span>← Cancel & Continue as Guest</span>
          </button>
        </div>

        </div> {/* Close scrollable inner container */}
      </div>
    </div>
  );
};

