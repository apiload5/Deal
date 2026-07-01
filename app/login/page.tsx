'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const sanitizedPhone = `+92${phone.replace(/^0|^92/, '')}`;
    
    const { error } = await supabase.auth.signInWithOtp({ phone: sanitizedPhone });
    setLoading(false);
    
    if (error) alert(error.message);
    else setStep(2);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const sanitizedPhone = `+92${phone.replace(/^0|^92/, '')}`;
    
    const { error } = await supabase.auth.verifyOtp({ phone: sanitizedPhone, token: otp, type: 'sms' });
    setLoading(false);
    
    if (error) alert(error.message);
    else router.push('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border rounded-2xl shadow-xl p-6 md:p-8">
        <h2 className="text-2xl font-black text-slate-950">Verify Phone Access</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">Secured via Supabase Phone Authentication Network.</p>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mobile Number (موبائل نمبر)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-sm text-slate-400">+92</span>
                <input type="tel" placeholder="3001234567" required className="w-full h-11 pl-12 pr-3 border rounded-xl bg-slate-50 text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full h-11 bg-blue-600 text-white font-bold rounded-xl shadow hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? 'Sending Code...' : 'Send Secure OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Enter 6-Digit OTP (کوڈ درج کریں)</label>
              <input type="text" placeholder="******" maxLength={6} required className="w-full h-11 border rounded-xl text-center font-extrabold tracking-widest text-lg bg-slate-50 outline-none focus:ring-1 focus:ring-blue-500" value={otp} onChange={(e) => setOtp(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full h-11 bg-emerald-600 text-white font-bold rounded-xl shadow hover:bg-emerald-700 transition disabled:opacity-50">
              {loading ? 'Authenticating...' : 'Verify Activation Code'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
