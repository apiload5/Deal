import {
  User,
  UserRole,
  Property,
  Booking,
  Invoice,
  KYCRecord,
  AppNotification,
  ChatRoom,
  ChatMessage,
  SearchFilter,
  Agency,
  Builder,
  Project,
  Agent,
  AgentTalent,
  BlogArticle,
  AutoBlogConfig,
  JobPost,
  DealRoom,
  UserWallet,
  WalletTransaction,
  PaymentGateway,
  StaffUser,
  StaffPermissions,
  StaffLoginRequest,
  EmailConfig,
  BankDetails
} from '../types';
import {
  GUEST_USER,
  INITIAL_USERS,
  INITIAL_PROPERTIES,
  INITIAL_AGENCIES,
  INITIAL_BUILDERS,
  INITIAL_PROJECTS,
  INITIAL_AGENTS,
  INITIAL_AGENT_TALENTS,
  INITIAL_BOOKINGS,
  INITIAL_INVOICES,
  INITIAL_KYC_RECORDS,
  INITIAL_BLOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CHAT_ROOMS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_JOB_POSTS,
  INITIAL_DEAL_ROOMS,
  INITIAL_WALLETS
} from '../data/mockData';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import bcrypt from 'bcryptjs';
import { auth, googleProvider } from './firebase';
import { compareWithBcrypt } from '../utils/security';
import { supabaseService, supabase } from './supabase';

const STORAGE_KEYS = {
  CURRENT_USER: 'dealfast_current_user',
  PROPERTIES: 'dealfast_properties',
  FAVORITES: 'dealfast_favorites',
  BOOKINGS: 'dealfast_bookings',
  INVOICES: 'dealfast_invoices',
  KYC: 'dealfast_kyc',
  NOTIFICATIONS: 'dealfast_notifications',
  CHAT_ROOMS: 'dealfast_chat_rooms',
  CHAT_MESSAGES: 'dealfast_chat_messages',
  AGENTS: 'dealfast_agents',
  PROJECTS: 'dealfast_projects'
};

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    const parsed = JSON.parse(data);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      return fallback;
    }
    if (fallback !== null && typeof fallback === 'object' && !Array.isArray(fallback) && (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))) {
      return fallback;
    }
    return parsed;
  } catch (e) {
    return fallback;
  }
}

export function cleanFirestoreData<T extends Record<string, any>>(data: T): Partial<T> {
  if (!data || typeof data !== 'object') return data;
  const clean: any = {};
  Object.keys(data).forEach(key => {
    const val = data[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = cleanFirestoreData(val);
      } else {
        clean[key] = val;
      }
    }
  });
  return clean;
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to store', key, e);
  }
}

function isDummyId(id: string | undefined): boolean {
  if (!id) return false;
  return id.startsWith('mock-junk-');
}

export class AppStore {
  private static instance: AppStore;

  public currentUser: User;
  public properties: Property[];
  public favorites: string[];
  public bookings: Booking[];
  public invoices: Invoice[];
  public kycRecords: KYCRecord[];
  public notifications: AppNotification[];
  public chatRooms: ChatRoom[];
  public chatMessages: Record<string, ChatMessage[]>;

  public agencies: Agency[] = INITIAL_AGENCIES;
  public builders: Builder[] = INITIAL_BUILDERS;
  public projects: Project[] = INITIAL_PROJECTS;
  public agents: Agent[] = INITIAL_AGENTS;
  public agentTalents: AgentTalent[];
  public blogs: BlogArticle[] = INITIAL_BLOGS;
  public autoBlogConfig: AutoBlogConfig;

  public wallets: Record<string, UserWallet>;
  public jobPosts: JobPost[];
  public dealRooms: DealRoom[];
  public staffUsers: StaffUser[];
  public staffLoginRequests: StaffLoginRequest[];
  public emailConfig: EmailConfig;
  public bankDetails: BankDetails;

  public stealthAdminPath: string;
  public totpSecret: string;
  public isTotpEnabled: boolean;
  public securityAuditLogs: {
    id: string;
    timestamp: string;
    event: string;
    user: string;
    status: 'success' | 'blocked' | 'alert' | 'failed';
    ip: string;
    device: string;
  }[];
  public financialAuditLogs: {
    id: string;
    timestamp: string;
    txType: 'wallet_deposit' | 'escrow_lock' | 'escrow_release' | 'escrow_refund' | 'payout';
    amountPKR: number;
    sender: string;
    recipient: string;
    referenceNo: string;
    gateway: string;
    status: 'completed' | 'pending' | 'flagged';
  }[];

  private listeners: (() => void)[] = [];

  private constructor() {
    let initialUser = getStored<User>(STORAGE_KEYS.CURRENT_USER, GUEST_USER);
    // Ensure initialUser is valid and has an ID
    if (!initialUser || !initialUser.id) {
      initialUser = GUEST_USER;
      setStored(STORAGE_KEYS.CURRENT_USER, GUEST_USER);
    }
    this.currentUser = initialUser;
    
    // Read stored items and default to INITIAL_PROPERTIES if empty or missing
    let storedProps = getStored<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
    this.properties = Array.isArray(storedProps) ? storedProps : INITIAL_PROPERTIES;
    this.checkAndProcessExpiries();
    
    const favs = getStored<string[]>(STORAGE_KEYS.FAVORITES, []);
    this.favorites = Array.isArray(favs) ? favs : [];

    const books = getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    this.bookings = Array.isArray(books) ? books : [];

    const invs = getStored<Invoice[]>(STORAGE_KEYS.INVOICES, []);
    this.invoices = Array.isArray(invs) ? invs : [];

    const kycs = getStored<KYCRecord[]>(STORAGE_KEYS.KYC, []);
    this.kycRecords = Array.isArray(kycs) ? kycs : [];

    const notifs = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    this.notifications = Array.isArray(notifs) ? notifs : [];

    const rooms = getStored<ChatRoom[]>(STORAGE_KEYS.CHAT_ROOMS, []);
    this.chatRooms = Array.isArray(rooms) ? rooms : [];

    this.chatMessages = getStored<Record<string, ChatMessage[]>>(STORAGE_KEYS.CHAT_MESSAGES, {});
    
    let storedAgencies = getStored<Agency[]>('dealfast_agencies', INITIAL_AGENCIES);
    this.agencies = Array.isArray(storedAgencies) ? storedAgencies : INITIAL_AGENCIES;

    let storedBuilders = getStored<Builder[]>('dealfast_builders', INITIAL_BUILDERS);
    this.builders = Array.isArray(storedBuilders) ? storedBuilders : INITIAL_BUILDERS;

    let storedProjects = getStored<Project[]>('dealfast_projects', INITIAL_PROJECTS);
    this.projects = Array.isArray(storedProjects) ? storedProjects : INITIAL_PROJECTS;

    let storedAgents = getStored<Agent[]>('dealfast_agents', INITIAL_AGENTS);
    this.agents = Array.isArray(storedAgents) ? storedAgents : INITIAL_AGENTS;
    
    const talents = getStored<AgentTalent[]>('dealfast_agent_talents', []);
    this.agentTalents = Array.isArray(talents) ? talents : [];

    this.wallets = getStored<Record<string, UserWallet>>('dealfast_wallets', {});
    this.jobPosts = getStored<JobPost[]>('dealfast_job_posts', []);
    this.dealRooms = getStored<DealRoom[]>('dealfast_deal_rooms', []);

    let storedBlogs = getStored<BlogArticle[]>('dealfast_blogs', INITIAL_BLOGS);
    this.blogs = (!storedBlogs || storedBlogs.length === 0) ? INITIAL_BLOGS : storedBlogs;
    this.autoBlogConfig = getStored<AutoBlogConfig>('dealfast_autoblog_config', {
      aiProvider: 'gemini',
      apiKey: '',
      rssFeeds: [
        'https://fbr.gov.pk/rss/news',
        'https://www.brecorder.com/feeds/latest-news',
        'https://www.dawn.com/feeds/home'
      ],
      frequency: '1_per_day',
      promptTemplate: 'Generate a short, concise, high-converting SEO article (under 350 words) focusing on Pakistan FBR Property Tax updates, Section 236K/236C rates, or DHA/Gulberg real estate trends based on these news headlines. Include 3 bullet points, low token count, and clear advice for home buyers.',
      targetCategory: 'FBR Tax & Real Estate News',
      autoPostEnabled: true,
      lastRunAt: new Date().toISOString()
    });


    this.staffUsers = getStored<StaffUser[]>('dealfast_staff_users', []);
    this.staffLoginRequests = getStored<StaffLoginRequest[]>('dealfast_staff_login_reqs', []);

    this.emailConfig = getStored<EmailConfig>('dealfast_email_config', {
      provider: 'brevo',
      brevoApiKey: '',
      resendApiKey: '',
      gmailAppPass: '',
      infoEmail: 'info@dealfast.pk',
      noReplyEmail: 'no-reply@dealfast.pk',
      paymentsEmail: 'payments@dealfast.pk',
      disputesEmail: 'disputes@dealfast.pk',
      autoOfflineNotify: true
    });

    this.bankDetails = getStored<BankDetails>('dealfast_bank_details', {
      bankName: 'Meezan Bank Islamic / HBL Corporate',
      accountTitle: 'DealFast Real Estate Escrow (Pvt) Ltd',
      iban: 'PK92MEZN0001020304050607',
      easypaisaTill: '0318-2055632 (DealFast Escrow Till)',
      commissionAccountIban: 'PK14HABB0009988776655443 (Platform Commission & Revenue Vault)'
    });

    this.stealthAdminPath = getStored<string>('dealfast_stealth_admin_path', 'dealfast-sec-x9k82v7m4q1w-portal-992834');
    this.totpSecret = getStored<string>('dealfast_totp_secret', 'JBSWY3DPEHPK3PXP');
    this.isTotpEnabled = getStored<boolean>('dealfast_totp_enabled', true);
    this.securityAuditLogs = getStored('dealfast_sec_audit_logs', [
      {
        id: 'sec-log-1',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        event: 'Stealth Admin Endpoint Initialized (High Entropy Path)',
        user: 'System Kernel',
        status: 'success',
        ip: '182.180.12.98 (Islamabad, PK)',
        device: 'Chrome 128 (Windows 11 x64)'
      },
      {
        id: 'sec-log-2',
        timestamp: new Date(Date.now() - 3600000).toISOString().replace('T', ' ').substring(0, 19),
        event: 'Salesforce / Google Authenticator 2FA Key Active',
        user: 'Super Admin (amir0921)',
        status: 'success',
        ip: '182.180.12.98 (Islamabad, PK)',
        device: 'Chrome 128 (Windows 11 x64)'
      }
    ]);

    this.financialAuditLogs = getStored('dealfast_financial_audit_logs', [
      {
        id: 'tx-fin-1',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        txType: 'escrow_lock',
        amountPKR: 500000,
        sender: 'Buyer (Ahmad Raza)',
        recipient: 'DealFast Escrow Master Bank Vault',
        referenceNo: 'ESCROW-PK-882910',
        gateway: 'Bank Alfalah Escrow Direct API',
        status: 'completed'
      },
      {
        id: 'tx-fin-2',
        timestamp: new Date(Date.now() - 7200000).toISOString().replace('T', ' ').substring(0, 19),
        txType: 'wallet_deposit',
        amountPKR: 100000,
        sender: 'Agency (DHA Lahore Prime)',
        recipient: 'User Internal Wallet',
        referenceNo: 'JAZZCASH-TOPUP-99218',
        gateway: 'JazzCash Wallet API Gateway',
        status: 'completed'
      }
    ]);

    // Initialize real-time Supabase synchronization
    this.initSupabaseSync();
  }

  private initSupabaseSync() {
    if (typeof window === 'undefined') return;
    try {
      // 1. Fetch Properties from Supabase
      supabaseService.getProperties().then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          const supabaseProps: Property[] = data.map((item: any) => ({
            ...item,
            images: Array.isArray(item.images) ? item.images : (typeof item.images === 'string' ? JSON.parse(item.images || '[]') : []),
            features: Array.isArray(item.features) ? item.features : (typeof item.features === 'string' ? JSON.parse(item.features || '[]') : []),
          }));
          const existingIds = new Set(this.properties.map(p => p.id));
          const newProps = supabaseProps.filter(p => !existingIds.has(p.id));
          if (newProps.length > 0) {
            this.properties = [...this.properties, ...newProps];
            setStored(STORAGE_KEYS.PROPERTIES, this.properties);
            this.notify();
          }
        }
      }).catch(err => {
        console.warn('Supabase properties fetch note:', err);
      });

      // 2. Fetch Bookings from Supabase
      supabaseService.getBookings().then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          this.bookings = data;
          setStored(STORAGE_KEYS.BOOKINGS, data);
          this.notify();
        }
      }).catch(err => {
        console.warn('Supabase bookings fetch note:', err);
      });

      // 3. Cross-Tab BroadcastChannel for Real-Time Sync
      try {
        const bc = new BroadcastChannel('dealfast_realtime_chat');
        bc.onmessage = (event) => {
          if (event.data) {
            if (event.data.type === 'NEW_MESSAGE') {
              const { roomId, newMsg, room } = event.data;
              if (roomId && newMsg) {
                const msgs = this.chatMessages[roomId] || [];
                if (!msgs.some(m => m.id === newMsg.id)) {
                  this.chatMessages[roomId] = [...msgs, newMsg];
                  if (room) {
                    const roomIndex = this.chatRooms.findIndex(r => r.id === roomId);
                    if (roomIndex >= 0) {
                      this.chatRooms[roomIndex] = room;
                    } else {
                      this.chatRooms = [room, ...this.chatRooms];
                    }
                  }
                  setStored(STORAGE_KEYS.CHAT_MESSAGES, this.chatMessages);
                  setStored(STORAGE_KEYS.CHAT_ROOMS, this.chatRooms);
                  this.notify();
                }
              }
            } else if (event.data.type === 'MARK_READ') {
              const { roomId } = event.data;
              if (roomId && this.chatMessages[roomId]) {
                this.chatMessages[roomId] = this.chatMessages[roomId].map(m => ({ ...m, isRead: true }));
                setStored(STORAGE_KEYS.CHAT_MESSAGES, this.chatMessages);
                this.notify();
              }
            }
          }
        };
      } catch (e) {}

      // 4. Firebase Authentication Listener & Supabase User Profile
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const isSuperAdmin = firebaseUser.email?.toLowerCase() === 'amir03182055632@gmail.com';
          const storedUser = getStored<User>(STORAGE_KEYS.CURRENT_USER, null as any);

          let supabaseProfile: Partial<User> = {};
          try {
            const profile = await supabaseService.getUserProfile(firebaseUser.uid);
            if (profile) {
              supabaseProfile = profile;
            }
          } catch (e) {
            console.warn('Could not read user profile from Supabase:', e);
          }

          const calculatedRole: UserRole = isSuperAdmin
            ? 'admin'
            : (supabaseProfile.role || storedUser?.role || this.currentUser?.role || 'user');

          const realUser: User = {
            ...this.currentUser,
            ...(storedUser && storedUser.id === firebaseUser.uid ? storedUser : {}),
            ...supabaseProfile,
            id: firebaseUser.uid,
            name: supabaseProfile.name || storedUser?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
            email: firebaseUser.email || supabaseProfile.email || storedUser?.email || '',
            phone: supabaseProfile.phone || storedUser?.phone || this.currentUser?.phone || '',
            city: supabaseProfile.city || storedUser?.city || this.currentUser?.city || 'Karachi',
            address: supabaseProfile.address || storedUser?.address || this.currentUser?.address || '',
            cnic: supabaseProfile.cnic || storedUser?.cnic || this.currentUser?.cnic || '',
            avatar: supabaseProfile.avatar || storedUser?.avatar || firebaseUser.photoURL || undefined,
            role: calculatedRole,
            kycStatus: supabaseProfile.kycStatus || storedUser?.kycStatus || 'verified',
            createdAt: supabaseProfile.createdAt || storedUser?.createdAt || new Date().toISOString()
          };
          this.currentUser = realUser;
          setStored(STORAGE_KEYS.CURRENT_USER, realUser);
          supabaseService.upsertUserProfile(realUser).catch(() => {});
          this.notify();
        } else {
          const storedUser = getStored<User>(STORAGE_KEYS.CURRENT_USER, null as any);
          if (storedUser && storedUser.id && storedUser.id !== 'user-guest' && storedUser.role !== 'guest') {
            this.currentUser = storedUser;
          } else if (this.currentUser && this.currentUser.id && this.currentUser.id !== 'user-guest' && this.currentUser.role !== 'guest') {
            setStored(STORAGE_KEYS.CURRENT_USER, this.currentUser);
          } else {
            this.currentUser = GUEST_USER;
            setStored(STORAGE_KEYS.CURRENT_USER, GUEST_USER);
          }
          this.notify();
        }
      });
    } catch (e) {
      console.warn('Supabase sync setup error:', e);
    }
  }

  public loginUserSession(user: User) {
    this.currentUser = user;
    setStored(STORAGE_KEYS.CURRENT_USER, user);
    supabaseService.upsertUserProfile(user).catch(() => {});
    this.notify();
  }

  public async loginWithGoogle() {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        const u: User = {
          id: res.user.uid,
          name: res.user.displayName || 'Google Member',
          email: res.user.email || '',
          avatar: res.user.photoURL || undefined,
          role: 'user',
          kycStatus: 'verified',
          createdAt: new Date().toISOString()
        };
        this.currentUser = u;
        setStored(STORAGE_KEYS.CURRENT_USER, u);
        await supabaseService.upsertUserProfile(u);
        this.notify();
      }
    } catch (e) {
      console.error('Google Auth Error:', e);
    }
  }

  public async logoutUser() {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
    } catch (e) {
      console.error('Logout error:', e);
    }
    this.currentUser = GUEST_USER;
    setStored(STORAGE_KEYS.CURRENT_USER, GUEST_USER);
    this.notify();
  }


  public static getInstance(): AppStore {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore();
    }
    return AppStore.instance;
  }

  public resetAllDataToEmpty() {
    this.properties = [];
    this.agencies = [];
    this.builders = [];
    this.projects = [];
    this.agents = [];
    this.agentTalents = [];
    this.bookings = [];
    this.invoices = [];
    this.kycRecords = [];
    this.notifications = [];
    this.chatRooms = [];
    this.chatMessages = {};
    this.jobPosts = [];
    this.dealRooms = [];
    this.wallets = {};
    this.favorites = [];
    
    setStored(STORAGE_KEYS.PROPERTIES, []);
    setStored(STORAGE_KEYS.BOOKINGS, []);
    setStored(STORAGE_KEYS.INVOICES, []);
    setStored(STORAGE_KEYS.KYC, []);
    setStored(STORAGE_KEYS.FAVORITES, []);
    setStored(STORAGE_KEYS.NOTIFICATIONS, []);
    setStored(STORAGE_KEYS.CHAT_ROOMS, []);
    setStored(STORAGE_KEYS.CHAT_MESSAGES, {});
    setStored('dealfast_agent_talents', []);
    setStored('dealfast_wallets', {});
    setStored('dealfast_job_posts', []);
    setStored('dealfast_deal_rooms', []);
    
    this.notify();
  }

  public subscribe(listener: () => void): () => void {

    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public notify() {
    this.listeners.forEach(l => l());
  }

  // --- ROLE & USER SWITCHER ---
  public switchRole(role: UserRole): { success: boolean; requiresKYC?: boolean; message?: string } {
    if (role === 'guest') {
      this.currentUser = { ...this.currentUser, role: 'guest' };
      setStored(STORAGE_KEYS.CURRENT_USER, this.currentUser);
      this.notify();
      return { success: true };
    }
    
    if (this.currentUser && this.currentUser.role !== 'guest' && this.currentUser.id !== 'user-guest') {
      if (role === 'admin' && this.currentUser.role !== 'admin' && this.currentUser.email !== 'admin@dealfast.pk' && this.currentUser.email !== 'amir03182055632@gmail.com') {
        console.warn('Security Alert: Cannot switch to Admin role without Super Admin authentication.');
        return { success: false, message: 'Admin role requires Super Admin credentials.' };
      }

      const highTrustRoles: UserRole[] = ['agent', 'agency', 'builder', 'marketing_company'];
      if (highTrustRoles.includes(role) && this.currentUser.kycStatus !== 'verified' && !this.currentUser.isVerified) {
        return {
          success: false,
          requiresKYC: true,
          message: `KYC Verification Required: You must complete NADRA 13-Digit Smart CNIC Verification in your Profile before operating as a ${role.replace('_', ' ').toUpperCase()}.`
        };
      }

      const isSuperAdmin = this.currentUser.email === 'admin@dealfast.pk' || this.currentUser.email === 'amir03182055632@gmail.com';
      const roleApprovalStatus = highTrustRoles.includes(role) && !isSuperAdmin ? 'pending' : 'approved';

      this.currentUser = {
        ...this.currentUser,
        role: role,
        roleApprovalStatus
      };
      supabaseService.upsertUserProfile(this.currentUser).catch(() => {});
    }
    setStored(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.notify();
    return { success: true };
  }

  public updateUserProfile(updates: Partial<User>) {
    const safeUpdates = { ...updates };
    // Anti-Fraud Guard: Prevent non-admin users from self-escalating role to admin
    if (this.currentUser.role !== 'admin') {
      delete safeUpdates.role;
    }
    this.currentUser = { ...this.currentUser, ...safeUpdates };
    setStored(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    if (this.currentUser.id && this.currentUser.id !== 'user-guest' && this.currentUser.id !== 'guest') {
      supabaseService.upsertUserProfile(this.currentUser).catch(() => {});
    }
    this.notify();
  }

  // --- FAVORITES ---
  public toggleFavorite(propertyId: string) {
    if (this.favorites.includes(propertyId)) {
      this.favorites = this.favorites.filter(id => id !== propertyId);
    } else {
      this.favorites = [...this.favorites, propertyId];
    }
    setStored(STORAGE_KEYS.FAVORITES, this.favorites);
    this.notify();
  }

  public isFavorite(propertyId: string): boolean {
    return this.favorites.includes(propertyId);
  }

  // --- PROJECTS CRUD ---
  public addProject(project: Project) {
    this.projects = [project, ...this.projects];
    setStored(STORAGE_KEYS.PROJECTS, this.projects);
    this.notify();
  }

  // --- PROPERTIES CRUD ---
  public addProperty(newProp: Omit<Property, 'id' | 'createdAt' | 'views' | 'status' | 'slug'>): Property {
    if (this.currentUser.role === 'guest' || this.currentUser.id === 'user-guest') {
      throw new Error('Authentication required. Guest visitors cannot post properties.');
    }

    const id = `prop-${Date.now()}`;
    const slug = newProp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // 1. Auto-assign map coordinates if missing or default
    const cityCoords: Record<string, { lat: number; lng: number }> = {
      Islamabad: { lat: 33.6844, lng: 73.0479 },
      Lahore: { lat: 31.5204, lng: 74.3587 },
      Karachi: { lat: 24.8607, lng: 67.0011 },
      Rawalpindi: { lat: 33.5651, lng: 73.0169 },
      Peshawar: { lat: 34.0151, lng: 71.5249 },
      Faisalabad: { lat: 31.4504, lng: 73.1350 },
      Multan: { lat: 30.1575, lng: 71.5249 },
      Quetta: { lat: 30.1798, lng: 66.9750 },
      Gujranwala: { lat: 32.1877, lng: 74.1945 },
      Sialkot: { lat: 32.4945, lng: 74.5229 },
      Hyderabad: { lat: 25.3960, lng: 68.3578 },
      Abbottabad: { lat: 34.1688, lng: 73.2215 },
      Bahawalpur: { lat: 29.3544, lng: 71.6911 },
      Sargodha: { lat: 32.0836, lng: 72.6711 },
      Sukkur: { lat: 27.7131, lng: 68.8485 },
      Mardan: { lat: 34.1986, lng: 72.0404 },
      Larkana: { lat: 27.5590, lng: 68.2120 },
      Sheikhupura: { lat: 31.7167, lng: 73.9850 },
      'Rahim Yar Khan': { lat: 28.4212, lng: 70.2989 },
      Jhelum: { lat: 32.9405, lng: 73.7276 },
      'Wah Cantt': { lat: 33.7715, lng: 72.7511 },
      Okara: { lat: 30.8100, lng: 73.4597 },
      Sahiwal: { lat: 30.6682, lng: 73.1114 },
      Gujrat: { lat: 32.5742, lng: 74.0754 },
      Gwadar: { lat: 25.1264, lng: 62.3225 },
      Swat: { lat: 35.2227, lng: 72.4258 },
      'Mirpur (AK)': { lat: 33.1484, lng: 73.7519 },
      Muzaffarabad: { lat: 34.3700, lng: 73.4711 }
    };

    let calculatedLat = newProp.lat;
    let calculatedLng = newProp.lng;

    if (!calculatedLat || !calculatedLng || (calculatedLat === 24.8607 && calculatedLng === 67.0011 && newProp.city !== 'Karachi')) {
      const base = cityCoords[newProp.city] || cityCoords['Islamabad'];
      let hash = 0;
      const key = (newProp.title || '') + (newProp.area || '');
      for (let i = 0; i < key.length; i++) {
        hash = (hash << 5) - hash + key.charCodeAt(i);
        hash |= 0;
      }
      const offsetLat = ((Math.abs(hash) % 120) - 60) / 3000;
      const offsetLng = ((Math.abs(hash >> 3) % 120) - 60) / 3000;
      calculatedLat = base.lat + offsetLat;
      calculatedLng = base.lng + offsetLng;
    }

    // 2. Duplicate Property Detection Check
    const normTitle = newProp.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normAddr = (newProp.address || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const isDuplicate = this.properties.some(p => {
      const pNormTitle = p.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const pNormAddr = (p.address || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      if (pNormTitle && pNormTitle === normTitle) return true;
      if (normAddr && pNormAddr && pNormAddr === normAddr && p.city.toLowerCase() === newProp.city.toLowerCase()) return true;
      if (
        p.city.toLowerCase() === newProp.city.toLowerCase() &&
        p.area.toLowerCase() === newProp.area.toLowerCase() &&
        p.type === newProp.type &&
        p.price === newProp.price &&
        p.beds === newProp.beds
      ) {
        return true;
      }
      return false;
    });

    const finalApprovedStatus = isDuplicate ? 'pending' : 'approved';

    const deletionSecurityCode = `DF-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowIso = new Date().toISOString();
    const expiresAtIso = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();

    const created: Property = {
      ...newProp,
      id,
      slug,
      status: finalApprovedStatus,
      lat: calculatedLat,
      lng: calculatedLng,
      isDuplicateFlagged: isDuplicate,
      duplicateReason: isDuplicate ? `Duplicate listing detected in ${newProp.city} (${newProp.area}). Requires Admin Approval before publishing.` : undefined,
      deletionSecurityCode,
      expiresAt: expiresAtIso,
      lastRenewedAt: nowIso,
      views: 1,
      createdAt: new Date().toISOString()
    };

    this.properties = [created, ...this.properties];
    setStored(STORAGE_KEYS.PROPERTIES, this.properties);

    // Supabase cloud database sync
    supabaseService.upsertProperty({
      ...created,
      images: JSON.stringify(created.images || []),
      features: JSON.stringify(created.features || [])
    }).catch(err => console.warn('Supabase property sync note:', err));

    this.addNotification({
      userId: this.currentUser.id,
      title: isDuplicate ? 'Duplicate Listing Flagged' : 'Property Submitted',
      message: isDuplicate
        ? `A similar listing already exists in ${created.city}. Your post "${created.title}" has been sent for Admin Approval.`
        : (finalApprovedStatus === 'approved' ? `Your listing "${created.title}" is now live!` : `Your listing "${created.title}" is pending admin review.`),
      type: 'property',
      isRead: false,
      timestamp: 'Just now'
    });

    this.notify();
    this.revalidateServerCache();
    return created;
  }

  public updateProperty(id: string, updates: Partial<Property>): Property | null {
    const index = this.properties.findIndex(p => p.id === id);
    if (index === -1) return null;
    const existing = this.properties[index];
    if (this.currentUser.role !== 'admin' && existing.userId !== this.currentUser.id) {
      throw new Error('Unauthorized: You can only edit your own listings.');
    }
    const updatedProp: Property = {
      ...existing,
      ...updates,
      id: existing.id
    };
    this.properties[index] = updatedProp;
    setStored(STORAGE_KEYS.PROPERTIES, this.properties);

    // Supabase update
    supabaseService.upsertProperty({
      ...updatedProp,
      images: JSON.stringify(updatedProp.images || []),
      features: JSON.stringify(updatedProp.features || [])
    }).catch(() => {});
    this.notify();
    this.revalidateServerCache();
    return updatedProp;
  }

  private revalidateServerCache() {
    if (typeof window !== 'undefined' && typeof fetch === 'function') {
      fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revalidate' })
      }).catch(err => console.warn('Cache revalidation trigger skipped:', err));
    }
  }

  public updatePropertyStatus(id: string, status: Property['status']) {
    if (this.currentUser.role !== 'admin') {
      console.warn('Security Alert: Only Admin can update property approval status.');
      return;
    }
    this.properties = this.properties.map(p => p.id === id ? { ...p, status } : p);
    setStored(STORAGE_KEYS.PROPERTIES, this.properties);
    const updatedProp = this.properties.find(p => p.id === id);
    if (updatedProp) {
      supabaseService.upsertProperty({
        ...updatedProp,
        images: JSON.stringify(updatedProp.images || []),
        features: JSON.stringify(updatedProp.features || [])
      }).catch(() => {});
    }
    this.notify();
    this.revalidateServerCache();
  }

  public togglePropertyFeature(id: string, field: 'isPremium' | 'isFeatured') {
    if (this.currentUser.role !== 'admin') {
      console.warn('Security Alert: Only Admin can toggle premium or featured property status.');
      return;
    }
    this.properties = this.properties.map(p => p.id === id ? { ...p, [field]: !p[field] } : p);
    setStored(STORAGE_KEYS.PROPERTIES, this.properties);
    const updatedProp = this.properties.find(p => p.id === id);
    if (updatedProp) {
      supabaseService.upsertProperty({
        ...updatedProp,
        images: JSON.stringify(updatedProp.images || []),
        features: JSON.stringify(updatedProp.features || [])
      }).catch(() => {});
    }
    this.notify();
    this.revalidateServerCache();
  }

  public incrementViews(id: string) {
    this.properties = this.properties.map(p => p.id === id ? { ...p, views: p.views + 1 } : p);
    setStored(STORAGE_KEYS.PROPERTIES, this.properties);
    this.notify();
  }

  // --- RECYCLE BIN & 15-DAY LISTING EXPIRY / RENEWAL ENGINE ---

  public checkAndProcessExpiries() {
    const nowMs = Date.now();
    let updated = false;
    const nextProps: Property[] = [];

    for (const p of this.properties) {
      // 1. Ensure every property has a unique secret deletion security code
      if (!p.deletionSecurityCode) {
        let hash = 0;
        for (let i = 0; i < p.id.length; i++) {
          hash = (hash << 5) - hash + p.id.charCodeAt(i);
          hash |= 0;
        }
        p.deletionSecurityCode = `DF-${Math.floor(10000 + (Math.abs(hash) % 89999))}`;
        updated = true;
      }

      // 2. Ensure every property has a valid expiration date (15 days from creation/renewal)
      if (!p.expiresAt) {
        const createdMs = p.createdAt ? new Date(p.createdAt).getTime() : nowMs;
        p.expiresAt = new Date(createdMs + 15 * 24 * 60 * 60 * 1000).toISOString();
        p.lastRenewedAt = p.createdAt || new Date().toISOString();
        updated = true;
      }

      // 3. Check active listings for 15-day validity expiry
      if (p.status !== 'recycle_bin') {
        const expMs = new Date(p.expiresAt).getTime();
        if (!isNaN(expMs) && nowMs > expMs) {
          p.status = 'recycle_bin';
          p.deletedAt = new Date().toISOString();
          updated = true;

          this.addNotification({
            userId: p.userId,
            title: 'Listing Expired (Moved to Recycle Bin)',
            message: `Your property listing "${p.title}" expired after 15 days. It is now in your Recycle Bin for 15 days before permanent auto-erasure. You can restore or renew it anytime.`,
            type: 'property',
            isRead: false,
            timestamp: 'Just now'
          });
        }
        nextProps.push(p);
      } else {
        // 4. Check Recycle Bin items for 15-day permanent erasure cutoff
        const delMs = p.deletedAt ? new Date(p.deletedAt).getTime() : nowMs;
        const binExpiryMs = delMs + 15 * 24 * 60 * 60 * 1000;
        if (nowMs > binExpiryMs) {
          // Exceeded 15 days in Recycle Bin => permanently erase
          updated = true;
          // Omit from nextProps
        } else {
          nextProps.push(p);
        }
      }
    }

    if (updated) {
      this.properties = nextProps;
      setStored(STORAGE_KEYS.PROPERTIES, this.properties);
    }
  }

  public renewProperty(propertyId: string): { success: boolean; message: string } {
    const p = this.properties.find(item => item.id === propertyId);
    if (!p) return { success: false, message: 'Property listing not found.' };

    const nowMs = Date.now();
    p.lastRenewedAt = new Date(nowMs).toISOString();
    p.expiresAt = new Date(nowMs + 15 * 24 * 60 * 60 * 1000).toISOString();
    if (p.status === 'recycle_bin') {
      p.status = 'approved';
      delete p.deletedAt;
    }

    setStored(STORAGE_KEYS.PROPERTIES, this.properties);
    supabaseService.upsertProperty({
      ...p,
      images: JSON.stringify(p.images || []),
      features: JSON.stringify(p.features || [])
    }).catch(() => {});

    this.addNotification({
      userId: p.userId,
      title: 'Listing Renewed (+15 Days Live)',
      message: `Your property listing "${p.title}" has been successfully renewed for 15 days!`,
      type: 'property',
      isRead: false,
      timestamp: 'Just now'
    });

    this.notify();
    return { success: true, message: `Listing renewed! Valid until ${new Date(p.expiresAt).toLocaleDateString()}.` };
  }

  public moveToRecycleBin(propertyId: string, securityCodeEntered: string): { success: boolean; message: string } {
    const p = this.properties.find(item => item.id === propertyId);
    if (!p) return { success: false, message: 'Property listing not found.' };

    const reqCode = (p.deletionSecurityCode || '').trim().toUpperCase();
    const inputCode = securityCodeEntered.trim().toUpperCase();

    if (reqCode && inputCode !== reqCode) {
      return { success: false, message: `Incorrect security code! You entered "${securityCodeEntered}". The exact code is "${p.deletionSecurityCode}".` };
    }

    p.status = 'recycle_bin';
    p.deletedAt = new Date().toISOString();

    setStored(STORAGE_KEYS.PROPERTIES, this.properties);
    supabaseService.upsertProperty({
      ...p,
      images: JSON.stringify(p.images || []),
      features: JSON.stringify(p.features || [])
    }).catch(() => {});

    this.addNotification({
      userId: p.userId,
      title: 'Listing Moved to Recycle Bin',
      message: `"${p.title}" was moved to your Recycle Bin. It will remain restorable for 15 days before permanent erasure.`,
      type: 'property',
      isRead: false,
      timestamp: 'Just now'
    });

    this.notify();
    return { success: true, message: 'Property moved to Recycle Bin.' };
  }

  public restoreFromRecycleBin(propertyId: string): { success: boolean; message: string } {
    const p = this.properties.find(item => item.id === propertyId);
    if (!p) return { success: false, message: 'Property listing not found.' };

    const nowMs = Date.now();
    p.status = 'approved';
    delete p.deletedAt;
    p.lastRenewedAt = new Date(nowMs).toISOString();
    p.expiresAt = new Date(nowMs + 15 * 24 * 60 * 60 * 1000).toISOString();

    setStored(STORAGE_KEYS.PROPERTIES, this.properties);
    supabaseService.upsertProperty({
      ...p,
      images: JSON.stringify(p.images || []),
      features: JSON.stringify(p.features || [])
    }).catch(() => {});

    this.addNotification({
      userId: p.userId,
      title: 'Listing Restored',
      message: `"${p.title}" was restored from your Recycle Bin and is active for 15 days.`,
      type: 'property',
      isRead: false,
      timestamp: 'Just now'
    });

    this.notify();
    return { success: true, message: 'Property restored successfully!' };
  }

  public permanentlyDeleteProperty(propertyId: string): { success: boolean; message: string } {
    this.properties = this.properties.filter(p => p.id !== propertyId);
    setStored(STORAGE_KEYS.PROPERTIES, this.properties);
    supabaseService.deleteProperty(propertyId).catch(() => {});
    this.notify();
    return { success: true, message: 'Property permanently deleted.' };
  }

  // --- BOOKING & ESCROW ---
  public createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'transactionId' | 'escrowHoldDate'>): Booking {
    if (this.currentUser.role === 'guest' || this.currentUser.id === 'user-guest') {
      throw new Error('Authentication required. Guests must sign in before making escrow bookings.');
    }
    const id = `book-${Date.now()}`;
    const txn = `TXN-DEAL-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString().split('T')[0];

    const newBooking: Booking = {
      ...bookingData,
      id,
      transactionId: txn,
      escrowHoldDate: now,
      createdAt: now
    };

    this.bookings = [newBooking, ...this.bookings];
    setStored(STORAGE_KEYS.BOOKINGS, this.bookings);
    supabaseService.upsertBooking(newBooking).catch(() => {});

    // Auto-generate invoice
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      bookingId: id,
      date: now,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      customerName: newBooking.buyerName,
      customerEmail: newBooking.buyerEmail,
      propertyTitle: newBooking.propertyTitle,
      amount: newBooking.amountPaid,
      platformFee: newBooking.platformFee,
      commission: newBooking.agentCommission,
      status: 'paid',
      paymentMethod: newBooking.paymentMethod.toUpperCase()
    };

    this.invoices = [newInvoice, ...this.invoices];
    setStored(STORAGE_KEYS.INVOICES, this.invoices);

    this.addNotification({
      userId: newBooking.buyerId,
      title: 'Booking Escrow Active',
      message: `Token payment for ${newBooking.propertyTitle} received and secured in DealFast Escrow.`,
      type: 'booking',
      isRead: false,
      timestamp: 'Just now'
    });

    this.notify();
    return newBooking;
  }

  public updateBookingStatus(id: string, bookingStatus: Booking['bookingStatus'], paymentStatus: Booking['paymentStatus']) {
    if (this.currentUser.role === 'guest' || this.currentUser.id === 'user-guest') {
      console.warn('Security Alert: Guest cannot update escrow booking status.');
      return;
    }
    const found = this.bookings.find(b => b.id === id);
    if (!found) return;

    // Ground Reality Security: Only Buyer, Seller (Agency/Builder/Owner), or Superadmin can update booking status
    const isBuyer = this.currentUser.id === found.buyerId || this.currentUser.email === found.buyerEmail;
    const isSeller = this.currentUser.id === found.sellerId || (found.sellerEmail && this.currentUser.email === found.sellerEmail);
    const isAdmin = this.currentUser.role === 'admin' || (this.currentUser as any).role === 'superadmin';

    if (!isBuyer && !isSeller && !isAdmin) {
      console.warn('Security Alert: User does not have ground-reality authorization to update this escrow booking status.');
      return;
    }

    if (paymentStatus === 'released' && !isAdmin) {
      console.warn('Security Alert: Only Super Admin can authorize final escrow release and disbursement.');
      return;
    }

    this.bookings = this.bookings.map(b => b.id === id ? { ...b, bookingStatus, paymentStatus } : b);
    setStored(STORAGE_KEYS.BOOKINGS, this.bookings);
    const updated = this.bookings.find(b => b.id === id);
    if (updated) {
      supabaseService.upsertBooking(updated).catch(() => {});
    }
    this.notify();
  }

  // --- KYC ---
  public submitKYC(data: { cnicFront: string; cnicBack: string; licenseDoc?: string; secpDoc?: string }) {
    if (this.currentUser.role === 'guest' || this.currentUser.id === 'user-guest') {
      throw new Error('Authentication required. Guest visitors cannot submit KYC verification.');
    }
    const id = `kyc-${Date.now()}`;
    const record: KYCRecord = {
      id,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userEmail: this.currentUser.email,
      userRole: this.currentUser.role,
      cnicFront: data.cnicFront,
      cnicBack: data.cnicBack,
      licenseDoc: data.licenseDoc,
      secpDoc: data.secpDoc,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0]
    };

    this.kycRecords = [record, ...this.kycRecords];
    this.currentUser.kycStatus = 'pending';
    setStored(STORAGE_KEYS.KYC, this.kycRecords);
    setStored(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    supabaseService.upsertUserProfile(this.currentUser).catch(() => {});

    this.notify();
  }

  public submitAutoNadraBiometricVerification(data: {
    cnic: string;
    fullName?: string;
    fatherHusbandName?: string;
    dob?: string;
    cnicIssueDate?: string;
    cnicFrontUrl?: string;
    cnicBackUrl?: string;
    verisysHash: string;
    biometricScore: number;
    verisysPassId: string;
  }) {
    if (this.currentUser.role === 'guest' || this.currentUser.id === 'user-guest') {
      throw new Error('Authentication required. Guest visitors cannot submit NADRA biometric verification.');
    }

    // Validate Pakistani CNIC format (13 digits with or without dashes)
    const cleanCnic = (data.cnic || '').replace(/[^0-9]/g, '');
    if (cleanCnic.length !== 13) {
      throw new Error('Security Error: Invalid CNIC number format. Must be a valid 13-digit Pakistani CNIC.');
    }

    const id = `kyc-nadra-${Date.now()}`;
    const status = 'pending';

    if (data.fullName && data.fullName.trim()) {
      this.currentUser.name = data.fullName.trim();
    }
    if (data.fatherHusbandName && data.fatherHusbandName.trim()) {
      this.currentUser.fatherName = data.fatherHusbandName.trim();
    }
    if (data.dob) {
      this.currentUser.dob = data.dob;
    }
    if (data.cnicIssueDate) {
      this.currentUser.cnicIssueDate = data.cnicIssueDate;
    }

    this.currentUser.cnic = data.cnic;
    this.currentUser.kycStatus = 'pending';

    const record: KYCRecord = {
      id,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userEmail: this.currentUser.email,
      userRole: this.currentUser.role,
      cnicFront: data.cnicFrontUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
      cnicBack: data.cnicBackUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0]
    };

    this.kycRecords = [record, ...this.kycRecords];
    setStored(STORAGE_KEYS.KYC, this.kycRecords);
    setStored(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    supabaseService.upsertUserProfile(this.currentUser).catch(() => {});

    this.addNotification({
      userId: this.currentUser.id,
      title: 'KYC & Document Verification Submitted',
      message: `CNIC and document submission (${data.verisysPassId}) sent to Super Admin Queue. Admin review and approval will grant official verified status.`,
      type: 'kyc',
      isRead: false,
      timestamp: 'Just now'
    });

    this.notify();
  }

  public reviewKYC(id: string, status: 'approved' | 'rejected', rejectionReason?: string) {
    if (this.currentUser.role !== 'admin') {
      console.warn('Security Alert: Reviewing KYC records requires Admin permissions.');
      return;
    }
    this.kycRecords = this.kycRecords.map(k => {
      if (k.id === id) {
        return { ...k, status, rejectionReason };
      }
      return k;
    });

    const record = this.kycRecords.find(k => k.id === id);
    if (record) {
      if (record.userId === this.currentUser.id) {
        this.currentUser.kycStatus = status === 'approved' ? 'verified' : 'rejected';
        this.currentUser.isVerified = status === 'approved';
        setStored(STORAGE_KEYS.CURRENT_USER, this.currentUser);
        supabaseService.upsertUserProfile(this.currentUser).catch(() => {});
      }

      if (status === 'approved') {
        this.addNotification({
          userId: record.userId,
          title: 'Official KYC & CNIC Verification Approved!',
          message: 'Super Admin has verified your CNIC documents and NADRA record. Your account is now officially verified.',
          type: 'kyc',
          isRead: false,
          timestamp: 'Just now'
        });
      }
    }

    setStored(STORAGE_KEYS.KYC, this.kycRecords);
    this.notify();
  }

  // --- CHAT & MESSAGES ---
  public sendMessage(roomId: string, text: string, mediaUrl?: string, mediaType?: 'image' | 'file'): ChatMessage {
    if (this.currentUser.role === 'guest' || this.currentUser.id === 'user-guest') {
      throw new Error('Guest visitors must sign in before sending messages.');
    }
    const cleanText = (text || '').replace(/[<>"'/]/g, '').trim();
    const msgId = `m-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: msgId,
      roomId,
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      senderAvatar: this.currentUser.avatar,
      text: cleanText,
      mediaUrl,
      mediaType,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      isDelivered: false,
      status: 'sent'
    };

    const roomMsgs = this.chatMessages[roomId] || [];
    this.chatMessages[roomId] = [...roomMsgs, newMsg];

    // Update room last message
    let updatedRoom: ChatRoom | undefined;
    this.chatRooms = this.chatRooms.map(r => {
      if (r.id === roomId) {
        updatedRoom = {
          ...r,
          lastMessage: text,
          lastMessageTime: newMsg.timestamp
        };
        return updatedRoom;
      }
      return r;
    });

    setStored(STORAGE_KEYS.CHAT_MESSAGES, this.chatMessages);
    setStored(STORAGE_KEYS.CHAT_ROOMS, this.chatRooms);

    // Save Message to Supabase in real-time
    try {
      supabaseService.saveChatMessage(newMsg).catch(() => {});
    } catch (e) {}

    // Broadcast message to all browser tabs and windows
    if (typeof window !== 'undefined') {
      try {
        const bc = new BroadcastChannel('dealfast_realtime_chat');
        bc.postMessage({ type: 'NEW_MESSAGE', roomId, newMsg, room: updatedRoom });
        bc.close();
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('dealfast_realtime_msg', { detail: { roomId, newMsg, room: updatedRoom } }));
    }

    // Automatically transition to 'delivered' after network acknowledgement (500ms)
    setTimeout(() => {
      if (this.chatMessages[roomId]) {
        this.chatMessages[roomId] = this.chatMessages[roomId].map(m => {
          if (m.id === msgId && !m.isRead) {
            return { ...m, isDelivered: true, status: 'delivered' };
          }
          return m;
        });
        setStored(STORAGE_KEYS.CHAT_MESSAGES, this.chatMessages);
        this.notify();
      }
    }, 500);

    this.notify();

    return newMsg;
  }

  public receiveAgentReply(roomId: string, senderId: string, senderName: string, text: string): ChatMessage {
    const msgId = `m-agent-${Date.now()}`;
    const agentMsg: ChatMessage = {
      id: msgId,
      roomId,
      senderId: senderId || 'agent-1',
      senderName: senderName || 'Verified Agent',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      isDelivered: true,
      status: 'delivered'
    };

    const roomMsgs = this.chatMessages[roomId] || [];
    this.chatMessages[roomId] = [...roomMsgs, agentMsg];

    let updatedRoom: ChatRoom | undefined;
    this.chatRooms = this.chatRooms.map(r => {
      if (r.id === roomId) {
        updatedRoom = {
          ...r,
          lastMessage: text,
          lastMessageTime: agentMsg.timestamp,
          unreadCount: (r.unreadCount || 0) + 1
        };
        return updatedRoom;
      }
      return r;
    });

    setStored(STORAGE_KEYS.CHAT_MESSAGES, this.chatMessages);
    setStored(STORAGE_KEYS.CHAT_ROOMS, this.chatRooms);

    try {
      supabaseService.saveChatMessage(agentMsg).catch(() => {});
    } catch (e) {}

    // Add In-App notification for new message
    this.addNotification({
      userId: this.currentUser.id,
      title: `New Message from ${senderName || 'Agent'}`,
      message: text.length > 80 ? `${text.substring(0, 80)}...` : text,
      type: 'chat',
      isRead: false,
      timestamp: 'Just now'
    });

    if (typeof window !== 'undefined') {
      try {
        const bc = new BroadcastChannel('dealfast_realtime_chat');
        bc.postMessage({ type: 'NEW_MESSAGE', roomId, newMsg: agentMsg, room: updatedRoom });
        bc.close();
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('dealfast_realtime_msg', { detail: { roomId, newMsg: agentMsg, room: updatedRoom } }));
    }

    this.notify();
    return agentMsg;
  }

  public getOrCreateChatRoom(agentId: string, agentName: string, propertyId?: string, propertyTitle?: string): ChatRoom {
    return this.getOrCreateRoomWithAgent(agentId, agentName, propertyId, propertyTitle);
  }

  public getOrCreateRoomWithAgent(agentId: string, agentName: string, propertyId?: string, propertyTitle?: string): ChatRoom {
    let room = this.chatRooms.find(r => r.participants.some(p => p.id === agentId));
    if (!room) {
      const roomId = `room-${Date.now()}`;
      room = {
        id: roomId,
        participants: [
          { id: this.currentUser.id, name: this.currentUser.name, role: this.currentUser.role, avatar: this.currentUser.avatar, isOnline: true },
          { id: agentId, name: agentName, role: 'agent', isOnline: true }
        ],
        lastMessage: 'Chat started',
        lastMessageTime: 'Just now',
        unreadCount: 0,
        propertyId,
        propertyTitle
      };
      this.chatRooms = [room, ...this.chatRooms];
      this.chatMessages[roomId] = [];
      setStored(STORAGE_KEYS.CHAT_ROOMS, this.chatRooms);
      setStored(STORAGE_KEYS.CHAT_MESSAGES, this.chatMessages);

      if (typeof window !== 'undefined') {
        try {
          const bc = new BroadcastChannel('dealfast_realtime_chat');
          bc.postMessage({ type: 'NEW_ROOM', room });
          bc.close();
        } catch (e) {}
      }

      this.notify();
    }
    return room;
  }

  public markRoomAsRead(roomId: string): void {
    let changed = false;
    this.chatRooms = this.chatRooms.map(r => {
      if (r.id === roomId && r.unreadCount > 0) {
        changed = true;
        return { ...r, unreadCount: 0 };
      }
      return r;
    });

    if (this.chatMessages[roomId]) {
      this.chatMessages[roomId] = this.chatMessages[roomId].map(m => {
        if (!m.isRead && m.senderId !== this.currentUser.id) {
          changed = true;
          return { ...m, isRead: true, isDelivered: true, status: 'read' };
        }
        return m;
      });
    }

    if (changed) {
      setStored(STORAGE_KEYS.CHAT_ROOMS, this.chatRooms);
      setStored(STORAGE_KEYS.CHAT_MESSAGES, this.chatMessages);

      if (typeof window !== 'undefined') {
        try {
          const bc = new BroadcastChannel('dealfast_realtime_chat');
          bc.postMessage({ type: 'MARK_READ', roomId });
          bc.close();
        } catch (e) {}
        window.dispatchEvent(new CustomEvent('dealfast_realtime_msg', { detail: { type: 'MARK_READ', roomId } }));
      }

      this.notify();
    }
  }

  public deleteChatRoom(roomId: string): void {
    this.chatRooms = this.chatRooms.filter(r => r.id !== roomId);
    delete this.chatMessages[roomId];
    setStored(STORAGE_KEYS.CHAT_ROOMS, this.chatRooms);
    setStored(STORAGE_KEYS.CHAT_MESSAGES, this.chatMessages);
    this.notify();
  }

  public deleteChatMessage(roomId: string, messageId: string): void {
    if (this.chatMessages[roomId]) {
      this.chatMessages[roomId] = this.chatMessages[roomId].filter(m => m.id !== messageId);
      const remaining = this.chatMessages[roomId];
      const last = remaining[remaining.length - 1];
      this.chatRooms = this.chatRooms.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            lastMessage: last ? last.text : 'No messages',
            lastMessageTime: last ? last.timestamp : ''
          };
        }
        return r;
      });
      setStored(STORAGE_KEYS.CHAT_ROOMS, this.chatRooms);
      setStored(STORAGE_KEYS.CHAT_MESSAGES, this.chatMessages);
      this.notify();
    }
  }

  // --- ADMIN METHODS ---
  public getAdminStats() {
    const totalUsers = INITIAL_USERS.length + this.agents.length + this.agencies.length;
    const activeProperties = this.properties.filter(p => p.status === 'approved').length;
    const pendingApprovals = this.properties.filter(p => p.status === 'pending').length;
    const escrowVolumePKR = this.bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
    const platformRevenuePKR = this.bookings.reduce((sum, b) => sum + (b.platformFee || 0), 0);
    const pendingKYC = this.kycRecords.filter(k => k.status === 'pending').length;

    return {
      totalUsers,
      activeProperties,
      pendingApprovals,
      escrowVolumePKR,
      platformRevenuePKR,
      totalProperties: this.properties.length,
      totalAgents: this.agents.length,
      totalAgencies: this.agencies.length,
      totalBookings: this.bookings.length,
      totalStaff: this.staffUsers.length,
      pendingKYC,
      totalBlogs: this.blogs.length
    };
  }

  public approveProperty(id: string) {
    this.updatePropertyStatus(id, 'approved');
  }

  public rejectProperty(id: string) {
    this.updatePropertyStatus(id, 'rejected');
  }

  public releaseEscrow(bookingId: string) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return;
    const isBuyer = this.currentUser.id === booking.buyerId || this.currentUser.email === booking.buyerEmail;
    const isAdmin = this.currentUser.role === 'admin';
    if (!isBuyer && !isAdmin) {
      console.warn('Security Alert: Unauthorized escrow release attempt blocked. Only Buyer or Admin can release funds.');
      return;
    }

    if (isAdmin) {
      // Super Admin final approval and release
      this.updateBookingStatus(bookingId, 'completed', 'released');
      this.addNotification({
        userId: booking.buyerId,
        title: 'Escrow Funds Disbursed by Admin',
        message: `Final Escrow release approved by Admin for ${booking.propertyTitle}. Payout sent to seller bank account.`,
        type: 'booking',
        isRead: false,
        timestamp: 'Just now'
      });
    } else {
      // Buyer/Seller request requires Admin final approval
      this.bookings = this.bookings.map(b => {
        if (b.id === bookingId) {
          return { ...b, paymentStatus: 'release_requested' as any };
        }
        return b;
      });
      setStored(STORAGE_KEYS.BOOKINGS, this.bookings);
      const updated = this.bookings.find(b => b.id === bookingId);
      if (updated) {
        supabaseService.upsertBooking(updated).catch(() => {});
      }

      this.addNotification({
        userId: this.currentUser.id,
        title: 'Escrow Release Request Sent to Admin',
        message: `Your request to release Escrow funds for ${booking.propertyTitle} has been submitted. Super Admin will verify bank details and issue final release.`,
        type: 'booking',
        isRead: false,
        timestamp: 'Just now'
      });
      this.notify();
    }
  }

  public refundEscrow(bookingId: string) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return;
    const isSeller = this.currentUser.id === booking.sellerId || (booking.sellerEmail && this.currentUser.email === booking.sellerEmail);
    const isAdmin = this.currentUser.role === 'admin';
    if (!isSeller && !isAdmin) {
      console.warn('Security Alert: Unauthorized escrow refund attempt blocked. Only Seller or Admin can refund funds.');
      return;
    }
    this.updateBookingStatus(bookingId, 'cancelled', 'refunded');
  }

  // --- NOTIFICATIONS & INQUIRIES ---
  public addInquiry(inquiry: { propertyId: string; propertyTitle: string; userName: string; userPhone: string; message: string }) {
    this.addNotification({
      userId: 'user-agent-1',
      title: `📩 New Inquiry: ${inquiry.propertyTitle}`,
      message: `${inquiry.userName} (${inquiry.userPhone}): "${inquiry.message}"`,
      type: 'property',
      isRead: false,
      timestamp: 'Just now'
    });
    this.notify();
  }

  public addNotification(notif: Omit<AppNotification, 'id'>) {
    const newN: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`
    };
    const current = Array.isArray(this.notifications) ? this.notifications : [];
    this.notifications = [newN, ...current];
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public markNotificationAsRead(id: string) {
    const current = Array.isArray(this.notifications) ? this.notifications : [];
    this.notifications = current.map(n => n.id === id ? { ...n, isRead: true } : n);
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public registerAgency(agencyData: Omit<Agency, 'id' | 'rating' | 'reviewCount'>): Agency {
    const id = `agency-${Date.now()}`;
    const newAgency: Agency = {
      ...agencyData,
      id,
      rating: 5.0,
      reviewCount: 1
    };
    this.agencies = [newAgency, ...this.agencies];
    setStored('dealfast_agencies', this.agencies);
    this.notify();
    return newAgency;
  }

  public registerAgent(agentData: Omit<Agent, 'id' | 'rating' | 'verified' | 'activeListings' | 'totalDeals'>): Agent {
    const id = `agent-${Date.now()}`;
    const newAgent: Agent = {
      ...agentData,
      id,
      rating: 5.0,
      activeListings: 1,
      totalDeals: 1,
      verified: true
    };
    this.agents = [newAgent, ...this.agents];
    setStored('dealfast_agents', this.agents);
    this.notify();
    return newAgent;
  }

  public saveAgreement(agreementData: any) {
    const id = agreementData.id || `agmt-${Date.now()}`;
    const agmtRecord = {
      ...agreementData,
      id,
      createdAt: new Date().toISOString()
    };
    return agmtRecord;
  }

  public addAgentTalent(talent: Omit<AgentTalent, 'id' | 'status' | 'appliedAt'>): AgentTalent {
    const id = `talent-${Date.now()}`;
    const newT: AgentTalent = {
      ...talent,
      id,
      status: 'available',
      appliedAt: new Date().toISOString().split('T')[0]
    };
    this.agentTalents = [newT, ...this.agentTalents];
    setStored('dealfast_agent_talents', this.agentTalents);

    // Also register agent profile in public directory
    this.registerAgent({
      name: talent.name,
      title: `${talent.specialization} Consultant`,
      avatar: talent.avatar,
      phone: talent.phone,
      email: talent.email,
      city: talent.city,
      agencyName: 'Freelance Consultant'
    });

    this.addNotification({
      userId: this.currentUser.id,
      title: '🎯 Agent Application Submitted!',
      message: `Your profile as ${talent.name} is now visible to Corporate Agencies & Builders looking to hire talent in ${talent.city}.`,
      type: 'system',
      timestamp: 'Just now',
      isRead: false
    });
    this.notify();
    return newT;
  }

  public hireAgentTalent(talentId: string, offerDetails: string) {
    this.agentTalents = this.agentTalents.map(t => t.id === talentId ? { ...t, status: 'interviewing' } : t);
    setStored('dealfast_agent_talents', this.agentTalents);
    this.addNotification({
      userId: this.currentUser.id,
      title: '💼 Agent Hiring Offer Sent!',
      message: `Job/partnership offer sent to candidate. Details: "${offerDetails}".`,
      type: 'commission',
      timestamp: 'Just now',
      isRead: false
    });
    this.notify();
  }

  public clearAllNotifications() {
    this.notifications = [];
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  // ==========================================
  // WALLET & BALANCE SYSTEM METHODS
  // ==========================================
  public getUserWallet(userId?: string): UserWallet {
    const uid = userId || this.currentUser.id;
    if (!uid || this.currentUser.role === 'guest' || uid === 'guest' || uid === 'user-guest') {
      return {
        userId: 'user-guest',
        availableBalance: 0,
        lockedStake: 0,
        totalEarned: 0,
        totalSpent: 0,
        transactions: []
      };
    }
    if (!this.wallets[uid]) {
      this.wallets[uid] = {
        userId: uid,
        availableBalance: 0, // Real balance starts at PKR 0 for new accounts
        lockedStake: 0,
        totalEarned: 0,
        totalSpent: 0,
        transactions: []
      };
      setStored('dealfast_wallets', this.wallets);
    }
    return this.wallets[uid];
  }

  public topupWallet(amount: number, method: PaymentGateway, refId: string): UserWallet {
    if (this.currentUser.role === 'guest' || this.currentUser.id === 'user-guest') {
      throw new Error('Authentication required. Guest visitors cannot top up wallets.');
    }
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount) || amount <= 0 || amount > 10000000) {
      throw new Error('Invalid deposit amount. Amount must be a positive number up to PKR 10,000,000.');
    }

    const uid = this.currentUser.id;
    const wallet = this.getUserWallet(uid);
    const cleanRef = (refId || '').replace(/[<>"'/]/g, '').trim();
    const tx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      userId: uid,
      type: 'topup',
      amount,
      status: 'completed',
      paymentMethod: method,
      referenceId: cleanRef || `TOPUP-${Math.floor(100000 + Math.random() * 900000)}`,
      description: `Wallet Top-Up via ${method.toUpperCase()} (RapidGateway)`,
      createdAt: new Date().toLocaleString()
    };

    wallet.availableBalance += amount;
    wallet.transactions = [tx, ...wallet.transactions];
    this.wallets[uid] = wallet;
    setStored('dealfast_wallets', this.wallets);

    this.addNotification({
      userId: uid,
      title: '💳 Wallet Deposit Successful',
      message: `PKR ${amount.toLocaleString()} added to your DealFast Escrow Wallet via RapidGateway (${method.toUpperCase()}).`,
      type: 'system',
      timestamp: 'Just now',
      isRead: false
    });

    this.notify();
    return wallet;
  }

  public withdrawWallet(amount: number, method: PaymentGateway, accountDetails: string): boolean {
    if (this.currentUser.role === 'guest' || this.currentUser.id === 'user-guest') {
      return false;
    }
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount) || amount <= 0) {
      return false;
    }

    const uid = this.currentUser.id;
    const wallet = this.getUserWallet(uid);
    if (wallet.availableBalance < amount) {
      return false;
    }

    const cleanDetails = (accountDetails || '').replace(/[<>"'/]/g, '').trim();

    wallet.availableBalance -= amount;
    const tx: WalletTransaction = {
      id: `tx-w-${Date.now()}`,
      userId: uid,
      type: 'withdrawal',
      amount,
      status: 'completed',
      paymentMethod: method,
      referenceId: `WD-${Math.floor(100000 + Math.random() * 900000)}`,
      description: `Withdrawal request to ${method.toUpperCase()} (${cleanDetails})`,
      createdAt: new Date().toLocaleString()
    };

    wallet.transactions = [tx, ...wallet.transactions];
    this.wallets[uid] = wallet;
    setStored('dealfast_wallets', this.wallets);

    this.addNotification({
      userId: uid,
      title: '💸 Withdrawal Processed',
      message: `PKR ${amount.toLocaleString()} withdrawn to ${method.toUpperCase()} (${cleanDetails}).`,
      type: 'system',
      timestamp: 'Just now',
      isRead: false
    });

    this.notify();
    return true;
  }

  // ==========================================
  // PROTECTED HIRING & JOB BOUNTY METHODS
  // ==========================================
  public postJobWithBounty(data: {
    title: string;
    propertyTitle: string;
    society: string;
    city: string;
    propertyType: string;
    bountyAmount: number; // 3,000 - 15,000
    maxAgents: number; // 1 to 3
    coAgentSplits?: number[];
    description: string;
  }): JobPost | { error: string } {
    if (this.currentUser.role === 'guest' || this.currentUser.id === 'user-guest') {
      return { error: 'Authentication required. Guests cannot post jobs or lock escrow bounty.' };
    }

    if (this.currentUser.role === 'agent') {
      return { error: 'Ground Reality Restriction: Field Agents cannot post job bounties. Bounties are posted by Agencies, Builders, or Property Owners seeking sales agents.' };
    }

    const uid = this.currentUser.id;
    const wallet = this.getUserWallet(uid);

    // Calculate FBR tax breakdown
    const bounty = Number(data.bountyAmount);
    if (isNaN(bounty) || bounty <= 0 || bounty > 1000000) {
      return { error: 'Invalid bounty amount specified.' };
    }

    const whtAmount = Math.round(bounty * 0.02); // 2% WHT
    const gstAmount = Math.round(bounty * 0.034); // ~17% GST on platform service fee
    const totalRequired = bounty + whtAmount + gstAmount;

    if (wallet.availableBalance < totalRequired) {
      return { error: `Insufficient wallet balance. Required: PKR ${totalRequired.toLocaleString()} (Bounty + FBR Taxes). Current Balance: PKR ${wallet.availableBalance.toLocaleString()}` };
    }

    // Debit Agency Balance
    wallet.availableBalance -= totalRequired;
    wallet.totalSpent += totalRequired;
    const tx: WalletTransaction = {
      id: `tx-job-${Date.now()}`,
      userId: uid,
      type: 'bounty_debit',
      amount: totalRequired,
      status: 'completed',
      paymentMethod: 'bank_transfer',
      referenceId: `ESCROW-JOB-${Date.now()}`,
      description: `Upfront Bounty Escrow Lock for "${data.title}" (PKR ${bounty.toLocaleString()} + PKR ${whtAmount + gstAmount} FBR Tax)`,
      createdAt: new Date().toLocaleString()
    };
    wallet.transactions = [tx, ...wallet.transactions];
    this.wallets[uid] = wallet;
    setStored('dealfast_wallets', this.wallets);

    const splits = data.coAgentSplits || (data.maxAgents === 2 ? [60, 40] : data.maxAgents === 3 ? [50, 30, 20] : [100]);

    const newJob: JobPost = {
      id: `job-${Date.now()}`,
      agencyId: this.currentUser.agencyId || uid,
      agencyName: this.currentUser.companyName || this.currentUser.name,
      agencyLogo: this.currentUser.avatar,
      title: data.title,
      propertyTitle: data.propertyTitle,
      society: data.society,
      city: data.city,
      propertyType: data.propertyType,
      bountyAmount: bounty,
      maxAgents: data.maxAgents,
      coAgentSplits: splits,
      description: data.description,
      status: 'open',
      requiredStakePerAgent: bounty < 3000 ? 0 : Math.round(bounty * 0.5), // base required stake
      taxDetails: {
        bounty,
        whtAmount,
        gstAmount,
        totalPaidByAgency: totalRequired
      },
      hiredAgentIds: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.jobPosts = [newJob, ...this.jobPosts];
    setStored('dealfast_job_posts', this.jobPosts);

    // Auto generate Tax Invoice
    const inv: Invoice = {
      id: `inv-bounty-${Date.now()}`,
      invoiceNumber: `FBR-INV-${Math.floor(100000 + Math.random() * 900000)}`,
      bookingId: newJob.id,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      customerName: newJob.agencyName,
      customerEmail: this.currentUser.email,
      propertyTitle: `Job Bounty: ${newJob.title}`,
      amount: bounty,
      platformFee: gstAmount,
      commission: whtAmount,
      status: 'paid',
      paymentMethod: 'DealFast Pre-Funded Escrow'
    };
    this.invoices = [inv, ...this.invoices];
    setStored(STORAGE_KEYS.INVOICES, this.invoices);

    this.addNotification({
      userId: uid,
      title: '🎯 Protected Job Posted Successfully',
      message: `Job "${newJob.title}" posted with PKR ${bounty.toLocaleString()} Bounty held safely in DealFast Escrow.`,
      type: 'system',
      timestamp: 'Just now',
      isRead: false
    });

    this.notify();
    return newJob;
  }

  public applyAndStakeJob(jobId: string): { success: boolean; message: string } {
    if (this.currentUser.role === 'guest' || this.currentUser.id === 'user-guest') {
      return { success: false, message: 'Authentication required. Guests must sign in before applying for agency job mandates.' };
    }

    const job = this.jobPosts.find(j => j.id === jobId);
    if (!job) return { success: false, message: 'Job post not found.' };

    const uid = this.currentUser.id;

    // Check if already applied
    if (job.hiredAgentIds.includes(uid)) {
      return { success: true, message: 'You have already applied for this agency mandate! Office meeting scheduled.' };
    }

    // Add agent to hired/applied list for job
    job.hiredAgentIds.push(uid);
    if (job.hiredAgentIds.length >= job.maxAgents) {
      job.status = 'in_progress';
    }
    setStored('dealfast_job_posts', this.jobPosts);

    // Create or attach to Deal Room for office meeting & execution
    let dealRoom = this.dealRooms.find(d => d.jobId === jobId);
    const newAgentDetail = {
      agentId: uid,
      agentName: this.currentUser.name,
      agentAvatar: this.currentUser.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      stakeLocked: 0,
      splitPercentage: 100,
      bountyShare: job.bountyAmount,
      agreedAgreement: true
    };

    if (!dealRoom) {
      dealRoom = {
        id: `dealroom-${Date.now()}`,
        jobId: job.id,
        jobTitle: job.title,
        agencyId: job.agencyId,
        agencyName: job.agencyName,
        agents: [newAgentDetail],
        totalBountyAmount: job.bountyAmount,
        status: 'active',
        currentMilestoneIndex: 0,
        milestones: [
          {
            id: `ms-1`,
            name: 'Office Meeting & Contract Sign',
            percentage: 25,
            bountyAmount: Math.round(job.bountyAmount * 0.25),
            proofRequired: 'Office Visit Confirmation / Agreement Photo',
            status: 'pending'
          },
          {
            id: `ms-2`,
            name: 'Site Visit Completed',
            percentage: 50,
            bountyAmount: Math.round(job.bountyAmount * 0.50),
            proofRequired: 'Property Site Visit Photo & Location Pin',
            status: 'pending'
          },
          {
            id: `ms-3`,
            name: 'Client Closing & Deal Execution',
            percentage: 100,
            bountyAmount: job.bountyAmount,
            proofRequired: 'Signed Deal Closing Copy',
            status: 'pending'
          }
        ],
        createdAt: new Date().toISOString().split('T')[0],
        slaViolationCount: 0
      };
      this.dealRooms = [dealRoom, ...this.dealRooms];
    } else {
      dealRoom.agents.push(newAgentDetail);
    }

    setStored('dealfast_deal_rooms', this.dealRooms);

    this.addNotification({
      userId: uid,
      title: 'Agency Mandate Application Submitted!',
      message: `Your application for "${job.title}" was received. Agency will contact you to schedule an in-person office meeting and site visit.`,
      type: 'system',
      isRead: false,
      timestamp: 'Just now'
    });

    this.notify();
    return {
      success: true,
      message: `Application submitted successfully for "${job.title}"! No deposit required. Agency office meeting & site visit will be scheduled.`
    };
  }

  public submitMilestoneProof(dealRoomId: string, milestoneId: string, proof: {
    proofUrl: string;
    locationPin?: string;
    notes?: string;
  }): boolean {
    const dealRoom = this.dealRooms.find(d => d.id === dealRoomId);
    if (!dealRoom) return false;

    const ms = dealRoom.milestones.find(m => m.id === milestoneId);
    if (!ms) return false;

    ms.status = 'submitted';
    ms.proof = {
      proofRequired: ms.proofRequired,
      proofUrl: proof.proofUrl,
      locationPin: proof.locationPin,
      notes: proof.notes,
      submittedAt: new Date().toLocaleString(),
      agencyApproved: false,
      autoAcceptedAt: new Date(Date.now() + 24 * 3600 * 1000).toLocaleString() // 24 Hours Auto Accept SLA
    };

    dealRoom.lastProgressUpdate = new Date().toLocaleString();
    setStored('dealfast_deal_rooms', this.dealRooms);

    // Notify Agency
    this.addNotification({
      userId: dealRoom.agencyId,
      title: '📋 Proof Submitted for Verification',
      message: `Agent submitted proof for "${ms.name}". Please review within 24 hours to prevent auto-approval.`,
      type: 'system',
      timestamp: 'Just now',
      isRead: false
    });

    this.notify();
    return true;
  }

  public reviewMilestoneProof(dealRoomId: string, milestoneId: string, approved: boolean, notes?: string): boolean {
    const dealRoom = this.dealRooms.find(d => d.id === dealRoomId);
    if (!dealRoom) return false;

    const msIndex = dealRoom.milestones.findIndex(m => m.id === milestoneId);
    if (msIndex === -1) return false;
    const ms = dealRoom.milestones[msIndex];

    if (approved) {
      ms.status = 'approved';
      if (ms.proof) {
        ms.proof.agencyApproved = true;
        ms.proof.reviewedAt = new Date().toLocaleString();
      }
      if (msIndex < dealRoom.milestones.length - 1) {
        dealRoom.currentMilestoneIndex = msIndex + 1;
      } else {
        // Final milestone approved! Auto close deal & release full bounty + return stake!
        this.closeDealAndReleaseBounty(dealRoomId);
        return true;
      }
    } else {
      ms.status = 'rejected';
      if (ms.proof) {
        ms.proof.agencyApproved = false;
        ms.proof.notes = notes || 'Rejected by agency';
      }
    }

    setStored('dealfast_deal_rooms', this.dealRooms);

    // Notify agents
    dealRoom.agents.forEach(a => {
      this.addNotification({
        userId: a.agentId,
        title: approved ? '✅ Milestone Approved' : '❌ Milestone Rejected',
        message: approved
          ? `Milestone "${ms.name}" approved by agency!`
          : `Milestone "${ms.name}" rejected. Reason: ${notes || 'Proof incomplete'}.`,
        type: 'commission',
        timestamp: 'Just now',
        isRead: false
      });
    });

    this.notify();
    return true;
  }

  public closeDealAndReleaseBounty(dealRoomId: string) {
    const dealRoom = this.dealRooms.find(d => d.id === dealRoomId);
    if (!dealRoom) return;

    dealRoom.status = 'completed';

    // Credit Agent Bounty + Return Locked Stake
    dealRoom.agents.forEach(ag => {
      const wallet = this.getUserWallet(ag.agentId);

      // Unlock Stake
      if (ag.stakeLocked > 0) {
        wallet.lockedStake = Math.max(0, wallet.lockedStake - ag.stakeLocked);
        wallet.availableBalance += ag.stakeLocked;
      }

      // Credit Bounty Share
      wallet.availableBalance += ag.bountyShare;
      wallet.totalEarned += ag.bountyShare;

      const tx: WalletTransaction = {
        id: `tx-rel-${Date.now()}`,
        userId: ag.agentId,
        type: 'bounty_earned',
        amount: ag.bountyShare + ag.stakeLocked,
        status: 'completed',
        paymentMethod: 'bank_transfer',
        referenceId: `RELEASE-${dealRoom.id}`,
        description: `Bounty Earned (PKR ${ag.bountyShare.toLocaleString()}) + Stake Deposit Unlocked (PKR ${ag.stakeLocked.toLocaleString()}) for "${dealRoom.jobTitle}"`,
        createdAt: new Date().toLocaleString()
      };

      wallet.transactions = [tx, ...wallet.transactions];
      this.wallets[ag.agentId] = wallet;

      this.addNotification({
        userId: ag.agentId,
        title: '🎉 DEAL CLOSED! BOUNTY RELEASED',
        message: `Congratulations! PKR ${ag.bountyShare.toLocaleString()} Bounty + PKR ${ag.stakeLocked.toLocaleString()} Stake Deposit returned to your wallet!`,
        type: 'commission',
        timestamp: 'Just now',
        isRead: false
      });
    });

    // Update Job post
    const job = this.jobPosts.find(j => j.id === dealRoom.jobId);
    if (job) job.status = 'completed';

    setStored('dealfast_wallets', this.wallets);
    setStored('dealfast_deal_rooms', this.dealRooms);
    setStored('dealfast_job_posts', this.jobPosts);

    this.notify();
  }

  public raiseDispute(dealRoomId: string, reason: string, evidenceUrls: string[]) {
    const dealRoom = this.dealRooms.find(d => d.id === dealRoomId);
    if (!dealRoom) return;

    dealRoom.status = 'disputed';
    dealRoom.dispute = {
      id: `disp-${Date.now()}`,
      raisedBy: this.currentUser.role,
      raisedByName: this.currentUser.name,
      reason,
      evidenceUrls,
      status: 'open'
    };

    setStored('dealfast_deal_rooms', this.dealRooms);

    this.addNotification({
      userId: this.currentUser.id,
      title: '⚖️ Dispute Ticket Submitted',
      message: `Dispute ticket opened for "${dealRoom.jobTitle}". Submitted to 3-Member Independent Panel (Agency Rep + Top Agent + DealFast Admin).`,
      type: 'system',
      timestamp: 'Just now',
      isRead: false
    });

    this.notify();
  }

  public addStaffUser(staffData: Omit<StaffUser, 'id' | 'createdAt'>): StaffUser {
    if (this.currentUser.role !== 'admin') {
      throw new Error('Security Error: Only Admin can add staff users.');
    }
    const newStaff: StaffUser = {
      ...staffData,
      id: `staff-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.staffUsers = [newStaff, ...this.staffUsers];
    setStored('dealfast_staff_users', this.staffUsers);
    this.notify();
    return newStaff;
  }

  public updateStaffPermissions(staffId: string, permissions: StaffPermissions): void {
    if (this.currentUser.role !== 'admin') {
      console.warn('Security Alert: Only Admin can update staff permissions.');
      return;
    }
    const staff = this.staffUsers.find(s => s.id === staffId);
    if (staff) {
      staff.permissions = permissions;
      setStored('dealfast_staff_users', this.staffUsers);
      this.notify();
    }
  }

  public deleteStaffUser(staffId: string): void {
    if (this.currentUser.role !== 'admin') {
      console.warn('Security Alert: Only Admin can delete staff users.');
      return;
    }
    this.staffUsers = this.staffUsers.filter(s => s.id !== staffId);
    setStored('dealfast_staff_users', this.staffUsers);
    this.notify();
  }

  public authenticateStaff(username: string, password?: string, pin?: string): StaffUser | null {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPin = (pin || '').trim();
    const cleanPassword = (password || '').trim();

    const found = this.staffUsers.find(s => {
      const matchUser = s.username.toLowerCase() === cleanUsername;
      const matchPin = s.pin === cleanPin || (s.pinHash ? bcrypt.compareSync(cleanPin, s.pinHash) : false);
      const matchPass = !s.password || s.password === cleanPassword || (s.passwordHash ? bcrypt.compareSync(cleanPassword, s.passwordHash) : false);
      return matchUser && matchPin && matchPass;
    });
    return found || null;
  }

  public requestStaffLoginAccess(staff: StaffUser): StaffLoginRequest {
    const existing = this.staffLoginRequests.find(r => r.staffId === staff.id && r.status === 'pending');
    if (existing) return existing;

    const newReq: StaffLoginRequest = {
      id: `req-${Date.now()}`,
      staffId: staff.id,
      staffName: staff.name,
      username: staff.username,
      roleTitle: staff.roleTitle,
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending'
    };

    staff.approvalStatus = 'pending';
    this.staffLoginRequests = [newReq, ...this.staffLoginRequests];
    setStored('dealfast_staff_login_reqs', this.staffLoginRequests);
    setStored('dealfast_staff_users', this.staffUsers);
    this.notify();
    return newReq;
  }

  public approveStaffLoginAccess(requestId: string): void {
    if (this.currentUser.role !== 'admin') {
      console.warn('Security Alert: Only Admin can approve staff login access.');
      return;
    }
    const req = this.staffLoginRequests.find(r => r.id === requestId);
    if (req) {
      req.status = 'approved';
      const staff = this.staffUsers.find(s => s.id === req.staffId);
      if (staff) {
        staff.isSessionApproved = true;
        staff.approvalStatus = 'approved';
      }
      setStored('dealfast_staff_login_reqs', this.staffLoginRequests);
      setStored('dealfast_staff_users', this.staffUsers);
      this.notify();
    }
  }

  public rejectStaffLoginAccess(requestId: string): void {
    if (this.currentUser.role !== 'admin') {
      console.warn('Security Alert: Only Admin can reject staff login access.');
      return;
    }
    const req = this.staffLoginRequests.find(r => r.id === requestId);
    if (req) {
      req.status = 'rejected';
      const staff = this.staffUsers.find(s => s.id === req.staffId);
      if (staff) {
        staff.isSessionApproved = false;
        staff.approvalStatus = 'rejected';
      }
      setStored('dealfast_staff_login_reqs', this.staffLoginRequests);
      setStored('dealfast_staff_users', this.staffUsers);
      this.notify();
    }
  }

  public addBlogArticle(article: BlogArticle): void {
    this.blogs = [article, ...this.blogs];
    setStored('dealfast_blogs', this.blogs);
    this.notify();
  }

  public deleteBlogArticle(articleId: string): void {
    this.blogs = this.blogs.filter(b => b.id !== articleId);
    setStored('dealfast_blogs', this.blogs);
    this.notify();
  }

  public saveAutoBlogConfig(config: AutoBlogConfig): void {
    this.autoBlogConfig = config;
    setStored('dealfast_autoblog_config', config);
    this.notify();
  }

  public saveEmailConfig(config: Partial<EmailConfig>): void {
    this.emailConfig = { ...this.emailConfig, ...config };
    setStored('dealfast_email_config', this.emailConfig);
    this.notify();
  }

  public saveBankDetails(details: Partial<BankDetails>): void {
    this.bankDetails = { ...this.bankDetails, ...details };
    setStored('dealfast_bank_details', this.bankDetails);
    this.notify();
  }

  public updateStealthAdminPath(newPath: string): void {
    if (this.currentUser.role !== 'admin') {
      console.warn('Security Alert: Only Super Admin can change stealth endpoint path.');
      return;
    }
    const clean = newPath.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (!clean || clean.length < 8) {
      throw new Error('Security Mandate: Secret Admin Endpoint Path must be at least 8 alphanumeric characters.');
    }
    this.stealthAdminPath = clean;
    setStored('dealfast_stealth_admin_path', clean);
    this.logSecurityEvent(`Stealth Admin URL Path updated to /#${clean}`, this.currentUser.name, 'alert');
    this.notify();
  }

  public updateTotpSecret(newSecret: string, enabled: boolean = true): void {
    if (this.currentUser.role !== 'admin') {
      console.warn('Security Alert: Only Super Admin can update 2FA secret.');
      return;
    }
    this.totpSecret = newSecret;
    this.isTotpEnabled = enabled;
    setStored('dealfast_totp_secret', newSecret);
    setStored('dealfast_totp_enabled', enabled);
    this.logSecurityEvent(`Salesforce / Google Authenticator 2FA key updated (${enabled ? 'Enabled' : 'Disabled'})`, this.currentUser.name, 'success');
    this.notify();
  }

  public logSecurityEvent(event: string, user: string, status: 'success' | 'blocked' | 'alert' | 'failed', ip: string = '182.180.12.98 (Islamabad, PK)'): void {
    const newLog = {
      id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      event,
      user,
      status,
      ip,
      device: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser') : 'Secure Workstation'
    };
    this.securityAuditLogs = [newLog, ...this.securityAuditLogs.slice(0, 99)];
    setStored('dealfast_sec_audit_logs', this.securityAuditLogs);
    this.notify();
  }

  public logFinancialEvent(txType: 'wallet_deposit' | 'escrow_lock' | 'escrow_release' | 'escrow_refund' | 'payout', amountPKR: number, sender: string, recipient: string, referenceNo: string, gateway: string, status: 'completed' | 'pending' | 'flagged' = 'completed'): void {
    const newFinLog = {
      id: `tx-fin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      txType,
      amountPKR,
      sender,
      recipient,
      referenceNo,
      gateway,
      status
    };
    this.financialAuditLogs = [newFinLog, ...this.financialAuditLogs.slice(0, 199)];
    setStored('dealfast_financial_audit_logs', this.financialAuditLogs);
    this.notify();
  }
}

export const store = AppStore.getInstance();

