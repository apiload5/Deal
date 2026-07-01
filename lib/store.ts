import { create } from 'zustand';

interface FilterState {
  city: string;
  purpose: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  beds: string;
  setFilter: (key: string, value: string) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  city: '',
  purpose: 'sale',
  propertyType: '',
  minPrice: '',
  maxPrice: '',
  beds: '',
  setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),
  reset: () => set({ city: '', purpose: 'sale', propertyType: '', minPrice: '', maxPrice: '', beds: '' }),
}));
