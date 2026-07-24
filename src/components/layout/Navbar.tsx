import React, { useState } from 'react';
import {
  Building2,
  Search,
  PlusCircle,
  Bell,
  MessageSquare,
  ShieldCheck,
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
  HelpCircle,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { UserRole } from '../../types';
import { store } from '../../lib/store';

interface NavbarProps {
  currentRole: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenListingModal: () => void;
  onOpenChat: () => void;
  onOpenGuide: () => void;
  onOpenAiAssistant: () => void;
  onOpenAuth?: () => void;
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
  onOpenAiAssistant,
  onOpenAuth,
  unreadNotifsCount,
  unreadChatCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const roles: { role: UserRole; label: string; badge: string }[] = [
    { role: 'guest', label: 'Guest', badge: 'View Only' },
    { role: 'user', label: 'User', badge: 'Basic' },
    { role: 'agent', label: 'Agent', badge: 'Verified Pro' },
    { role: 'agency', label: 'Agency', badge: 'Agency Hub' },
    { role: 'builder', label: 'Builder', badge: 'Developer' },
    { role: 'admin', label: 'Admin', badge: 'Full Control' }
  ];

  const handleRoleChange = (role: UserRole) => {
    store.switchRole(role);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-800/80 bg-[#0a0e1a]/90 backdrop-blur-xl">
      {/* Top Banner: Interactive Role Switcher & Escrow Guarantee */}
      <div className="bg-slate-950/80 border-b border-slate-800/50 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-3 h-3 mr-1 text-amber-400" /> 100% Escrow Guarantee
            </span>
            <span className="hidden sm:inline text-slate-400">
              Pakistani Real Estate Platform with WebRTC Calls & Instant Bookings
            </span>
          </div>

          {/* Quick Role Switcher Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto py-0.5 no-scrollbar">
            <span className="text-[11px] font-medium text-slate-400 mr-1 hidden md:inline">Test Role:</span>
            {roles.map(r => {
              const active = currentRole === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => handleRoleChange(r.role)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-sm'
                      : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-orange-500/20">
              <div className="w-full h-full bg-[#0a0e1a] rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight gradient-text">
                Deal<span className="text-white">.pk</span>
              </span>
              <span className="block text-[10px] tracking-wider text-slate-400 font-medium -mt-1 uppercase">
                Real Estate Escrow
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { id: 'home', label: 'Home' },
              { id: 'properties', label: 'Properties' },
              { id: 'projects', label: 'Mega Projects' },
              { id: 'agencies', label: 'Agencies' },
              { id: 'builders', label: 'Builders' },
              { id: 'agents', label: 'Agents' },
              { id: 'blog', label: 'Market Guides' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* AI Real Estate Assistant button */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600/20 to-orange-600/20 text-purple-300 border border-purple-500/30 hover:border-purple-400/60 transition-all shadow-sm"
              title="Ask Deal.pk AI Property Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span>AI Advisor</span>
            </button>

            {/* Help / Guide */}
            <button
              onClick={onOpenGuide}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Platform User Guide & Escrow FAQ"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Chat button */}
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

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-[#0a0e1a]" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 glass-card rounded-xl shadow-2xl p-4 border border-slate-700/80 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="text-sm font-bold text-white flex items-center">
                      <Bell className="w-4 h-4 mr-1.5 text-orange-400" /> Notifications
                    </h4>
                    <button
                      onClick={() => store.clearAllNotifications()}
                      className="text-[11px] text-slate-400 hover:text-orange-400"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto py-2">
                    {store.notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No new notifications</p>
                    ) : (
                      store.notifications.map(n => (
                        <div key={n.id} className="py-2.5 text-xs">
                          <p className="font-semibold text-slate-200">{n.title}</p>
                          <p className="text-slate-400 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">{n.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* List Property + Button */}
            {currentRole !== 'guest' ? (
              <button
                onClick={onOpenListingModal}
                className="flex items-center space-x-1.5 gradient-btn text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all transform hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List Property</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (onOpenAuth) onOpenAuth();
                  else handleRoleChange('user');
                }}
                className="gradient-btn text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
              >
                Sign In / Register
              </button>
            )}

            {/* User Dashboard / Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
                  {store.currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-slate-200 leading-tight max-w-[100px] truncate">
                    {store.currentUser.name}
                  </div>
                  <div className="text-[10px] text-orange-400 capitalize font-medium leading-none mt-0.5">
                    {store.currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-2xl p-2 border border-slate-700/80 z-50">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs font-bold text-white">{store.currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{store.currentUser.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 capitalize">
                      Role: {store.currentUser.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (currentRole === 'admin') setActiveTab('admin');
                      else setActiveTab('dashboard');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg flex items-center space-x-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-orange-400" />
                    <span>{currentRole === 'admin' ? 'Admin Control Center' : 'My Dashboard'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('favorites');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Saved Wishlist ({store.favorites.length})</span>
                  </button>

                  <div className="border-t border-slate-800 my-1 pt-1">
                    <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Role</p>
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
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              onClick={onOpenChat}
              className="relative p-2 rounded-lg text-slate-300 bg-slate-900 border border-slate-800"
            >
              <MessageSquare className="w-5 h-5 text-orange-400" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden glass-card border-t border-slate-800 p-4 space-y-3 bg-[#0a0e1a]/95">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800">
            {[
              { id: 'home', label: 'Home' },
              { id: 'properties', label: 'Properties' },
              { id: 'projects', label: 'Mega Projects' },
              { id: 'agencies', label: 'Agencies' },
              { id: 'builders', label: 'Builders' },
              { id: 'agents', label: 'Agents' },
              { id: 'blog', label: 'Guides' },
              { id: 'dashboard', label: 'Dashboard' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold text-center ${
                  activeTab === item.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                onOpenListingModal();
                setMobileMenuOpen(false);
              }}
              className="w-full gradient-btn text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Property Now</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
