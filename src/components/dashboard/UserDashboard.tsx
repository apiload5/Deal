import React, { useState } from 'react';
import {
  User as UserIcon,
  Building2,
  Heart,
  ShieldCheck,
  FileText,
  CreditCard,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { store } from '../../lib/store';
import { PropertyCard } from '../properties/PropertyCard';
import { ImageUpload } from '../common/ImageUpload';
import { Property } from '../../types';

interface UserDashboardProps {
  onOpenListingModal: () => void;
  onSelectProperty: (p: Property) => void;
  onOpenBookingModal: (p: Property) => void;
  onOpenChatWithAgent: (agentId: string, agentName: string, pId?: string, pTitle?: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onOpenListingModal,
  onSelectProperty,
  onOpenBookingModal,
  onOpenChatWithAgent
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'favorites' | 'bookings' | 'invoices' | 'kyc' | 'profile'>('properties');
  
  const currentUser = store.currentUser;
  const myProps = store.properties.filter(p => p.userId === currentUser.id);
  const myFavs = store.properties.filter(p => store.favorites.includes(p.id));
  const myBookings = store.bookings.filter(b => b.buyerId === currentUser.id || b.sellerId === currentUser.id);
  const myInvoices = store.invoices;

  const [cnicFront, setCnicFront] = useState('');
  const [cnicBack, setCnicBack] = useState('');

  const handleKYCSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnicFront) {
      alert('Please upload CNIC document');
      return;
    }
    store.submitKYC({ cnicFront, cnicBack });
    alert('KYC submitted to Deal.pk Admin for verification!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner Profile Summary */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 font-black text-2xl flex items-center justify-center border border-orange-500/30">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center">
              {currentUser.name}
              {currentUser.kycStatus === 'verified' && (
                <ShieldCheck className="w-5 h-5 ml-2 text-amber-400" title="KYC Verified" />
              )}
            </h1>
            <p className="text-xs text-slate-400">{currentUser.email} • {currentUser.phone || '+92 300 1234567'}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Role: {currentUser.role}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                currentUser.kycStatus === 'verified'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                KYC: {currentUser.kycStatus}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenListingModal}
          className="gradient-btn text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-orange-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Listing</span>
        </button>
      </div>

      {/* Dashboard Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'properties', label: `My Properties (${myProps.length})` },
          { id: 'favorites', label: `Saved Wishlist (${myFavs.length})` },
          { id: 'bookings', label: `Bookings & Escrow (${myBookings.length})` },
          { id: 'invoices', label: `Invoices (${myInvoices.length})` },
          { id: 'kyc', label: 'KYC Document Status' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === t.id
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          {myProps.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No listed properties found</h3>
              <p className="text-xs text-slate-400 mt-1">Submit your villa or plot for listing on Deal.pk</p>
              <button onClick={onOpenListingModal} className="mt-4 gradient-btn text-white px-4 py-2 rounded-xl text-xs font-bold">
                List Property Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProps.map(p => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onSelectProperty={onSelectProperty}
                  onOpenBookingModal={onOpenBookingModal}
                  onOpenChatWithAgent={onOpenChatWithAgent}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myFavs.map(p => (
            <PropertyCard
              key={p.id}
              property={p}
              onSelectProperty={onSelectProperty}
              onOpenBookingModal={onOpenBookingModal}
              onOpenChatWithAgent={onOpenChatWithAgent}
            />
          ))}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-4 text-xs">
          {myBookings.map(b => (
            <div key={b.id} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <span className="font-bold text-white text-sm">{b.propertyTitle}</span>
                  <p className="text-slate-400 text-[10px]">Txn ID: {b.transactionId} • Date: {b.createdAt}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Escrow Status: {b.paymentStatus}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
                <div>
                  <p className="text-slate-500 text-[10px]">Deposit Amount</p>
                  <p className="font-bold text-white">PKR {b.amountPaid.toLocaleString('en-PK')}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Seller / Agent</p>
                  <p className="font-bold text-white">{b.sellerName}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Payment Method</p>
                  <p className="font-bold text-amber-400 uppercase">{b.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Booking Type</p>
                  <p className="font-bold text-white capitalize">{b.bookingType}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-3 text-xs">
          {myInvoices.map(inv => (
            <div key={inv.id} className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">{inv.invoiceNumber} - {inv.propertyTitle}</p>
                <p className="text-[10px] text-slate-400">Date: {inv.date} • Method: {inv.paymentMethod}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-amber-400">PKR {inv.amount.toLocaleString('en-PK')}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                  {inv.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'kyc' && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 max-w-xl mx-auto space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center">
            <ShieldCheck className="w-5 h-5 text-amber-400 mr-2" /> KYC & Real Estate Agent Verification
          </h3>
          <p className="text-slate-400">
            Upload CNIC front & back images to obtain Deal.pk Verified Agent status for 100% auto-approved listings.
          </p>

          <form onSubmit={handleKYCSubmit} className="space-y-4">
            <ImageUpload
              label="CNIC Front Image Upload"
              multiple={false}
              onUploadComplete={urls => setCnicFront(urls[0] || '')}
            />
            <ImageUpload
              label="CNIC Back Image Upload"
              multiple={false}
              onUploadComplete={urls => setCnicBack(urls[0] || '')}
            />

            <button type="submit" className="w-full gradient-btn text-white py-3 rounded-xl font-bold">
              Submit Documents for Admin Verification
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
