import React, { useState } from 'react';
import {
  UserCheck,
  Building2,
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  Star,
  CheckCircle2,
  Search,
  ExternalLink,
  Briefcase,
  PlusCircle,
  X,
  Send,
  Award,
  Clock
} from 'lucide-react';
import { Agent, AgentTalent } from '../../types';
import { store } from '../../lib/store';

interface AgentGridProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  onOpenChatWithAgent: (agentId: string, agentName: string) => void;
}

export const AgentGrid: React.FC<AgentGridProps> = ({
  agents,
  onSelectAgent,
  onOpenChatWithAgent
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'recruitment'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  // Modal states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedTalentToHire, setSelectedTalentToHire] = useState<AgentTalent | null>(null);
  const [offerText, setOfferText] = useState('');

  // Application Form State
  const [applyForm, setApplyForm] = useState({
    name: store.currentUser.name || '',
    phone: store.currentUser.phone || '',
    email: store.currentUser.email || '',
    city: store.currentUser.city || 'Karachi',
    targetSocieties: 'DHA, Bahria Town, Gulberg, Scheme 33',
    experienceYears: 2,
    specialization: 'Residential Plots & Off-Plan Luxury Villas',
    expectedCommission: '50% Commission Split',
    bio: 'Motivated real estate consultant with strong client communication & field expertise in local societies.'
  });

  const cities = ['All', ...Array.from(new Set([...agents.map(a => a.city), ...store.agentTalents.map(t => t.city)]))];

  const filteredAgents = agents.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.agencyName && a.agencyName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCity = selectedCity === 'All' || a.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const filteredTalents = store.agentTalents.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.targetSocieties.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'All' || t.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addAgentTalent({
      name: applyForm.name,
      avatar: store.currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      phone: applyForm.phone,
      email: applyForm.email,
      city: applyForm.city,
      targetSocieties: applyForm.targetSocieties,
      experienceYears: Number(applyForm.experienceYears),
      specialization: applyForm.specialization,
      expectedCommission: applyForm.expectedCommission,
      bio: applyForm.bio,
      cnicVerified: store.currentUser.kycStatus === 'verified'
    });
    setShowApplyModal(false);
    setActiveTab('recruitment');
    alert('🎉 Your agent candidate profile has been published! Agencies & Builders across Pakistan can now view and extend hiring offers to you.');
  };

  const handleSendOffer = () => {
    if (!selectedTalentToHire) return;
    store.hireAgentTalent(selectedTalentToHire.id, offerText);
    setSelectedTalentToHire(null);
    setOfferText('');
    alert(`💼 Hiring offer sent to ${selectedTalentToHire.name}! They will receive notification & can respond via chat.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Section Header & Main Toggle */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center">
              <UserCheck className="w-6 h-6 text-orange-400 mr-2 shrink-0" />
              Real Estate Agents & Talent Network
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Connect with top certified agents or hire local sales talent for agencies & builders in Pakistan
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'directory'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Agents Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('recruitment')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 relative ${
                activeTab === 'recruitment'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Agent Hiring & Talent Pool</span>
              <span className="px-1.5 py-0.2 bg-orange-600 text-white rounded text-[9px] uppercase tracking-wider font-extrabold ml-1">
                For Agencies
              </span>
            </button>
          </div>
        </div>

        {/* SECP & NADRA Security Guarantee Banner */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/60 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-slate-300 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block text-xs">🛡️ 100% NADRA CNIC & SECP Verified Agents Network</span>
              <span className="text-[11px] text-slate-400">Fake or unverified agents are strictly prohibited. Every consultant undergoes NADRA verification before handling deals.</span>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 text-[10px]">
            Zero Fake Agents Policy
          </span>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 flex items-center space-x-2 text-xs w-full sm:w-64">
              <Search className="w-4 h-4 text-orange-400 shrink-0" />
              <input
                type="text"
                placeholder={activeTab === 'directory' ? "Search agent or agency..." : "Search talent by city, society, skill..."}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-transparent text-white outline-none w-full"
              />
            </div>

            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none cursor-pointer"
            >
              {cities.map(c => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c === 'All' ? 'All Cities' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Action to list oneself as an agent for hire */}
          <button
            onClick={() => setShowApplyModal(true)}
            className="gradient-btn text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-orange-500/20 w-full sm:w-auto justify-center"
          >
            <PlusCircle className="w-4 h-4" />
            <span>➕ Earn Money: Apply as Freelance Agent</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: VERIFIED AGENTS DIRECTORY */}
      {activeTab === 'directory' && (
        filteredAgents.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center border border-slate-800/80 my-8 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
              <UserCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No Agents Listed Yet</h3>
              <p className="text-xs text-slate-400">
                Be the first verified real estate agent to list your profile on DealFast!
              </p>
            </div>
            <button
              onClick={() => setShowApplyModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 inline-flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Apply as Freelance Agent</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAgents.map(agent => (
              <div
                key={agent.id}
                className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-orange-500/50 transition-all duration-300 flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                {/* Top Verified Badge */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified Agent
                  </span>
                  <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{agent.rating}</span>
                  </div>
                </div>

                {/* Profile Avatar & Details */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-orange-500/30 group-hover:ring-orange-500 transition-all"
                    />
                    {agent.verified && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 bg-slate-950 rounded-full absolute -bottom-1 -right-1" />
                    )}
                  </div>

                  <div>
                    <h3
                      onClick={() => onSelectAgent(agent)}
                      className="font-black text-white text-base hover:text-orange-400 transition-colors cursor-pointer line-clamp-1"
                    >
                      {agent.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">{agent.title}</p>
                    {agent.agencyName && (
                      <div className="flex items-center space-x-1 text-[11px] text-orange-400 font-semibold mt-0.5">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{agent.agencyName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location & Stats */}
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/60 grid grid-cols-2 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">City</span>
                    <span className="font-bold text-white flex items-center justify-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-orange-400" />
                      <span className="truncate">{agent.city}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Listings</span>
                    <span className="font-bold text-orange-400 mt-0.5 block">{agent.activeListings} Active</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onOpenChatWithAgent(agent.id, agent.name)}
                    className="gradient-btn text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => onSelectAgent(agent)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center space-x-1 transition-colors"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* VIEW 2: AGENT HIRING & TALENT NETWORK */}
      {activeTab === 'recruitment' && (
        <div className="space-y-6">
          
          {/* Banner */}
          <div className="bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-900 border border-amber-500/30 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold rounded-lg uppercase">
                Agency & Builder Recruitment Portal
              </span>
              <h3 className="text-lg font-black text-white">Hire Verified Local Agents Across Pakistan</h3>
              <p className="text-xs text-slate-300 max-w-2xl">
                Agencies & Builders can easily search for active agents by city, view their target society expertise & expected commission splits, and send direct hiring offers or chat interviews.
              </p>
            </div>

            <button
              onClick={() => setShowApplyModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shrink-0 shadow-lg shadow-amber-500/20"
            >
              💼 List Myself as Available Agent
            </button>
          </div>

          {/* Talent Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTalents.map(talent => (
              <div
                key={talent.id}
                className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4 relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={talent.avatar}
                      alt={talent.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-500/30"
                    />
                    <div>
                      <h4 className="font-black text-white text-base flex items-center space-x-1.5">
                        <span>{talent.name}</span>
                        {talent.cnicVerified && (
                          <span title="CNIC Verified Candidate">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center space-x-1 text-slate-400 text-xs font-semibold mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                        <span>{talent.city}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                    talent.status === 'available'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {talent.status === 'available' ? 'Available for Hire' : 'In Interview'}
                  </span>
                </div>

                {/* Info Breakdown */}
                <div className="space-y-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Societies</span>
                    <p className="text-slate-200 font-semibold line-clamp-1">{talent.targetSocieties}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Experience</span>
                      <p className="text-amber-400 font-extrabold">{talent.experienceYears} Years Sales</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Expected Terms</span>
                      <p className="text-emerald-400 font-bold">{talent.expectedCommission}</p>
                    </div>
                  </div>

                  <p className="text-slate-400 text-[11px] italic line-clamp-2 pt-1">{talent.bio}</p>
                </div>

                {/* Actions for Agencies/Builders */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setSelectedTalentToHire(talent)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-colors shadow-md"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>💼 Hire / Offer</span>
                  </button>

                  <button
                    onClick={() => onOpenChatWithAgent(talent.id, talent.name)}
                    className="bg-slate-800 hover:bg-slate-700 text-white py-2 px-3 rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                    <span>Interview Chat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: APPLY AS AGENT FOR HIRE */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card max-w-xl w-full p-6 rounded-3xl border border-slate-800 space-y-5 bg-[#0a0e1a]/95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">Apply as Freelance Agent / Talent</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={applyForm.name}
                    onChange={e => setApplyForm({ ...applyForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={applyForm.phone}
                    onChange={e => setApplyForm({ ...applyForm, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Primary Operating City</label>
                  <select
                    value={applyForm.city}
                    onChange={e => setApplyForm({ ...applyForm, city: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  >
                    {['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Faisalabad', 'Multan'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={applyForm.experienceYears}
                    onChange={e => setApplyForm({ ...applyForm, experienceYears: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Target Societies / Areas</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DHA Phase 6, Bahria Town, Gulberg, Scheme 33"
                  value={applyForm.targetSocieties}
                  onChange={e => setApplyForm({ ...applyForm, targetSocieties: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Residential Plots & High-Rise Apartments"
                    value={applyForm.specialization}
                    onChange={e => setApplyForm({ ...applyForm, specialization: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Expected Commission / Terms</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50% Commission Split"
                    value={applyForm.expectedCommission}
                    onChange={e => setApplyForm({ ...applyForm, expectedCommission: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Bio / Resume Pitch for Agencies</label>
                <textarea
                  rows={3}
                  required
                  value={applyForm.bio}
                  onChange={e => setApplyForm({ ...applyForm, bio: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-xl font-black flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SEND HIRING OFFER TO AGENT CANDIDATE */}
      {selectedTalentToHire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card max-w-lg w-full p-6 rounded-3xl border border-slate-800 space-y-5 bg-[#0a0e1a]/95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">Send Hiring Offer to {selectedTalentToHire.name}</h3>
              </div>
              <button
                onClick={() => setSelectedTalentToHire(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center space-x-3 text-xs">
              <img
                src={selectedTalentToHire.avatar}
                alt={selectedTalentToHire.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <p className="font-bold text-white">{selectedTalentToHire.name}</p>
                <p className="text-slate-400">{selectedTalentToHire.city} • {selectedTalentToHire.experienceYears} Yrs Experience</p>
                <p className="text-emerald-400 font-bold mt-0.5">{selectedTalentToHire.expectedCommission}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-400 font-bold">Hiring Offer / Commission Split Details</label>
              <textarea
                rows={4}
                placeholder="e.g. We at Premier Estate Group offer 50% commission split, office space in DHA Lahore, desk support & verified leads list..."
                value={offerText}
                onChange={e => setOfferText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-white outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedTalentToHire(null)}
                className="px-4 py-2 text-slate-400 hover:text-white font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOffer}
                disabled={!offerText.trim()}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-5 py-2 rounded-xl flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Formal Hiring Offer</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
