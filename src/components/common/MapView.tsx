import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Layers, Navigation, ExternalLink, Compass, Search, Loader2 } from 'lucide-react';
import { Property } from '../../types';
import { PAKISTAN_CITIES } from '../../data/mockData';

interface MapViewProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

interface AddressSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export const MapView: React.FC<MapViewProps> = ({ properties, onSelectProperty }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [L, setL] = useState<any>(null);

  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [activePin, setActivePin] = useState<Property | null>(properties[0] || null);

  // Load Leaflet dynamically on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Promise.all([
        import('leaflet'),
        import('leaflet/dist/leaflet.css')
      ]).then(([leafletModule]) => {
        const Leaflet = leafletModule.default || leafletModule;
        try {
          delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;
          Leaflet.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          });
        } catch (err) {
          console.warn('Leaflet icon config notice:', err);
        }
        setL(Leaflet);
      }).catch(err => {
        console.error('Failed to load Leaflet:', err);
      });
    }
  }, []);

  // Address Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const cityCoords: Record<string, { lat: number; lng: number }> = {
    Islamabad: { lat: 33.6844, lng: 73.0479 },
    Lahore: { lat: 31.5204, lng: 74.3587 },
    Karachi: { lat: 24.8607, lng: 67.0011 },
    Rawalpindi: { lat: 33.5651, lng: 73.0169 },
    Peshawar: { lat: 34.0151, lng: 71.5249 },
    Faisalabad: { lat: 31.4504, lng: 73.1350 },
    Multan: { lat: 30.1575, lng: 71.5249 },
    Quetta: { lat: 30.1798, lng: 66.9750 },
    Gujranwala: { lat: 32.1877, lng: 74.1945 },
    Sialkot: { lat: 32.4945, lng: 74.5229 },
    Hyderabad: { lat: 25.3960, lng: 68.3578 },
    Abbottabad: { lat: 34.1688, lng: 73.2215 },
    Bahawalpur: { lat: 29.3544, lng: 71.6911 },
    Sargodha: { lat: 32.0836, lng: 72.6711 },
    Sukkur: { lat: 27.7131, lng: 68.8485 },
    Mardan: { lat: 34.1986, lng: 72.0404 },
    Larkana: { lat: 27.5590, lng: 68.2120 },
    Sheikhupura: { lat: 31.7167, lng: 73.9850 },
    'Rahim Yar Khan': { lat: 28.4212, lng: 70.2989 },
    Jhelum: { lat: 32.9405, lng: 73.7276 },
    'Wah Cantt': { lat: 33.7715, lng: 72.7511 },
    Okara: { lat: 30.8100, lng: 73.4597 },
    Sahiwal: { lat: 30.6682, lng: 73.1114 },
    Gujrat: { lat: 32.5742, lng: 74.0754 },
    Gwadar: { lat: 25.1264, lng: 62.3225 },
    Swat: { lat: 35.2227, lng: 72.4258 },
    'Mirpur (AK)': { lat: 33.1484, lng: 73.7519 },
    Muzaffarabad: { lat: 34.3700, lng: 73.4711 }
  };

  const currentCityObj = (selectedCity && selectedCity !== 'All Cities' && selectedCity !== 'all')
    ? (cityCoords[selectedCity] || cityCoords['Islamabad'])
    : { lat: 30.3753, lng: 69.3451 }; // Pakistan national center view

  const filtered = properties.filter(p => {
    if (!selectedCity || selectedCity === 'All Cities' || selectedCity === 'all') return true;
    return p.city?.toLowerCase() === selectedCity.toLowerCase();
  });

  // Helper to retrieve or calculate robust fallback coordinates
  const getPropertyCoords = (p: Property): { lat: number; lng: number } => {
    if (p.lat && p.lng && p.lat !== 0 && p.lng !== 0) {
      return { lat: p.lat, lng: p.lng };
    }
    const cityKey = p.city || 'Karachi';
    const base = cityCoords[cityKey] || (p.city?.toLowerCase().includes('karachi') ? { lat: 24.8607, lng: 67.0011 } : { lat: 33.6844, lng: 73.0479 });
    
    // Hash string to create deterministic scatter offset around base city
    let hash = 0;
    const key = (p.id || '') + (p.title || '');
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    const offsetLat = ((Math.abs(hash) % 120) - 60) / 3000;
    const offsetLng = ((Math.abs(hash >> 3) % 120) - 60) / 3000;
    return { lat: base.lat + offsetLat, lng: base.lng + offsetLng };
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!L || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentCityObj.lat, currentCityObj.lng],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [L]);

  // Center map on city change
  useEffect(() => {
    if (mapInstanceRef.current && currentCityObj) {
      const zoomLevel = (!selectedCity || selectedCity === 'All Cities' || selectedCity === 'all') ? 6 : 12;
      mapInstanceRef.current.setView([currentCityObj.lat, currentCityObj.lng], zoomLevel);
    }
  }, [selectedCity]);

  // Update property markers on map
  useEffect(() => {
    if (!L || !mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    const bounds = L.latLngBounds([]);

    filtered.forEach(prop => {
      const coords = getPropertyCoords(prop);
      bounds.extend([coords.lat, coords.lng]);

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-property-pin',
        html: `
          <div style="
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            padding: 4px 8px;
            border-radius: 12px;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            white-space: nowrap;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span>${prop.priceFormatted ? prop.priceFormatted.split(' ')[0] + ' ' + (prop.priceFormatted.split(' ')[1] || '') : 'PKR'}</span>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 15]
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: customIcon });

      // Popup Content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 font-sans text-slate-900';
      popupContent.innerHTML = `
        <div style="font-weight:700; font-size:12px; margin-bottom:2px; color:#0f172a;">${prop.title}</div>
        <div style="font-weight:800; font-size:12px; color:#d97706;">${prop.priceFormatted}</div>
        <div style="font-size:10px; color:#64748b; margin-bottom:6px;">${prop.area}, ${prop.city}</div>
      `;

      const viewBtn = document.createElement('button');
      viewBtn.innerText = 'View Property →';
      viewBtn.style.cssText = 'background:#f59e0b; color:#fff; font-weight:700; font-size:10px; padding:4px 8px; border-radius:6px; border:none; cursor:pointer; width:100%;';
      viewBtn.onclick = () => onSelectProperty(prop);

      popupContent.appendChild(viewBtn);

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        setActivePin(prop);
      });

      markersLayerRef.current?.addLayer(marker);
    });

    if (filtered.length > 0 && bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [L, filtered, onSelectProperty]);

  // Pan to active pin
  useEffect(() => {
    if (activePin && mapInstanceRef.current) {
      const coords = getPropertyCoords(activePin);
      mapInstanceRef.current.panTo([coords.lat, coords.lng], { animate: true });
    }
  }, [activePin]);

  // Nominatim Address Search Autocomplete
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=pk&limit=5`
        );
        const data = await response.json();
        setSuggestions(data || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Nominatim search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectLocation = (place: AddressSuggestion) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], 14, { animate: true });
    }

    setSearchQuery(place.display_name.split(',')[0]);
    setShowSuggestions(false);
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-4 relative overflow-hidden shadow-2xl space-y-4">
      
      {/* Top Map Controls & Address Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              OpenStreetMap Leaflet GIS
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                Live Open Data
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">Interactive Pakistan Property Map & Nominatim Location Search</p>
          </div>
        </div>

        {/* City Selector */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedCity}
            onChange={e => {
              setSelectedCity(e.target.value);
              const cityProps = properties.filter(p => p.city.toLowerCase() === e.target.value.toLowerCase());
              if (cityProps.length > 0) setActivePin(cityProps[0]);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-200 outline-none focus:border-orange-500"
          >
            {PAKISTAN_CITIES.filter(c => c !== 'All Cities').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Nominatim Address Autocomplete Bar */}
      <div className="relative z-30">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search location in Pakistan (e.g. DHA Phase 6 Lahore, F-7 Islamabad, Clifton Karachi)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500 transition-colors"
          />
          {isSearching && (
            <Loader2 className="w-4 h-4 text-orange-400 animate-spin absolute right-3" />
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
            {suggestions.map((place) => (
              <div
                key={place.place_id}
                onClick={() => handleSelectLocation(place)}
                className="p-2.5 text-xs text-slate-200 border-b border-slate-800/80 hover:bg-slate-800 cursor-pointer flex items-center space-x-2 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="truncate">{place.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaflet Canvas Container */}
      <div className="w-full h-96 rounded-xl relative overflow-hidden border border-slate-800 shadow-inner bg-slate-950 z-10">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Property Pins Drawer Overlay on Right */}
        <div className="absolute top-3 right-3 max-h-80 overflow-y-auto space-y-1.5 p-1 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl max-w-[200px] shadow-2xl z-20 no-scrollbar">
          <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider border-b border-slate-800">
            {filtered.length} Properties On Map
          </p>
          {filtered.map(prop => {
            const isActive = activePin?.id === prop.id;
            return (
              <button
                key={prop.id}
                onClick={() => setActivePin(prop)}
                className={`w-full text-left p-2 rounded-lg text-[11px] transition-all flex items-center justify-between gap-1 border ${
                  isActive
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 font-bold'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800/80 hover:bg-slate-800'
                }`}
              >
                <div className="truncate min-w-0">
                  <div className="truncate text-white font-semibold">{prop.title}</div>
                  <div className="text-orange-400 text-[10px]">{prop.priceFormatted}</div>
                </div>
                <MapPin className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              </button>
            );
          })}
        </div>

        {/* Selected Property Card Popup at Bottom */}
        {activePin && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md glass-card-glow rounded-xl p-3 border border-orange-500/40 shadow-2xl flex items-center space-x-3 z-30 animate-in fade-in slide-in-from-bottom-2 bg-slate-950/95">
            <img
              src={activePin.images[0]}
              alt={activePin.title}
              className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-800"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold uppercase">
                {activePin.purpose === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
              <h5 className="text-xs font-bold text-white truncate mt-1">{activePin.title}</h5>
              <p className="text-[11px] font-black text-amber-400">{activePin.priceFormatted}</p>
              <p className="text-[10px] text-slate-400 truncate">{activePin.area}, {activePin.city}</p>
            </div>
            <button
              onClick={() => onSelectProperty(activePin)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs transition-all shrink-0 flex items-center space-x-1 shadow-lg shadow-orange-500/20"
              title="View Full Property Details"
            >
              <span>View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
