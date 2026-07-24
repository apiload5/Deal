import React, { useState } from 'react';
import {
  Heart,
  Eye,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageSquare
} from 'lucide-react';
import { Property } from '../../types';
import { store } from '../../lib/store';

interface PropertyCardProps {
  property: Property;
  onSelectProperty: (p: Property) => void;
  onOpenBookingModal: (p: Property) => void;
  onOpenChatWithAgent: (agentId: string, agentName: string, pId?: string, pTitle?: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelectProperty,
  onOpenBookingModal,
  onOpenChatWithAgent
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const isFav = store.isFavorite(property.id);

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    store.toggleFavorite(property.id);
  };

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.images.length > 0) {
      setCurrentImgIndex((currentImgIndex + 1) % property.images.length);
    }
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.images.length > 0) {
      setCurrentImgIndex((currentImgIndex - 1 + property.images.length) % property.images.length);
    }
  };

  return (
    <div
      onClick={() => onSelectProperty(property)}
      className={`group glass-card rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col ${
        property.isPremium
          ? 'border-amber-500/40 shadow-xl shadow-amber-500/5'
          : 'border-slate-800 hover:border-orange-500/50'
      }`}
    >
      {/* Image Slider Header */}
      <div className="relative h-52 w-full bg-slate-900 overflow-hidden">
        <img
          src={property.images[currentImgIndex] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-black/30" />

        {/* Image Arrows */}
        {property.images.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImg}
              className="p-1 rounded-full bg-black/60 text-white hover:bg-orange-500 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImg}
              className="p-1 rounded-full bg-black/60 text-white hover:bg-orange-500 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Badges Top Left */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          {property.isPremium && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 flex items-center shadow-md">
              <Sparkles className="w-3 h-3 mr-1" /> Premium Gold
            </span>
          )}
          {property.purpose === 'sale' ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-orange-500 text-white shadow-md">
              For Sale
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-600 text-white shadow-md">
              For Rent
            </span>
          )}
        </div>

        {/* Favorite Heart Top Right */}
        <button
          onClick={handleToggleFav}
          className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/70 border border-slate-800 text-slate-300 hover:text-red-500 transition-colors shadow-lg"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Escrow Badge Bottom Right */}
        <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-md border border-amber-500/30 px-2 py-0.5 rounded-lg text-[10px] font-semibold text-amber-400 flex items-center">
          <ShieldCheck className="w-3 h-3 mr-1 text-amber-400" /> Escrow Protected
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Price & Location */}
        <div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-black text-white gradient-text">
              {property.priceFormatted}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium flex items-center">
              <Eye className="w-3 h-3 mr-1 text-slate-500" /> {property.views} views
            </span>
          </div>

          <p className="text-xs font-bold text-slate-200 mt-1 line-clamp-1 group-hover:text-orange-400 transition-colors">
            {property.title}
          </p>

          <p className="text-[11px] text-slate-400 flex items-center mt-1">
            <MapPin className="w-3.5 h-3.5 mr-1 text-orange-400 shrink-0" />
            <span className="truncate">{property.area}, {property.city}</span>
          </p>
        </div>

        {/* Specs Pill Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center space-x-1.5">
            <Bed className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-semibold">{property.beds} Beds</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Bath className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-semibold">{property.baths} Baths</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-semibold">{property.sqft} sqft</span>
          </div>
        </div>

        {/* Agent Info & Quick Booking Buttons */}
        <div className="pt-1 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-orange-400 font-bold flex items-center justify-center text-xs shrink-0">
              {property.ownerName.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-[11px] font-bold text-slate-300 truncate">{property.agencyName || property.ownerName}</p>
              <p className="text-[9px] text-amber-400 font-medium">Verified Agent</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenChatWithAgent(property.userId, property.ownerName, property.id, property.title);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Chat with Seller"
            >
              <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenBookingModal(property);
              }}
              className="px-2.5 py-1 rounded-lg gradient-btn text-white text-[10px] font-bold transition-all"
            >
              Book Token
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
