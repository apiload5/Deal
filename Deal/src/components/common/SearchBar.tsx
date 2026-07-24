import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, ArrowUpDown, Filter, RotateCcw, Check } from 'lucide-react';
import { PAKISTAN_CITIES, CITY_AREAS } from '../../data/mockData';
import { SearchFilter, PropertyType, PropertyPurpose, FurnishedStatus } from '../../types';

const DEFAULT_FILTERS: SearchFilter = {
  city: 'Islamabad',
  area: '',
  purpose: 'all',
  type: 'all',
  minPrice: 0,
  maxPrice: 1000000000,
  beds: 'any',
  baths: 'any',
  minArea: 0,
  maxArea: 100000,
  furnished: 'all',
  keyword: '',
  sortBy: 'newest'
};

interface SearchBarProps {
  filters?: SearchFilter;
  onChangeFilters?: (filters: SearchFilter) => void;
  onReset?: () => void;
  totalResults?: number;
  onSearch?: (filters: SearchFilter) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  filters: propsFilters,
  onChangeFilters,
  onReset,
  totalResults = 0,
  onSearch
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFilter>(DEFAULT_FILTERS);

  const filters = propsFilters || localFilters;

  const handleUpdate = (updated: SearchFilter) => {
    setLocalFilters(updated);
    if (onChangeFilters) {
      onChangeFilters(updated);
    }
    if (onSearch) {
      onSearch(updated);
    }
  };

  const handleResetClick = () => {
    setLocalFilters(DEFAULT_FILTERS);
    if (onReset) {
      onReset();
    }
    if (onSearch) {
      onSearch(DEFAULT_FILTERS);
    }
  };

  const currentCity = filters.city || 'Islamabad';
  const availableAreas = CITY_AREAS[currentCity] || [];

  const propertyTypes: { id: PropertyType | 'all'; label: string }[] = [
    { id: 'all', label: 'All Types' },
    { id: 'house', label: 'Houses / Villas' },
    { id: 'apartment', label: 'Apartments' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'plot', label: 'Plots / Land' },
    { id: 'penthouse', label: 'Penthouses' }
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md mb-6">
      {/* Top Main Filter Strip */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search location, title, keyword..."
            value={filters.keyword || ''}
            onChange={e => handleUpdate({ ...filters, keyword: e.target.value })}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-100 outline-none focus:border-orange-500 placeholder:text-slate-500"
          />
        </div>

        {/* Quick Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* City */}
          <select
            value={filters.city || 'Islamabad'}
            onChange={e => handleUpdate({ ...filters, city: e.target.value, area: '' })}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-orange-500 cursor-pointer"
          >
            {PAKISTAN_CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Purpose */}
          <select
            value={filters.purpose || 'all'}
            onChange={e => handleUpdate({ ...filters, purpose: e.target.value as any })}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="all">Any Purpose</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>

          {/* Property Type */}
          <select
            value={filters.type || 'all'}
            onChange={e => handleUpdate({ ...filters, type: e.target.value as any })}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-orange-500 cursor-pointer"
          >
            {propertyTypes.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>

          {/* Sort By */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-orange-400" />
            <select
              value={filters.sortBy || 'newest'}
              onChange={e => handleUpdate({ ...filters, sortBy: e.target.value as any })}
              className="bg-transparent text-xs font-semibold outline-none cursor-pointer text-slate-200"
            >
              <option value="newest" className="bg-slate-900">Newest First</option>
              <option value="price_low" className="bg-slate-900">Price: Low to High</option>
              <option value="price_high" className="bg-slate-900">Price: High to Low</option>
              <option value="popular" className="bg-slate-900">Most Popular</option>
            </select>
          </div>

          {/* More Filters Toggle */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-bold hover:bg-orange-500/20 transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleResetClick}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Filter Drawer */}
      {drawerOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
          
          {/* Area Sector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Specific Area / Sector
            </label>
            <select
              value={filters.area || ''}
              onChange={e => handleUpdate({ ...filters, area: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none"
            >
              <option value="">All Sectors</option>
              {availableAreas.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Bedrooms
            </label>
            <div className="flex space-x-1">
              {['any', 1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => handleUpdate({ ...filters, beds: num as any })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filters.beds === num
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {num === 'any' ? 'Any' : `${num}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Bathrooms
            </label>
            <div className="flex space-x-1">
              {['any', 1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => handleUpdate({ ...filters, baths: num as any })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filters.baths === num
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {num === 'any' ? 'Any' : `${num}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Furnished */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Furnishing
            </label>
            <select
              value={filters.furnished || 'all'}
              onChange={e => handleUpdate({ ...filters, furnished: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none"
            >
              <option value="all">Any Furnishing</option>
              <option value="furnished">Fully Furnished</option>
              <option value="semi-furnished">Semi Furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
          </div>

          {/* Toggles: Premium & Featured */}
          <div className="lg:col-span-4 flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300 font-semibold">
                <input
                  type="checkbox"
                  checked={!!filters.isPremium}
                  onChange={e => handleUpdate({ ...filters, isPremium: e.target.checked })}
                  className="rounded accent-orange-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-amber-400 font-bold">Premium Gold Listings</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300 font-semibold">
                <input
                  type="checkbox"
                  checked={!!filters.isFeatured}
                  onChange={e => handleUpdate({ ...filters, isFeatured: e.target.checked })}
                  className="rounded accent-orange-500 w-4 h-4 cursor-pointer"
                />
                <span>Featured Listings</span>
              </label>
            </div>

            <p className="text-xs text-slate-400">
              Showing <span className="text-white font-bold">{totalResults}</span> matching properties
            </p>
          </div>

        </div>
      )}
    </div>
  );
};
