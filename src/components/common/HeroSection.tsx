import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building, Sparkles, SlidersHorizontal, ChevronLeft, ChevronRight, RotateCcw, BookOpen } from 'lucide-react';
import { PAKISTAN_CITIES, CITY_AREAS } from '../../data/mockData';
import { SearchFilter } from '../../types';

interface HeroSectionProps {
  onSearch: (filters: Partial<SearchFilter>) => void;
  onOpenAiAssistant: () => void;
  onOpenGuide?: (topic?: string) => void;
}

const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80',
    title: 'Modern Canal-Side Villas & Green Enclaves',
    location: 'Sector F-7 & Margalla Enclave, Islamabad'
  },
  {
    url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1920&q=80',
    title: 'Autumn Garden Courtyards & Farmhouses',
    location: 'Bedian Road & Raiwind, Lahore'
  },
  {
    url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80',
    title: 'Ivy Garden Patios & Serene Retreats',
    location: 'DHA Phase 5 & 6, Lahore'
  },
  {
    url: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=1920&q=80',
    title: 'Lush Pergola Estates & Green Canopies',
    location: 'Chak Shahzad & Naval Anchorage, Islamabad'
  },
  {
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=80',
    title: 'Tropical Waterfront Villas & Beach Residences',
    location: 'Emaar Oceanfront & Clifton Phase 8, Karachi'
  },
  {
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=80',
    title: 'European Style Cobblestone Courtyards & Cottages',
    location: 'Murree Expressway & Nathia Gali Enclave'
  },
  {
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80',
    title: 'Modern High-Rise Towers & Business Centers',
    location: 'Blue Area Islamabad & Gulberg Lahore'
  },
  {
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80',
    title: 'Turret Cottage & Flower Garden Enclaves',
    location: 'Abbottabad Hills & Swat Valley Resort Plots'
  },
  {
    url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1920&q=80',
    title: 'Terracotta Roof Villas & Tropical Gardens',
    location: 'Bahria Golf City & Gwadar Master Plan'
  },
  {
    url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1920&q=80',
    title: 'Modern Suburban Homes with Warm Dusk Illumination',
    location: 'Bahria Town Phase 8, Rawalpindi'
  }
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch, onOpenAiAssistant, onOpenGuide }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showAdvance, setShowAdvance] = useState(false);

  // Form State
  const [city, setCity] = useState('Islamabad');
  const [area, setArea] = useState('All Areas');
  const [type, setType] = useState('all');
  const [purpose, setPurpose] = useState('all');
  const [beds, setBeds] = useState('any');
  const [baths, setBaths] = useState('any');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest');

  // Auto Slider Timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const availableAreas = CITY_AREAS[city] || [];

  const handleExecuteSearch = () => {
    onSearch({
      city: city === 'All Cities' ? '' : city,
      area: area === 'All Areas' ? '' : area,
      purpose: purpose as any,
      type: type as any,
      beds: beds as any,
      baths: baths as any,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minArea: minArea ? Number(minArea) : undefined,
      maxArea: maxArea ? Number(maxArea) : undefined,
      keyword,
      sortBy
    });
  };

  const handleReset = () => {
    setCity('Islamabad');
    setArea('All Areas');
    setType('all');
    setPurpose('all');
    setBeds('any');
    setBaths('any');
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMaxArea('');
    setKeyword('');
    setSortBy('newest');
    onSearch({});
  };

  const activeAdvanceCount = [
    area !== 'All Areas',
    type !== 'all',
    beds !== 'any',
    baths !== 'any',
    !!minPrice,
    !!maxPrice,
    !!minArea,
    !!maxArea,
    sortBy !== 'newest'
  ].filter(Boolean).length;

  return (
    <div className="relative min-h-[88vh] flex items-center justify-center overflow-hidden pt-6 pb-16 bg-slate-950">
      
      {/* BACKGROUND IMAGE SLIDER WITH FADE & OVERLAYS */}
      <div 
        className="absolute inset-0 z-0"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {HERO_IMAGES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={slide.url}
              alt={slide.title}
              referrerPolicy="no-referrer"
              loading="eager"
              className="w-full h-full object-cover object-center transform transition-transform duration-10000 scale-105 brightness-110 contrast-105 saturate-110"
            />
            {/* Luminous Gradient Overlay for vibrant bright photo visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-transparent to-slate-950/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
            
            {/* Slide Title & Location Pill Overlay (Bottom Left) */}
            <div className="absolute bottom-6 left-6 z-10 hidden sm:flex flex-col items-start space-y-1 max-w-md pointer-events-none">
              <span className="text-[11px] font-bold text-amber-400 bg-black/60 px-3 py-1 rounded-full border border-amber-500/40 backdrop-blur-md flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>{slide.location}</span>
              </span>
              <p className="text-xs font-semibold text-slate-200 drop-shadow-md bg-black/40 px-2.5 py-0.5 rounded-lg backdrop-blur-sm">
                {slide.title}
              </p>
            </div>
          </div>
        ))}

        {/* Slide Controls (Prev / Next Arrows) */}
        <button
          onClick={() => setCurrentSlide((currentSlide - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-orange-500 text-white backdrop-blur-md border border-white/20 transition-all transform hover:scale-110"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((currentSlide + 1) % HERO_IMAGES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-orange-500 text-white backdrop-blur-md border border-white/20 transition-all transform hover:scale-110"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicators / Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentSlide ? 'w-8 bg-orange-500' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* FOREGROUND CONTENT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-4">
        
        {/* Header Text & Badge */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-orange-500/40 text-xs font-bold text-orange-400 shadow-xl backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Pakistan's #1 Escrow Protected Property Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
            Find Your Dream <span className="gradient-text">Property</span> in Pakistan
          </h1>

          <p className="text-xs sm:text-base text-slate-200 font-normal max-w-2xl mx-auto drop-shadow">
            Discover thousands of properties, trusted agencies, and top builders across Pakistan with <span className="text-amber-400 font-semibold">100% Escrow Protection</span>.
          </p>
        </div>

        {/* UNIFIED GLASSMORPHIC SEARCH CARD */}
        <div className="bg-slate-900/35 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-5 sm:p-7 space-y-4">
          
          {/* 1. Purpose Tabs */}
          <div className="border-b border-white/15 pb-3">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full">
              {[
                { id: 'all', label: 'All Purpose' },
                { id: 'sale', label: 'Buy / For Sale' },
                { id: 'rent', label: 'For Rent' },
                { id: 'commercial', label: 'Commercial' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setPurpose(tab.id);
                    if (tab.id === 'commercial') setType('commercial');
                    else setType('all');
                  }}
                  className={`min-h-[38px] px-4 py-2 flex items-center justify-center rounded-xl text-xs font-bold transition-all text-center ${
                    purpose === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                      : 'text-slate-200 hover:text-white hover:bg-white/20 bg-black/25 border border-white/15 backdrop-blur-md'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Primary Basic Search Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            
            {/* City Selector */}
            <div className="md:col-span-3 bg-black/30 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2.5 flex items-center space-x-2 focus-within:border-orange-500 transition-colors">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
              <select
                value={city}
                onChange={e => {
                  setCity(e.target.value);
                  setArea('All Areas');
                }}
                className="w-full bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
              >
                <option value="All Cities" className="bg-slate-900 text-white">All Cities</option>
                {PAKISTAN_CITIES.map(c => (
                  <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                ))}
              </select>
            </div>

            {/* Keyword Input */}
            <div className="md:col-span-5 bg-black/30 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2.5 flex items-center space-x-2 focus-within:border-orange-500 transition-colors">
              <Search className="w-4 h-4 text-orange-400 shrink-0" />
              <input
                type="text"
                placeholder="Search location, sector, title (e.g. DHA, Seaview, 1 Kanal)..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleExecuteSearch()}
                className="w-full bg-transparent text-xs font-medium text-white outline-none placeholder:text-slate-300"
              />
            </div>

            {/* Search Button & Advance Toggle */}
            <div className="md:col-span-4 flex items-center space-x-2">
              <button
                onClick={handleExecuteSearch}
                className="flex-1 gradient-btn text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 transition-all hover:brightness-110"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAdvance(!showAdvance)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0 ${
                  showAdvance || activeAdvanceCount > 0
                    ? 'bg-orange-500/30 border-orange-500 text-orange-200'
                    : 'bg-black/30 backdrop-blur-md border-white/20 text-slate-200 hover:bg-black/50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 text-orange-400" />
                <span>Filters</span>
                {activeAdvanceCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {activeAdvanceCount}
                  </span>
                )}
              </button>

              {(activeAdvanceCount > 0 || keyword || city !== 'Islamabad') && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-slate-300 hover:text-white transition-colors shrink-0 backdrop-blur-md border border-white/15"
                  title="Reset Search"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 3. Collapsible Advance Filters Panel */}
          {showAdvance && (
            <div className="pt-3 border-t border-white/15 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-400 flex items-center space-x-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Advanced Property Filters</span>
                </span>
                <span className="text-[11px] text-slate-300">Specify exact requirements</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-left">
                
                {/* AREA / SECTOR */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Area / Sector
                  </label>
                  <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 flex items-center space-x-2 focus-within:border-orange-500">
                    <Building className="w-4 h-4 text-orange-400 shrink-0" />
                    <select
                      value={area}
                      onChange={e => setArea(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                    >
                      <option value="All Areas" className="bg-slate-900 text-white">All Areas</option>
                      {availableAreas.map(a => (
                        <option key={a} value={a} className="bg-slate-900 text-white">{a}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* PROPERTY TYPE */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Property Type
                  </label>
                  <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 flex items-center space-x-2 focus-within:border-orange-500">
                    <select
                      value={type}
                      onChange={e => setType(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                    >
                      <option value="all" className="bg-slate-900 text-white">All Types</option>
                      <option value="house" className="bg-slate-900 text-white">House / Villa</option>
                      <option value="apartment" className="bg-slate-900 text-white">Apartment / Flat</option>
                      <option value="commercial" className="bg-slate-900 text-white">Commercial Plaza</option>
                      <option value="plot" className="bg-slate-900 text-white">Plot / Land</option>
                    </select>
                  </div>
                </div>

                {/* BEDS */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Bedrooms
                  </label>
                  <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 flex items-center space-x-2 focus-within:border-orange-500">
                    <select
                      value={beds}
                      onChange={e => setBeds(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                    >
                      <option value="any" className="bg-slate-900 text-white">Any Bedrooms</option>
                      <option value="1" className="bg-slate-900 text-white">1 Bed</option>
                      <option value="2" className="bg-slate-900 text-white">2 Beds</option>
                      <option value="3" className="bg-slate-900 text-white">3 Beds</option>
                      <option value="4" className="bg-slate-900 text-white">4 Beds</option>
                      <option value="5" className="bg-slate-900 text-white">5+ Beds</option>
                    </select>
                  </div>
                </div>

                {/* BATHS */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Bathrooms
                  </label>
                  <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 flex items-center space-x-2 focus-within:border-orange-500">
                    <select
                      value={baths}
                      onChange={e => setBaths(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                    >
                      <option value="any" className="bg-slate-900 text-white">Any Bathrooms</option>
                      <option value="1" className="bg-slate-900 text-white">1 Bath</option>
                      <option value="2" className="bg-slate-900 text-white">2 Baths</option>
                      <option value="3" className="bg-slate-900 text-white">3 Baths</option>
                      <option value="4" className="bg-slate-900 text-white">4+ Baths</option>
                    </select>
                  </div>
                </div>

                {/* MIN PRICE */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Min Price (PKR)
                  </label>
                  <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 focus-within:border-orange-500">
                    <input
                      type="number"
                      placeholder="e.g. 5000000"
                      value={minPrice}
                      onChange={e => setMinPrice(e.target.value.replace(/^0+(?=\d)/, ''))}
                      className="w-full bg-transparent text-xs font-medium text-white outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* MAX PRICE */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Max Price (PKR)
                  </label>
                  <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 focus-within:border-orange-500">
                    <input
                      type="number"
                      placeholder="e.g. 50000000"
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value.replace(/^0+(?=\d)/, ''))}
                      className="w-full bg-transparent text-xs font-medium text-white outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* MIN AREA */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Min Area (SQFT)
                  </label>
                  <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 focus-within:border-orange-500">
                    <input
                      type="number"
                      placeholder="e.g. 1000"
                      value={minArea}
                      onChange={e => setMinArea(e.target.value.replace(/^0+(?=\d)/, ''))}
                      className="w-full bg-transparent text-xs font-medium text-white outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* SORT BY */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Sort Results By
                  </label>
                  <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 focus-within:border-orange-500">
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className="w-full bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                    >
                      <option value="newest" className="bg-slate-900 text-white">Newest First</option>
                      <option value="price_low" className="bg-slate-900 text-white">Price: Low to High</option>
                      <option value="price_high" className="bg-slate-900 text-white">Price: High to Low</option>
                      <option value="popular" className="bg-slate-900 text-white">Most Popular Views</option>
                    </select>
                  </div>
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleExecuteSearch}
                  className="gradient-btn text-white px-6 py-2 rounded-xl font-bold text-xs shadow-lg shadow-orange-500/20"
                >
                  Apply Advance Filters
                </button>
              </div>
            </div>
          )}

          {/* Bottom Trending Tags */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-300 font-medium text-[11px] mr-1">Popular Searches:</span>
              {['DHA Phase 6 Lahore', 'E-11 Islamabad', 'Clifton Karachi', 'Bahria Town', 'Capital Smart City'].map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setKeyword(tag);
                    onSearch({ keyword: tag });
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-black/30 hover:bg-black/50 text-slate-200 text-[11px] border border-white/15 backdrop-blur-md transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
