// types/index.ts
export interface City {
  id: string;
  name: string;
  slug: string;
  total_properties: number;
}

export interface User {
  id: string;
  phone: string;
  name: string | null;
  role: 'owner' | 'admin';
  created_at: string;
}

export interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  city_id: string;
  city?: City;
  area_sqft: number | null;
  beds: number;
  baths: number;
  property_type: 'house' | 'flat' | 'plot' | 'commercial';
  purpose: 'sale' | 'rent';
  address: string | null;
  lat: number | null;
  lng: number | null;
  images: string[];
  tiktok_video_url: string | null;
  owner_id: string;
  owner_whatsapp: string;
  is_featured: boolean;
  status: 'active' | 'inactive' | 'sold';
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export interface PropertyFilters {
  city?: string;
  purpose?: 'sale' | 'rent';
  property_type?: 'house' | 'flat' | 'plot' | 'commercial';
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  minArea?: number;
  maxArea?: number;
}

export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  city_id: string;
  area_sqft: number;
  beds: number;
  baths: number;
  property_type: 'house' | 'flat' | 'plot' | 'commercial';
  purpose: 'sale' | 'rent';
  address: string;
  lat: number;
  lng: number;
  images: string[];
  tiktok_video_url: string;
  owner_whatsapp: string;
}
