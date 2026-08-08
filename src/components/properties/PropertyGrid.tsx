import React, { useState } from 'react';
import { LayoutGrid, List, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Property } from '../../types';
import { PropertyCard } from './PropertyCard';

interface PropertyGridProps {
  properties: Property[];
  onSelectProperty: (p: Property) => void;
  onOpenBookingModal: (p: Property) => void;
  onOpenChatWithAgent: (agentId: string, agentName: string, pId?: string, pTitle?: string) => void;
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  onSelectProperty,
  onOpenBookingModal,
  onOpenChatWithAgent
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (properties.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 my-8">
        <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-white">No properties match your filter criteria</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Try expanding your search parameters or selecting a different city or sector.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Switcher Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-300">
          Showing <span className="text-orange-400">{properties.length}</span> Verified Property Listings
        </p>
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              viewMode === 'grid' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              viewMode === 'list' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Builder & Marketing Company Sponsored Banner Ad Slot */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-orange-950/40 border border-orange-500/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="px-2.5 py-1 rounded-md bg-orange-500 text-white font-black text-[10px] uppercase tracking-wider shrink-0">
            Sponsored Ad
          </div>
          <div>
            <h4 className="font-black text-white text-xs sm:text-sm">GSF Builders & Developers - High-Rise Commercial Plaza</h4>
            <p className="text-[11px] text-slate-300 mt-0.5">Pre-launch booking open in Gulberg Greens Islamabad. 10% Down Payment & 3 Year Easy Installments.</p>
          </div>
        </div>
        <a
          href="#projects"
          onClick={e => {
            e.preventDefault();
            alert('Opening GSF Builders High-Rise Commercial Plaza pre-launch brochure!');
          }}
          className="gradient-btn text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0 shadow-md shadow-orange-500/20"
        >
          View Project & Installment Plan
        </a>
      </div>

      {/* Grid */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'flex flex-col space-y-4'
        }
      >
        {properties.map(p => (
          <PropertyCard
            key={p.id}
            property={p}
            viewMode={viewMode}
            onSelectProperty={onSelectProperty}
            onOpenBookingModal={onOpenBookingModal}
            onOpenChatWithAgent={onOpenChatWithAgent}
          />
        ))}
      </div>
    </div>
  );
};
