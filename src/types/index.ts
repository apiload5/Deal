export interface StaffPermissions {
  canManageListings: boolean;
  canManageUsers: boolean;
  canManageEscrow: boolean;
  canManageKYC: boolean;
  canManageDisputes: boolean;
  canManageSettings: boolean;
}

export interface StaffUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  passwordHash?: string;
  pin: string;
  pinHash?: string;
  roleTitle: string;
  permissions: StaffPermissions;
  createdBy: string;
  createdAt: string;
  isSessionApproved?: boolean;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  lastAccessRequestAt?: string;
}

export interface StaffLoginRequest {
  id: string;
  staffId: string;
  staffName: string;
  username: string;
  roleTitle: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type UserRole = 'guest' | 'user' | 'agent' | 'agency' | 'builder' | 'marketing_company' | 'admin';

export type KYCStatus = 'none' | 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleApprovalStatus?: 'approved' | 'pending' | 'rejected';
  username?: string;
  avatar?: string;
  phone?: string;
  city?: string;
  address?: string;
  bio?: string;
  cnic?: string;
  fatherName?: string;
  dob?: string;
  cnicIssueDate?: string;
  agencyName?: string;
  isFiler?: boolean;
  isVerified?: boolean;
  kycStatus: KYCStatus;
  kycDocuments?: {
    cnicFront?: string;
    cnicBack?: string;
    businessLicense?: string;
    secpDoc?: string;
  };
  agencyId?: string;
  companyName?: string;
  isOverseasPakistani?: boolean;
  overseasCountry?: string;
  nicopNumber?: string;
  hasRdaAccount?: boolean;
  listerPreferences?: ListerPreferences;
  createdAt: string;
}

export type PropertyPurpose = 'sale' | 'rent';
export type PropertyType = 'house' | 'apartment' | 'commercial' | 'plot' | 'villa' | 'penthouse';
export type PropertyStatus = 'pending' | 'approved' | 'rejected' | 'sold' | 'rented' | 'recycle_bin';
export type FurnishedStatus = 'unfurnished' | 'semi-furnished' | 'furnished';

export interface ListerPreferences {
  showPhoneNumber: boolean;
  allowVideoCall: boolean;
  allowVoiceCall: boolean;
  allowWebRTCCall: boolean;
  allowChat: boolean;
  allowWhatsApp: boolean;
  availableFrom: string;
  availableTo: string;
  availableDays: string[];
  timezone: string;
}

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
  allowOnlineToken?: boolean; // Controls if seller enables online escrow token (bayana)
  listerPreferences?: ListerPreferences;
  isDuplicateFlagged?: boolean;
  duplicateReason?: string;
  deletionSecurityCode?: string; // Secret code required to move listing to recycle bin
  expiresAt?: string; // 15-day listing validity timestamp
  lastRenewedAt?: string;
  deletedAt?: string; // Date moved to recycle bin (permanent removal after 15 days)
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
  status?: 'approved' | 'pending' | 'rejected';
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
  status?: 'approved' | 'pending' | 'rejected';
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
  dealsCompleted?: number;
  verified: boolean;
  status?: 'approved' | 'pending' | 'rejected';
}

export interface AgentTalent {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  city: string;
  targetSocieties: string;
  experienceYears: number;
  specialization: string;
  expectedCommission: string;
  bio: string;
  cnicVerified: boolean;
  status: 'available' | 'hired' | 'interviewing';
  appliedAt: string;
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
  sellerEmail?: string;
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
  secpDoc?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
  summary?: string;
  content: string;
  image: string;
  authorName?: string;
  authorRole?: string;
  author?: string;
  date?: string;
  publishedAt?: string;
  readTime: string;
  tags?: string[];
}

export interface AutoBlogConfig {
  aiProvider: 'gemini' | 'openai' | 'deepseek';
  apiKey: string;
  rssFeeds: string[];
  frequency: '1_per_day' | '2_per_day' | 'every_2_days' | 'weekly' | 'off';
  promptTemplate: string;
  targetCategory: string;
  autoPostEnabled: boolean;
  lastRunAt?: string;
}

export interface StaffLoginRequest {
  id: string;
  staffName: string;
  username: string;
  roleTitle: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export interface BankDetails {
  bankName: string;
  accountTitle: string;
  iban: string;
  easypaisaTill: string;
  commissionAccountIban?: string;
}

export interface EmailConfig {
  provider: 'brevo' | 'resend' | 'gmail' | 'smtp';
  brevoApiKey: string;
  resendApiKey: string;
  gmailAppPass: string;
  smtpHost?: string;
  smtpPort?: number;
  infoEmail: string;
  noReplyEmail: string;
  paymentsEmail: string;
  disputesEmail: string;
  autoOfflineNotify: boolean;
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

// WALLET & BALANCE SYSTEM TYPES
export type WalletTxType = 'topup' | 'withdrawal' | 'stake_lock' | 'stake_unlock' | 'bounty_earned' | 'bounty_debit' | 'forfeit_penalty' | 'refund';
export type PaymentGateway = 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'rapidgateway' | 'card';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: WalletTxType;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: PaymentGateway;
  referenceId: string;
  description: string;
  createdAt: string;
}

export interface UserWallet {
  userId: string;
  availableBalance: number;
  lockedStake: number;
  totalEarned: number;
  totalSpent: number;
  transactions: WalletTransaction[];
}

// PROTECTED HIRING & JOB BOUNTY TYPES
export interface JobPost {
  id: string;
  agencyId: string;
  agencyName: string;
  agencyLogo?: string;
  title: string;
  propertyTitle: string;
  society: string;
  city: string;
  propertyType: string;
  bountyAmount: number; // 3,000 to 15,000 PKR
  maxAgents: number; // 1 to 3 co-agents
  coAgentSplits: number[]; // e.g. [60, 40]
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'disputed' | 'cancelled';
  requiredStakePerAgent: number; // Based on bounty amount & agent trust score
  taxDetails: {
    bounty: number;
    whtAmount: number; // 2% WHT
    gstAmount: number; // 17% GST on platform fee
    totalPaidByAgency: number;
  };
  hiredAgentIds: string[];
  createdAt: string;
}

// DEAL ROOM & MILESTONE PROOF TYPES
export interface MilestoneProof {
  proofRequired: string;
  proofUrl?: string;
  locationPin?: string;
  notes?: string;
  submittedAt?: string;
  reviewedAt?: string;
  agencyApproved?: boolean;
  autoAcceptedAt?: string;
}

export interface DealRoomMilestone {
  id: string;
  name: string; // "Site Visit", "Offer Submission", "Token Paid", "Registry Close"
  percentage: number; // 20%, 30%, 50%, 100%
  bountyAmount: number;
  proofRequired: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  proof?: MilestoneProof;
}

export interface DealAgentDetail {
  agentId: string;
  agentName: string;
  agentAvatar: string;
  stakeLocked: number;
  splitPercentage: number;
  bountyShare: number;
  agreedAgreement: boolean;
}

export interface DealDispute {
  id: string;
  raisedBy: string; // 'agency' | 'agent'
  raisedByName: string;
  reason: string;
  evidenceUrls: string[];
  status: 'open' | 'under_review' | 'resolved';
  panelDecision?: string;
  resolvedAt?: string;
}

export interface DealRoom {
  id: string;
  jobId: string;
  jobTitle: string;
  agencyId: string;
  agencyName: string;
  agents: DealAgentDetail[];
  totalBountyAmount: number;
  status: 'active' | 'completed' | 'disputed' | 'cancelled';
  currentMilestoneIndex: number;
  milestones: DealRoomMilestone[];
  dispute?: DealDispute;
  createdAt: string;
  lastProgressUpdate?: string;
  slaViolationCount: number;
}

