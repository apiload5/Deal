import React, { useState } from 'react';
import {
  X,
  Heart,
  Share2,
  ShieldCheck,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  PhoneCall,
  Video,
  MessageSquare,
  Sparkles,
  Calculator,
  Building,
  CheckCircle2,
  Play,
  Layers,
  Calendar,
  Eye
} from 'lucide-react';
import { Property } from '../../types';
import { store } from '../../lib/store';
import { MortgageCalculator } from '../common/MortgageCalculator';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onOpenBookingModal: (p: Property) => void;
  onOpenChatWithAgent: (agentId: string, agentName: string, pId?: string, pTitle?: string) => void;
  onStartCall: (agentName: string, agentAvatar?: string, isVideo?: boolean) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onOpenBookingModal,
  onOpenChatWithAgent,
  onStartCall
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'virtual' | 'mortgage' | 'map'>('overview');
  const [selectedImage, setSelectedImage] = useState<string>(property?.images[0] || '');

  if (!property) return null;

  const isFav = store.isFavorite(property.id);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Property link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in overflow-y-auto">
      <div className="glass-card-glow w-full max-w-5xl rounded-3xl p-4 sm:p-6 border border-orange-500/30 my-auto shadow-2xl relative max-h-[92vh] overflow-y-auto">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-500 text-white">
                {property.purpose === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
              {property.isPremium && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" /> Premium Gold
                </span>
              )}
              <span className="text-xs text-slate-400 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 mr-1" /> Deal.pk Escrow Guaranteed
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white mt-1 leading-snug">{property.title}</h2>
            <p className="text-xs text-slate-400 flex items-center mt-1">
              <MapPin className="w-3.5 h-3.5 mr-1 text-orange-400" />
              <span>{property.address}, {property.area}, {property.city}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => store.toggleFavorite(property.id)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-red-500 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gallery Preview Box */}
        <div className="mt-4 space-y-3">
          <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
            <img
              src={selectedImage || property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-orange-400" />
              <span>{property.views} Views</span>
            </div>
          </div>

          {/* Thumbnails row */}
          {property.images.length > 1 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    (selectedImage || property.images[0]) === img ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 py-3 mt-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview & Specs' },
            { id: 'virtual', label: 'Virtual 3D & Video' },
            { id: 'mortgage', label: 'Mortgage Calculator' },
            { id: 'map', label: 'Location Map' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === t.id
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content Areas */}
        <div className="mt-6 space-y-6">
          
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Specs & Features */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Price Box */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demand Price</p>
                    <p className="text-2xl sm:text-3xl font-black text-white gradient-text">{property.priceFormatted}</p>
                  </div>
                  <button
                    onClick={() => onOpenBookingModal(property)}
                    className="gradient-btn text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20"
                  >
                    Book Token (10%)
                  </button>
                </div>

                {/* Key Metrics Pills */}
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <Bed className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-white">{property.beds} Beds</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <Bath className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-white">{property.baths} Baths</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <Maximize2 className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-white">{property.sqft} sqft</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <Building className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-white capitalize">{property.furnished}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Property Description</h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    {property.description}
                  </p>
                </div>

                {/* Features & Amenities */}
                {property.features.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Features & Amenities</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {property.features.map(f => (
                        <div key={f} className="flex items-center space-x-2 text-xs text-slate-200 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Seller / Agent Contact Card */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 font-black text-lg flex items-center justify-center">
                      {property.ownerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{property.ownerName}</p>
                      <p className="text-xs text-amber-400 font-semibold">{property.agencyName || 'Direct Owner / Agent'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{property.ownerPhone}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* WebRTC Video Call */}
                    <button
                      onClick={() => onStartCall(property.ownerName, property.ownerAvatar, true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg transition-all"
                    >
                      <Video className="w-4 h-4" />
                      <span>WebRTC Video Call</span>
                    </button>

                    {/* WebRTC Voice Call */}
                    <button
                      onClick={() => onStartCall(property.ownerName, property.ownerAvatar, false)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all"
                    >
                      <PhoneCall className="w-4 h-4 text-orange-400" />
                      <span>Voice Call</span>
                    </button>

                    {/* Real-time Chat */}
                    <button
                      onClick={() => onOpenChatWithAgent(property.userId, property.ownerName, property.id, property.title)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <span>Send Instant Chat</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-slate-300">
                    <p className="font-bold text-orange-400 flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Deal.pk Escrow Protection
                    </p>
                    <p className="mt-1 text-slate-400">
                      Token money is strictly held in escrow until physical site verification & NOC clearance.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'virtual' && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                <Play className="w-8 h-8 fill-orange-400" />
              </div>
              <h4 className="text-base font-bold text-white">Interactive 3D Virtual Walkthrough Tour</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Matterport 3D Tour & High Definition Video Inspection of this {property.title}.
              </p>
              <div className="aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                <iframe
                  title="Virtual Tour"
                  src={property.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {activeTab === 'mortgage' && (
            <MortgageCalculator initialPrice={property.price} />
          )}

          {activeTab === 'map' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Location Map ({property.city})</h4>
              <p className="text-xs text-slate-400 mb-4">{property.address}</p>
              <div className="h-72 w-full rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                <MapPin className="w-10 h-10 text-orange-500 animate-bounce" />
                <span className="text-xs font-bold text-slate-300 absolute bottom-4 bg-slate-950/90 px-3 py-1 rounded-lg border border-slate-800">
                  Exact sector coordinates locked for verified buyers
                </span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
