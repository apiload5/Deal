import { Property, SearchFilter } from '../types';
import { INITIAL_PROPERTIES } from '../data/mockData';
import { supabaseService, supabase } from '../lib/supabase';

export class PropertyService {
  private static instance: PropertyService;
  private properties: Property[] = [...INITIAL_PROPERTIES];
  private favorites: Set<string> = new Set();
  private listeners: ((props: Property[]) => void)[] = [];

  private constructor() {
    this.initRealtimeProperties();
  }

  public static getInstance(): PropertyService {
    if (!PropertyService.instance) {
      PropertyService.instance = new PropertyService();
    }
    return PropertyService.instance;
  }

  private async initRealtimeProperties() {
    if (typeof window === 'undefined') return;

    try {
      // 1. Initial fetch from Supabase
      const cloudProps = await supabaseService.getProperties();
      if (cloudProps && cloudProps.length > 0) {
        const mapped = cloudProps.map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug || p.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: p.description,
          type: p.type,
          purpose: p.purpose,
          status: p.status || 'approved',
          price: Number(p.price),
          priceFormatted: p.price_formatted || `PKR ${p.price}`,
          city: p.city,
          area: p.area,
          address: p.address,
          beds: Number(p.beds),
          baths: Number(p.baths),
          sqft: Number(p.sqft),
          furnished: p.furnished,
          images: Array.isArray(p.images) ? p.images : [],
          features: Array.isArray(p.features) ? p.features : [],
          isPremium: Boolean(p.is_premium),
          isFeatured: Boolean(p.is_featured),
          views: Number(p.views) || 0,
          userId: p.user_id,
          userRole: p.user_role,
          ownerName: p.owner_name,
          ownerPhone: p.owner_phone,
          ownerAvatar: p.owner_avatar,
          agencyName: p.agency_name,
          lat: Number(p.lat) || 24.8607,
          lng: Number(p.lng) || 67.0011,
          allowOnlineToken: Boolean(p.allow_online_token ?? true),
          createdAt: p.created_at
        }));

        // Merge with initial properties
        const map = new Map<string, Property>();
        this.properties.forEach(p => map.set(p.id, p));
        mapped.forEach((p: Property) => map.set(p.id, p));
        this.properties = Array.from(map.values());
        this.notify();
      }

      // 2. Real-time Subscription to Supabase properties table
      supabase
        .channel('public:properties')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'properties' },
          (payload: any) => {
            if (payload.eventType === 'INSERT') {
              const newP = payload.new;
              this.properties = [newP, ...this.properties.filter(p => p.id !== newP.id)];
              this.notify();
            } else if (payload.eventType === 'UPDATE') {
              const updatedP = payload.new;
              this.properties = this.properties.map(p => (p.id === updatedP.id ? { ...p, ...updatedP } : p));
              this.notify();
            } else if (payload.eventType === 'DELETE') {
              this.properties = this.properties.filter(p => p.id !== payload.old.id);
              this.notify();
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Property real-time sync notice:', e);
    }
  }

  public subscribe(listener: (props: Property[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.properties);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.properties));
  }

  public getAllProperties(): Property[] {
    return this.properties;
  }

  public getPropertyById(id: string): Property | undefined {
    return this.properties.find(p => p.id === id);
  }

  public getFeaturedProperties(): Property[] {
    return this.properties.filter(p => p.isFeatured || p.isPremium);
  }

  public async addProperty(data: Omit<Property, 'id' | 'createdAt' | 'views'>): Promise<Property> {
    const newProperty: Property = {
      ...data,
      id: `prop-${Date.now()}`,
      views: 0,
      createdAt: new Date().toISOString()
    };

    this.properties = [newProperty, ...this.properties];
    this.notify();

    // Cloud Database Sync
    await supabaseService.upsertProperty(newProperty).catch(() => {});
    return newProperty;
  }

  public async updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
    const index = this.properties.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updated = { ...this.properties[index], ...updates };
    this.properties[index] = updated;
    this.notify();

    // Cloud Database Sync
    await supabaseService.upsertProperty(updated).catch(() => {});
    return updated;
  }

  public async deleteProperty(id: string): Promise<boolean> {
    this.properties = this.properties.filter(p => p.id !== id);
    this.notify();

    await supabaseService.deleteProperty(id).catch(() => {});
    return true;
  }

  public toggleFavorite(propertyId: string): boolean {
    if (this.favorites.has(propertyId)) {
      this.favorites.delete(propertyId);
      return false;
    } else {
      this.favorites.add(propertyId);
      return true;
    }
  }

  public isFavorite(propertyId: string): boolean {
    return this.favorites.has(propertyId);
  }

  public getFavorites(): Property[] {
    return this.properties.filter(p => this.favorites.has(p.id));
  }

  public searchProperties(filter: SearchFilter): Property[] {
    return this.properties.filter(p => {
      if (filter.purpose && filter.purpose !== 'all' && p.purpose !== filter.purpose) return false;
      if (filter.type && filter.type !== 'all' && p.type !== filter.type) return false;
      if (filter.city && filter.city !== 'all' && p.city.toLowerCase() !== filter.city.toLowerCase()) return false;
      if (filter.beds !== undefined && filter.beds !== 'any' && p.beds !== filter.beds) return false;
      if (filter.baths !== undefined && filter.baths !== 'any' && p.baths !== filter.baths) return false;
      if (filter.minPrice && p.price < filter.minPrice) return false;
      if (filter.maxPrice && p.price > filter.maxPrice) return false;
      if (filter.keyword) {
        const q = filter.keyword.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }
}

export const propertyService = PropertyService.getInstance();
