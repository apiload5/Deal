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
  FileCheck,
  Fingerprint,
  Zap,
  Trash2,
  RefreshCw,
  Info,
  Lock,
  RotateCcw,
  Calendar
} from 'lucide-react';
import { store } from '../../lib/store';
import { PropertyCard } from '../properties/PropertyCard';
import { DeletePropertyModal } from '../properties/DeletePropertyModal';
import { ImageUpload } from '../common/ImageUpload';
import { NadraBiometricModal } from '../common/NadraBiometricModal';
import { JobPostModal } from '../hiring/JobPostModal';
import { Property } from '../../types';

interface UserDashboardProps {
  onOpenListingModal: () => void;
  onSelectProperty: (p: Property) => void;
  onOpenBookingModal: (p: Property) => void;
  onOpenChatWithAgent: (agentId: string, agentName: string, pId?: string, pTitle?: string) => void;
  onOpenProfile?: () => void;
  onOpenKYC?: () => void;
  onOpenWallet?: () => void;
  onOpenNadraVerification?: () => void;
  onOpenAuth?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onOpenListingModal,
  onSelectProperty,
  onOpenBookingModal,
  onOpenChatWithAgent,
  onOpenProfile,
  onOpenKYC,
  onOpenWallet,
  onOpenNadraVerification,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'favorites' | 'bookings' | 'invoices' | 'kyc' | 'profile' | 'tasks' | 'recycle_bin'>('properties');
  const [isNadraModalOpen, setIsNadraModalOpen] = useState(false);
  const [isJobPostModalOpen, setIsJobPostModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const currentUser = store.currentUser;
  const myProps = store.properties.filter(p => p.userId === currentUser.id && p.status !== 'recycle_bin');
  const recycleBinProps = store.properties.filter(p => (p.userId === currentUser.id || currentUser.role === 'admin') && p.status === 'recycle_bin');
  const myFavs = store.properties.filter(p => store.favorites.includes(p.id) && p.status !== 'recycle_bin');
  const myBookings = store.bookings.filter(b => b.buyerId === currentUser.id || b.sellerId === currentUser.id);
  const myInvoices = store.invoices;

  const isAgencyOrBuilder = currentUser.role === 'agency' || currentUser.role === 'builder';
  const isAgent = currentUser.role === 'agent';

  const [agencyNtn, setAgencyNtn] = useState('');
  const [cnicFront, setCnicFront] = useState('');
  const [cnicBack, setCnicBack] = useState('');
  const [secpDoc, setSecpDoc] = useState('');

  const handleKYCSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAgencyOrBuilder) {
      if (!secpDoc && !cnicFront) {
        alert('Please upload SECP Registration or FBR NTN document for Agency Verification.');
        return;
      }
      store.submitKYC({ cnicFront, cnicBack, secpDoc });
      alert('Agency Corporate Registration submitted to DealFast Admin for SECP verification!');
    } else {
      if (!cnicFront) {
        alert('Please upload CNIC document');
        return;
      }
      store.submitKYC({ cnicFront, cnicBack });
      alert('KYC submitted to DealFast Admin for verification!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Guest Mode Banner */}
      {currentUser.role === 'guest' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-2xl mx-auto shadow-2xl my-8">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto text-2xl font-bold">
            👤
          </div>
          <h2 className="text-xl font-black text-white">Welcome to DealFast Escrow Real Estate</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            You are currently browsing as a Guest Visitor. Please sign in or register an account to list properties, manage Escrow bookings, track KYC verification, and access your wallet.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                if (onOpenAuth) onOpenAuth();
                else if (onOpenProfile) onOpenProfile();
              }}
              className="gradient-btn text-white font-bold px-8 py-3 rounded-xl text-sm shadow-xl transition-all transform hover:scale-105"
            >
              Sign In or Register Account
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Pending Role Approval Notice */}
          {currentUser.roleApprovalStatus === 'pending' && currentUser.role !== 'admin' && currentUser.role !== 'user' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start space-x-3 text-amber-300 text-xs font-semibold">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-200">
                  ⏳ {currentUser.role.replace('_', ' ').toUpperCase()} Role Approval Pending Admin Verification
                </p>
                <p className="text-slate-300 font-normal">
                  Your registration as a certified {currentUser.role.replace('_', ' ')} is under review by DealFast Super Admin. Your profile and company listings will be published in public directories once CNIC and license verification is completed.
                </p>
              </div>
            </div>
          )}

          {/* Top Banner Profile Summary */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 font-black text-2xl flex items-center justify-center border border-orange-500/30 overflow-hidden shrink-0 shadow-lg">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name ? currentUser.name.charAt(0) : 'U'
                )}
              </div>
              <div>
                <h1 className="text-xl font-black text-white flex items-center">
                  {currentUser.name}
                  {currentUser.kycStatus === 'verified' && (
                    <span title="KYC Verified">
                      <ShieldCheck className="w-5 h-5 ml-2 text-amber-400" />
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-400">{currentUser.email}{currentUser.phone ? ` • ${currentUser.phone}` : ''}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    Role: {currentUser.role === 'agency' ? 'Corporate Agency' : currentUser.role === 'builder' ? 'Developer / Builder' : currentUser.role === 'agent' ? 'Field Agent' : currentUser.role === 'admin' ? 'Super Admin' : 'User / Member'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    currentUser.kycStatus === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    KYC: {currentUser.kycStatus === 'verified' ? 'SECP/CNIC Verified' : currentUser.kycStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onOpenWallet && (
                <button
                  onClick={onOpenWallet}
                  className="bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-400 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2"
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Wallet: Rs {store.getUserWallet().availableBalance.toLocaleString('en-PK')}</span>
                </button>
              )}
              {onOpenProfile && (
                <button
                  onClick={onOpenProfile}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <span>⚙️ Edit Profile</span>
                </button>
              )}
              {onOpenKYC && (
                <button
                  onClick={onOpenKYC}
                  className="bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>📄 CNIC & SECP KYC</span>
                </button>
              )}
              <button
                onClick={onOpenListingModal}
                className="gradient-btn text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-orange-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add New Listing</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Dashboard Navigation Tabs */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'properties', label: `My Properties (${myProps.length})` },
          { id: 'recycle_bin', label: `🗑️ Recycle Bin (${recycleBinProps.length})` },
          { id: 'favorites', label: `Saved Wishlist (${myFavs.length})` },
          { id: 'bookings', label: `Bookings & Escrow (${myBookings.length})` },
          { id: 'invoices', label: `Invoices (${myInvoices.length})` },
          isAgencyOrBuilder
            ? { id: 'tasks', label: 'Posted Job Bounties (Hire Agents)' }
            : isAgent
            ? { id: 'tasks', label: 'Available Agency Bounties (Earn)' }
            : { id: 'tasks', label: '⭐ Earn Bounties (Become Agent)' },
          { 
            id: 'kyc', 
            label: isAgencyOrBuilder 
              ? 'Corporate SECP / NTN Verification' 
              : isAgent 
              ? 'Agent CNIC & Test Verification' 
              : 'Buyer/Seller CNIC Verification' 
          }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`min-h-[42px] px-3 py-2 text-center flex items-center justify-center rounded-xl text-xs font-bold transition-all border ${
              activeTab === t.id
                ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          
          {/* Instructions Box for 15-Day Cycle */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-white">15-Day Active Listing & Renewal Rules</h4>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Every published listing stays live on public search for <strong>15 days</strong>. You can click <strong>"Renew (+15 Days)"</strong> anytime to extend its validity. Unrenewed listings automatically move to your <strong>Recycle Bin</strong> for 15 days before permanent deletion.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenListingModal}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs shrink-0 transition-colors shadow-md"
            >
              + Post New Listing
            </button>
          </div>

          {myProps.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No active listings found</h3>
              <p className="text-xs text-slate-400 mt-1">Submit your villa, flat, or plot for listing on DealFast</p>
              <button onClick={onOpenListingModal} className="mt-4 gradient-btn text-white px-4 py-2 rounded-xl text-xs font-bold">
                List Property Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProps.map(p => {
                const expiresDate = p.expiresAt ? new Date(p.expiresAt) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
                const daysLeft = Math.max(0, Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                
                return (
                  <div key={p.id} className="relative group flex flex-col justify-between">
                    <PropertyCard
                      property={p}
                      onSelectProperty={onSelectProperty}
                      onOpenBookingModal={onOpenBookingModal}
                      onOpenChatWithAgent={onOpenChatWithAgent}
                    />

                    {/* Listing Owner Management Toolbar */}
                    <div className="mt-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      
                      {/* Validity & Secret Code Bar */}
                      <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 pb-2 border-b border-slate-800">
                        <span className="flex items-center space-x-1 font-semibold text-amber-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Expires in {daysLeft} days ({expiresDate.toLocaleDateString()})</span>
                        </span>
                        <span className="font-mono text-orange-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800" title="Secret Security Deletion Code">
                          Code: {p.deletionSecurityCode || 'DF-SEC'}
                        </span>
                      </div>

                      {/* Management Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <button
                          onClick={() => {
                            const res = store.renewProperty(p.id);
                            alert(res.message);
                          }}
                          className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-xl font-bold text-[11px] flex items-center justify-center space-x-1.5 transition-colors"
                          title="Renew validity for another 15 days"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Renew (+15 Days)</span>
                        </button>

                        <button
                          onClick={() => {
                            setPropertyToDelete(p);
                            setIsDeleteModalOpen(true);
                          }}
                          className="px-3 py-2 bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 rounded-xl font-bold text-[11px] flex items-center justify-center space-x-1.5 transition-colors"
                          title="Move to Recycle Bin with secret security code"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Listing</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RECYCLE BIN TAB */}
      {activeTab === 'recycle_bin' && (
        <div className="space-y-4">
          
          {/* Recycle Bin Policy Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-amber-400 text-sm">
              <Info className="w-5 h-5 shrink-0" />
              <span>Recycle Bin (کچرا دان) — 15 Days Erasure Window</span>
            </div>
            <p className="text-[11px] text-amber-100/90 leading-relaxed">
              Listings in your Recycle Bin are hidden from the public portal. You have <strong>15 days</strong> from deletion/expiry to click <strong>"Restore Listing"</strong> and reactivate them. Items remaining after 15 days are permanently auto-erased.
            </p>
          </div>

          {recycleBinProps.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-2">
              <Trash2 className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">Your Recycle Bin is Empty</h3>
              <p className="text-xs text-slate-400">Deleted or expired listings will appear here for 15 days before permanent cleanup.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recycleBinProps.map(p => {
                const deletedDate = p.deletedAt ? new Date(p.deletedAt) : new Date();
                const permExpiryDate = new Date(deletedDate.getTime() + 15 * 24 * 60 * 60 * 1000);
                const daysUntilErase = Math.max(0, Math.ceil((permExpiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

                return (
                  <div key={p.id} className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3 relative flex flex-col justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=300'}
                        alt={p.title}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0 opacity-75 grayscale group-hover:grayscale-0 transition-all"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                          In Recycle Bin
                        </span>
                        <h4 className="font-bold text-white text-xs truncate mt-1">{p.title}</h4>
                        <p className="text-[11px] font-extrabold text-orange-400">{p.priceFormatted}</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Secret Security Code:</span>
                        <span className="font-mono text-amber-400 font-bold">{p.deletionSecurityCode || 'DF-SEC'}</span>
                      </div>
                      <div className="flex justify-between text-red-400 font-bold">
                        <span>Permanent Erasure In:</span>
                        <span>{daysUntilErase} days ({permExpiryDate.toLocaleDateString()})</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          const res = store.restoreFromRecycleBin(p.id);
                          alert(res.message);
                        }}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] flex items-center justify-center space-x-1 transition-colors shadow"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Listing</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to PERMANENTLY erase "${p.title}"? This cannot be undone!`)) {
                            store.permanentlyDeleteProperty(p.id);
                            alert('Listing permanently erased!');
                          }
                        }}
                        className="px-3 py-2 bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white font-bold rounded-xl text-[11px] flex items-center justify-center space-x-1 border border-red-500/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Erase Now</span>
                      </button>
                    </div>
                  </div>
                );
              })}
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

              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div>
                  {b.buyerId === currentUser.id ? (
                    /* Buyer View */
                    <>
                      {b.paymentStatus === 'escrow_held' && (
                        <button
                          onClick={() => {
                            store.releaseEscrow(b.id);
                            alert(`Escrow release requested for ${b.propertyTitle}. Super Admin will verify and perform final payout disbursement.`);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1 shadow-md"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Authorize & Request Escrow Release to Seller</span>
                        </button>
                      )}
                      {b.paymentStatus === ('release_requested' as any) && (
                        <span className="text-amber-400 font-bold text-[11px] flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5" /> Release Requested — Awaiting Admin Audit & Disbursement
                        </span>
                      )}
                      {b.paymentStatus === 'released' && (
                        <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Escrow Released & Disbursed to Seller
                        </span>
                      )}
                    </>
                  ) : (
                    /* Seller View */
                    <>
                      {b.paymentStatus === 'escrow_held' && (
                        <span className="text-blue-400 font-bold text-[11px] flex items-center gap-1 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Escrow Vault Secured (Awaiting Buyer Approval)
                        </span>
                      )}
                      {b.paymentStatus === ('release_requested' as any) && (
                        <span className="text-amber-400 font-bold text-[11px] flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5" /> Buyer Approved Release — Pending Admin Disbursement
                        </span>
                      )}
                      {b.paymentStatus === 'released' && (
                        <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Escrow Funds Disbursed to Your Account
                        </span>
                      )}
                    </>
                  )}
                </div>

                <button
                  onClick={() => {
                    alert(`Opening Government of Pakistan E-Stamp Certified Agreement (Bayana) for ${b.propertyTitle}`);
                  }}
                  className="bg-slate-900 border border-orange-500/40 hover:bg-orange-500 text-orange-400 hover:text-white px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Stamp Paper Agreement</span>
                </button>
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

      {/* Field File Verification Tasks (Bounty Wallet) */}
      {activeTab === 'tasks' && (
        <div className="space-y-4 text-xs">
          {currentUser.role === 'user' ? (
            /* Regular User View: Upgrade & KYC Prompt */
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/20 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="max-w-xl mx-auto space-y-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Verified Agent Exclusive Feature
                </span>
                <h3 className="text-lg font-black text-white">
                  Become a Verified DealFast Agent to Earn On-Ground Bounties
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Field verification tasks (plot physical checks, RDA/CDA NOC verifications, and owner CNIC match) pay <strong className="text-amber-400">PKR 3,000 to PKR 10,000</strong> per completed report. Only certified agents can accept field tasks.
                </p>
              </div>

              {/* 3 Step Process */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-black text-orange-400">01. Submit CNIC</span>
                  <p className="text-[11px] text-slate-400 mt-1">Upload clear CNIC front & back images in your KYC tab.</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-black text-amber-400">02. Office Address</span>
                  <p className="text-[11px] text-slate-400 mt-1">Provide your active real estate agency / office details.</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-black text-emerald-400">03. Earn Bounties</span>
                  <p className="text-[11px] text-slate-400 mt-1">Accept local verification tasks & get paid directly to bank.</p>
                </div>
              </div>

              <div className="pt-2 flex justify-center space-x-3">
                <button
                  onClick={() => setActiveTab('kyc')}
                  className="gradient-btn text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 flex items-center space-x-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Start KYC & Apply for Agent Verification</span>
                </button>
              </div>
            </div>
          ) : isAgencyOrBuilder ? (
            /* Agency / Builder View: Manage & Post Bounties */
            <>
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-white text-sm flex items-center">
                    <FileCheck className="w-4 h-4 text-orange-400 mr-2" /> Agency Bounty Management & Field Agent Recruitment
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Post property mandates and pre-funded Escrow Bounties. Field agents stake security deposits and conduct on-ground site checks for your agency.
                  </p>
                </div>
                <button
                  onClick={() => setIsJobPostModalOpen(true)}
                  className="gradient-btn text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0 hover:scale-105 transition-transform"
                >
                  + Post Agent Bounty
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: 'agency-task-1',
                    title: 'Verify File # 1042 - Bahria Town Islamabad Phase 8',
                    bounty: 'PKR 3,000 Escrow Funded',
                    city: 'Islamabad',
                    deadline: '24 Hours',
                    applicants: 3,
                    status: 'Open for Applicants'
                  },
                  {
                    id: 'agency-task-2',
                    title: 'DHA Lahore Phase 6 Sector J - Site Photo & Registry Verification',
                    bounty: 'PKR 5,000 Escrow Funded',
                    city: 'Lahore',
                    deadline: '12 Hours',
                    applicants: 5,
                    status: 'Agent Working (Proof Pending Review)'
                  }
                ].map(task => (
                  <div key={task.id} className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white">{task.title}</h4>
                        <p className="text-[10px] text-slate-400">City: {task.city} • Status: <span className="text-amber-400 font-bold">{task.status}</span></p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold">
                        {task.bounty}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400 font-medium">
                        👥 {task.applicants} Agents Applied / Staked
                      </span>
                      <button
                        onClick={() => alert(`Reviewing agent milestone submissions for ${task.title}`)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl font-bold transition-all"
                      >
                        Review Submissions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Field Agent View: Available Bounties to Earn Money */
            <>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-white text-sm flex items-center">
                    <FileCheck className="w-4 h-4 text-emerald-400 mr-2" /> On-Ground Agency Bounties & Paid Site Tasks
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Claim property inspection tasks posted by verified agencies, stake security deposit, submit site proof photos, and earn instant escrow payouts!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: 'task-1',
                    title: 'Verify File # 1042 - Bahria Town Islamabad Phase 8',
                    agency: 'Royal Estate & Marketing',
                    bounty: 'PKR 3,000',
                    city: 'Islamabad',
                    deadline: '24 Hours',
                    status: 'Available'
                  },
                  {
                    id: 'task-2',
                    title: 'DHA Lahore Phase 6 Sector J - Site Photo Verification',
                    agency: 'Titanium Group Pakistan',
                    bounty: 'PKR 5,000',
                    city: 'Lahore',
                    deadline: '12 Hours',
                    status: 'In Progress'
                  }
                ].map(task => (
                  <div key={task.id} className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white">{task.title}</h4>
                        <p className="text-[10px] text-slate-400">Posted by {task.agency} • {task.city}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold">
                        {task.bounty}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                      <span className="text-amber-400 font-bold flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" /> Deadline: {task.deadline}
                      </span>
                      <button
                        onClick={() => alert(`Task ${task.title} accepted! Stake PKR 500 deposit & submit ground photos.`)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20"
                      >
                        Accept Task & Stake
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'kyc' && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 max-w-xl mx-auto space-y-6 text-xs">
          
          {/* Automatic Instant NADRA Verification Box */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/40 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
                <Fingerprint className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>Automated NADRA E-Sahulat Biometric Engine</span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Instant Pass
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300">
                  Verify 13-digit Smart CNIC, citizen family tree, and liveness biometric match in 30 seconds automatically!
                </p>
              </div>
            </div>

            {currentUser.kycStatus === 'verified' ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Account Verified via NADRA E-Sahulat Verisys</span>
                </div>
                <button
                  onClick={() => setIsNadraModalOpen(true)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition-colors"
                >
                  View Pass / Re-verify
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsNadraModalOpen(true)}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Start Automatic NADRA Biometric Verification</span>
                <Zap className="w-3.5 h-3.5 text-amber-300" />
              </button>
            )}
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-sm font-bold text-white flex items-center mb-2">
              <ShieldCheck className="w-5 h-5 text-amber-400 mr-2" /> 
              {isAgencyOrBuilder 
                ? 'Agency Corporate SECP & FBR NTN Document Submission' 
                : isAgent 
                ? 'Field Agent Document Submission (Manual Fallback)' 
                : 'Manual Document Verification'}
            </h3>
            <p className="text-slate-400 leading-relaxed mb-4">
              {isAgencyOrBuilder 
                ? 'Upload SECP Registration Certificate / FBR NTN Tax document and Principal CNIC for manual corporate inspection by DealFast Admin.' 
                : 'If you prefer manual review instead of instant NADRA automated verification, upload your document scans below.'}
            </p>

            <form onSubmit={handleKYCSubmit} className="space-y-4">
              {isAgencyOrBuilder && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    FBR NTN / SECP License Registration Number
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

              {isAgencyOrBuilder && (
                <ImageUpload
                  label="SECP Registration Certificate / FBR NTN Document Upload"
                  multiple={false}
                  onUploadComplete={urls => setSecpDoc(urls[0] || '')}
                />
              )}

              <ImageUpload
                label={isAgencyOrBuilder ? "Agency Principal / Owner CNIC Front Image" : "CNIC Front Image Upload"}
                multiple={false}
                onUploadComplete={urls => setCnicFront(urls[0] || '')}
              />
              <ImageUpload
                label={isAgencyOrBuilder ? "Agency Principal / Owner CNIC Back Image" : "CNIC Back Image Upload"}
                multiple={false}
                onUploadComplete={urls => setCnicBack(urls[0] || '')}
              />

              <button type="submit" className="w-full gradient-btn text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20">
                {isAgencyOrBuilder ? 'Submit Agency Documents for SECP Verification' : 'Submit Manual Scans to Admin'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NADRA Biometric Modal */}
      <NadraBiometricModal
        isOpen={isNadraModalOpen}
        onClose={() => setIsNadraModalOpen(false)}
        targetRole={currentUser.role === 'agent' || currentUser.role === 'agency' || currentUser.role === 'builder' ? currentUser.role : 'user'}
      />

      {/* Agency Job Post Modal */}
      <JobPostModal
        isOpen={isJobPostModalOpen}
        onClose={() => setIsJobPostModalOpen(false)}
        onSuccess={() => setIsJobPostModalOpen(false)}
      />

      {/* Delete Property Modal with Secret Security Code */}
      <DeletePropertyModal
        isOpen={isDeleteModalOpen}
        property={propertyToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPropertyToDelete(null);
        }}
        onSuccess={() => {
          setIsDeleteModalOpen(false);
          setPropertyToDelete(null);
        }}
      />

    </div>
  );
};
