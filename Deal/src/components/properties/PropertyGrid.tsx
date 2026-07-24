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
            onSelectProperty={onSelectProperty}
            onOpenBookingModal={onOpenBookingModal}
            onOpenChatWithAgent={onOpenChatWithAgent}
          />
        ))}
      </div>
    </div>
  );
};
