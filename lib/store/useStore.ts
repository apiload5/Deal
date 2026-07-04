import { create } from 'zustand';
import { Property, User } from '@/types';

interface StoreState {
  user: User | null;
  setUser: (user: User | null) => void;
  favorites: string[];
  setFavorites: (favorites: string[]) => void;
  addFavorite: (propertyId: string) => void;
  removeFavorite: (propertyId: string) => void;
  isPremiumModalOpen: boolean;
  setPremiumModalOpen: (isOpen: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  favorites: [],
  setFavorites: (favorites) => set({ favorites }),
  addFavorite: (propertyId) =>
    set((state) => ({
      favorites: [...state.favorites, propertyId],
    })),
  removeFavorite: (propertyId) =>
    set((state) => ({
      favorites: state.favorites.filter((id) => id !== propertyId),
    })),
  isPremiumModalOpen: false,
  setPremiumModalOpen: (isOpen) => set({ isPremiumModalOpen: isOpen }),
}));
