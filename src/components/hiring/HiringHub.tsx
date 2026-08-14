import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Briefcase,
  Users,
  PlusCircle,
  Sparkles,
  MapPin,
  Lock,
  Building2,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { store } from '../../lib/store';
import { JobPost, DealRoom } from '../../types';
import { JobPostModal } from './JobPostModal';
import { DealRoomView } from './DealRoomView';
import { AgentGrid } from '../agents/AgentGrid';

interface HiringHubProps {
  onOpenAuth?: () => void;
}

export const HiringHub: React.FC<HiringHubProps> = ({ onOpenAuth }) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'dealrooms' | 'directory'>('jobs');
  const [jobPosts, setJobPosts] = useState<JobPost[]>(store.jobPosts);
  const [dealRooms, setDealRooms] = useState<DealRoom[]>(store.dealRooms);
  const [selectedDealRoom, setSelectedDealRoom] = useState<DealRoom | null>(store.dealRooms[0] || null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobPost | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [cityFilter, setCityFilter] = useState('All');

  const isGuest = store.currentUser.role === 'guest' || store.currentUser.id === 'user-guest';

  const refreshData = () => {
    setJobPosts([...store.jobPosts]);
    setDealRooms([...store.dealRooms]);
    if (store.dealRooms.length > 0 && !selectedDealRoom) {
      setSelectedDealRoom(store.dealRooms[0]);
    }
  };

  useEffect(() => {
    const unsubscribe = store.subscribe(refreshData);
    return () => unsubscribe();
  }, []);

  const handleApply = (job: JobPost) => {
    if (isGuest) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    const res = store.applyAndStakeJob(job.id);
    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setSelectedJobForApply(null);
      refreshData();
      setActiveTab('dealrooms');
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
  };

  const isAgencyOrBuilder = store.currentUser.role === 'agency' || store.currentUser.role === 'builder' || store.currentUser.role === 'marketing_company' || store.currentUser.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* BANNER / HERO SECTION */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 shadow-2xl overflow-hidden border border-emerald-500/20">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <ShieldCheck className="w-80 h-80 text-emerald-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-extrabold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>DEALFAST AGENCY RECRUITMENT & MANDATES</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Corporate Agency Hiring & In-Person Meeting Portal
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Agencies and Developers list property sales mandates. Licensed agents apply directly for office visits, site inspections, and direct contract execution — <strong>no deposit or financial risk required!</strong>
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!isGuest && isAgencyOrBuilder && (
              <button
                onClick={() => setShowJobModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Post Property Mandate
              </button>
            )}

            {isGuest && (
              <button
                onClick={() => { if (onOpenAuth) onOpenAuth(); }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <Lock className="w-4 h-4" /> Sign In to Apply for Mandates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* GLOBAL ALERT BANNER */}
      {message && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="font-bold underline text-xs">Dismiss</button>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-slate-800 pb-3 w-full">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center gap-2 border ${
            activeTab === 'jobs'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          <Briefcase className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Agency Mandates ({jobPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dealrooms')}
          className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center gap-2 border ${
            activeTab === 'dealrooms'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Office Meetings & Deal Rooms ({dealRooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center gap-2 border ${
            activeTab === 'directory'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Agent Talent Directory</span>
        </button>
      </div>

      {/* TAB CONTENT: BOUNTIES & PROTECTED JOBS */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <h2 className="text-base font-extrabold text-slate-800">Browse Pre-Funded Job Bounties</h2>
              <p className="text-xs text-slate-500">Apply with your Escrow Wallet stake deposit to claim mandates</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-1.5 border rounded-xl text-xs font-semibold bg-white text-slate-800 outline-none"
              >
                <option value="All">All Cities</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobPosts
              .filter(j => cityFilter === 'All' || j.city === cityFilter)
              .map((job) => (
                <div key={job.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col justify-between">
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <img src={job.agencyLogo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a'} alt={job.agencyName} className="w-9 h-9 rounded-xl object-cover border" />
                        <div>
                          <span className="font-bold text-xs text-slate-800 block">{job.agencyName}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500" /> {job.society}, {job.city}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                        job.status === 'open' ? 'bg-emerald-100 text-emerald-800' :
                        job.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-800 leading-snug line-clamp-2">
                      {job.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>

                    <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-100 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-medium">Pre-Funded Bounty:</span>
                        <span className="font-extrabold text-emerald-700">PKR {job.bountyAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>Agent Hiring Mode:</span>
                        <span className="font-bold text-slate-700">{job.maxAgents === 1 ? 'Single Exclusive' : `Co-Agent Team (${job.coAgentSplits.join('/')}%)`}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>Stake Deposit Required:</span>
                        <span className="font-bold text-amber-700">
                          {job.bountyAmount < 3000 ? '0 PKR (Low Risk Entry)' : `PKR ${(job.bountyAmount * 0.5).toLocaleString()} (50% Deposit)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedJobForApply(job)}
                      disabled={job.status !== 'open'}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 shadow ${
                        job.status === 'open'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {job.status === 'open' ? (
                        <>Stake Deposit & Apply <ArrowRight className="w-4 h-4" /></>
                      ) : (
                        <>Agents Hired / In Progress</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ACTIVE DEAL ROOMS */}
      {activeTab === 'dealrooms' && (
        <div className="space-y-6">
          {dealRooms.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
              <Lock className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-base">No Active Deal Rooms Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Apply for a job bounty or post a new mandate to initiate a 4-step proof milestone Deal Room.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* DEAL ROOM SELECTOR LIST */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Select Active Deal Room</h3>
                {dealRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedDealRoom(room)}
                    className={`w-full text-left p-4 rounded-2xl border transition ${
                      selectedDealRoom?.id === room.id
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">ROOM #{room.id}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                        {room.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{room.jobTitle}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Agency: {room.agencyName}</p>

                    <div className="mt-2 text-xs font-extrabold text-emerald-600 flex justify-between items-center">
                      <span>Bounty: PKR {room.totalBountyAmount.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400">Step {room.currentMilestoneIndex + 1} of 4</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* DEAL ROOM VIEW */}
              <div className="lg:col-span-2">
                {selectedDealRoom ? (
                  <DealRoomView dealRoom={selectedDealRoom} onRefresh={refreshData} />
                ) : (
                  <div className="bg-white p-6 rounded-2xl border text-center text-xs text-slate-500">
                    Select a Deal Room to view milestones.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: AGENT TALENT DIRECTORY */}
      {activeTab === 'directory' && (
        <AgentGrid
          agents={store.agents}
          onSelectAgent={() => {}}
          onOpenChatWithAgent={() => {}}
        />
      )}

      {/* CREATE JOB MODAL */}
      <JobPostModal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        onSuccess={() => {
          refreshData();
          setMessage({ text: 'Property Mandate posted successfully! Agents can now apply.', type: 'success' });
        }}
      />

      {/* APPLY CONFIRMATION MODAL */}
      {selectedJobForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" /> Confirm Mandate Application
              </h3>
              <button onClick={() => setSelectedJobForApply(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                You are applying for <strong className="text-slate-800">{selectedJobForApply.title}</strong> posted by <strong>{selectedJobForApply.agencyName}</strong>.
              </p>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-2 text-emerald-900">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>In-Person Meeting & Site Visit</span>
                </div>
                <p className="text-xs leading-relaxed text-emerald-800">
                  No security deposit or lock is required. Applying will notify the agency team to contact you and schedule an in-office interview and property walk-through.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setSelectedJobForApply(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApply(selectedJobForApply)}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
