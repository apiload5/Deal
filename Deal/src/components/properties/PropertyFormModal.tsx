import React, { useState } from 'react';
import { X, Plus, Sparkles, Building2, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Property, PropertyType, PropertyPurpose, FurnishedStatus } from '../../types';
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
  const [address, setAddress] = useState('');
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(3);
  const [sqft, setSqft] = useState(2200);
  const [furnished, setFurnished] = useState<FurnishedStatus>('unfurnished');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'
  ]);
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Solar Panel System',
    'Corner Plot'
  ]);

  if (!isOpen) return null;

  const availableAreas = CITY_AREAS[city] || ['Sector A', 'Sector B', 'Main Boulevard'];

  const allFeatures = [
    'Solar Panel System',
    'Swimming Pool',
    'Corner Plot',
    'Servant Quarter',
    'Lawn / Garden',
    'Margalla / Seaview',
    'Bore Water',
    'Elevator Access',
    'Backup Generator',
    'CCTV Security'
  ];

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

    const priceFormatted =
      price >= 10000000
        ? `PKR ${(price / 10000000).toFixed(2)} Crore`
        : `PKR ${(price / 100000).toFixed(2)} Lacs`;

    const user = store.currentUser;

    const newProperty = store.addProperty({
      title,
      description: description || 'Spacious modern property located in prime sector with full amenities and verified title documents.',
      type,
      purpose,
      price,
      priceFormatted,
      city,
      area,
      address: address || `${area}, ${city}`,
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
      lat: 33.7,
      lng: 73.1,
      features: selectedFeatures
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
              <h2 className="text-lg font-black text-white">List Property on Deal.pk</h2>
              <p className="text-xs text-slate-400">Step {step} of 3: Enter complete property specifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress bar */}
        <div className="flex items-center space-x-2 mb-6">
          {[1, 2, 3].map(s => (
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
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Beds</label>
                  <input
                    type="number"
                    value={beds}
                    onChange={e => setBeds(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Baths</label>
                  <input
                    type="number"
                    value={baths}
                    onChange={e => setBaths(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Area (sqft)</label>
                  <input
                    type="number"
                    value={sqft}
                    onChange={e => setSqft(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none"
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
                  <label className="block text-slate-300 font-bold mb-1">Area / Sector</label>
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

            {step < 3 ? (
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
