'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Building2,
  Users,
  ShieldCheck,
  MapPin,
  HelpCircle,
  MessageSquare,
  PlusCircle,
  Bot,
  UserCheck,
  Star,
  ExternalLink,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/common/HeroSection';
import { PropertyGrid } from './components/properties/PropertyGrid';
import { PropertyDetailModal } from './components/properties/PropertyDetailModal';
import { PropertyFormModal } from './components/properties/PropertyFormModal';
import { BookingModal } from './components/bookings/BookingModal';
import { AgencyGrid } from './components/agencies/AgencyGrid';
import { AgencyDetailModal } from './components/agencies/AgencyDetailModal';
import { BuilderGrid } from './components/builders/BuilderGrid';
import { ProjectDetailModal } from './components/projects/ProjectDetailModal';
import { AddProjectModal } from './components/projects/AddProjectModal';
import { AgentGrid } from './components/agents/AgentGrid';
import { AgentDetailModal } from './components/agents/AgentDetailModal';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ChatDrawer } from './components/chat/ChatDrawer';
import { UserGuideModal } from './components/common/UserGuideModal';
import { PlatformFeaturesModal } from './components/common/PlatformFeaturesModal';
import { UserProfileModal } from './components/common/UserProfileModal';
import { OverseasPakistaniModal } from './components/common/OverseasPakistaniModal';
import { WalletModal } from './components/wallet/WalletModal';
import { BlogSection } from './components/blog/BlogSection';
import { AuthModal } from './components/auth/AuthModal';
import { HiringHub } from './components/hiring/HiringHub';
import { RoleGuideModal } from './components/common/RoleGuideModal';
import { MapView } from './components/common/MapView';
import { WebRTCCallModal } from './components/webrtc/WebRTCCallModal';
import { NadraBiometricModal } from './components/common/NadraBiometricModal';
import { HomePageExplanations } from './components/common/HomePageExplanations';
import { SEOMeta } from './components/common/SEOMeta';
import { store } from './lib/store';
import { Property, Agency, Builder, Project, Agent, BlogArticle, UserRole, SearchFilter } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('properties');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(store.currentUser.role);
  
  // Modals state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [selectedBuilder, setSelectedBuilder] = useState<Builder | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogArticle | null>(null);

  const [bookingProperty, setBookingProperty] = useState<Property | null>(null);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | undefined>(undefined);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideInitialTopic, setGuideInitialTopic] = useState<string | undefined>(undefined);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isRoleGuideOpen, setIsRoleGuideOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isNadraModalOpen, setIsNadraModalOpen] = useState(false);
  const [isOverseasDeskOpen, setIsOverseasDeskOpen] = useState(false);
  const [isVerificationPortalOpen, setIsVerificationPortalOpen] = useState(false);
  const [verificationInitialTab, setVerificationInitialTab] = useState<'noc' | 'fard'>('noc');
  const [verificationPrefilledSociety, setVerificationPrefilledSociety] = useState('');
  const [deferredPwaPrompt, setDeferredPwaPrompt] = useState<any>(null);

  const handleOpenVerificationPortal = (tab: 'noc' | 'fard' = 'noc', societyName: string = '') => {
    setVerificationInitialTab(tab);
    setVerificationPrefilledSociety(societyName);
    setIsVerificationPortalOpen(true);
  };
  const [showPwaBanner, setShowPwaBanner] = useState(false);

  // Listen for PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPwaPrompt(e);
      setShowPwaBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPwaPrompt) {
      deferredPwaPrompt.prompt();
      const choiceResult = await deferredPwaPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted PWA install');
      }
      setDeferredPwaPrompt(null);
      setShowPwaBanner(false);
    } else {
      alert('To install DealFast as a Mobile App on Android/Chrome:\n1. Open Chrome Menu (⋮)\n2. Tap "Add to Home screen" or "Install app"');
    }
  };

  // WebRTC Call state
  const [isCallActive, setIsCallActive] = useState(false);
  const [callAgentName, setCallAgentName] = useState('');
  const [callAgentAvatar, setCallAgentAvatar] = useState<string | undefined>(undefined);
  const [isCallVideo, setIsCallVideo] = useState(true);

  // Search Filter State
  const [searchFilters, setSearchFilters] = useState<SearchFilter>({
    city: 'All Cities',
    area: '',
    purpose: 'all',
    type: 'all',
    minPrice: 0,
    maxPrice: 1000000000,
    beds: 'any',
    baths: 'any',
    minArea: 0,
    maxArea: 100000,
    furnished: 'all',
    keyword: '',
    sortBy: 'newest'
  });
  const initialSortedProps = [...store.properties].sort((a, b) => {
    const paidValueA = (a.isFeatured ? 100000 : 0) + (a.isPremium ? 50000 : 0) + (a.views || 0);
    const paidValueB = (b.isFeatured ? 100000 : 0) + (b.isPremium ? 50000 : 0) + (b.views || 0);
    return paidValueB - paidValueA;
  });
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(initialSortedProps);

  // Sync active tab & selected listing modal with URL search query params
  useEffect(() => {
    const handleUrlRoute = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const propertyId = searchParams.get('property');
      const projectId = searchParams.get('project');
      const agencyId = searchParams.get('agency');
      const agentId = searchParams.get('agent');
      const blogId = searchParams.get('blog');
      const cityParam = searchParams.get('city');
      const tabParam = searchParams.get('tab');

      // Check deep link parameters
      if (propertyId) {
        const found = store.properties.find(p => p.id === propertyId || p.slug === propertyId);
        if (found) setSelectedProperty(found);
      }
      if (projectId) {
        const found = store.projects.find(p => p.id === projectId);
        if (found) setSelectedProject(found);
      }
      if (agencyId) {
        const found = store.agencies.find(a => a.id === agencyId);
        if (found) setSelectedAgency(found);
      }
      if (agentId) {
        const found = store.agents.find(a => a.id === agentId);
        if (found) setSelectedAgent(found);
      }
      if (blogId) {
        const found = store.blogs.find(b => b.id === blogId);
        if (found) setSelectedBlog(found);
      }

      if (cityParam) {
        setSearchFilters(prev => ({ ...prev, city: cityParam }));
      }

      const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      const rawHash = window.location.hash.replace('#', '').toLowerCase();
      const stealthPath = store.stealthAdminPath.toLowerCase();

      const isStealthMatch = rawPath === stealthPath || rawHash === stealthPath || window.location.pathname.includes(stealthPath) || rawHash.includes('dealpk-sec') || rawHash.includes('dealfastpk-sec') || rawHash.includes('dealfast-sec') || rawPath.includes('dealpk-sec') || rawPath.includes('dealfastpk-sec') || rawPath.includes('dealfast-sec') || rawHash.startsWith('dea');
      const isPublicAdminAttempt = rawPath === 'admin' || rawHash === 'admin' || window.location.pathname.startsWith('/admin');

      if (isStealthMatch) {
        setActiveTab('admin');
      } else if (isPublicAdminAttempt) {
        if (store.currentUser.role === 'admin') {
          setActiveTab('admin');
        } else {
          store.logSecurityEvent('Blocked public scan on standard /admin route (Stealth route active)', 'Unauthenticated Visitor', 'blocked');
          setActiveTab('properties');
        }
      } else if (tabParam) {
        setActiveTab(tabParam);
      } else if (rawPath === 'agencies' || rawHash === 'agencies') {
        setActiveTab('agencies');
      } else if (rawPath === 'builders' || rawHash === 'builders') {
        setActiveTab('builders');
      } else if (rawPath === 'projects' || rawHash === 'projects') {
        setActiveTab('projects');
      } else if (rawPath === 'agents' || rawHash === 'agents') {
        setActiveTab('agents');
      } else if (rawPath === 'map' || rawHash === 'map') {
        setActiveTab('map');
      } else if (rawPath === 'dashboard' || rawHash === 'dashboard') {
        setActiveTab('dashboard');
      } else if (rawPath === 'hiring' || rawHash === 'hiring') {
        setActiveTab('hiring');
      } else if (rawPath === 'blog' || rawHash === 'blog') {
        setActiveTab('blog');
      } else {
        setActiveTab('properties');
      }
    };
    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);


  // Subscribe to store updates (sync currentUserRole & properties)
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setCurrentUserRole(store.currentUser.role);
      setFilteredProperties([...(store.properties || [])].sort((a, b) => {
        const paidValueA = (a.isFeatured ? 100000 : 0) + (a.isPremium ? 50000 : 0) + (a.views || 0);
        const paidValueB = (b.isFeatured ? 100000 : 0) + (b.isPremium ? 50000 : 0) + (b.views || 0);
        return paidValueB - paidValueA;
      }));
    });
    return () => unsubscribe();
  }, []);

  // SEO & Security meta tag management
  useEffect(() => {
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    
    if (activeTab === 'admin') {
      metaRobots.setAttribute('content', 'noindex, nofollow, noarchive');
    } else {
      metaRobots.setAttribute('content', 'index, follow, max-image-preview:large');
    }
  }, [activeTab]);

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    try {
      const targetPath = tab === 'properties' ? '/' : `/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentUserRole(role);
    store.switchRole(role);
    if (role === 'admin') setActiveTab('admin');
  };

  const handleFilterSearch = (filters: SearchFilter) => {
    setSearchFilters(filters);
    let result = store.properties || [];
    if (!filters) {
      setFilteredProperties(result);
      return;
    }

    if (filters.keyword) {
      const q = filters.keyword.toLowerCase();
      result = result.filter(p => p && (
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.area && p.area.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      ));
    }
    if (filters.city && filters.city !== 'All Cities') {
      result = result.filter(p => p && p.city && p.city.toLowerCase() === filters.city.toLowerCase());
    }
    if (filters.area) {
      result = result.filter(p => p && p.area && p.area.toLowerCase() === filters.area.toLowerCase());
    }
    if (filters.purpose && filters.purpose !== 'all') {
      result = result.filter(p => p && p.purpose === filters.purpose);
    }
    if (filters.type && filters.type !== 'all') {
      result = result.filter(p => p && p.type === filters.type);
    }
    if (filters.minPrice) {
      result = result.filter(p => p && p.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
      result = result.filter(p => p && p.price <= filters.maxPrice);
    }
    if (filters.beds && filters.beds !== 'any') {
      result = result.filter(p => p && p.beds >= Number(filters.beds));
    }
    if (filters.baths && filters.baths !== 'any') {
      result = result.filter(p => p && p.baths >= Number(filters.baths));
    }
    if (filters.furnished && filters.furnished !== 'all') {
      result = result.filter(p => p && p.furnished === filters.furnished);
    }

    // Strictly Paid Featured & Premium Slot Ranking Algorithm (Paid Sponsorships stay on Top)
    const sortWithFeaturedPriority = (arr: Property[], primaryCompare: (a: Property, b: Property) => number) => {
      const featured = arr.filter(p => p.isFeatured || p.isPremium).sort(primaryCompare);
      const standard = arr.filter(p => !p.isFeatured && !p.isPremium).sort(primaryCompare);
      return [...featured, ...standard];
    };

    if (filters.sortBy === 'price_low') {
      result = sortWithFeaturedPriority(result, (a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price_high') {
      result = sortWithFeaturedPriority(result, (a, b) => b.price - a.price);
    } else if (filters.sortBy === 'popular') {
      result = sortWithFeaturedPriority(result, (a, b) => (b.views || 0) - (a.views || 0));
    } else {
      // Direct Paid Listing Top Placement Engine (Paid Featured > Paid Premium > Standard)
      result = [...result].sort((a, b) => {
        const paidValueA = (a.isFeatured ? 100000 : 0) + (a.isPremium ? 50000 : 0) + (a.views || 0);
        const paidValueB = (b.isFeatured ? 100000 : 0) + (b.isPremium ? 50000 : 0) + (b.views || 0);
        return paidValueB - paidValueA;
      });
    }

    setFilteredProperties(result);
  };

  const handleResetFilters = () => {
    const defaultF: SearchFilter = {
      city: 'All Cities',
      area: '',
      purpose: 'all',
      type: 'all',
      minPrice: 0,
      maxPrice: 1000000000,
      beds: 'any',
      baths: 'any',
      minArea: 0,
      maxArea: 100000,
      furnished: 'all',
      keyword: '',
      sortBy: 'newest'
    };
    setSearchFilters(defaultF);
    setFilteredProperties(store.properties || []);
  };

  const handleRequireAuth = (action: () => void) => {
    const u = store.currentUser;
    const isGuest = !u || u.role === 'guest' || u.id === 'guest' || u.id === 'user-public' || u.id === 'user-guest';
    if (isGuest) {
      setIsAuthModalOpen(true);
    } else {
      action();
    }
  };

  const handleOpenChatWithAgent = (agentId: string, agentName: string, pId?: string, pTitle?: string) => {
    handleRequireAuth(() => {
      const room = store.getOrCreateChatRoom(agentId, agentName, pId, pTitle);
      setActiveChatRoomId(room.id);
      setIsChatOpen(true);
    });
  };

  const handleOpenGuide = (topic?: string) => {
    setGuideInitialTopic(topic);
    setIsGuideOpen(true);
  };

  const handleStartCall = (agentName: string, agentAvatar?: string, isVideo: boolean = true) => {
    handleRequireAuth(() => {
      setCallAgentName(agentName);
      setCallAgentAvatar(agentAvatar);
      setIsCallVideo(isVideo);
      setIsCallActive(true);
    });
  };

  const handleSelectProperty = (p: Property | null) => {
    setSelectedProperty(p);
    try {
      if (p) {
        window.history.pushState({}, '', `/?property=${p.id}`);
      } else {
        window.history.pushState({}, '', activeTab === 'properties' ? '/' : `/?tab=${activeTab}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectProject = (proj: Project | null) => {
    setSelectedProject(proj);
    try {
      if (proj) {
        window.history.pushState({}, '', `/?project=${proj.id}`);
      } else {
        window.history.pushState({}, '', `/?tab=projects`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectAgency = (a: Agency | null) => {
    setSelectedAgency(a);
    try {
      if (a) {
        window.history.pushState({}, '', `/?agency=${a.id}`);
      } else {
        window.history.pushState({}, '', `/?tab=agencies`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectAgent = (ag: Agent | null) => {
    setSelectedAgent(ag);
    try {
      if (ag) {
        window.history.pushState({}, '', `/?agent=${ag.id}`);
      } else {
        window.history.pushState({}, '', `/?tab=agents`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (

    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Dynamic SEO Meta Tags & Schema.org JSON-LD Structured Data */}
      <SEOMeta
        activeTab={activeTab}
        selectedProperty={selectedProperty}
        selectedProject={selectedProject}
        selectedAgency={selectedAgency}
        selectedAgent={selectedAgent}
        selectedBlog={selectedBlog}
        selectedCity={searchFilters.city}
      />

      {/* PWA App Install Banner */}

      {showPwaBanner && (
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white text-xs py-2 px-4 flex items-center justify-between shadow-xl z-50 animate-in slide-in-from-top">
          <div className="flex items-center space-x-2">
            <span className="font-black text-sm">📲 Install DealFast App</span>
            <span className="hidden sm:inline text-[11px] text-orange-100">
              Install our Android / Mobile web app directly onto your home screen for instant access & push notifications!
            </span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleInstallPwa}
              className="bg-white text-orange-600 hover:bg-orange-100 font-black px-3 py-1 rounded-lg text-xs shadow transition-colors"
            >
              Install App
            </button>
            <button
              onClick={() => setShowPwaBanner(false)}
              className="p-1 text-orange-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Primary Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={changeTab}
        currentRole={currentUserRole}
        onOpenListingModal={() => handleRequireAuth(() => setIsListingModalOpen(true))}
        onOpenGuide={handleOpenGuide}
        onOpenFeatures={() => setIsFeaturesOpen(true)}
        onOpenRoleGuide={() => setIsRoleGuideOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenChat={() => handleRequireAuth(() => setIsChatOpen(true))}
        onOpenOverseasDesk={() => setIsOverseasDeskOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onInstallPwa={handleInstallPwa}
        unreadNotifsCount={store.notifications.length}
        unreadChatCount={store.chatRooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {activeTab === 'properties' && (
          <div>
            <HeroSection
              onSearch={handleFilterSearch}
              onOpenAiAssistant={() => setIsAiOpen(true)}
              onOpenGuide={handleOpenGuide}
            />

            {/* Active Filters & Results Summary Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-white text-sm">
                    {filteredProperties.length} Verified Properties Found
                  </span>
                  <span className="text-slate-400 hidden sm:inline">• 100% Escrow Protection</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {searchFilters.city && (
                    <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 font-medium">
                      City: {searchFilters.city}
                    </span>
                  )}
                  {searchFilters.area && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium">
                      Area: {searchFilters.area}
                    </span>
                  )}
                  {searchFilters.keyword && (
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-medium">
                      Keyword: "{searchFilters.keyword}"
                    </span>
                  )}
                  {(searchFilters.city || searchFilters.area || searchFilters.keyword) && (
                    <button
                      onClick={handleResetFilters}
                      className="text-slate-400 hover:text-white underline font-medium ml-1"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
              <PropertyGrid
                properties={filteredProperties}
                onSelectProperty={p => handleSelectProperty(p)}
                onOpenBookingModal={p => handleRequireAuth(() => setBookingProperty(p))}
                onOpenChatWithAgent={handleOpenChatWithAgent}
              />

              {/* Home Page Featured Agencies & Verified Agents Showcase (Zameen Style) */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center">
                      <UserCheck className="w-5 h-5 text-orange-400 mr-2" />
                      Top Verified Agencies & Agents in Pakistan
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Direct contact with licensed realtors in DHA, Bahria Town, Gulberg & Clifton
                    </p>
                  </div>
                  <button
                    onClick={() => changeTab('agents')}
                    className="text-orange-400 hover:text-orange-300 text-xs font-bold flex items-center space-x-1"
                  >
                    <span>View All Agents</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {store.agents.slice(0, 4).map(ag => (
                    <div
                      key={ag.id}
                      onClick={() => handleSelectAgent(ag)}
                      className="bg-slate-900 border border-slate-800 hover:border-orange-500/50 p-4 rounded-2xl cursor-pointer transition-all space-y-3 group"
                    >
                      <div className="flex items-center space-x-3">
                        <img src={ag.avatar} alt={ag.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-orange-500/30 group-hover:ring-orange-500" />
                        <div>
                          <h4 className="font-bold text-white text-xs line-clamp-1 group-hover:text-orange-400">{ag.name}</h4>
                          <p className="text-[10px] text-slate-400">{ag.city}</p>
                          <span className="text-[10px] text-orange-400 font-bold">{ag.agencyName}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800/60">
                        <span>{ag.activeListings} Listings</span>
                        <span className="text-amber-400 font-bold flex items-center">
                          <Star className="w-3 h-3 fill-amber-400 mr-0.5" /> {ag.rating}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Preview Section */}
              <div className="pt-2">
                <MapView
                  properties={store.properties}
                  onSelectProperty={p => handleSelectProperty(p)}
                />
              </div>

              {/* On-Page Detailed Instructions & Process Explanations */}
              <HomePageExplanations
                onOpenGuide={(topic) => handleOpenGuide(topic)}
                onOpenNadraVerification={() => setIsNadraModalOpen(true)}
              />

              {/* Real Estate Market Guides Section */}
              <BlogSection />
            </div>
          </div>
        )}

        {activeTab === 'agencies' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AgencyGrid
              agencies={store.agencies.filter(a => a.status === 'approved' || !a.status || a.verified)}
              onSelectAgency={a => handleSelectAgency(a)}
            />
          </div>
        )}

        {activeTab === 'hiring' && (
          <HiringHub onOpenAuth={() => setIsAuthModalOpen(true)} />
        )}

        {activeTab === 'builders' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BuilderGrid
              builders={store.builders.filter(b => b.status === 'approved' || !b.status || b.verified)}
              onSelectBuilder={b => setSelectedBuilder(b)}
            />
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AgentGrid
              agents={store.agents.filter(a => a.status === 'approved' || !a.status || a.verified)}
              onSelectAgent={a => handleSelectAgent(a)}
              onOpenChatWithAgent={handleOpenChatWithAgent}
            />
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BlogSection />
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center">
                    <Building2 className="w-5 h-5 text-orange-400 mr-2" />
                    Mega Urban Projects & Commercial Towers
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Exclusive high-rise towers & gated societies. Direct bookings managed by Builders & Agencies with DealFast Escrow protection.
                  </p>
                </div>

                {store.currentUser.role === 'builder' || store.currentUser.role === 'marketing_company' || store.currentUser.role === 'admin' ? (
                  <button
                    onClick={() => setIsAddProjectModalOpen(true)}
                    className="gradient-btn text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 flex items-center space-x-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Launch New Mega Project</span>
                  </button>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Mega Projects posting accessible for <strong>Builders</strong> & <strong>Marketing Companies</strong>.</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {store.projects.map(proj => (
                  <div
                    key={proj.id}
                    onClick={() => handleSelectProject(proj)}
                    className="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-orange-500/50 transition-all cursor-pointer group space-y-4"
                  >
                    <div className="h-52 w-full relative bg-slate-900">
                      <img src={proj.images[0]} alt="Proj" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-black text-white block">{proj.title}</span>
                          <span className="text-[10px] text-slate-300 font-medium">{proj.builderName} • {proj.city}</span>
                        </div>
                        <span className="text-xs font-bold text-orange-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                          {proj.startingPriceFormatted}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <MapView
              properties={store.properties}
              onSelectProperty={p => handleSelectProperty(p)}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <UserDashboard
            onOpenListingModal={() => handleRequireAuth(() => setIsListingModalOpen(true))}
            onSelectProperty={p => handleSelectProperty(p)}
            onOpenBookingModal={p => handleRequireAuth(() => setBookingProperty(p))}
            onOpenChatWithAgent={handleOpenChatWithAgent}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenWallet={() => setIsWalletOpen(true)}
            onOpenNadraVerification={() => setIsNadraModalOpen(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            onBackToWebsite={() => changeTab('properties')}
            onOpenChat={(roomId) => {
              setActiveChatRoomId(roomId);
              setIsChatOpen(true);
            }}
          />
        )}
      </main>

      {/* Global Floating Modals & Drawers */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => handleSelectProperty(null)}
        onOpenBookingModal={p => {
          handleSelectProperty(null);
          handleRequireAuth(() => setBookingProperty(p));
        }}
        onOpenChatWithAgent={handleOpenChatWithAgent}
        onStartCall={handleStartCall}
        onOpenVerificationPortal={handleOpenVerificationPortal}
      />

      <PropertyFormModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        onPropertyCreated={newP => {
          setFilteredProperties([newP, ...filteredProperties]);
          alert(`Property "${newP.title}" created successfully! Submitting for admin approval.`);
        }}
      />

      <BookingModal
        property={bookingProperty}
        isOpen={!!bookingProperty}
        onClose={() => setBookingProperty(null)}
      />

      <AgencyDetailModal
        agency={selectedAgency}
        agencyProperties={store.properties.filter(p => p.agencyName === selectedAgency?.name)}
        onClose={() => handleSelectAgency(null)}
        onSelectProperty={p => handleSelectProperty(p)}
        onOpenBookingModal={p => handleRequireAuth(() => setBookingProperty(p))}
        onOpenChatWithAgent={handleOpenChatWithAgent}
      />

      <AgentDetailModal
        agent={selectedAgent}
        onClose={() => handleSelectAgent(null)}
        onSelectProperty={p => handleSelectProperty(p)}
        onOpenChatWithAgent={handleOpenChatWithAgent}
        onStartCall={handleStartCall}
      />

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => handleSelectProject(null)}

        onOpenBookingModal={proj => {
          const dummyProp: Property = {
            id: proj.id,
            slug: proj.id,
            title: proj.title,
            description: proj.description,
            type: 'house',
            purpose: 'sale',
            price: proj.startingPrice,
            priceFormatted: proj.startingPriceFormatted,
            city: proj.city,
            area: proj.area,
            address: `${proj.area}, ${proj.city}`,
            beds: 3,
            baths: 3,
            sqft: 2000,
            furnished: 'unfurnished',
            images: proj.images,
            isPremium: true,
            isFeatured: true,
            status: 'approved',
            createdAt: '2026-07-24',
            views: 400,
            userId: 'builder-1',
            userRole: 'builder',
            ownerName: proj.builderName,
            ownerPhone: '+92 300 0000000',
            lat: 33.7,
            lng: 73.1,
            features: ['Installment Available']
          };
          setSelectedProject(null);
          handleRequireAuth(() => setBookingProperty(dummyProp));
        }}
        onOpenVerificationPortal={handleOpenVerificationPortal}
      />

      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onProjectCreated={newProj => {
          alert(`Mega Project "${newProj.title}" launched successfully!`);
        }}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        activeRoomId={activeChatRoomId}
        onStartCall={handleStartCall}
      />

      <WebRTCCallModal
        isOpen={isCallActive}
        agentName={callAgentName}
        agentAvatar={callAgentAvatar}
        isVideo={isCallVideo}
        onEndCall={() => setIsCallActive(false)}
      />

      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialTopic={guideInitialTopic}
      />

      <PlatformFeaturesModal
        isOpen={isFeaturesOpen}
        onClose={() => setIsFeaturesOpen(false)}
        onNavigateTab={(tab) => {
          if (tab === 'install') {
            handleInstallPwa();
          } else {
            changeTab(tab);
          }
        }}
      />

      <RoleGuideModal
        isOpen={isRoleGuideOpen}
        onClose={() => setIsRoleGuideOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenNadraVerification={() => setIsNadraModalOpen(true)}
      />

      <NadraBiometricModal
        isOpen={isNadraModalOpen}
        onClose={() => setIsNadraModalOpen(false)}
        onSuccess={() => {
          store.updateUserProfile({ kycStatus: 'verified', isVerified: true });
        }}
      />

      <OverseasPakistaniModal
        isOpen={isOverseasDeskOpen}
        onClose={() => setIsOverseasDeskOpen(false)}
        onOpenEscrowGuide={() => handleOpenGuide('escrow-process')}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
      />

      {/* Footer - Hidden on Admin Panel for clean dedicated view */}
      {activeTab !== 'admin' && (
        <Footer
          setActiveTab={changeTab}
          onOpenGuide={handleOpenGuide}
          onOpenFeatures={() => setIsFeaturesOpen(true)}
        />
      )}
    </div>
  );
}
