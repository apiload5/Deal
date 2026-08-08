import React, { useState } from 'react';
import { X, Plus, Sparkles, Building2, MapPin, CheckCircle2, ShieldCheck, Phone, Video, PhoneCall, MessageSquare, Clock, Calendar } from 'lucide-react';
import { Property, PropertyType, PropertyPurpose, FurnishedStatus, ListerPreferences } from '../../types';
import { PAKISTAN_CITIES, CITY_AREAS } from '../../data/mockData';
import { store } from '../../lib/store';
import { ImageUpload } from '../common/ImageUpload';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyCreated: (p: Property) => void;
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  onPropertyCreated
}) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState<PropertyPurpose>('sale');
  const [type, setType] = useState<PropertyType>('house');
  const [price, setPrice] = useState<number>(25000000);
  const [city, setCity] = useState('Islamabad');
  const [area, setArea] = useState('E-11');
  const [customArea, setCustomArea] = useState('');
  const [lat, setLat] = useState<number>(24.8607);
  const [lng, setLng] = useState<number>(67.0011);
  const [address, setAddress] = useState('');
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(3);
  const [sqft, setSqft] = useState(2200);
  const [furnished, setFurnished] = useState<FurnishedStatus>('unfurnished');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'
  ]);
  const [videoUrl, setVideoUrl] = useState('');
  const [allowOnlineToken, setAllowOnlineToken] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Solar Panel System',
    'Corner Plot'
  ]);

  // Lister Communication Preferences State
  const [showPhoneNumber, setShowPhoneNumber] = useState(true);
  const [allowVideoCall, setAllowVideoCall] = useState(true);
  const [allowVoiceCall, setAllowVoiceCall] = useState(true);
  const [allowWebRTCCall, setAllowWebRTCCall] = useState(true);
  const [allowChat, setAllowChat] = useState(true);
  const [allowWhatsApp, setAllowWhatsApp] = useState(true);
  const [availableFrom, setAvailableFrom] = useState('09:00');
  const [availableTo, setAvailableTo] = useState('18:00');
  const [availableDays, setAvailableDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

  if (!isOpen) return null;

  const availableAreas = CITY_AREAS[city] || ['Sector A', 'Sector B', 'Main Boulevard'];

  const allFeatures = [
    'Corner Plot (کونر پلاٹ)',
    'Main Boulevard Facing (مین بلیوارڈ)',
    'West Open (ویسٹ اوپن)',
    'Park Facing (پارک فیسنگ)',
    'Sun Facing / East Open',
    'Underground Electricity',
    'Gated Community & 24/7 Security',
    'Sewerage & Sui Gas Connected',
    'Dedicated Water Line / Bore',
    'Solar Panel System Installed',
    'Swimming Pool & Jacuzzi',
    'Servant Quarter with Bath',
    'Lawn & Landscaped Garden',
    'Elevator / Lift Access',
    'Backup Generator / Heavy UPS',
    'CCTV & Smart Lock Security',
    'Double Storey / Dual Kitchen',
    'Basement Car Parking',
    'Registered Leased Title Deed',
    'Near Mosque & Commercial Market',
    'Near Top Schools & Hospitals',
    'Boundary Wall & Security Gate'
  ];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter(d => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert('Please provide a property title');
      return;
    }

    const formatPkrPrice = (val: number): string => {
      if (!val || val <= 0) return 'PKR 0';
      if (val >= 10000000) {
        const crore = val / 10000000;
        const formatted = crore % 1 === 0 ? crore.toString() : crore.toFixed(2).replace(/\.?0+$/, '');
        return `PKR ${formatted} Crore`;
      }
      if (val >= 100000) {
        const lakh = val / 100000;
        const formatted = lakh % 1 === 0 ? lakh.toString() : lakh.toFixed(2).replace(/\.?0+$/, '');
        return `PKR ${formatted} Lakh`;
      }
      if (val >= 1000) {
        const thousand = val / 1000;
        const formatted = thousand % 1 === 0 ? thousand.toString() : thousand.toFixed(1).replace(/\.?0+$/, '');
        return `PKR ${formatted} Thousand`;
      }
      return `PKR ${val.toLocaleString()}`;
    };

    const priceFormatted = formatPkrPrice(price);

    const user = store.currentUser;

    const finalArea = area === 'Other / Custom Area' ? (customArea.trim() || 'Custom Sector') : area;

    const listerPreferences: ListerPreferences = {
      showPhoneNumber,
      allowVideoCall,
      allowVoiceCall,
      allowWebRTCCall,
      allowChat,
      allowWhatsApp,
      availableFrom,
      availableTo,
      availableDays,
      timezone: 'Asia/Karachi'
    };

    const newProperty = store.addProperty({
      title,
      description: description || 'Spacious modern property located in prime sector with full amenities and verified title documents.',
      type,
      purpose,
      price,
      priceFormatted,
      city,
      area: finalArea,
      address: address || `${finalArea}, ${city}`,
      beds,
      baths,
      sqft,
      furnished,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'],
      videoUrl,
      isPremium: user.role === 'agent' || user.role === 'agency',
      isFeatured: false,
      userId: user.id,
      userRole: user.role,
      ownerName: user.name,
      ownerPhone: user.phone || '+92 300 1234567',
      agencyName: user.companyName,
      lat: lat || 24.8607,
      lng: lng || 67.0011,
      features: selectedFeatures,
      allowOnlineToken,
      listerPreferences
    });

    onPropertyCreated(newProperty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card-glow w-full max-w-2xl rounded-3xl p-6 border border-orange-500/30 max-h-[85vh] overflow-y-auto shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">List Property on DealFast</h2>
              <p className="text-xs text-slate-400">Step {step} of 4: Enter property details & preferences</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress bar */}
        <div className="flex items-center space-x-2 mb-6">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                step >= s ? 'bg-orange-500' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleFinalSubmit} className="space-y-4 text-xs">
          
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Property Title *</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Kanal Brand New Villa DHA Phase 6"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Purpose</label>
                  <select
                    value={purpose}
                    onChange={e => setPurpose(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none"
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Property Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none"
                  >
                    <option value="house">House / Villa</option>
                    <option value="apartment">Apartment / Flat</option>
                    <option value="commercial">Commercial Plot / Plaza</option>
                    <option value="plot">Residential Plot</option>
                    <option value="penthouse">Penthouse</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Demand Price (PKR): {price >= 10000000 ? `${(price / 10000000).toFixed(2)} Crore` : `${(price / 100000).toFixed(2)} Lacs`}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 25000000"
                  value={price === 0 ? '' : price}
                  onChange={e => {
                    const raw = e.target.value.replace(/^0+(?=\d)/, '');
                    setPrice(raw === '' ? 0 : Number(raw));
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-orange-500"
                />
              </div>

              {/* Escrow Token Optional Toggle */}
              <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between">
                <div>
                  <label className="font-bold text-white text-xs flex items-center">
                    <ShieldCheck className="w-4 h-4 text-orange-400 mr-1.5" />
                    Accept Online Escrow Token (Bayana)?
                  </label>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    If enabled, buyers can pay 10% token online through DealFast Escrow.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={allowOnlineToken}
                  onChange={e => setAllowOnlineToken(e.target.checked)}
                  className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Beds</label>
                  <input
                    type="number"
                    placeholder="e.g. 3"
                    value={beds === 0 ? '' : beds}
                    onChange={e => {
                      const raw = e.target.value.replace(/^0+(?=\d)/, '');
                      setBeds(raw === '' ? 0 : Number(raw));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Baths</label>
                  <input
                    type="number"
                    placeholder="e.g. 3"
                    value={baths === 0 ? '' : baths}
                    onChange={e => {
                      const raw = e.target.value.replace(/^0+(?=\d)/, '');
                      setBaths(raw === '' ? 0 : Number(raw));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Area (sqft)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2200"
                    value={sqft === 0 ? '' : sqft}
                    onChange={e => {
                      const raw = e.target.value.replace(/^0+(?=\d)/, '');
                      setSqft(raw === '' ? 0 : Number(raw));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">City</label>
                  <select
                    value={city}
                    onChange={e => {
                      setCity(e.target.value);
                      const arr = CITY_AREAS[e.target.value];
                      if (arr && arr[0]) setArea(arr[0]);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none"
                  >
                    {PAKISTAN_CITIES.slice(1).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Area / Sector ({availableAreas.length} Areas)</label>
                  <select
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none"
                  >
                    {availableAreas.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Area Name if 'Other / Custom Area' selected */}
              {area === 'Other / Custom Area' && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                  <label className="block text-amber-300 font-bold text-xs flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1" /> Custom Society / New Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Garden City Phase 3 / New Suburban Enclave..."
                    value={customArea}
                    onChange={e => setCustomArea(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-400">
                    If your society is new or out-of-city, write the exact name here for indexing.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Address</label>
                <input
                  type="text"
                  placeholder="House 42, Street 18, Block B..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none"
                />
              </div>

              {/* Exact Map Pinpoint Coordinates (GPS) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-white text-xs flex items-center">
                      <MapPin className="w-4 h-4 text-orange-400 mr-1.5" /> Exact Map GPS Location Pinpoint
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Pinpoint exact plot/building on DealFast Interactive Map
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          pos => {
                            setLat(Number(pos.coords.latitude.toFixed(6)));
                            setLng(Number(pos.coords.longitude.toFixed(6)));
                            alert(`GPS Coordinates Pinpointed!\nLat: ${pos.coords.latitude}\nLng: ${pos.coords.longitude}`);
                          },
                          () => alert('Could not fetch GPS automatically. You can enter Lat & Lng manually below.')
                        );
                      }
                    }}
                    className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 px-3 py-1.5 rounded-xl font-bold text-[10px] transition-all flex items-center space-x-1"
                  >
                    <MapPin className="w-3 h-3 text-orange-400" />
                    <span>Get GPS Pin</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-slate-400 text-[10px]">Latitude (e.g. 24.8607)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lat}
                      onChange={e => setLat(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px]">Longitude (e.g. 67.0011)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lng}
                      onChange={e => setLng(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Furnishing Status</label>
                <select
                  value={furnished}
                  onChange={e => setFurnished(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none"
                >
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi-furnished">Semi Furnished</option>
                  <option value="furnished">Fully Furnished</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detail Spanish tiles, German fittings, double height lobby..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-2">Select Amenities & Key Features</label>
                <div className="grid grid-cols-2 gap-2">
                  {allFeatures.map(f => {
                    const checked = selectedFeatures.includes(f);
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFeature(f)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          checked
                            ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{f}</span>
                        {checked && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <ImageUpload
                label="Property Images (Cloudinary CDN)"
                onUploadComplete={newUrls => setImages(newUrls)}
                existingUrls={images}
              />

              <div>
                <label className="block text-slate-300 font-bold mb-1">YouTube / Video Tour Embed Link (Optional)</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-1">
                <h4 className="text-xs font-bold text-orange-400 flex items-center">
                  <PhoneCall className="w-4 h-4 mr-1.5" /> Lister Communication Preferences & Availability
                </h4>
                <p className="text-[11px] text-slate-300">
                  Configure how potential buyers or renters can contact you for this property listing.
                </p>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <span className="flex items-center text-slate-200 text-xs font-medium">
                    <Phone className="w-3.5 h-3.5 text-orange-400 mr-2" /> Show Phone Number
                  </span>
                  <input
                    type="checkbox"
                    checked={showPhoneNumber}
                    onChange={e => setShowPhoneNumber(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <span className="flex items-center text-slate-200 text-xs font-medium">
                    <Video className="w-3.5 h-3.5 text-purple-400 mr-2" /> Allow Video Calls
                  </span>
                  <input
                    type="checkbox"
                    checked={allowVideoCall}
                    onChange={e => setAllowVideoCall(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <span className="flex items-center text-slate-200 text-xs font-medium">
                    <PhoneCall className="w-3.5 h-3.5 text-amber-400 mr-2" /> Allow Voice Calls
                  </span>
                  <input
                    type="checkbox"
                    checked={allowVoiceCall}
                    onChange={e => setAllowVoiceCall(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <span className="flex items-center text-slate-200 text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 mr-2" /> Allow WebRTC Browser Calls
                  </span>
                  <input
                    type="checkbox"
                    checked={allowWebRTCCall}
                    onChange={e => setAllowWebRTCCall(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <span className="flex items-center text-slate-200 text-xs font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400 mr-2" /> Allow Instant Chat
                  </span>
                  <input
                    type="checkbox"
                    checked={allowChat}
                    onChange={e => setAllowChat(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <span className="flex items-center text-slate-200 text-xs font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400 mr-2" /> Allow WhatsApp Inquiries
                  </span>
                  <input
                    type="checkbox"
                    checked={allowWhatsApp}
                    onChange={e => setAllowWhatsApp(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Time Slots */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-slate-300 font-bold text-xs flex items-center">
                  <Clock className="w-3.5 h-3.5 text-orange-400 mr-1.5" /> Daily Available Hours
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400">Available From</label>
                    <input
                      type="time"
                      value={availableFrom}
                      onChange={e => setAvailableFrom(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Available To</label>
                    <input
                      type="time"
                      value={availableTo}
                      onChange={e => setAvailableTo(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Days Selection */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-slate-300 font-bold text-xs flex items-center">
                  <Calendar className="w-3.5 h-3.5 text-amber-400 mr-1.5" /> Available Days of Week
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {daysOfWeek.map(day => {
                    const active = availableDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          active
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-slate-800 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-bold"
              >
                Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="gradient-btn text-white px-5 py-2 rounded-xl font-bold"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                className="gradient-btn text-white px-6 py-2 rounded-xl font-black shadow-lg shadow-orange-500/20"
              >
                Submit Listing
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
