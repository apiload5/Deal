import React from 'react';
import { X, ShieldCheck, MapPin, Phone, Mail, Star, Users, Building2, Globe } from 'lucide-react';
import { Agency, Property } from '../../types';
import { PropertyCard } from '../properties/PropertyCard';

interface AgencyDetailModalProps {
  agency: Agency | null;
  agencyProperties: Property[];
  onClose: () => void;
  onSelectProperty: (p: Property) => void;
  onOpenBookingModal: (p: Property) => void;
  onOpenChatWithAgent: (agentId: string, agentName: string, pId?: string, pTitle?: string) => void;
}

export const AgencyDetailModal: React.FC<AgencyDetailModalProps> = ({
  agency,
  agencyProperties,
  onClose,
  onSelectProperty,
  onOpenBookingModal,
  onOpenChatWithAgent
}) => {
  if (!agency) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card-glow w-full max-w-4xl rounded-3xl p-6 border border-orange-500/30 max-h-[85vh] overflow-y-auto shadow-2xl relative">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800">
          <X className="w-5 h-5" />
        </button>

        {/* Cover & Profile Header */}
        <div className="space-y-4">
          <div className="h-44 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative">
            <img src={agency.coverImage} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 -mt-10 px-4 relative z-10">
            <div className="flex items-center space-x-3">
              <img src={agency.logo} alt={agency.name} className="w-20 h-20 rounded-2xl border-2 border-orange-500 object-cover shadow-2xl bg-slate-900" />
              <div>
                <h2 className="text-xl font-black text-white flex items-center">
                  {agency.name}
                  {agency.verified && <ShieldCheck className="w-5 h-5 ml-2 text-amber-400" />}
                </h2>
                <p className="text-xs text-slate-300 flex items-center mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-400 mr-1" />
                  <span>{agency.address}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={`tel:${agency.phone}`}
                className="gradient-btn text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg"
              >
                <Phone className="w-4 h-4" />
                <span>Call Agency</span>
              </a>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            {agency.description}
          </p>

          {/* Agency Properties Section */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white mb-4">Properties Managed by {agency.name} ({agencyProperties.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agencyProperties.map(p => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onSelectProperty={onSelectProperty}
                  onOpenBookingModal={onOpenBookingModal}
                  onOpenChatWithAgent={onOpenChatWithAgent}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
