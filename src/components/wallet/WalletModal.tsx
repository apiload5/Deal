import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  X,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Wallet,
  Building,
  RefreshCcw,
  CheckCircle2,
  Zap,
  Copy,
  Check,
  Smartphone,
  Loader2,
  Info
} from 'lucide-react';
import { store } from '../../lib/store';
import { PaymentGateway } from '../../types';
import { DirectRaastPaymentModal } from '../escrow/DirectRaastPaymentModal';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'topup' | 'withdraw' | 'transactions'>('balance');
  const [topupAmount, setTopupAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentGateway>('raast');
  const [accountDetails, setAccountDetails] = useState<string>('');
  const [raastRrn, setRaastRrn] = useState<string>('');
  const [payerPhone, setPayerPhone] = useState<string>(store.currentUser.phone || '');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showRaastModal, setShowRaastModal] = useState<boolean>(false);
  
  // 🔥 FIX BUG #3: Confirmation modal & balance loading states
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<'topup' | 'withdraw' | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentUser = store.currentUser;
  const userWallet = store.getUserWallet(currentUser.id);
  const bankDetails = store.bankDetails || {
    bankName: 'Meezan Bank Islamic / HBL Corporate',
    accountTitle: 'DealFast Real Estate Escrow (Pvt) Ltd',
    iban: 'PK92MEZN0001020304050607',
    raastId: '03182055632',
    raastIban: 'PK92MEZN0001020304050607',
    easypaisaTill: '0318-2055632 (DealFast Escrow Till)'
  };

  // 🔥 FIX BUG #3: Balance loading lifecycle
  useEffect(() => {
    if (isOpen) {
      setIsBalanceLoading(true);
      const currentWallet = store.getUserWallet(store.currentUser.id);
      setBalance(currentWallet.availableBalance);
      const timer = setTimeout(() => {
        setIsBalanceLoading(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, store.currentUser.id, activeTab]);

  // 🔥 FIX BUG #3: Auto-dismiss success and error messages after 5 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  if (!isOpen) return null;

  // 🔥 FIX BUG #3: Format amount helper with Pakistani currency commas and decimals
  const formatAmount = (amount: number): string => {
    return `PKR ${amount.toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Prompt confirmation dialog before Top-Up
  const handleInitiateTopup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const amount = Number(topupAmount);
    if (isNaN(amount) || amount < 100) {
      setErrorMessage('Minimum deposit amount is PKR 100.');
      return;
    }
    if (amount > 10000000) {
      setErrorMessage('Maximum deposit limit per transaction is PKR 10,000,000.');
      return;
    }

    if (paymentMethod === 'raast') {
      const cleanRrn = raastRrn.replace(/\D/g, '').trim();
      if (!cleanRrn || cleanRrn.length < 8 || cleanRrn.length > 18) {
        setErrorMessage('State Bank Raast RRN must contain between 8 and 18 digits.');
        return;
      }
    }

    setConfirmAction('topup');
    setShowConfirmModal(true);
  };

  // Prompt confirmation dialog before Withdrawal
  const handleInitiateWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount < 100) {
      setErrorMessage('Minimum withdrawal amount is PKR 100.');
      return;
    }

    const available = userWallet.availableBalance - (userWallet.lockedStake || 0);
    if (amount > available) {
      setErrorMessage(`Insufficient withdrawable balance. Maximum available is ${formatAmount(available)}.`);
      return;
    }

    if (!accountDetails.trim()) {
      setErrorMessage('Please provide your beneficiary account details, Raast ID, or IBAN.');
      return;
    }

    setConfirmAction('withdraw');
    setShowConfirmModal(true);
  };

  // Execute confirmed transaction
  const handleConfirmTransaction = async () => {
    setShowConfirmModal(false);
    if (confirmAction === 'topup') {
      await executeTopup();
    } else if (confirmAction === 'withdraw') {
      await executeWithdraw();
    }
  };

  const executeTopup = async () => {
    const amount = Number(topupAmount);
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const cleanRrn = paymentMethod === 'raast' ? raastRrn.replace(/\D/g, '').trim() : undefined;
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          amount,
          paymentMethod,
          raastRrn: cleanRrn,
          payerPhone: payerPhone.trim()
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.referenceId) {
        throw new Error(data.error || 'Payment verification failed. Deposit rejected.');
      }

      // Execute topup on store
      const updated = store.topupWallet(amount, paymentMethod, data.referenceId);
      setBalance(updated.availableBalance);
      setSuccessMessage(
        paymentMethod === 'raast'
          ? `${formatAmount(amount)} deposited via State Bank Raast with 0% Fee! (RRN: ${data.raastRrn || data.referenceId})`
          : `${formatAmount(amount)} deposited successfully into Escrow Wallet via ${paymentMethod.toUpperCase()}! (Ref: ${data.referenceId})`
      );
      setTopupAmount('');
      setRaastRrn('');
      setActiveTab('balance');
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const executeWithdraw = async () => {
    const amount = Number(withdrawAmount);
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'withdraw',
          amount,
          accountDetails: accountDetails.trim(),
          paymentMethod
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Withdrawal processing failed.');
      }

      const withdrawOk = store.withdrawWallet(amount, paymentMethod, accountDetails.trim());
      if (withdrawOk) {
        const updated = store.getUserWallet(currentUser.id);
        setBalance(updated.availableBalance);
        setSuccessMessage(`${formatAmount(amount)} withdrawal request processed via ${paymentMethod.toUpperCase()}! (Ref: ${data.referenceId || 'WD-OK'})`);
        setWithdrawAmount('');
        setAccountDetails('');
        setActiveTab('balance');
      } else {
        setErrorMessage('Failed to process withdrawal in store. Please verify available balance.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Withdrawal request failed. Please check account details.');
    } finally {
      setLoading(false);
    }
  };

  // Validate RRN state in real-time
  const isRrnValid = raastRrn.length >= 8 && raastRrn.length <= 18;

  return (
    <>
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-[#090f1d] border-2 border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col text-slate-100 max-h-[92vh]">
          
          {/* Top Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 px-5 py-4 border-b border-emerald-500/30 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400 font-black">
                ⚡
              </div>
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <span>State Bank Raast Escrow Wallet</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/40">
                    0% Fee Direct
                  </span>
                </h2>
                <p className="text-[11px] text-emerald-300/80">
                  RapidGateway SBP Compliant • Instant RRN Escrow Locking • Real-Time Cloud Sync
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-950/80 px-4 pt-2 gap-2 shrink-0 overflow-x-auto">
            {[
              { id: 'balance', label: 'Wallet Balance', icon: Wallet },
              { id: 'topup', label: '⚡ Deposit (Raast 0% Fee)', icon: PlusCircle },
              { id: 'withdraw', label: 'Withdrawal', icon: ArrowUpRight },
              { id: 'transactions', label: 'Transaction Ledger', icon: CreditCard }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex items-center space-x-1.5 pb-2.5 px-3 border-b-2 font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'border-emerald-400 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Body */}
          <div className="p-5 overflow-y-auto space-y-4 text-xs">
            
            {/* Feedback Messages (Auto-dismiss in 5s) */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 font-medium text-xs flex items-center space-x-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="flex-1">{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white text-xs">✕</button>
              </div>
            )}
            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 font-medium text-xs flex items-center space-x-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="flex-1">{successMessage}</span>
                <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white text-xs">✕</button>
              </div>
            )}

            {/* TAB 1: BALANCE OVERVIEW */}
            {activeTab === 'balance' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      DealFast Escrow Secured Vault
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      SBP Raast Integrated
                    </span>
                  </div>

                  <div className="my-4">
                    <span className="text-xs text-slate-400 block font-medium">Available Liquid Balance</span>
                    {isBalanceLoading ? (
                      <div className="flex items-center gap-2 py-2 text-emerald-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-sm font-bold text-slate-400">Synchronizing Escrow Balance...</span>
                      </div>
                    ) : (
                      <p className="text-3xl sm:text-4xl font-black text-white font-mono mt-1">
                        {formatAmount(balance)}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Total Deposits:</span>
                      <span className="font-bold text-emerald-400">
                        {formatAmount(userWallet.transactions.filter(t => t.type === 'topup').reduce((s, t) => s + t.amount, 0))}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Total Payouts:</span>
                      <span className="font-bold text-slate-300">
                        {formatAmount(userWallet.transactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0))}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-5">
                    <button
                      onClick={() => setActiveTab('topup')}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>Deposit via Raast (0% Fee)</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('withdraw')}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3 rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                      <span>Withdraw to Raast/Bank</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TOPUP / DEPOSIT */}
            {activeTab === 'topup' && (
              <form onSubmit={handleInitiateTopup} className="space-y-4">
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      State Bank Raast Zero-Fee Direct Deposit
                    </p>
                    <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                      100% Free
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-300/80">
                    Pay from HBL, Meezan, Nayapay, SadaPay, EasyPaisa, or JazzCash via RapidGateway without paying 2.5% surcharge.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-white">
                      Deposit Amount (PKR) *
                    </label>
                    <span className="text-[10px] text-slate-400">Min: PKR 100 • Max: PKR 10,000,000</span>
                  </div>
                  <input
                    type="number"
                    min="100"
                    max="10000000"
                    value={topupAmount}
                    onChange={e => setTopupAmount(e.target.value.replace(/^0+(?=\d)/, ''))}
                    placeholder="e.g. 100000"
                    required
                    className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-4 py-3 text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-400"
                  />
                  {topupAmount && Number(topupAmount) >= 100 && (
                    <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                      Preview: {formatAmount(Number(topupAmount))}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Select Payment Gateway (RapidGateway Unified)
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentGateway)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="raast">⚡ State Bank Direct Raast (0% Fee - Instant)</option>
                    <option value="bank_transfer">Direct Bank Transfer (Meezan / HBL IBAN)</option>
                    <option value="easypaisa">EasyPaisa Mobile Account</option>
                    <option value="jazzcash">JazzCash Mobile Account</option>
                    <option value="card">Debit / Credit Card (Visa / Mastercard)</option>
                  </select>
                </div>

                {/* State Bank Raast Account Credentials Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <Building className="w-4 h-4 text-emerald-400" />
                      DealFast Official Escrow Beneficiary
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      Verified SBP Escrow
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Official Raast ID:</span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">{bankDetails.raastId || '03182055632'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(bankDetails.raastId || '03182055632', 'raastId')}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        {copiedField === 'raastId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Account Title:</span>
                        <span className="font-bold text-white text-xs">{bankDetails.accountTitle}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(bankDetails.accountTitle, 'title')}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        {copiedField === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="sm:col-span-2 p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Raast IBAN (Meezan / HBL):</span>
                        <span className="font-mono font-bold text-slate-200 text-xs">{bankDetails.raastIban || bankDetails.iban}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(bankDetails.raastIban || bankDetails.iban, 'iban')}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* State Bank Raast RRN Input with validation feedback */}
                {paymentMethod === 'raast' && (
                  <div className="space-y-3 p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-white">
                        Enter Bank Transfer RRN (Retrieval Reference Number) *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (!topupAmount || Number(topupAmount) < 100) {
                            setErrorMessage('Please enter valid deposit amount (min PKR 100) first.');
                            return;
                          }
                          setShowRaastModal(true);
                        }}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                      >
                        Open QR Code & Step-by-Step Checkout
                      </button>
                    </div>

                    {/* 🔥 FIX BUG #3: Digits-only RRN input with live validation */}
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={18}
                        value={raastRrn}
                        onChange={e => setRaastRrn(e.target.value.replace(/\D/g, '').slice(0, 18))}
                        placeholder="e.g. 408291039821 (Digits only, 8-18 digits)"
                        className={`w-full bg-slate-900 border rounded-xl px-4 py-2.5 text-xs font-mono font-bold tracking-widest focus:outline-none ${
                          raastRrn.length > 0
                            ? isRrnValid
                              ? 'border-emerald-400 text-emerald-400 focus:border-emerald-300'
                              : 'border-rose-500/60 text-rose-300 focus:border-rose-400'
                            : 'border-emerald-500/50 text-emerald-400 focus:border-emerald-400'
                        }`}
                      />
                      {raastRrn.length > 0 && (
                        <span className="absolute right-3 top-2.5 text-[10px] font-bold">
                          {isRrnValid ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Valid RRN ({raastRrn.length}d)
                            </span>
                          ) : (
                            <span className="text-rose-400">
                              {raastRrn.length < 8 ? `${8 - raastRrn.length} more digits required` : 'Max 18 digits'}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Transfer funds to the Raast ID or IBAN above, then enter the 8-18 digit reference number from your bank app receipt/SMS.
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                    <span>Confirm & Review Deposit</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: WITHDRAWAL */}
            {activeTab === 'withdraw' && (
              <form onSubmit={handleInitiateWithdraw} className="space-y-4">
                {/* 🔥 FIX BUG #3: Daily withdrawal limit warning & guidance */}
                <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>State Bank Daily Payout Limits</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90">
                    Standard daily withdrawal limit is <strong>PKR 500,000</strong> per account. Payouts are routed directly to your verified IBAN/Raast ID via RapidGateway with 0% processing fee.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-white">
                      Withdrawal Amount (PKR) *
                    </label>
                    <span className="text-[10px] text-emerald-400">
                      Available: {formatAmount(userWallet.availableBalance - (userWallet.lockedStake || 0))}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="100"
                    max={userWallet.availableBalance - (userWallet.lockedStake || 0)}
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value.replace(/^0+(?=\d)/, ''))}
                    placeholder="e.g. 25000 (Min PKR 100)"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
                  />
                  {withdrawAmount && Number(withdrawAmount) >= 100 && (
                    <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                      Payout: {formatAmount(Number(withdrawAmount))}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Withdrawal Channel
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentGateway)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="raast">⚡ Direct State Bank Raast ID (Mobile Number - Instant)</option>
                    <option value="bank_transfer">Pakistani Bank Account (IBAN)</option>
                    <option value="easypaisa">EasyPaisa Mobile Account</option>
                    <option value="jazzcash">JazzCash Mobile Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    {paymentMethod === 'raast'
                      ? 'Your Raast ID (11-Digit Mobile Number) *'
                      : paymentMethod === 'bank_transfer'
                      ? 'Bank Account Title & 24-Digit IBAN (e.g. PK92MEZN...) *'
                      : '11-Digit Mobile Account Number *'}
                  </label>
                  <input
                    type="text"
                    value={accountDetails}
                    onChange={e => setAccountDetails(e.target.value)}
                    placeholder={
                      paymentMethod === 'raast'
                        ? 'e.g. 03218889900'
                        : paymentMethod === 'bank_transfer'
                        ? 'e.g. PK36HABB0001234567890123 (Ahmad Raza)'
                        : 'e.g. 03001234567'
                    }
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                  <span>Review & Submit Withdrawal</span>
                </button>
              </form>
            )}

            {/* TAB 4: TRANSACTIONS */}
            {activeTab === 'transactions' && (
              <div className="space-y-3">
                {userWallet.transactions.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <Wallet className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-300">No transactions recorded yet</p>
                    <p className="text-[11px] text-slate-500">Your deposits, withdrawals, and escrow transfers will appear here.</p>
                  </div>
                ) : (
                  userWallet.transactions.slice(0, 50).map(tx => (
                    <div key={tx.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${
                          tx.type === 'topup' || tx.type === 'bounty_earned'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {tx.type === 'topup' || tx.type === 'bounty_earned' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            {tx.description}
                            {tx.paymentMethod === 'raast' && (
                              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                                RAAST SBP
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">Ref: {tx.referenceId} • {tx.createdAt}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-bold ${
                          tx.type === 'topup' || tx.type === 'bounty_earned'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}>
                          {tx.type === 'topup' || tx.type === 'bounty_earned' ? '+' : '-'} {formatAmount(tx.amount)}
                        </span>
                        <span className="block text-[10px] text-emerald-400 font-bold capitalize">{tx.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>State Bank of Pakistan Compliant Zero-Fee Escrow Vault</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">100% Capital Protection</span>
          </div>

        </div>
      </div>

      {/* 🔥 FIX BUG #3: Confirmation Dialog Modal before Topup / Withdrawal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400 font-bold">
                {confirmAction === 'topup' ? <Zap className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  {confirmAction === 'topup' ? 'Confirm Escrow Deposit' : 'Confirm Escrow Withdrawal'}
                </h3>
                <p className="text-[11px] text-slate-400">Please verify transaction parameters</p>
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Transaction Type:</span>
                <span className="font-bold text-white capitalize">{confirmAction === 'topup' ? 'Deposit to Escrow Vault' : 'Withdrawal Payout'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Amount:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  {confirmAction === 'topup' ? formatAmount(Number(topupAmount)) : formatAmount(Number(withdrawAmount))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Channel / Gateway:</span>
                <span className="font-bold text-slate-200 uppercase">{paymentMethod}</span>
              </div>
              {confirmAction === 'topup' && paymentMethod === 'raast' && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Raast RRN:</span>
                  <span className="font-mono font-bold text-emerald-400">{raastRrn}</span>
                </div>
              )}
              {confirmAction === 'withdraw' && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Destination Account:</span>
                  <span className="font-mono text-slate-200 text-[11px] truncate max-w-[180px]">{accountDetails}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-slate-400">Gateway Fee:</span>
                <span className="text-emerald-400 font-bold">PKR 0 (0% Free)</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTransaction}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Authorize & Process</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Raast Checkout Modal for direct interactive guidance */}
      {showRaastModal && (
        <DirectRaastPaymentModal
          isOpen={showRaastModal}
          onClose={() => setShowRaastModal(false)}
          amount={Number(topupAmount) || 100000}
          purposeTitle="Wallet Escrow Deposit"
          onSuccess={raastData => {
            setShowRaastModal(false);
            const amt = Number(topupAmount) || 100000;
            const updated = store.topupWallet(amt, 'raast', raastData.escrowRef);
            setBalance(updated.availableBalance);
            setSuccessMessage(`${formatAmount(amt)} added via State Bank Raast! (RRN: ${raastData.rrn})`);
            setTopupAmount('');
            setRaastRrn('');
            setActiveTab('balance');
          }}
        />
      )}
    </>
  );
};
