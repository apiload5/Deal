import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { store } from '../../lib/store';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'moderation' | 'escrow' | 'kyc' | 'users'>('moderation');
  const [refreshToggle, setRefreshToggle] = useState(0);

  const stats = store.getAdminStats();
  const pendingProps = store.properties.filter(p => p.status === 'pending');
  const allBookings = store.bookings;

  const handleApproveProperty = (id: string) => {
    store.approveProperty(id);
    setRefreshToggle(prev => prev + 1);
  };

  const handleRejectProperty = (id: string) => {
    store.rejectProperty(id);
    setRefreshToggle(prev => prev + 1);
  };

  const handleReleaseEscrow = (bookingId: string) => {
    store.releaseEscrow(bookingId);
    setRefreshToggle(prev => prev + 1);
    alert('Escrow funds released to Seller bank account!');
  };

  const handleRefundEscrow = (bookingId: string) => {
    store.refundEscrow(bookingId);
    setRefreshToggle(prev => prev + 1);
    alert('Escrow funds refunded back to Buyer account!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="glass-card rounded-3xl p-6 border border-purple-500/30 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white flex items-center">
            <ShieldCheck className="w-6 h-6 text-purple-400 mr-2" />
            Deal.pk Platform Admin Dashboard
          </h1>
          <p className="text-xs text-slate-400">Escrow verification, property approval & financial metrics</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase border border-purple-500/30">
          Super Admin Access
        </span>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Total Registered Users</p>
          <p className="text-2xl font-black text-white mt-1">{stats.totalUsers}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Active Verified Listings</p>
          <p className="text-2xl font-black text-orange-400 mt-1">{stats.activeProperties}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Funds Held in Escrow</p>
          <p className="text-2xl font-black text-amber-400 mt-1">PKR {(stats.escrowVolumePKR / 1000000).toFixed(1)}M</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Total Platform Revenue</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">PKR {(stats.platformRevenuePKR / 100000).toFixed(1)} Lacs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'moderation', label: `Pending Listings (${pendingProps.length})` },
          { id: 'escrow', label: `Escrow Fund Control (${allBookings.length})` },
          { id: 'kyc', label: 'CNIC KYC Verification Queue' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === t.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="space-y-4 text-xs">
          {pendingProps.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 text-slate-400">
              No pending property listings waiting for approval.
            </div>
          ) : (
            pendingProps.map(p => (
              <div key={p.id} className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <img src={p.images[0]} alt="Prop" className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-white text-sm">{p.title}</h4>
                    <p className="text-orange-400 font-black">{p.priceFormatted} • {p.city}</p>
                    <p className="text-[10px] text-slate-400">Owner: {p.ownerName} ({p.userRole})</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleApproveProperty(p.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl font-bold flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleRejectProperty(p.id)}
                    className="bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/30 px-3 py-2 rounded-xl font-bold flex items-center space-x-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Escrow Control */}
      {activeTab === 'escrow' && (
        <div className="space-y-4 text-xs">
          {allBookings.map(b => (
            <div key={b.id} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white">{b.propertyTitle}</h4>
                  <p className="text-[10px] text-slate-400">Buyer: {b.buyerName} ➔ Seller: {b.sellerName}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Status: {b.paymentStatus}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="font-black text-white text-sm">
                  Amount: PKR {b.amountPaid.toLocaleString('en-PK')}
                </p>

                {b.paymentStatus === 'escrow_held' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReleaseEscrow(b.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold"
                    >
                      Release to Seller
                    </button>
                    <button
                      onClick={() => handleRefundEscrow(b.id)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl font-bold"
                    >
                      Refund to Buyer
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
