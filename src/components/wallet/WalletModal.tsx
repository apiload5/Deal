import React, { useState } from 'react';
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
  Smartphone
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
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

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

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const amount = Number(topupAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Please enter a valid deposit amount in PKR.');
      return;
    }

    if (paymentMethod === 'raast') {
      if (!raastRrn.trim() || raastRrn.trim().length < 8) {
        setErrorMessage('Please provide the 8 to 18-digit State Bank Raast RRN from your bank slip or click "Open Interactive Raast Checkout" below.');
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          amount,
          paymentMethod,
          raastRrn: paymentMethod === 'raast' ? raastRrn.trim().toUpperCase() : undefined,
          payerPhone: payerPhone.trim()
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.referenceId) {
        throw new Error(data.error || 'Payment gateway verification failed. Deposit rejected.');
      }

      // Execute topup on store
      store.topupWallet(amount, paymentMethod, data.referenceId);
      setSuccessMessage(
        paymentMethod === 'raast'
          ? `PKR ${amount.toLocaleString()} deposited via State Bank Raast with 0% Fee! (RRN: ${data.raastRrn || data.referenceId})`
          : `PKR ${amount.toLocaleString()} deposited successfully into your Escrow Wallet via ${paymentMethod.toUpperCase()}! (Ref: ${data.referenceId})`
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

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Please enter a valid withdrawal amount in PKR.');
      return;
    }

    if (amount > userWallet.availableBalance) {
      setErrorMessage(`Insufficient balance. Maximum withdrawable balance is PKR ${userWallet.availableBalance.toLocaleString()}.`);
      return;
    }

    if (!accountDetails.trim()) {
      setErrorMessage('Please enter your Raast ID (Mobile Number), Bank IBAN, or Mobile Wallet details.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'withdraw',
          amount,
          accountDetails,
          paymentMethod
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Withdrawal processing failed.');
      }

      const withdrawOk = store.withdrawWallet(amount, paymentMethod, accountDetails);
      if (withdrawOk) {
        setSuccessMessage(`PKR ${amount.toLocaleString()} withdrawal request processed via ${paymentMethod.toUpperCase()}! (Ref: ${data.referenceId || 'WD-OK'})`);
        setWithdrawAmount('');
        setAccountDetails('');
        setActiveTab('balance');
      } else {
        setErrorMessage('Failed to process withdrawal in store. Insufficient balance.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Withdrawal request failed. Please check your account details.');
    } finally {
      setLoading(false);
    }
  };

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
                  Zero 3rd-Party Gateway Surcharge • Instant RRN Escrow Locking
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-950/80 px-4 pt-2 gap-2 shrink-0">
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
                  className={`flex items-center space-x-1.5 pb-2.5 px-3 border-b-2 font-bold text-xs transition-all ${
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
            
            {/* Feedback Messages */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 font-medium text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 font-medium text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
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
                    <p className="text-3xl sm:text-4xl font-black text-white font-mono mt-1">
                      PKR {userWallet.availableBalance.toLocaleString('en-PK')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Total Deposits:</span>
                      <span className="font-bold text-emerald-400">
                        PKR {userWallet.transactions.filter(t => t.type === 'topup').reduce((s, t) => s + t.amount, 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Total Payouts:</span>
                      <span className="font-bold text-slate-300">
                        PKR {userWallet.transactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0).toLocaleString()}
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
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3 rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition"
                    >
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                      <span>Withdraw to Raast/Bank</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TOPUP / DEPOSIT (ZERO FEE RAAST & BANK) */}
            {activeTab === 'topup' && (
              <form onSubmit={handleTopup} className="space-y-4">
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
                    Pay from HBL, Meezan, Nayapay, SadaPay, EasyPaisa, or JazzCash without paying 2.5% 3rd-party gateway fees.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Deposit Amount (PKR) *
                  </label>
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Select Payment Gateway
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentGateway)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="raast">⚡ State Bank Direct Raast (0% Fee - Recommended)</option>
                    <option value="bank_transfer">Direct Bank Transfer (Meezan/HBL IBAN)</option>
                    <option value="easypaisa">EasyPaisa Mobile Account</option>
                    <option value="jazzcash">JazzCash Mobile Account</option>
                    <option value="card">Debit / Credit Card</option>
                  </select>
                </div>

                {/* State Bank Raast Account Credentials Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <Building className="w-4 h-4 text-emerald-400" />
                      DealFast Official Escrow Account
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      Verified
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

                {/* State Bank Raast RRN Input */}
                {paymentMethod === 'raast' && (
                  <div className="space-y-3 p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-white">
                        Enter Bank Transfer RRN (Retrieval Reference Number) *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (!topupAmount || Number(topupAmount) <= 0) {
                            setErrorMessage('Please enter deposit amount first.');
                            return;
                          }
                          setShowRaastModal(true);
                        }}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                      >
                        Open QR Code & Step-by-Step Checkout
                      </button>
                    </div>
                    <input
                      type="text"
                      value={raastRrn}
                      onChange={e => setRaastRrn(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
                      placeholder="e.g. 408291039821 or SBP Ref Code"
                      className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-4 py-2.5 text-xs font-mono text-emerald-400 font-bold tracking-widest focus:outline-none focus:border-emerald-400"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Transfer funds to the Raast ID or IBAN above, then enter the SMS/receipt reference number to instantly credit your Escrow Wallet.
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                  >
                    {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                    <span>{loading ? 'Verifying SBP Raast Reference...' : 'Confirm & Deposit to Escrow Wallet'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: WITHDRAWAL */}
            {activeTab === 'withdraw' && (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Withdrawal Amount (PKR) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    max={userWallet.availableBalance}
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value.replace(/^0+(?=\d)/, ''))}
                    placeholder="e.g. 25000"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-[10px] text-emerald-400 mt-1 block">
                    Available Balance: PKR {userWallet.availableBalance.toLocaleString('en-PK')}
                  </span>
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
                    <option value="raast">⚡ Direct State Bank Raast ID (Mobile Number)</option>
                    <option value="bank_transfer">Pakistani Bank Account (IBAN)</option>
                    <option value="easypaisa">EasyPaisa Account</option>
                    <option value="jazzcash">JazzCash Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    {paymentMethod === 'raast' ? 'Your Raast ID (Registered Mobile Number) *' : 'Account Title & IBAN / Mobile Number *'}
                  </label>
                  <input
                    type="text"
                    value={accountDetails}
                    onChange={e => setAccountDetails(e.target.value)}
                    placeholder={paymentMethod === 'raast' ? 'e.g. 03218889900 (Ahmad Raza)' : 'e.g. PK36 HABB 0001 2345 6789 0123 - Ahmad Raza'}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                  <span>{loading ? 'Processing Payout Request...' : 'Submit Withdrawal Request'}</span>
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
                    <p className="text-[11px] text-slate-500">Your deposits and withdrawals will appear here.</p>
                  </div>
                ) : (
                  userWallet.transactions.map(tx => (
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
                          {tx.type === 'topup' || tx.type === 'bounty_earned' ? '+' : '-'} PKR {tx.amount.toLocaleString('en-PK')}
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

      {/* Embedded Raast Checkout Modal for direct interactive guidance */}
      {showRaastModal && (
        <DirectRaastPaymentModal
          isOpen={showRaastModal}
          onClose={() => setShowRaastModal(false)}
          amount={Number(topupAmount) || 100000}
          purposeTitle="Wallet Escrow Deposit"
          onSuccess={raastData => {
            setShowRaastModal(false);
            store.topupWallet(Number(topupAmount) || 100000, 'raast', raastData.escrowRef);
            setSuccessMessage(`PKR ${(Number(topupAmount) || 100000).toLocaleString()} added via Raast! (RRN: ${raastData.rrn})`);
            setTopupAmount('');
            setRaastRrn('');
            setActiveTab('balance');
          }}
        />
      )}
    </>
  );
};
