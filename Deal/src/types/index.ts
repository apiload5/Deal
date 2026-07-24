export type UserRole = 'guest' | 'user' | 'agent' | 'agency' | 'builder' | 'admin';

export type KYCStatus = 'none' | 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  city?: string;
  address?: string;
  bio?: string;
  isVerified?: boolean;
  kycStatus: KYCStatus;
  kycDocuments?: {
    cnicFront?: string;
    cnicBack?: string;
    businessLicense?: string;
  };
  agencyId?: string;
  companyName?: string;
  createdAt: string;
}

export type PropertyPurpose = 'sale' | 'rent';
export type PropertyType = 'house' | 'apartment' | 'commercial' | 'plot' | 'villa' | 'penthouse';
export type PropertyStatus = 'pending' | 'approved' | 'rejected' | 'sold' | 'rented';
export type FurnishedStatus = 'unfurnished' | 'semi-furnished' | 'furnished';

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: PropertyType;
  purpose: PropertyPurpose;
  status: PropertyStatus;
  price: number; // In PKR
  priceFormatted: string;
  city: string;
  area: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  furnished: FurnishedStatus;
  images: string[];
  videoUrl?: string;
  virtualTourUrl?: string;
  isPremium: boolean;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  userId: string;
  userRole: UserRole;
  ownerName: string;
  ownerPhone: string;
  ownerAvatar?: string;
  agencyName?: string;
  lat: number;
  lng: number;
  features: string[];
}

export interface Agency {
  id: string;
  name: string;
  logo: string;
  coverImage: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  verified: boolean;
  totalProperties: number;
  activeAgents: number;
  rating: number;
  reviewCount: number;
  socialLinks?: {
    facebook?: string;
    whatsapp?: string;
    website?: string;
  };
}

export interface Builder {
  id: string;
  name: string;
  logo: string;
  coverImage: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  verified: boolean;
  totalProjects: number;
  ongoingProjects: number;
  rating: number;
  reviewCount: number;
}

export interface Project {
  id: string;
  title: string;
  builderId: string;
  builderName: string;
  builderLogo: string;
  city: string;
  area: string;
  startingPrice: number;
  startingPriceFormatted: string;
  type: string;
  status: 'upcoming' | 'under_construction' | 'completed';
  completionDate: string;
  description: string;
  images: string[];
  brochureUrl?: string;
  paymentPlan: {
    downPayment: string;
    installments: string;
    possession: string;
  };
  totalUnits: number;
  availableUnits: number;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  title: string;
  agencyId?: string;
  agencyName?: string;
  city: string;
  phone: string;
  email: string;
  rating: number;
  activeListings: number;
  totalDeals: number;
  verified: boolean;
}

export type BookingType = 'token' | 'booking' | 'full';
export type PaymentMethod = 'stripe' | 'rapidpaisa' | 'bank_transfer' | 'cash';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'escrow_held' | 'released' | 'refunded';

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyImage: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  sellerId: string;
  sellerName: string;
  sellerRole: UserRole;
  bookingType: BookingType;
  amountPaid: number;
  totalAmount: number;
  platformFee: number;
  agentCommission: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  transactionId: string;
  escrowHoldDate: string;
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  date: string;
  dueDate: string;
  customerName: string;
  customerEmail: string;
  propertyTitle: string;
  amount: number;
  platformFee: number;
  commission: number;
  status: 'unpaid' | 'paid' | 'overdue';
  paymentMethod: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'file';
  timestamp: string;
  isRead: boolean;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isOnline?: boolean;
}

export interface ChatRoom {
  id: string;
  participants: ChatParticipant[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  propertyId?: string;
  propertyTitle?: string;
  propertyImage?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'chat' | 'property' | 'kyc' | 'system' | 'commission';
  isRead: boolean;
  timestamp: string;
  link?: string;
}

export interface KYCRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  cnicFront: string;
  cnicBack: string;
  licenseDoc?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  authorName: string;
  authorRole: string;
  date: string;
  readTime: string;
}

export interface SearchFilter {
  city: string;
  area: string;
  purpose: PropertyPurpose | 'all';
  type: PropertyType | 'all';
  minPrice: number;
  maxPrice: number;
  beds: number | 'any';
  baths: number | 'any';
  minArea: number;
  maxArea: number;
  furnished: FurnishedStatus | 'all';
  isPremium?: boolean;
  isFeatured?: boolean;
  keyword: string;
  sortBy: 'newest' | 'price_low' | 'price_high' | 'popular';
}
