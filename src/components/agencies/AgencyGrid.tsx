import React, { useState } from 'react';
import { Building2, ShieldCheck, MapPin, Phone, Mail, Star, Users, ExternalLink } from 'lucide-react';
import { Agency } from '../../types';

interface AgencyGridProps {
  agencies: Agency[];
  onSelectAgency: (a: Agency) => void;
}

export const AgencyGrid: React.FC<AgencyGridProps> = ({ agencies, onSelectAgency }) => {
  return (
    <div className="space-y-6 my-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Certified Real Estate Agencies</h2>
          <p className="text-xs text-slate-400">Verified corporate agencies in Islamabad, Lahore, and Karachi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agencies.map(a => (
          <div
            key={a.id}
            onClick={() => onSelectAgency(a)}
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-orange-500/50 transition-all cursor-pointer group space-y-4"
          >
            <div className="flex items-start space-x-3">
              <img src={a.logo} alt={a.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-800 shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                  {a.name}
                </h3>
                <p className="text-[11px] text-slate-400 flex items-center mt-0.5">
                  <MapPin className="w-3 h-3 text-orange-400 mr-1 shrink-0" />
                  <span className="truncate">{a.address}</span>
                </p>
                <div className="flex items-center space-x-1 mt-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{a.rating}</span>
                  <span className="text-slate-500 font-normal">({a.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              {a.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-slate-800/80">
              <div className="bg-slate-900/80 p-2 rounded-xl">
                <p className="font-extrabold text-orange-400">{a.totalProperties}</p>
                <p className="text-[10px] text-slate-400">Active Listings</p>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl">
                <p className="font-extrabold text-white">{a.activeAgents}</p>
                <p className="text-[10px] text-slate-400">Agents</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
