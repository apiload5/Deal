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
  Eye,
  ZoomIn,
  ZoomOut,
  Star,
  Printer,
  Send,
  Clock,
  Copy,
  ExternalLink,
  ThumbsUp,
  Trash2,
  Download
} from 'lucide-react';
import { Property } from '../../types';
import { store } from '../../lib/store';
import { MortgageCalculator } from '../common/MortgageCalculator';
import { downloadPropertyBrochurePDF } from '../../utils/pdfGenerator';
import { WatermarkedImage, downloadWatermarkedImage } from '../../utils/imageWatermark';
import { DealLogo } from '../common/DealLogo';
import { DeletePropertyModal } from './DeletePropertyModal';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onOpenBookingModal: (p: Property) => void;
  onOpenChatWithAgent: (agentId: string, agentName: string, pId?: string, pTitle?: string) => void;
  onStartCall: (agentName: string, agentAvatar?: string, isVideo?: boolean) => void;
  onOpenVerificationPortal?: (tab?: 'noc' | 'fard', societyName?: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onOpenBookingModal,
  onOpenChatWithAgent,
  onStartCall,
  onOpenVerificationPortal
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'schedule' | 'virtual' | 'mortgage' | 'map'>('overview');
  const [selectedImage, setSelectedImage] = useState<string>(property?.images[0] || '');

  // Image Magnifier / Hover Zoom & Lightbox State
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  // Share Modal & Toast
  const [shareOpen, setShareOpen] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Schedule Visit State
  const [visitDate, setVisitDate] = useState('');
  const [visitTimeSlot, setVisitTimeSlot] = useState('11:00 AM');
  const [visitPhone, setVisitPhone] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [visitSuccess, setVisitSuccess] = useState(false);

  // Review Form State
  const [reviews, setReviews] = useState([
    { id: 'r1', name: 'Zainab Ahmed', rating: 5, date: '2 days ago', comment: 'Excellent location in DHA! Visited physically with agent and documents were 100% verified.' },
    { id: 'r2', name: 'Raza Farooq', rating: 4, date: '1 week ago', comment: 'Very clean property construction and responsive builder.' }
  ]);
  const [userRating, setUserRating] = useState(5);
  const [userReviewText, setUserReviewText] = useState('');
  const [reviewPostedSuccess, setReviewPostedSuccess] = useState(false);

  // Contact Inquiry Form State
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Overseas Currency Conversion State
  const [selectedCurrency, setSelectedCurrency] = useState<'PKR' | 'USD' | 'AED' | 'SAR' | 'GBP'>('PKR');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!property) return null;

  const currentUser = store.currentUser;
  const isOwnerOrAdmin = currentUser && (currentUser.id === property.userId || currentUser.role === 'admin');

  const getConvertedPrice = (pkrPrice: number, curr: 'PKR' | 'USD' | 'AED' | 'SAR' | 'GBP') => {
    if (curr === 'USD') return `$ ${(pkrPrice / 278).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (curr === 'AED') return `${(pkrPrice / 75.6).toLocaleString(undefined, { maximumFractionDigits: 0 })} AED`;
    if (curr === 'SAR') return `${(pkrPrice / 74.1).toLocaleString(undefined, { maximumFractionDigits: 0 })} SAR`;
    if (curr === 'GBP') return `£ ${(pkrPrice / 352).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    return property.priceFormatted;
  };

  const prefs = property.listerPreferences || {
    showPhoneNumber: true,
    allowVideoCall: true,
    allowVoiceCall: true,
    allowWebRTCCall: true,
    allowChat: true,
    allowWhatsApp: true,
    availableFrom: '09:00',
    availableTo: '18:00',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timezone: 'Asia/Karachi'
  };

  const getAvailabilityStatus = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = dayNames[now.getDay()];

    if (prefs.availableDays && !prefs.availableDays.includes(currentDay)) {
      return { status: 'offline', label: '📅 Unavailable today', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };
    }

    if (prefs.availableFrom && prefs.availableTo) {
      if (currentTime < prefs.availableFrom || currentTime > prefs.availableTo) {
        return {
          status: 'offline',
          label: `⏰ Available ${prefs.availableFrom} - ${prefs.availableTo}`,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/30'
        };
      }
    }

    return { status: 'online', label: '🟢 Available now', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  };

  const availStatus = getAvailabilityStatus();

  const currentImg = selectedImage || property.images[0];
  const isFav = store.isFavorite(property.id);

  // Similar properties calculation
  const similarProps = store.properties.filter(p => p.id !== property.id && (p.city === property.city || p.type === property.type)).slice(0, 3);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((touch.clientX - left) / width) * 100));
      const y = Math.max(0, Math.min(100, ((touch.clientY - top) / height) * 100));
      setZoomPos({ x, y });
      setIsHovering(true);
    }
  };

  const showShareNotice = (msg: string) => {
    setShareToast(msg);
    setTimeout(() => setShareToast(null), 3000);
  };

  const handlePrint = () => {
    downloadPropertyBrochurePDF({
      title: property.title,
      priceFormatted: property.priceFormatted || `PKR ${property.price.toLocaleString()}`,
      address: property.address,
      city: property.city,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
      type: property.type,
      ownerName: property.ownerName || 'Verified Agent',
      agencyName: property.agencyName,
      description: property.description
    });
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userReviewText.trim()) return;
    const newR = {
      id: `rev-${Date.now()}`,
      name: store.currentUser.name || 'Verified Buyer',
      rating: userRating,
      date: 'Just now',
      comment: userReviewText
    };
    setReviews([newR, ...reviews]);
    setUserReviewText('');
    setReviewPostedSuccess(true);
    setTimeout(() => setReviewPostedSuccess(false), 4000);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addInquiry({
      propertyId: property.id,
      propertyTitle: property.title,
      userName: store.currentUser.name || 'Buyer',
      userPhone: visitPhone || store.currentUser.phone || '0300-0000000',
      message: `[SCHEDULED SITE VISIT] Preferred Date: ${visitDate || 'Tomorrow'}, Slot: ${visitTimeSlot}. Notes: ${visitNotes}`
    });
    setVisitSuccess(true);
    setTimeout(() => setVisitSuccess(false), 5000);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addInquiry({
      propertyId: property.id,
      propertyTitle: property.title,
      userName: store.currentUser.name || 'Interested Buyer',
      userPhone: inquiryPhone || store.currentUser.phone || '0300-0000000',
      message: inquiryMsg || `Hi, I am interested in ${property.title}. Please contact me with details.`
    });
    setInquirySuccess(true);
    setInquiryMsg('');
    setTimeout(() => setInquirySuccess(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in overflow-y-auto">
      <div className="glass-card-glow w-full max-w-5xl rounded-3xl p-4 sm:p-6 border border-orange-500/30 my-auto shadow-2xl relative max-h-[92vh] overflow-y-auto">
        
        {/* Floating Close Button for Mobile Accessibility */}
        <button
          onClick={onClose}
          className="sm:hidden absolute top-3 right-3 z-30 p-2.5 rounded-full bg-slate-900/90 border border-slate-700 text-white shadow-xl hover:bg-red-600 transition-colors"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3 pr-10 sm:pr-0">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-500 text-white">
                {property.purpose === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
              {property.isPremium && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" /> Premium Gold
                </span>
              )}
              <span className="text-[11px] sm:text-xs text-slate-400 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 mr-1" /> DealFast Escrow Guaranteed
              </span>
            </div>
            <h2 className="text-base sm:text-2xl font-black text-white mt-1.5 leading-snug">{property.title}</h2>
            <p className="text-xs text-slate-400 flex items-center mt-1">
              <MapPin className="w-3.5 h-3.5 mr-1 text-orange-400 shrink-0" />
              <span className="truncate">{property.address}, {property.area}, {property.city}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => store.toggleFavorite(property.id)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-red-500 transition-colors"
              title="Save to Favorites"
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button
              onClick={() => setShareOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Share Property"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
              title="Print Property Sheet / PDF"
            >
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {isOwnerOrAdmin && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 sm:p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                title="Delete Listing (Move to Recycle Bin)"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="hidden sm:flex p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gallery Preview Box with Hover/Touch Magnifier Zoom */}
        <div className="mt-4 space-y-3">
          <div
            className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 cursor-crosshair group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
              setIsHovering(false);
              setZoomPos(null);
            }}
            onMouseMove={handleMouseMove}
            onTouchStart={() => setIsHovering(true)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => {
              setIsHovering(false);
              setZoomPos(null);
            }}
            onClick={() => setLightboxOpen(true)}
          >
            {/* Base Image with baked watermark */}
            <WatermarkedImage
              src={currentImg}
              alt={property.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isHovering && zoomPos ? 'opacity-30' : 'opacity-100'
              }`}
            />

            {/* Hover / Touch Magnified Background Zoom Overlay */}
            {isHovering && zoomPos && (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-75"
                style={{
                  backgroundImage: `url(${currentImg})`,
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                  backgroundSize: '280%',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            )}

            {/* Top Badge Indicators */}
            <div className="absolute top-3 right-3 flex items-center space-x-2 pointer-events-none">
              <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-amber-400 border border-amber-500/30 flex items-center space-x-1 shadow-lg">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>{isHovering ? 'Zooming High-Res' : 'Hover / Touch to Zoom'}</span>
              </div>
              <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5 text-orange-400" />
                <span>{property.views} Views</span>
              </div>
            </div>

            {/* Tap to expand overlay */}
            <div className="absolute bottom-3 left-3 flex items-center z-20 pointer-events-auto">
              <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-200 border border-slate-800 flex items-center space-x-1">
                <Maximize2 className="w-3.5 h-3.5 text-orange-400" />
                <span>Tap to Open Lightbox</span>
              </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 border-b border-slate-800 py-3 mt-4 w-full">
          {[
            { id: 'overview', label: 'Overview & Specs' },
            { id: 'schedule', label: '📅 Schedule Visit' },
            { id: 'reviews', label: `⭐ Reviews (${reviews.length})` },
            { id: 'virtual', label: 'Virtual 3D & Video' },
            { id: 'mortgage', label: 'Mortgage Calculator' },
            { id: 'map', label: 'Location Map' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`min-h-[40px] px-3 py-2 text-center flex items-center justify-center rounded-xl text-xs font-bold transition-all border ${
                activeTab === t.id
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content Areas */}
        <div className="mt-6 space-y-6">
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Specs & Features */}
                <div className="lg:col-span-2 space-y-6">
                
                {/* Price Box */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demand Price</p>
                        {/* Currency Selector Pills for Overseas Buyers */}
                        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
                          {(['PKR', 'USD', 'AED', 'SAR', 'GBP'] as const).map(curr => (
                            <button
                              key={curr}
                              onClick={() => setSelectedCurrency(curr)}
                              className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                selectedCurrency === curr
                                  ? 'bg-orange-500 text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {curr}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl font-black text-white gradient-text mt-0.5">
                        {getConvertedPrice(property.price, selectedCurrency)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {onOpenVerificationPortal && (
                        <button
                          onClick={() => onOpenVerificationPortal('noc', property.area || property.title)}
                          className="bg-blue-600/90 hover:bg-blue-500 text-white border border-blue-400/50 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-blue-500/20"
                          title="Verify CDA/RDA/LDA NOC & PLRA Title Deed directly"
                        >
                          <ShieldCheck className="w-4 h-4 text-white" />
                          <span>🏛️ Verify NOC & Title</span>
                        </button>
                      )}

                      {property.allowOnlineToken ? (
                        <button
                          onClick={() => onOpenBookingModal(property)}
                          className="gradient-btn text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 hover:brightness-110"
                        >
                          Book Token (10% Escrow)
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenChatWithAgent(property.userId, property.ownerName, property.id, property.title)}
                          className="bg-slate-900 border border-orange-500/40 text-orange-400 hover:bg-orange-500 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Contact Agent / Inquire</span>
                        </button>
                      )}
                    </div>
                  </div>
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

                {/* Government NOC & Patwari e-Fard Verification Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-700/80 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-500/20 border border-blue-500/40 rounded-xl text-blue-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Government Legal Clearance Check</span>
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Live
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Check CDA/RDA/LDA NOC approval or PLRA e-Fard malkiyat ledger for {property.area}, {property.city}
                      </p>
                    </div>
                  </div>

                  {onOpenVerificationPortal && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenVerificationPortal('noc', `${property.area}, ${property.city}`)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
                      >
                        🏛️ Verify Society NOC
                      </button>
                      <button
                        onClick={() => onOpenVerificationPortal('fard', `${property.area}, ${property.city}`)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
                      >
                        📜 Check e-Fard Ledger
                      </button>
                    </div>
                  )}
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
                  
                  {/* Availability Badge */}
                  <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${availStatus.bg}`}>
                    <span className={availStatus.color}>{availStatus.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {prefs.availableFrom} - {prefs.availableTo} PKT
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 font-black text-lg flex items-center justify-center">
                      {property.ownerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{property.ownerName}</p>
                      <p className="text-xs text-amber-400 font-semibold">{property.agencyName || 'Direct Owner / Agent'}</p>
                      {prefs.showPhoneNumber ? (
                        <p className="text-[10px] text-slate-400 mt-0.5">{property.ownerPhone}</p>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic mt-0.5">🔒 Phone hidden by lister</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Real-time Chat */}
                    <button
                      onClick={() => onOpenChatWithAgent(property.userId, property.ownerName, property.id, property.title)}
                      className="bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Instant Chat</span>
                    </button>

                    {/* Voice Call */}
                    {prefs.allowVoiceCall && (
                      <button
                        onClick={() => onStartCall(property.ownerName, property.ownerAvatar, false)}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 py-2.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span className="truncate">Voice Call</span>
                      </button>
                    )}

                    {/* WebRTC Video Call */}
                    {(prefs.allowVideoCall || prefs.allowWebRTCCall) && (
                      <button
                        onClick={() => onStartCall(property.ownerName, property.ownerAvatar, true)}
                        className="bg-purple-950/80 hover:bg-purple-900/80 text-purple-200 border border-purple-500/40 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <Video className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">Video Call</span>
                      </button>
                    )}

                    {/* WhatsApp */}
                    {prefs.allowWhatsApp && (
                      <a
                        href={`https://wa.me/${property.ownerPhone.replace(/[^0-9]/g, '')}?text=Hi,%20I'm%20interested%20in%20your%20property:%20${encodeURIComponent(property.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">WhatsApp</span>
                      </a>
                    )}
                  </div>

                  {/* Instant Inquiry Form */}
                  <form onSubmit={handleInquirySubmit} className="pt-3 border-t border-slate-800 space-y-2.5">
                    <p className="text-xs font-bold text-white flex items-center">
                      <Send className="w-3.5 h-3.5 text-orange-400 mr-1.5" /> Direct Inquiry to Seller
                    </p>
                    {inquirySuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        ✓ Inquiry sent! Agent will reach out shortly.
                      </div>
                    )}
                    <input
                      type="tel"
                      placeholder="Your Phone Number"
                      value={inquiryPhone}
                      onChange={e => setInquiryPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500"
                    />
                    <textarea
                      placeholder="Ask about price negotiation, possession, NOC..."
                      value={inquiryMsg}
                      onChange={e => setInquiryMsg(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500 resize-none"
                    />
                    <button
                      type="submit"
                      className="w-full gradient-btn text-white py-2 rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 hover:brightness-110"
                    >
                      Send Message Inquiry
                    </button>
                  </form>

                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-slate-300">
                    <p className="font-bold text-orange-400 flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> DealFast Escrow Protection
                    </p>
                    <p className="mt-1 text-slate-400">
                      Token money is strictly held in escrow until physical site verification & NOC clearance.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Similar Properties Section */}
            {similarProps.length > 0 && (
              <div className="pt-6 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center">
                    <Sparkles className="w-4 h-4 text-orange-400 mr-2" />
                    <span>Similar Properties in {property.city}</span>
                  </h4>
                  <span className="text-xs text-slate-400">Handpicked Recommendations</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {similarProps.map(sim => (
                    <div
                      key={sim.id}
                      onClick={() => {
                        setSelectedImage(sim.images[0] || '');
                        setActiveTab('overview');
                      }}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-orange-500/50 transition-all cursor-pointer group"
                    >
                      <div className="h-28 rounded-xl overflow-hidden relative mb-2">
                        <img src={sim.images[0]} alt={sim.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-slate-950/80 text-[10px] font-bold text-orange-400 border border-orange-500/30">
                          {sim.priceFormatted}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{sim.title}</p>
                      <p className="text-[10px] text-slate-400 flex items-center mt-1">
                        <MapPin className="w-3 h-3 text-orange-400 mr-1" /> {sim.area}, {sim.city}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}

          {/* SCHEDULE VISIT TAB */}
          {activeTab === 'schedule' && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
              <div className="text-center max-w-lg mx-auto space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Book Physical Site Visit</h4>
                <p className="text-xs text-slate-400">
                  Select a convenient date and time slot. Our verified field manager or property agent will accompany you to inspect <span className="text-white font-semibold">{property.title}</span>.
                </p>
              </div>

              {visitSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center max-w-md mx-auto space-y-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-white">Site Visit Request Booked!</p>
                  <p className="text-xs text-slate-300">
                    Agent <span className="text-amber-400 font-bold">{property.ownerName}</span> has received your appointment request for {visitDate || 'Tomorrow'} ({visitTimeSlot}).
                  </p>
                </div>
              ) : (
                <form onSubmit={handleScheduleSubmit} className="max-w-md mx-auto space-y-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={visitDate}
                      onChange={e => setVisitDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Preferred Time Slot</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['10:00 AM', '02:00 PM', '05:00 PM'].map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setVisitTimeSlot(slot)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            visitTimeSlot === slot
                              ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Contact Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0300-1234567"
                      value={visitPhone}
                      onChange={e => setVisitPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Additional Notes / Instructions</label>
                    <textarea
                      placeholder="Any specific questions or request for NOC documents on site..."
                      value={visitNotes}
                      onChange={e => setVisitNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full gradient-btn text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 hover:brightness-110 flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Confirm Site Visit Appointment</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* REVIEWS & RATINGS TAB */}
          {activeTab === 'reviews' && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400 mr-2" />
                    <span>Property Reviews & Feedback</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Real feedback from verified site visitors & buyers</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
                  <div className="text-3xl font-black text-amber-400">4.8</div>
                  <div className="text-xs">
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{reviews.length} Verified Reviews</p>
                  </div>
                </div>
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <p className="text-xs font-bold text-white">Leave a Review for this Property</p>
                {reviewPostedSuccess && (
                  <p className="text-xs font-bold text-emerald-400">✓ Review posted successfully!</p>
                )}
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-slate-400 mr-2">Your Rating:</span>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${star <= userRating ? 'fill-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  required
                  placeholder="Share details about the neighborhood, construction quality, agent honesty..."
                  value={userReviewText}
                  onChange={e => setUserReviewText(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500 resize-none"
                />
                <button
                  type="submit"
                  className="gradient-btn text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  Submit Review
                </button>
              </form>

              {/* Existing Reviews List */}
              <div className="space-y-3">
                {reviews.map(rev => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center">
                          {rev.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{rev.name}</p>
                          <p className="text-[10px] text-slate-400">{rev.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-10">{rev.comment}</p>
                  </div>
                ))}
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

      {/* FULLSCREEN LIGHTBOX MODAL WITH MULTI-LEVEL ZOOM CONTROLS */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in">
          {/* Top Bar */}
          <div className="w-full max-w-6xl flex items-center justify-between z-10">
            <div>
              <h3 className="text-white font-black text-sm sm:text-base">{property.title}</h3>
              <p className="text-xs text-amber-400">Pinch or use zoom buttons to examine property photo details</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLightboxZoom(prev => Math.min(3, prev + 0.5))}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white hover:border-orange-500 font-bold text-xs flex items-center space-x-1"
              >
                <ZoomIn className="w-4 h-4 text-orange-400" />
                <span className="hidden sm:inline">Zoom In</span>
              </button>
              <button
                onClick={() => setLightboxZoom(prev => Math.max(1, prev - 0.5))}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white hover:border-orange-500 font-bold text-xs flex items-center space-x-1"
              >
                <ZoomOut className="w-4 h-4 text-orange-400" />
                <span className="hidden sm:inline">Zoom Out</span>
              </button>
              <button
                onClick={() => {
                  setLightboxOpen(false);
                  setLightboxZoom(1);
                }}
                className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Image Container with Baked Watermark */}
          <div className="flex-1 w-full max-w-6xl flex items-center justify-center overflow-auto p-2 my-2 relative">
            <div className="relative inline-block max-h-[80vh] max-w-full">
              <WatermarkedImage
                src={currentImg}
                alt="High-Res Zoom"
                style={{ transform: `scale(${lightboxZoom})` }}
                className="max-h-[80vh] max-w-full object-contain transition-transform duration-200 cursor-grab active:cursor-grabbing rounded-xl shadow-2xl"
              />
            </div>
          </div>

          {/* Bottom Thumbnails */}
          {property.images.length > 1 && (
            <div className="flex items-center space-x-2 overflow-x-auto p-2 max-w-xl no-scrollbar z-10">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    currentImg === img ? 'border-orange-500 ring-2 ring-orange-500/50 scale-105' : 'border-slate-800 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SHARE MODAL OVERLAY */}
      {shareOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Share2 className="w-4 h-4 text-orange-400 mr-2" />
                <span>Share Property Listing</span>
              </h3>
              <button
                onClick={() => setShareOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {shareToast && (
              <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs text-center font-bold">
                {shareToast}
              </div>
            )}

            <p className="text-xs text-slate-300 line-clamp-2">{property.title}</p>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out this property on DealFast: ${property.title} - ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center space-x-2 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center space-x-2 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Facebook</span>
              </a>
            </div>

            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(window.location.href);
                  showShareNotice('✓ Direct link copied to clipboard!');
                }
              }}
              className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all"
            >
              <Copy className="w-4 h-4 text-amber-400" />
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Property Security Modal */}
      <DeletePropertyModal
        isOpen={isDeleteModalOpen}
        property={property}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => {
          setIsDeleteModalOpen(false);
          onClose();
        }}
      />

    </div>
  );
};
