/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'agent' | 'user' | 'owner';

export interface User {
  id: string;
  email: string;
  name: string;
  image: string;
  role: UserRole;
  stripeCustomerId?: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  company: string;
  officeAddress: string;
  officePhone: string;
  verified: boolean;
  stripeAccountId?: string;
  rating: number;
  totalReviews: number;
  totalDealsCompleted: number;
  bio?: string;
  createdAt: string;
}

export type PropertyStatus = 'pending' | 'approved' | 'rejected' | 'sold';
export type PropertyType = 'house' | 'flat' | 'plot' | 'commercial';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number; // in PKR
  priceFormatted: string; // e.g., "Rs. 1.25 Crore" or "Rs. 85 Lakh"
  city: string;
  area: string;
  propertyType: PropertyType;
  beds: number;
  baths: number;
  areaSqft: number;
  furnished: boolean;
  floor?: number;
  builtYear?: number;
  images: string[];
  videoUrl?: string;
  videoPlatform?: 'youtube' | 'tiktok' | 'dailymotion' | 'other';
  latitude: number;
  longitude: number;
  agentId?: string; // If agent listing
  ownerId?: string; // If direct owner listing
  isPremium: boolean;
  isFeatured: boolean;
  premiumExpiresAt?: string;
  status: PropertyStatus;
  views: number;
  whatsappClicks: number;
  callClicks: number;
  createdAt: string;
}

export interface Review {
  id: string;
  propertyId?: string;
  agentId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface AreaGuide {
  id: string;
  city: string;
  area: string;
  title: string;
  content: string;
  image: string;
  createdAt: string;
}

export interface SearchAlert {
  id: string;
  userId: string;
  name: string;
  filters: {
    city?: string;
    area?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    beds?: number;
    baths?: number;
  };
  createdAt: string;
}

export interface Payment {
  id: string;
  agentId: string;
  propertyId?: string;
  amount: number; // in USD or PKR
  amountRs: number; // in PKR
  type: 'premium' | 'featured' | 'escrow';
  stripePaymentId: string;
  status: 'succeeded' | 'pending' | 'failed';
  createdAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  propertyId: string;
}

export type DealStatus = 'pending' | 'approved' | 'paid' | 'completed';

export interface Deal {
  id: string;
  propertyId: string;
  propertyTitle: string;
  agentId: string;
  agentName: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  salePriceRs: number;
  sellerAmountRs: number;
  commissionRs: number;
  platformFeePercent: number;
  platformFeeRs: number;
  status: DealStatus;
  stripePaymentId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'deal' | 'payment' | 'system';
  read: boolean;
  createdAt: string;
}

export interface SiteSettings {
  adsenseClientId: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
  platformFeePercent: number;
  siteName: string;
}
