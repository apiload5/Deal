import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Search,
  PlusCircle,
  Bell,
  MessageSquare,
  ShieldCheck,
  Fingerprint,
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
  HelpCircle,
  Download,
  PhoneCall,
  CheckCircle2,
  FileText,
  LogOut,
  UserCheck,
  Heart,
  Calendar,
  Wallet,
  Building,
  Users,
  Briefcase,
  Map,
  BookOpen,
  Plus,
  Compass,
  Globe,
  Layers
} from 'lucide-react';
import { UserRole } from '../../types';
import { store } from '../../lib/store';
import { DealLogo } from '../common/DealLogo';

interface NavbarProps {
  currentRole: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenListingModal: () => void;
  onOpenChat: () => void;
  onOpenGuide: (topic?: string) => void;
  onOpenFeatures?: () => void;
  onOpenRoleGuide?: () => void;
  onOpenProfile?: () => void;
  onOpenKYC?: () => void;
  onOpenNadraVerification?: () => void;
  onOpenWallet?: () => void;
  onOpenOverseasDesk?: () => void;
  onOpenAuth?: () => void;
  onInstallPwa?: () => void;
  unreadNotifsCount: number;
  unreadChatCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  activeTab,
  setActiveTab,
  onOpenListingModal,
  onOpenChat,
  onOpenGuide,
  onOpenFeatures,
  onOpenRoleGuide,
  onOpenProfile,
  onOpenKYC,
  onOpenNadraVerification,
  onOpenWallet,
  onOpenOverseasDesk,
  onOpenAuth,
  onInstallPwa,
  unreadNotifsCount,
  unreadChatCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        notifRef.current &&
        !notifRef.current.contains(target) &&
        mobileNotifRef.current &&
        !mobileNotifRef.current.contains(target)
      ) {
        setNotifDropdownOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(target)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const user = store.currentUser;

  useEffect(() => {
    if (user && user.id && user.id !== 'guest' && user.id !== 'user-guest' && user.id !== 'user-public') {
      setMobileMenuOpen(false);
    }
  }, [user?.id]);

  const roles: { role: UserRole; label: string; badge: string }[] = [
    { role: 'user', label: 'User / Member', badge: 'Public' },
    { role: 'agent', label: 'Verified Agent', badge: 'Pro' },
    { role: 'agency', label: 'Real Estate Agency', badge: 'Agency' },
    { role: 'builder', label: 'Property Builder', badge: 'Developer' },
    { role: 'marketing_company', label: 'Marketing Company', badge: 'Marketing' }
  ];

  const handleRoleChange = (role: UserRole) => {
    if (isGuestUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    const res = store.switchRole(role);
    if (!res.success) {
      if (res.requiresKYC) {
        alert(res.message || 'KYC Verification Required: Please complete 13-Digit Smart CNIC Verification in your Profile before switching roles.');
        if (onOpenProfile) onOpenProfile();
      } else if (res.message) {
        alert(res.message);
      }
    } else {
      setUserDropdownOpen(false);
    }
  };

  const handleListPropertyClick = () => {
    if (isGuestUser) {
      if (onOpenAuth) onOpenAuth();
    } else {
      onOpenListingModal();
    }
  };

  const isGuestUser = !user || user.role === 'guest' || user.id === 'guest' || user.id === 'user-public' || user.id === 'user-guest' || currentRole === 'guest';
  
  const userNotifications = (store.notifications || []).filter(n => {
    if (isGuestUser) {
      return n.userId === 'all' || n.userId === 'guest';
    }
    return !n.userId || n.userId === 'all' || n.userId === user.id;
  });
  const userWallet = store.getUserWallet();
  const userFavoritesCount = store.favorites.length;
  const userBookingsCount = store.bookings.filter(b => b.buyerId === user.id).length;
  const userPropertiesCount = store.properties.filter(p => p.userId === user.id).length;

  const getRoleBadge = (r: UserRole) => {
    if (isGuestUser) {
      return { label: 'Visitor', bg: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
    switch (r) {
      case 'agent':
        return { label: '⭐ Verified Agent', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'agency':
        return { label: '🏢 Real Estate Agency', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
      case 'builder':
        return { label: '🏗️ Property Builder', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'marketing_company':
        return { label: '🚀 Marketing Company', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'admin':
        return { label: '🔐 Super Admin', bg: 'bg-red-500/20 text-red-300 border-red-500/40' };
      default:
        return { label: '👤 Member', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
    }
  };

  const currentRoleBadge = getRoleBadge(currentRole);

  const handleDrawerSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (drawerSearch.trim()) {
      setActiveTab('properties');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full max-w-full glass-header bg-[#080c16]/95 backdrop-blur-xl shadow-2xl">
      {/* Top Banner: Escrow Guarantee */}
      <div className="bg-slate-950 border-b border-slate-800/80 py-1 px-2 sm:px-4 text-xs w-full max-w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center space-x-1 shrink-0">
            <span className="inline-flex items-center justify-center px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] min-[380px]:text-[10px] sm:text-[11px] font-black bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 border border-amber-300 h-6 sm:h-7 shrink-0 shadow-sm leading-none whitespace-nowrap">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1 text-slate-950 shrink-0" />
              <span>100% Escrow</span>
            </span>
            <span className="hidden md:inline text-slate-300 text-[11px] font-semibold truncate">
              Pakistan's Premier Escrow Property Network
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[10px] sm:text-[11px] shrink-0 max-w-full">
            {onInstallPwa && (
              <button
                onClick={onInstallPwa}
                className="inline-flex items-center justify-center gap-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white border border-amber-300/40 px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all h-6 sm:h-7 shrink-0 whitespace-nowrap shadow-md shadow-orange-950/50 leading-none"
              >
                <Download className="w-3 h-3 text-white shrink-0" />
                <span>Install App</span>
              </button>
            )}
            {onOpenOverseasDesk && (
              <button
                onClick={onOpenOverseasDesk}
                className="hidden sm:inline-flex items-center justify-center gap-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all h-6 sm:h-7 shrink-0 whitespace-nowrap shadow-md shadow-emerald-950/50 leading-none"
              >
                <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-100 shrink-0" />
                <span>Overseas Desk</span>
              </button>
            )}
            {onOpenRoleGuide && (
              <button
                onClick={onOpenRoleGuide}
                className="hidden md:inline-flex items-center justify-center gap-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:to-purple-500 text-white border border-purple-400/40 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all h-6 sm:h-7 shrink-0 whitespace-nowrap shadow-md shadow-purple-950/50 leading-none"
                title="Explore Roles Capabilities & Workflow Guide"
              >
                <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-100 shrink-0" />
                <span>Role Guide</span>
              </button>
            )}
            {onOpenFeatures && (
              <button
                onClick={onOpenFeatures}
                className="hidden lg:inline-flex items-center justify-center gap-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/40 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all h-6 sm:h-7 shrink-0 whitespace-nowrap shadow-md shadow-blue-950/50 leading-none"
              >
                <Layers className="w-3 h-3 text-cyan-100 shrink-0" />
                <span>Features</span>
              </button>
            )}
            <button
              onClick={() => onOpenGuide('faq-general')}
              className="inline-flex items-center justify-center gap-1 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white border border-rose-400/40 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all h-6 sm:h-7 shrink-0 whitespace-nowrap shadow-md shadow-rose-950/50 leading-none"
            >
              <HelpCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-200 shrink-0" />
              <span>FAQ<span className="hidden sm:inline"> & Manual</span></span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1">
          
          {/* Brand Logo */}
          <div className="shrink-0 flex items-center">
            <DealLogo onClick={() => setActiveTab('properties')} variant="orange" size="sm" />
          </div>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { id: 'properties', label: 'Home' },
              { id: 'projects', label: 'Mega Projects' },
              { id: 'hiring', label: 'Protected Hiring' },
              { id: 'map', label: 'Map Search' },
              { id: 'agencies', label: 'Agencies' },
              { id: 'builders', label: 'Builders' },
              { id: 'agents', label: 'Agents' },
              { id: 'blog', label: 'Guides' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === item.id
                    ? 'text-white bg-gradient-to-r from-orange-500/25 via-amber-500/20 to-orange-600/15 border border-orange-500/40 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action Icons Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            
            {/* Chat */}
            <button
              onClick={onOpenChat}
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Real-time Chat & WebRTC Calls"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadChatCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-[#0a0e1a] animate-pulse" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 glass-card rounded-xl shadow-2xl p-4 border border-slate-700/80 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="text-sm font-bold text-white flex items-center">
                      <Bell className="w-4 h-4 mr-1.5 text-orange-400" /> Notifications
                      {unreadNotifsCount > 0 && (
                        <span className="ml-2 text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold">
                          {unreadNotifsCount} new
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {unreadNotifsCount > 0 && (
                        <button
                          onClick={() => store.markAllNotificationsAsRead()}
                          className="text-[11px] text-orange-400 hover:text-orange-300 font-medium"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => store.clearAllNotifications()}
                        className="text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto py-2">
                    {userNotifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No new notifications</p>
                    ) : (
                      userNotifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.isRead) store.markNotificationAsRead(n.id);
                          }}
                          className={`py-2.5 px-2 rounded-lg text-xs transition-colors cursor-pointer ${
                            !n.isRead ? 'bg-orange-500/10 border border-orange-500/20' : 'hover:bg-slate-800/40 opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className={`font-semibold ${!n.isRead ? 'text-orange-300' : 'text-slate-200'}`}>{n.title}</p>
                            {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                          </div>
                          <p className="text-slate-400 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">{n.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Add Property Button */}
            <button
              onClick={handleListPropertyClick}
              className="flex items-center space-x-1.5 gradient-btn text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all transform hover:scale-[1.02] border border-amber-400/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ List Property</span>
            </button>

            {/* User Account Dropdown */}
            {isGuestUser ? (
              <button
                onClick={onOpenAuth}
                className="bg-gradient-to-r from-slate-800 via-slate-800/90 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700/80 shadow-md"
              >
                Sign In / Register
              </button>
            ) : (
              <div ref={userDropdownRef} className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-bold text-slate-200 leading-tight max-w-[100px] truncate">
                      {user.name || 'User'}
                    </div>
                    <div className="text-[10px] text-orange-400 capitalize font-medium leading-none mt-0.5">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-2xl p-2 border border-slate-700/80 z-50">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-bold text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 capitalize">
                        Role: {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (onOpenProfile) onOpenProfile();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-orange-400 hover:bg-slate-800 rounded-lg flex items-center space-x-2"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                      <span>Edit User Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onOpenKYC) onOpenKYC();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-slate-800 rounded-lg flex items-center space-x-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>CNIC & SECP KYC Portal</span>
                    </button>

                    {onOpenNadraVerification && (
                      <button
                        onClick={() => {
                          if (onOpenNadraVerification) onOpenNadraVerification();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg flex items-center space-x-2"
                      >
                        <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                        <span>NADRA Biometric Verification</span>
                      </button>
                    )}

                    {onOpenWallet && (
                      <button
                        onClick={() => {
                          onOpenWallet();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-amber-400 hover:bg-slate-800 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Wallet className="w-3.5 h-3.5 text-amber-400" />
                          <span>Escrow Wallet</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          PKR {userWallet.availableBalance.toLocaleString()}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg flex items-center space-x-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('properties');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg flex items-center space-x-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Saved Wishlist ({store.favorites.length})</span>
                    </button>

                    <div className="border-t border-slate-800 my-1 pt-1">
                      <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Account Mode</p>
                      {roles.map(r => (
                        <button
                          key={r.role}
                          onClick={() => handleRoleChange(r.role)}
                          className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                            currentRole === r.role ? 'text-orange-400 font-bold bg-orange-500/10' : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>{r.label}</span>
                          <span className="text-[10px] text-slate-500">{r.badge}</span>
                        </button>
                      ))}

                      <button
                        onClick={() => {
                          store.logoutUser();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg flex items-center space-x-2 mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Mobile Action Controls (< lg) */}
          <div className="flex lg:hidden items-center space-x-1.5 shrink-0">
            {/* Chat Icon */}
            <button
              onClick={onOpenChat}
              className="relative p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Real-time Chat & Calls"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* Notifications Icon */}
            <div ref={mobileNotifRef} className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-[#0a0e1a]" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-16px)] sm:w-80 glass-card rounded-xl shadow-2xl p-4 border border-slate-700/80 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="text-sm font-bold text-white flex items-center">
                      <Bell className="w-4 h-4 mr-1.5 text-orange-400" /> Notifications
                      {unreadNotifsCount > 0 && (
                        <span className="ml-2 text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold">
                          {unreadNotifsCount} new
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {unreadNotifsCount > 0 && (
                        <button
                          onClick={() => store.markAllNotificationsAsRead()}
                          className="text-[11px] text-orange-400 hover:text-orange-300 font-medium"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => store.clearAllNotifications()}
                        className="text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto py-2">
                    {userNotifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No notifications</p>
                    ) : (
                      userNotifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.isRead) store.markNotificationAsRead(n.id);
                          }}
                          className={`py-2.5 px-2 rounded-lg text-xs transition-colors cursor-pointer ${
                            !n.isRead ? 'bg-orange-500/10 border border-orange-500/20' : 'hover:bg-slate-800/40 opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className={`font-semibold ${!n.isRead ? 'text-orange-300' : 'text-slate-200'}`}>{n.title}</p>
                            {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                          </div>
                          <p className="text-slate-400 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">{n.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* + List Property Button */}
            <button
              onClick={handleListPropertyClick}
              className="inline-flex items-center justify-center gap-1 gradient-btn text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold shadow-md shrink-0 leading-none whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span>+ List</span>
            </button>

            {/* Hamburger / Close Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800 shrink-0 inline-flex items-center justify-center"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-orange-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Professional Full-Screen Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-[#0a0e1a] flex flex-col h-screen w-screen overflow-hidden animate-in fade-in duration-150">
          
          {/* Top Bar inside Drawer */}
          <div className="sticky top-0 z-20 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <DealLogo onClick={() => { setActiveTab('properties'); setMobileMenuOpen(false); }} variant="orange" size="sm" />
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${currentRoleBadge.bg}`}>
                {currentRoleBadge.label}
              </span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center justify-center space-x-1.5"
              aria-label="Close menu"
            >
              <span className="text-xs font-bold text-slate-400">Close</span>
              <X className="w-5 h-5 text-orange-400" />
            </button>
          </div>

          {/* Drawer Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pb-20">
            
            {/* User Profile Summary */}
            {!isGuestUser ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      user.name ? user.name.charAt(0) : 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{user.name || 'Verified Member'}</h3>
                    {user.email && <p className="text-xs text-slate-400 truncate">{user.email}</p>}
                    <p className="text-[11px] text-orange-400 font-bold mt-0.5">
                      Wallet: PKR {userWallet.availableBalance.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActiveTab('dashboard');
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>My Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenProfile) onOpenProfile();
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
                <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center mx-auto text-orange-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Welcome to DealFast Escrow</h3>
                  <p className="text-xs text-slate-400">Sign in to manage listings, escrow wallet, and live agent chats</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAuth) onOpenAuth();
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-orange-500/20 transition-all"
                >
                  Sign In / Create Account
                </button>
              </div>
            )}

            {/* Core Navigation Links */}
            <div className="space-y-1 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2">
              <p className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>NAVIGATION</span>
                {onOpenOverseasDesk && (
                  <button
                    onClick={() => {
                      onOpenOverseasDesk();
                      setMobileMenuOpen(false);
                    }}
                    className="text-emerald-400 font-bold hover:underline flex items-center text-[11px]"
                  >
                    <Globe className="w-3 h-3 mr-1 text-emerald-400" />
                    <span>Overseas Desk</span>
                  </button>
                )}
              </p>

              {[
                { id: 'properties', label: 'Home Marketplace', desc: 'Main Marketplace & Listings', icon: '🏠' },
                { id: 'projects', label: 'Off-Plan Projects', desc: 'Mega Developments', icon: '🏗️' },
                { id: 'hiring', label: 'Protected Hiring & Bounties', desc: 'Escrow Freelance Jobs', icon: '💰' },
                { id: 'map', label: 'Interactive Map Search', desc: 'Explore Sector Pins', icon: '🌐' },
                { id: 'agencies', label: 'Agencies Directory', desc: `${store.agencies.length} Registered`, icon: '🏢' },
                { id: 'builders', label: 'Builders & Developers', desc: `${store.builders.length} Companies`, icon: '🏗️' },
                { id: 'agents', label: 'Verified Agents', desc: `${store.agents.length} Experts`, icon: '🧑‍💼' },
                { id: 'blog', label: 'Market Guides & Tax FAQ', desc: 'Property Insights', icon: '📖' },
                ...(currentRole === 'admin' ? [{ id: 'admin', label: 'Admin Portal', desc: 'Listing Approvals, KYC & Escrow', icon: '🔐' }] : [])
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between ${
                    activeTab === item.id
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold'
                      : 'text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.desc}</div>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 -rotate-90" />
                </button>
              ))}
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleListPropertyClick();
              }}
              className="w-full gradient-btn text-white p-3.5 rounded-2xl text-sm font-black flex items-center justify-center space-x-2 shadow-xl"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ List Property Now</span>
            </button>

            {/* Sign Out */}
            {!isGuestUser && (
              <div className="pt-2 text-center">
                <button
                  onClick={() => {
                    store.logoutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="inline-flex items-center text-xs text-red-400 font-bold hover:text-red-300 bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

          </div>

        </div>
      )}
    </header>
  );
};
