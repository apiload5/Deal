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
  CheckCircle2
} from 'lucide-react';
import { store } from '../../lib/store';
import { PaymentGateway } from '../../types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'topup' | 'withdraw' | 'transactions'>('balance');
  const [topupAmount, setTopupAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentGateway>('bank_transfer');
  const [accountDetails, setAccountDetails] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUser = store.currentUser;
  const userWallet = store.getUserWallet(currentUser.id);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const amount = Number(topupAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Please enter a valid deposit amount in PKR.');
      return;
    }

    setLoading(true);

    try {
      // Send real API request to server endpoint powered by single Payment API Key
      const res = await fetch('/app/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          amount,
          paymentMethod
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error || 'Not Found: Payment API Key is not configured. Fake operations are disabled. Please contact Admin Staff to configure the payment API key.'
        );
        setLoading(false);
        return;
      }

      // If API key is present and call succeeds:
      store.topupWallet(amount, paymentMethod, data.referenceId || `TXN-${Date.now()}`);
      setSuccessMessage(data.message || `PKR ${amount.toLocaleString()} deposited successfully!`);
      setTopupAmount('');
      setActiveTab('balance');
    } catch (err: any) {
      setErrorMessage(
        'Not Found: Payment API Key is not configured. Fake operations are disabled. Please contact Admin Staff to configure the payment API key.'
      );
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
      setErrorMessage('Please enter your Bank IBAN, EasyPaisa, or JazzCash account details.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/app/api/payments', {
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
        setErrorMessage(
          data.error || 'Not Found: Payment API Key is not configured. Fake operations are disabled. Please contact Admin Staff to configure the payment API key.'
        );
        setLoading(false);
        return;
      }

      const withdrawOk = store.withdrawWallet(amount, paymentMethod, accountDetails);
      if (withdrawOk) {
        setSuccessMessage(data.message || `PKR ${amount.toLocaleString()} withdrawal processed.`);
        setWithdrawAmount('');
        setAccountDetails('');
        setActiveTab('balance');
      } else {
        setErrorMessage('Failed to process withdrawal request.');
      }
    } catch (err: any) {
      setErrorMessage(
        'Not Found: Payment API Key is not configured. Fake operations are disabled. Please contact Admin Staff to configure the payment API key.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0c1322] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col text-slate-100">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-3.5 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Save & Secure Escrow Wallet</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Protected System
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Single API Key Gateway • End-to-End Encrypted Settlements
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

        {/* Modal Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            {[
              { id: 'balance', label: 'Wallet Balance' },
              { id: 'topup', label: 'Deposit Funds' },
              { id: 'withdraw', label: 'Withdraw Funds' },
              { id: 'transactions', label: 'Transaction History' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="p-4 bg-amber-950/80 border border-amber-500/50 rounded-xl text-xs text-amber-200 space-y-1 font-mono">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>API Gateway Response:</span>
              </div>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: BALANCE SUMMARY */}
          {activeTab === 'balance' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Available Escrow Wallet Balance
                </span>
                <p className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">
                  PKR {userWallet.availableBalance.toLocaleString('en-PK')}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-left">
                    <span className="text-slate-500 text-[10px] block font-semibold">Locked in Escrow</span>
                    <span className="font-bold text-slate-200 font-mono">PKR {userWallet.lockedStake.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-left">
                    <span className="text-slate-500 text-[10px] block font-semibold">Total Earned</span>
                    <span className="font-bold text-emerald-400 font-mono">PKR {userWallet.totalEarned.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-3 pt-2">
                  <button
                    onClick={() => setActiveTab('topup')}
                    className="gradient-btn text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-orange-500/20"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Deposit Money</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('withdraw')}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center space-x-2"
                  >
                    <ArrowUpRight className="w-4 h-4 text-amber-400" />
                    <span>Withdraw Money</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TOPUP / DEPOSIT */}
          {activeTab === 'topup' && (
            <form onSubmit={handleTopup} className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Single Payment API Gateway Protected Deposit
                </p>
                <p className="text-slate-400">
                  Deposits require an active Payment API key. If the key is not configured, operations are disabled with a 404 response.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Deposit Amount (PKR)
                </label>
                <input
                  type="number"
                  min="100"
                  max="10000000"
                  value={topupAmount}
                  onChange={e => setTopupAmount(e.target.value.replace(/^0+(?=\d)/, ''))}
                  placeholder="e.g. 50000"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Select Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentGateway)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="bank_transfer">Direct Bank Transfer / Raast (Escrow Account)</option>
                  <option value="card">Visa / MasterCard Credit or Debit</option>
                  <option value="easypaisa">EasyPaisa Mobile Wallet</option>
                  <option value="jazzcash">JazzCash Mobile Wallet</option>
                </select>
              </div>

              {/* Official Escrow Bank & Till Details for Bank Transfer or Mobile Wallet */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" />
                    Official Platform Escrow Account
                  </span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    Escrow Holding
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Bank Name:</span>
                    <span className="font-bold text-white">{store.bankDetails?.bankName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Account Title:</span>
                    <span className="font-bold text-white">{store.bankDetails?.accountTitle}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block text-[10px]">Escrow IBAN:</span>
                    <span className="font-mono font-bold text-emerald-400">{store.bankDetails?.iban}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block text-[10px]">EasyPaisa / JazzCash Till ID:</span>
                    <span className="font-mono font-bold text-amber-300">{store.bankDetails?.easypaisaTill}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-btn text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                <span>{loading ? 'Processing via Single Payment Gateway...' : 'Process Secure Deposit'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: WITHDRAW */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Withdrawal Amount (PKR)
                </label>
                <input
                  type="number"
                  min="100"
                  max={userWallet.availableBalance}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value.replace(/^0+(?=\d)/, ''))}
                  placeholder="e.g. 25000"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Available Balance: PKR {userWallet.availableBalance.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Withdrawal Destination Channel
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentGateway)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="bank_transfer">Bank Account (IBAN)</option>
                  <option value="easypaisa">EasyPaisa Account</option>
                  <option value="jazzcash">JazzCash Mobile Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Account Details (Title, IBAN or Phone Number)
                </label>
                <input
                  type="text"
                  value={accountDetails}
                  onChange={e => setAccountDetails(e.target.value)}
                  placeholder="e.g. PK36 HABB 0001 2345 6789 0123 - Ahmad Raza"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                <span>{loading ? 'Processing Withdrawal...' : 'Request Secure Withdrawal'}</span>
              </button>
            </form>
          )}

          {/* TAB 4: TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div className="space-y-3">
              {userWallet.transactions.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <Wallet className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-300">No transactions found</p>
                  <p className="text-[11px] text-slate-500">Your wallet transaction ledger will appear here.</p>
                </div>
              ) : (
                userWallet.transactions.map(tx => (
                  <div key={tx.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
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
                        <p className="font-bold text-white">{tx.description}</p>
                        <p className="text-[10px] text-slate-400">Ref: {tx.referenceId} • {tx.createdAt}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold ${
                        tx.type === 'topup' || tx.type === 'bounty_earned'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}>
                        {tx.type === 'topup' || tx.type === 'bounty_earned' ? '+' : '-'} PKR {tx.amount.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-slate-500 capitalize">{tx.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Single Key Wallet Engine</span>
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-semibold">
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
