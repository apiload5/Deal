export interface City {
  id: string;
  name: string;
  slug: string;
  total_properties: number;
}

export interface UserProfile {
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
  status: 'active' | 'sold' | 'inactive';
  created_at: string;
  cities?: City;
}
