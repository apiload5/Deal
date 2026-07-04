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
  email: string | null;
  role: 'user' | 'agent' | 'admin';
  is_verified: boolean;
  agent_company: string | null;
  agent_license: string | null;
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
  is_premium: boolean;
  premium_until: string | null;
  status: 'active' | 'sold' | 'inactive';
  views: number;
  created_at: string;
  owner?: User;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export interface Agent {
  id: string;
  user_id: string;
  company_name: string | null;
  license_number: string | null;
  experience_years: number | null;
  specialization: string[];
  is_verified: boolean;
  rating: number;
  total_listings: number;
  created_at: string;
  user?: User;
}

export interface SiteSettings {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface PropertyFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  property_type?: string;
  purpose?: string;
  search?: string;
}

export interface AddPropertyFormData {
  title: string;
  description: string;
  price: number;
  city_id: string;
  area_sqft?: number;
  beds: number;
  baths: number;
  property_type: string;
  purpose: string;
  address: string;
  images: string[];
  tiktok_video_url?: string;
  owner_whatsapp: string;
}
