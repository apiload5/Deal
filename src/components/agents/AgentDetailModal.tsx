import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  Building2,
  MapPin,
  ShieldCheck,
  Star,
  CheckCircle2,
  ExternalLink,
  PhoneCall,
  Fingerprint
} from 'lucide-react';
import { Agent, Property } from '../../types';
import { store } from '../../lib/store';
import { NadraBiometricModal } from '../common/NadraBiometricModal';

interface AgentDetailModalProps {
  agent: Agent | null;
  onClose: () => void;
  onSelectProperty: (p: Property) => void;
  onOpenChatWithAgent: (agentId: string, agentName: string) => void;
  onStartCall: (agentName: string, avatar?: string, isVideo?: boolean) => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  onClose,
  onSelectProperty,
  onOpenChatWithAgent,
  onStartCall
}) => {
  const [isNadraModalOpen, setIsNadraModalOpen] = useState(false);

  if (!agent) return null;

  const agentProperties = store.properties.filter(
    p => p.ownerName === agent.name || p.userId === agent.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-card rounded-3xl max-w-3xl w-full border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Agent Profile Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-2">
          <div className="relative">
            <img
              src={agent.avatar}
              alt={agent.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-orange-500/30"
            />
            {(agent.verified || (agent as any).kycVerified) && (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 bg-slate-950 rounded-full absolute -bottom-1 -right-1" />
            )}
          </div>

          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center">
                <Fingerprint className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                NADRA Verisys Verified Agent
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 flex items-center">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
                {agent.rating} / 5.0
              </span>
            </div>

            <h2 className="text-2xl font-black text-white">{agent.name}</h2>
            <p className="text-sm font-semibold text-orange-400">{agent.title}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 pt-1">
              {agent.agencyName && (
                <span className="flex items-center font-bold">
                  <Building2 className="w-4 h-4 text-orange-400 mr-1" />
                  {agent.agencyName}
                </span>
              )}
              <span className="flex items-center font-bold">
                <MapPin className="w-4 h-4 text-orange-400 mr-1" />
                {agent.city}, Pakistan
              </span>
            </div>
          </div>
        </div>

        {/* NADRA Biometric Verisys Live Status Banner */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/40 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>NADRA Biometric Citizen Status:</span>
                <span className="text-emerald-400 font-extrabold">100% E-Sahulat Verified</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Agent's 13-digit CNIC family tree & field site biometric credentials verified on DealFast Escrow.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNadraModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Verify Agent CNIC</span>
          </button>
        </div>

        {/* Quick Contact & Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onOpenChatWithAgent(agent.id, agent.name)}
            className="gradient-btn text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-orange-500/20"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat Now</span>
          </button>

          <button
            onClick={() => onStartCall(agent.name, agent.avatar, false)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Agent</span>
          </button>

          <a
            href={`https://wa.me/${agent.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-700/30 hover:bg-emerald-700/50 text-emerald-300 border border-emerald-500/30 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Deals Closed</span>
            <span className="text-sm font-black text-amber-400">{agent.totalDeals}+</span>
          </div>
        </div>

        {/* Active Property Listings */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              Active Property Listings ({agentProperties.length})
            </h3>
            <span className="text-xs text-slate-400">Escrow Protected</span>
          </div>

          {agentProperties.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
              No active listings available right now. Contact agent for custom portfolio requests.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agentProperties.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    onClose();
                    onSelectProperty(p);
                  }}
                  className="bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-2xl p-3 flex items-center space-x-3 cursor-pointer transition-all group"
                >
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-xs line-clamp-1 group-hover:text-orange-400 transition-colors">
                      {p.title}
                    </h4>
                    <p className="text-orange-400 font-black text-xs">{p.priceFormatted}</p>
                    <p className="text-[11px] text-slate-400 flex items-center">
                      <MapPin className="w-3 h-3 text-slate-500 mr-1" />
                      {p.area}, {p.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <NadraBiometricModal
        isOpen={isNadraModalOpen}
        onClose={() => setIsNadraModalOpen(false)}
        targetRole="agent"
      />
    </div>
  );
};
