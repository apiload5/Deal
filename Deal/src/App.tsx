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
  UserCheck
} from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/common/HeroSection';
import { SearchBar } from './components/common/SearchBar';
import { PropertyGrid } from './components/properties/PropertyGrid';
import { PropertyDetailModal } from './components/properties/PropertyDetailModal';
import { PropertyFormModal } from './components/properties/PropertyFormModal';
import { BookingModal } from './components/bookings/BookingModal';
import { AgencyGrid } from './components/agencies/AgencyGrid';
import { AgencyDetailModal } from './components/agencies/AgencyDetailModal';
import { BuilderGrid } from './components/builders/BuilderGrid';
import { ProjectDetailModal } from './components/projects/ProjectDetailModal';
import { MapView } from './components/common/MapView';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ChatDrawer } from './components/chat/ChatDrawer';
import { WebRTCCallModal } from './components/webrtc/WebRTCCallModal';
import { AiPropertyAssistant } from './components/common/AiPropertyAssistant';
import { UserGuideModal } from './components/common/UserGuideModal';
import { BlogSection } from './components/blog/BlogSection';
import { AuthModal } from './components/auth/AuthModal';
import { store } from './lib/store';
import { Property, Agency, Builder, Project, UserRole, SearchFilter } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'properties' | 'agencies' | 'builders' | 'projects' | 'map' | 'dashboard' | 'admin'>('properties');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(store.currentUser.role);
  
  // Modals state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [selectedBuilder, setSelectedBuilder] = useState<Builder | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [bookingProperty, setBookingProperty] = useState<Property | null>(null);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | undefined>(undefined);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(store.properties);

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
    if (filters.isPremium) {
      result = result.filter(p => p && p.isPremium);
    }
    if (filters.isFeatured) {
      result = result.filter(p => p && p.isFeatured);
    }

    if (filters.sortBy === 'price_low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price_high') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'popular') {
      result = [...result].sort((a, b) => (b.views || 0) - (a.views || 0));
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

  const handleOpenChatWithAgent = (agentId: string, agentName: string, pId?: string, pTitle?: string) => {
    const room = store.getOrCreateChatRoom(agentId, agentName, pId, pTitle);
    setActiveChatRoomId(room.id);
    setIsChatOpen(true);
  };

  const handleStartCall = (agentName: string, agentAvatar?: string, isVideo: boolean = true) => {
    setCallAgentName(agentName);
    setCallAgentAvatar(agentAvatar);
    setIsCallVideo(isVideo);
    setIsCallActive(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Top Role Switcher Demo Bar */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold text-[10px] uppercase">
            Live Role Switcher:
          </span>
          <div className="flex items-center space-x-1">
            {(['guest', 'user', 'agent', 'agency', 'builder', 'admin'] as UserRole[]).map(r => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                  currentUserRole === r
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
          <button
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center space-x-1 text-amber-400 hover:underline font-bold"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Escrow & Role Guide</span>
          </button>
          <span className="hidden sm:inline">Current User: <strong className="text-white">{store.currentUser.name}</strong></span>
        </div>
      </div>

      {/* Primary Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentUserRole}
        onOpenListingModal={() => setIsListingModalOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenAiAssistant={() => setIsAiOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
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
                  {(searchFilters.city || searchFilters.area || searchFilters.keyword || searchFilters.purpose) && (
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
                onSelectProperty={p => setSelectedProperty(p)}
                onOpenBookingModal={p => setBookingProperty(p)}
                onOpenChatWithAgent={handleOpenChatWithAgent}
              />

              {/* Map Preview Section */}
              <div className="pt-6">
                <MapView
                  properties={store.properties}
                  onSelectProperty={p => setSelectedProperty(p)}
                />
              </div>

              {/* Real Estate Tax Guide Section */}
              <BlogSection />
            </div>
          </div>
        )}

        {activeTab === 'agencies' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AgencyGrid
              agencies={store.agencies}
              onSelectAgency={a => setSelectedAgency(a)}
            />
          </div>
        )}

        {activeTab === 'builders' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BuilderGrid
              builders={store.builders}
              onSelectBuilder={b => setSelectedBuilder(b)}
            />
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Mega Urban Projects & Commercial Towers</h2>
                <p className="text-xs text-slate-400">Pre-launch booking & flexible installment payment plans</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {store.projects.map(proj => (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProject(proj)}
                    className="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-orange-500/50 transition-all cursor-pointer group space-y-4"
                  >
                    <div className="h-52 w-full relative bg-slate-900">
                      <img src={proj.images[0]} alt="Proj" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-sm font-black text-white">{proj.title}</span>
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
              onSelectProperty={p => setSelectedProperty(p)}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <UserDashboard
            onOpenListingModal={() => setIsListingModalOpen(true)}
            onSelectProperty={p => setSelectedProperty(p)}
            onOpenBookingModal={p => setBookingProperty(p)}
            onOpenChatWithAgent={handleOpenChatWithAgent}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Floating AI Assistant Trigger Button */}
      {!isAiOpen && (
        <button
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-6 left-6 z-40 p-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xl hover:scale-110 transition-transform flex items-center space-x-2 border border-purple-400/40"
        >
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          <span className="text-xs font-bold pr-1">Ask AI Advisor</span>
        </button>
      )}

      {/* Global Floating Modals & Drawers */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onOpenBookingModal={p => {
          setSelectedProperty(null);
          setBookingProperty(p);
        }}
        onOpenChatWithAgent={handleOpenChatWithAgent}
        onStartCall={handleStartCall}
      />

      <PropertyFormModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        onPropertyCreated={newP => {
          setFilteredProperties([newP, ...filteredProperties]);
          alert(`Property "${newP.title}" created successfully!`);
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
        onClose={() => setSelectedAgency(null)}
        onSelectProperty={p => setSelectedProperty(p)}
        onOpenBookingModal={p => setBookingProperty(p)}
        onOpenChatWithAgent={handleOpenChatWithAgent}
      />

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onOpenBookingModal={proj => {
          // Convert project into dummy property for escrow booking
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
          setBookingProperty(dummyProp);
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

      <AiPropertyAssistant
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />

      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
