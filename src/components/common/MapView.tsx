import React, { useState } from 'react';
import { MapPin, Layers, Navigation, ExternalLink } from 'lucide-react';
import { Property } from '../../types';

interface MapViewProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

export const MapView: React.FC<MapViewProps> = ({ properties, onSelectProperty }) => {
  const [selectedCity, setSelectedCity] = useState('Islamabad');
  const [mapMode, setMapMode] = useState<'streets' | 'satellite'>('streets');
  const [activePin, setActivePin] = useState<Property | null>(properties[0] || null);

  const filtered = properties.filter(p => !selectedCity || p.city.toLowerCase() === selectedCity.toLowerCase());

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-4 relative overflow-hidden shadow-2xl">
      
      {/* Top Map Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Pakistan GIS Map Explorer</h4>
            <p className="text-[10px] text-slate-400">Locate verified plots and villas visually</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* City Selector */}
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-200"
          >
            <option value="Islamabad">Islamabad Map</option>
            <option value="Lahore">Lahore Map</option>
            <option value="Karachi">Karachi Map</option>
          </select>

          {/* Mode Toggle */}
          <button
            onClick={() => setMapMode(mapMode === 'streets' ? 'satellite' : 'streets')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="capitalize">{mapMode}</span>
          </button>
        </div>
      </div>

      {/* Simulated Interactive Vector Map Canvas */}
      <div
        className={`w-full h-80 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-800/80 transition-all ${
          mapMode === 'satellite'
            ? 'bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950'
            : 'bg-gradient-to-br from-slate-950 via-slate-900 to-[#0a0e1a]'
        }`}
      >
        {/* Vector Grid Background Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* City Label Overlay */}
        <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-800 px-3 py-1 rounded-lg text-xs font-bold text-orange-400 flex items-center space-x-1 shadow-lg">
          <Navigation className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{selectedCity} Sector Grid</span>
        </div>

        {/* Map Property Pins */}
        <div className="relative w-full h-full p-8 flex flex-wrap items-center justify-around gap-6">
          {filtered.map((prop, idx) => {
            const isActive = activePin?.id === prop.id;
            return (
              <div
                key={prop.id}
                onClick={() => setActivePin(prop)}
                className={`cursor-pointer transition-all transform hover:scale-110 flex flex-col items-center ${
                  isActive ? 'z-20 scale-110' : 'z-10'
                }`}
              >
                {/* Pin Badge */}
                <div
                  className={`px-2.5 py-1 rounded-xl font-bold text-[11px] shadow-xl flex items-center space-x-1 border ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 ring-2 ring-orange-500/50'
                      : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-orange-500'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-orange-300" />
                  <span>{prop.priceFormatted}</span>
                </div>
                <div className={`w-2 h-2 rotate-45 -mt-1 ${isActive ? 'bg-amber-500' : 'bg-slate-800'}`} />
              </div>
            );
          })}
        </div>

        {/* Selected Property Popup Card */}
        {activePin && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm glass-card-glow rounded-xl p-3 border border-orange-500/30 shadow-2xl flex items-center space-x-3 z-30 animate-in fade-in slide-in-from-bottom-2">
            <img
              src={activePin.images[0]}
              alt={activePin.title}
              className="w-16 h-16 rounded-lg object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-white truncate">{activePin.title}</h5>
              <p className="text-[11px] font-extrabold text-orange-400 mt-0.5">{activePin.priceFormatted}</p>
              <p className="text-[10px] text-slate-400 truncate">{activePin.area}, {activePin.city}</p>
            </div>
            <button
              onClick={() => onSelectProperty(activePin)}
              className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors"
              title="View Property Details"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
