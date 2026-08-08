import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Camera,
  MapPin,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Upload,
  UserCheck,
  Building2,
  Check,
  X,
  Lock,
  Sparkles
} from 'lucide-react';
import { DealRoom, DealRoomMilestone } from '../../types';
import { store } from '../../lib/store';

interface DealRoomViewProps {
  dealRoom: DealRoom;
  onRefresh: () => void;
}

export const DealRoomView: React.FC<DealRoomViewProps> = ({ dealRoom, onRefresh }) => {
  const [selectedMilestone, setSelectedMilestone] = useState<DealRoomMilestone>(
    dealRoom.milestones[dealRoom.currentMilestoneIndex] || dealRoom.milestones[0]
  );
  const [proofUrl, setProofUrl] = useState('');
  const [locationPin, setLocationPin] = useState('');
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showProofModal, setShowProofModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const isAgency = store.currentUser.role === 'agency' || store.currentUser.role === 'builder' || store.currentUser.role === 'admin';
  const isHiredAgent = dealRoom.agents.some(a => a.agentId === store.currentUser.id);

  const handleUploadProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl) {
      setMsg('Please provide a valid image or document proof URL.');
      return;
    }

    const ok = store.submitMilestoneProof(dealRoom.id, selectedMilestone.id, {
      proofUrl,
      locationPin,
      notes
    });

    if (ok) {
      setMsg('Proof submitted! 24-Hour SLA timer started for Agency review.');
      setShowProofModal(false);
      setProofUrl('');
      setLocationPin('');
      setNotes('');
      onRefresh();
    }
  };

  const handleReviewProof = (approved: boolean) => {
    store.reviewMilestoneProof(dealRoom.id, selectedMilestone.id, approved, rejectReason);
    setMsg(approved ? 'Milestone approved! Escrow progress updated.' : 'Milestone proof rejected.');
    setRejectReason('');
    onRefresh();
  };

  const handleRaiseDispute = (e: React.FormEvent) => {
    e.preventDefault();
    store.raiseDispute(dealRoom.id, disputeReason, [proofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c']);
    setMsg('Dispute ticket generated and submitted to 3-Member Independent Panel.');
    setShowDisputeModal(false);
    onRefresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden space-y-6 p-6">
      {/* HEADER & STATUS BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
              dealRoom.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
              dealRoom.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {dealRoom.status.toUpperCase()} DEAL ROOM
            </span>
            <span className="text-xs text-slate-400">ID: #{dealRoom.id}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">{dealRoom.jobTitle}</h2>
          <p className="text-xs text-slate-500">Agency: {dealRoom.agencyName} • Total Escrow Bounty: PKR {dealRoom.totalBountyAmount.toLocaleString()}</p>
        </div>

        <div className="flex items-center gap-2">
          {dealRoom.status === 'active' && (
            <button
              onClick={() => setShowDisputeModal(true)}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition flex items-center gap-1"
            >
              <AlertTriangle className="w-4 h-4" /> Raise Dispute Ticket
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex justify-between items-center">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} className="underline">Dismiss</button>
        </div>
      )}

      {/* AGENTS & STAKE SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
            <UserCheck className="w-4 h-4 text-emerald-600" /> Assigned Agents & Escrow Stake
          </h4>
          <div className="space-y-2">
            {dealRoom.agents.map((ag) => (
              <div key={ag.agentId} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <img src={ag.agentAvatar} alt={ag.agentName} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <span className="font-bold text-slate-800 block">{ag.agentName}</span>
                    <span className="text-[10px] text-slate-500">{ag.splitPercentage}% Split Share (PKR {ag.bountyShare.toLocaleString()})</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 font-extrabold block">PKR {ag.stakeLocked.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5 justify-end">
                    <Lock className="w-3 h-3 text-amber-500" /> Locked Stake
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 24-HOUR SLA TIMER STATUS */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Clock className="w-4 h-4 text-amber-500" /> 24-Hour Review SLA Policy
          </h4>
          <p className="text-xs text-slate-600">
            Agency must review and verify proof uploads within 24 hours. If no rejection is made within 24 hours, DealFast system auto-approves the milestone!
          </p>
          <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg font-medium border border-amber-200">
            ⚡ Last Update: {dealRoom.lastProgressUpdate || 'Awaiting milestone submission'}
          </div>
        </div>
      </div>

      {/* MILESTONE PROGRESS STEPPER */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-slate-800 text-sm">4-Step Proof-Based Milestones</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dealRoom.milestones.map((ms, index) => (
            <button
              key={ms.id}
              onClick={() => setSelectedMilestone(ms)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                selectedMilestone.id === ms.id ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400">STEP {index + 1}</span>
                {ms.status === 'approved' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {ms.status === 'submitted' && <Clock className="w-5 h-5 text-amber-500 animate-pulse" />}
                {ms.status === 'pending' && <span className="text-xs text-slate-300 font-bold">Pending</span>}
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-800">{ms.name}</h5>
                <span className="text-[11px] font-extrabold text-emerald-600">PKR {ms.bountyAmount.toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* SELECTED MILESTONE DETAIL & PROOF DISPLAY */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h4 className="font-extrabold text-slate-800 text-base">{selectedMilestone.name}</h4>
            <p className="text-xs text-slate-500">Required Proof: {selectedMilestone.proofRequired}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
            selectedMilestone.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
            selectedMilestone.status === 'submitted' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
          }`}>
            {selectedMilestone.status}
          </span>
        </div>

        {/* PROOF CONTENT */}
        {selectedMilestone.proof ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">Uploaded Proof File / Photo:</span>
              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-900 flex items-center justify-center">
                <img src={selectedMilestone.proof.proofUrl} alt="Proof" className="object-cover max-h-48 w-full" />
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {selectedMilestone.proof.locationPin && (
                <div>
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-rose-500" /> GPS Location Pin:
                  </span>
                  <p className="text-slate-600 bg-white p-2 rounded-lg border border-slate-200 mt-1">{selectedMilestone.proof.locationPin}</p>
                </div>
              )}

              {selectedMilestone.proof.notes && (
                <div>
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-indigo-500" /> Agent Notes:
                  </span>
                  <p className="text-slate-600 bg-white p-2 rounded-lg border border-slate-200 mt-1">{selectedMilestone.proof.notes}</p>
                </div>
              )}

              <div className="text-[11px] text-slate-400">
                Submitted at: {selectedMilestone.proof.submittedAt}
              </div>

              {/* AGENCY REVIEW CONTROLS */}
              {isAgency && selectedMilestone.status === 'submitted' && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">Agency Verification Actions:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReviewProof(true)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow"
                    >
                      <Check className="w-4 h-4" /> Approve & Advance
                    </button>
                    <button
                      onClick={() => handleReviewProof(false)}
                      className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1 border border-rose-200"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <p className="text-xs text-slate-500">No proof submitted for this milestone yet.</p>
            {isHiredAgent && selectedMilestone.status === 'pending' && (
              <button
                onClick={() => setShowProofModal(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition inline-flex items-center gap-1"
              >
                <Upload className="w-4 h-4" /> Upload Proof & GPS Pin
              </button>
            )}
          </div>
        )}
      </div>

      {/* PROOF UPLOAD MODAL */}
      {showProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base">Submit Proof for {selectedMilestone.name}</h3>
              <button onClick={() => setShowProofModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleUploadProof} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Proof Photo / Document URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Provide image URL of site photo, offer letter, or bank slip.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GPS Location Pin / Area</label>
                <input
                  type="text"
                  placeholder="e.g. DHA Phase 6 Block MB, Lahore (31.472, 74.412)"
                  value={locationPin}
                  onChange={(e) => setLocationPin(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Verification Notes</label>
                <textarea
                  rows={2}
                  placeholder="Add comments or inspection notes for Agency review..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowProofModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition"
                >
                  Submit Proof to Agency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPUTE MODAL */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base text-rose-700 flex items-center gap-1">
                <AlertTriangle className="w-5 h-5" /> Generate Dispute Ticket
              </h3>
              <button onClick={() => setShowDisputeModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleRaiseDispute} className="space-y-4">
              <p className="text-xs text-slate-600">
                Disputes are escalated to DealFast 3-Member Independent Panel (Agency Representative + Top Verified Agent + DealFast Official Administrator).
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Dispute</label>
                <textarea
                  rows={3}
                  placeholder="Explain issue, SLA violation, or unverified refusal..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow transition"
                >
                  Submit Dispute Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
