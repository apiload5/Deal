import {
  Property,
  Agency,
  Builder,
  Project,
  Agent,
  BlogArticle,
  User,
  Booking,
  Invoice,
  KYCRecord,
  AppNotification,
  ChatRoom,
  ChatMessage
} from '../types';

export const PAKISTAN_CITIES = [
  'All Cities',
  'Islamabad',
  'Lahore',
  'Karachi',
  'Rawalpindi',
  'Peshawar',
  'Faisalabad',
  'Multan',
  'Quetta',
  'Gujranwala',
  'Sialkot'
];

export const CITY_AREAS: Record<string, string[]> = {
  Islamabad: ['F-6', 'F-7', 'F-8', 'F-10', 'E-11', 'G-13', 'DHA Phase 2', 'Bahria Town Phase 8', 'B-17', 'Gulberg Greens'],
  Lahore: ['DHA Phase 5', 'DHA Phase 6', 'Gulberg III', 'Bahria Town', 'Johar Town', 'Model Town', 'Askari 11', 'Lake City'],
  Karachi: ['Clifton Block 5', 'DHA Phase 8', 'DHA Phase 6', 'Gulshan-e-Iqbal', 'PECHS Block 6', 'Bahria Town Karachi', 'North Nazimabad'],
  Rawalpindi: ['Bahria Town Phase 4', 'Saddar', 'Chaklala Scheme 3', 'Gulraiz', 'Adiala Road'],
  Peshawar: ['Hayatabad Phase 3', 'University Town', 'Regi Model Town'],
  Faisalabad: ['Canal Express', 'Civil Lines', 'People\'s Colony'],
  Multan: ['DHA Multan', 'Royal Orchard', 'Gulgasht Colony'],
  Quetta: ['Chiltan Housing', 'Airport Road', 'Jinnah Town']
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Deal.pk Admin',
    email: 'admin@deal.pk',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    phone: '+92 300 1234567',
    city: 'Islamabad',
    kycStatus: 'verified',
    createdAt: '2025-01-01'
  },
  {
    id: 'user-guest',
    name: 'Guest Visitor',
    email: 'guest@deal.pk',
    role: 'guest',
    kycStatus: 'none',
    createdAt: '2026-01-01'
  },
  {
    id: 'user-basic',
    name: 'Usman Chaudhry',
    email: 'usman@gmail.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    phone: '+92 321 8889900',
    city: 'Lahore',
    address: 'DHA Phase 5, Lahore',
    kycStatus: 'none',
    createdAt: '2026-02-10'
  },
  {
    id: 'user-agent-1',
    name: 'Tariq Malik',
    email: 'tariq.malik@zameenpro.pk',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    phone: '+92 333 4445566',
    city: 'Islamabad',
    companyName: 'Estate Masters Pvt',
    agencyId: 'agency-1',
    kycStatus: 'verified',
    createdAt: '2025-06-15'
  },
  {
    id: 'user-agency-1',
    name: 'Premier Estate Group',
    email: 'contact@premierestate.pk',
    role: 'agency',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    phone: '+92 51 111222333',
    city: 'Islamabad',
    companyName: 'Premier Estate Group',
    agencyId: 'agency-1',
    kycStatus: 'verified',
    createdAt: '2025-03-20'
  },
  {
    id: 'user-builder-1',
    name: 'Giga Developers',
    email: 'info@gigadevelopers.pk',
    role: 'builder',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    phone: '+92 51 8887766',
    city: 'Islamabad',
    companyName: 'Giga Group International',
    kycStatus: 'verified',
    createdAt: '2025-01-10'
  }
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'Luxury 1 Kanal Modern Designer Villa in DHA Phase 6',
    slug: 'luxury-1-kanal-modern-villa-dha-phase-6-lahore',
    description: 'Ultra-luxurious custom-built 1 Kanal modern smart villa featuring Spanish tile flooring, imported German kitchen fittings, double height lobby, swimming pool, basement cinema, and imported sanitary ware. Prime corner location near main boulevard.',
    type: 'villa',
    purpose: 'sale',
    status: 'approved',
    price: 125000000,
    priceFormatted: 'PKR 12.5 Crore',
    city: 'Lahore',
    area: 'DHA Phase 6',
    address: 'Block MB, DHA Phase 6, Lahore',
    beds: 5,
    baths: 6,
    sqft: 4500,
    furnished: 'furnished',
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200'
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    virtualTourUrl: 'https://my.matterport.com/show/?m=sample',
    isPremium: true,
    isFeatured: true,
    views: 1420,
    createdAt: '2026-07-01',
    userId: 'user-agency-1',
    userRole: 'agency',
    ownerName: 'Premier Estate Group',
    ownerPhone: '+92 321 5551234',
    agencyName: 'Premier Estate Group',
    lat: 31.472,
    lng: 74.412,
    features: ['Solar Panel System', 'Swimming Pool', 'Home Theater', 'Basement', 'Corner Plot', 'Servant Quarter', 'Lawn']
  },
  {
    id: 'prop-2',
    title: '3 Bed High-Rise Sea Facing Penthouse in Clifton Block 5',
    slug: '3-bed-sea-facing-penthouse-clifton-karachi',
    description: 'Breathtaking panoramic views of the Arabian Sea from this 28th-floor penthouse. Comes with high-speed private elevators, round-the-clock security, designated underground parking, rooftop infinity pool, and concierge service.',
    type: 'penthouse',
    purpose: 'sale',
    status: 'approved',
    price: 85000000,
    priceFormatted: 'PKR 8.5 Crore',
    city: 'Karachi',
    area: 'Clifton Block 5',
    address: 'Seaview Heights, Clifton Block 5, Karachi',
    beds: 3,
    baths: 4,
    sqft: 3200,
    furnished: 'furnished',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200'
    ],
    isPremium: true,
    isFeatured: true,
    views: 980,
    createdAt: '2026-07-10',
    userId: 'user-agent-1',
    userRole: 'agent',
    ownerName: 'Tariq Malik',
    ownerPhone: '+92 333 4445566',
    agencyName: 'Estate Masters Pvt',
    lat: 24.813,
    lng: 67.032,
    features: ['Sea View', 'Infinity Pool', 'Gymnasium', 'Backup Generator', 'Valet Parking', '24/7 Security']
  },
  {
    id: 'prop-3',
    title: 'E-11/2 Full House 10 Marla for Rent - Ideal for Corporate Office or Family',
    slug: 'e-11-2-full-house-10-marla-rent-islamabad',
    description: 'Spacious double storey house in central E-11/2 Islamabad. Close to Margalla hills view, commercial market, schools, and hospitals. Equipped with dual electricity meters, gas connection, and bore water system.',
    type: 'house',
    purpose: 'rent',
    status: 'approved',
    price: 250000,
    priceFormatted: 'PKR 2.5 Lac / month',
    city: 'Islamabad',
    area: 'E-11',
    address: 'Street 14, Sector E-11/2, Islamabad',
    beds: 4,
    baths: 5,
    sqft: 2700,
    furnished: 'semi-furnished',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200'
    ],
    isPremium: false,
    isFeatured: true,
    views: 650,
    createdAt: '2026-07-15',
    userId: 'user-agent-1',
    userRole: 'agent',
    ownerName: 'Tariq Malik',
    ownerPhone: '+92 333 4445566',
    lat: 33.702,
    lng: 72.981,
    features: ['Bore Water', 'Margalla View', 'Car Porch', 'Separate Servant Room', 'Sui Gas Installed']
  },
  {
    id: 'prop-4',
    title: '1 Kanal Prime Commercial Plot on Main Boulevard Gulberg Greens',
    slug: '1-kanal-commercial-plot-main-boulevard-gulberg-greens-islamabad',
    description: 'Direct owner plot on 220ft wide main boulevard Gulberg Greens Islamabad. Approved height for 12 storeys plaza. Unbeatable investment for corporate headquarters or shopping mall.',
    type: 'commercial',
    purpose: 'sale',
    status: 'approved',
    price: 180000000,
    priceFormatted: 'PKR 18.0 Crore',
    city: 'Islamabad',
    area: 'Gulberg Greens',
    address: 'Main Boulevard A-Executive, Gulberg Greens, Islamabad',
    beds: 0,
    baths: 0,
    sqft: 4500,
    furnished: 'unfurnished',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?auto=format&fit=crop&q=80&w=1200'
    ],
    isPremium: true,
    isFeatured: false,
    views: 1120,
    createdAt: '2026-07-05',
    userId: 'user-agency-1',
    userRole: 'agency',
    ownerName: 'Premier Estate Group',
    ownerPhone: '+92 51 111222333',
    lat: 33.601,
    lng: 73.120,
    features: ['Main Boulevard', 'Approved Commercial NOC', 'Direct Transfer', 'Corner Location']
  },
  {
    id: 'prop-5',
    title: '2 Bedroom Luxury Apartment in Bahria Town Karachi - Tower 3',
    slug: '2-bed-apartment-bahria-town-karachi-tower-3',
    description: 'Ready to move in luxury apartment in Bahria Heights Tower 3. Includes fitted cabinets, split air conditioners, marble flooring, and uninterrupted power backup system.',
    type: 'apartment',
    purpose: 'sale',
    status: 'approved',
    price: 14500000,
    priceFormatted: 'PKR 1.45 Crore',
    city: 'Karachi',
    area: 'Bahria Town Karachi',
    address: 'Precinct 19, Bahria Heights, Karachi',
    beds: 2,
    baths: 2,
    sqft: 1150,
    furnished: 'semi-furnished',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&q=80&w=1200'
    ],
    isPremium: false,
    isFeatured: false,
    views: 430,
    createdAt: '2026-07-18',
    userId: 'user-basic',
    userRole: 'user',
    ownerName: 'Usman Chaudhry',
    ownerPhone: '+92 321 8889900',
    lat: 25.011,
    lng: 67.310,
    features: ['Elevator Access', 'Standby Generator', 'CCTV Security', 'Park Facing']
  },
  {
    id: 'prop-6',
    title: '10 Marla Brand New Modern House in DHA Phase 2 Islamabad',
    slug: '10-marla-brand-new-house-dha-phase-2-islamabad',
    description: 'Architect-designed brand new double-storey house featuring 5 master bedrooms, imported jacuzzi, double kitchen, servant quarter, and car porch for 3 vehicles.',
    type: 'house',
    purpose: 'sale',
    status: 'approved',
    price: 52000000,
    priceFormatted: 'PKR 5.2 Crore',
    city: 'Islamabad',
    area: 'DHA Phase 2',
    address: 'Sector E, DHA Phase 2, Islamabad',
    beds: 5,
    baths: 6,
    sqft: 2500,
    furnished: 'unfurnished',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200'
    ],
    isPremium: true,
    isFeatured: true,
    views: 1890,
    createdAt: '2026-07-12',
    userId: 'user-agent-1',
    userRole: 'agent',
    ownerName: 'Tariq Malik',
    ownerPhone: '+92 333 4445566',
    agencyName: 'Estate Masters Pvt',
    lat: 33.533,
    lng: 73.155,
    features: ['Jacuzzi Bath', 'Solid Ash Wood Doors', 'Underground Utilities', 'Gated Community']
  }
];

export const INITIAL_AGENCIES: Agency[] = [
  {
    id: 'agency-1',
    name: 'Premier Estate Group',
    logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
    description: 'Islamabad\'s top-rated real estate advisory firm specializing in luxury residential properties, commercial plots, and high-return investment portfolios in DHA, Bahria, and CDA sectors.',
    city: 'Islamabad',
    address: 'Plaza 42, Main Boulevard, F-6 Markaz, Islamabad',
    phone: '+92 51 111222333',
    email: 'info@premierestate.pk',
    verified: true,
    totalProperties: 124,
    activeAgents: 18,
    rating: 4.9,
    reviewCount: 142,
    socialLinks: {
      facebook: 'https://facebook.com/premierestatepk',
      whatsapp: 'https://wa.me/923001234567',
      website: 'https://premierestate.pk'
    }
  },
  {
    id: 'agency-2',
    name: 'Lahore Realtors & Associates',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
    description: 'DHA Lahore certified real estate agency with over 15 years of excellence in property buying, selling, and rental management.',
    city: 'Lahore',
    address: '15-CCA, DHA Phase 5, Lahore',
    phone: '+92 42 35748890',
    email: 'contact@lahorerealtors.pk',
    verified: true,
    totalProperties: 88,
    activeAgents: 12,
    rating: 4.8,
    reviewCount: 96
  },
  {
    id: 'agency-3',
    name: 'Karachi Prime Properties',
    logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
    description: 'Premier agency handling high-end Clifton and DHA Karachi seaside residential properties and corporate commercial leases.',
    city: 'Karachi',
    address: 'Suite 302, Ocean Tower, Clifton Block 9, Karachi',
    phone: '+92 21 35870099',
    email: 'hello@karachiprime.pk',
    verified: true,
    totalProperties: 65,
    activeAgents: 9,
    rating: 4.7,
    reviewCount: 78
  }
];

export const INITIAL_BUILDERS: Builder[] = [
  {
    id: 'builder-1',
    name: 'Giga Developers International',
    logo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=1200',
    description: 'Pioneers of iconic vertical landmarks in Pakistan. Builders of Giga Mall Extension, World Trade Center Islamabad, and Goldcrest Highlife.',
    city: 'Islamabad',
    address: 'Giga WTC, DHA Phase 2, Islamabad',
    phone: '+92 51 8887766',
    email: 'info@gigadevelopers.pk',
    verified: true,
    totalProjects: 14,
    ongoingProjects: 5,
    rating: 4.9,
    reviewCount: 230
  },
  {
    id: 'builder-2',
    name: 'Urban City Developers',
    logo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1200',
    description: 'Creating smart eco-sustainable urban townships and master-planned gated communities in Lahore and Rawalpindi.',
    city: 'Lahore',
    address: 'Urban Heights, Main Boulevard Gulberg, Lahore',
    phone: '+92 42 111000999',
    email: 'sales@urbancity.pk',
    verified: true,
    totalProjects: 8,
    ongoingProjects: 3,
    rating: 4.6,
    reviewCount: 115
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Goldcrest Highlife - Luxury Apartments & Mall',
    builderId: 'builder-1',
    builderName: 'Giga Developers International',
    builderLogo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    city: 'Islamabad',
    area: 'DHA Phase 2',
    startingPrice: 12000000,
    startingPriceFormatted: 'PKR 1.2 Crore',
    type: 'Luxury Apartments & Commercial Outlets',
    status: 'under_construction',
    completionDate: 'December 2027',
    description: 'A 32-storey state-of-the-art residential and commercial skyscraper with world-class amenities including infinity pool, sky deck, 5-star hotel apartments, and high-end shopping arcade.',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200'
    ],
    paymentPlan: {
      downPayment: '15% Down Payment',
      installments: '36 Monthly Installments',
      possession: '15% on Possession'
    },
    totalUnits: 450,
    availableUnits: 180
  },
  {
    id: 'proj-2',
    title: 'Urban Eco Smart City Lahore',
    builderId: 'builder-2',
    builderName: 'Urban City Developers',
    builderLogo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    city: 'Lahore',
    area: 'Near Kala Shah Kaku Interchange',
    startingPrice: 3500000,
    startingPriceFormatted: 'PKR 35 Lacs',
    type: 'Residential & Commercial Plots',
    status: 'under_construction',
    completionDate: 'June 2028',
    description: 'Pakistan\'s first solar-powered smart digital city featuring underground electrification, automated traffic control, central lake park, and 4-year flexible payment plan.',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1200'
    ],
    paymentPlan: {
      downPayment: '10% Down Payment',
      installments: '48 Quarterly Installments',
      possession: '10% Balloting'
    },
    totalUnits: 1200,
    availableUnits: 540
  }
];

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Tariq Malik',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    title: 'Senior Real Estate Consultant',
    agencyId: 'agency-1',
    agencyName: 'Premier Estate Group',
    city: 'Islamabad',
    phone: '+92 333 4445566',
    email: 'tariq.malik@zameenpro.pk',
    rating: 4.9,
    activeListings: 18,
    totalDeals: 84,
    verified: true
  },
  {
    id: 'agent-2',
    name: 'Ayesha Raza',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    title: 'Commercial Investment Specialist',
    agencyId: 'agency-2',
    agencyName: 'Lahore Realtors & Associates',
    city: 'Lahore',
    phone: '+92 322 7778899',
    email: 'ayesha.raza@lahorerealtors.pk',
    rating: 4.8,
    activeListings: 14,
    totalDeals: 62,
    verified: true
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'book-101',
    propertyId: 'prop-1',
    propertyTitle: 'Luxury 1 Kanal Modern Designer Villa in DHA Phase 6',
    propertyPrice: 125000000,
    propertyImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200',
    buyerId: 'user-basic',
    buyerName: 'Usman Chaudhry',
    buyerEmail: 'usman@gmail.com',
    buyerPhone: '+92 321 8889900',
    sellerId: 'user-agency-1',
    sellerName: 'Premier Estate Group',
    sellerRole: 'agency',
    bookingType: 'token',
    amountPaid: 12500000, // 10%
    totalAmount: 125000000,
    platformFee: 250000, // 2%
    agentCommission: 6250000, // 5%
    paymentMethod: 'rapidpaisa',
    paymentStatus: 'escrow_held',
    bookingStatus: 'confirmed',
    transactionId: 'TXN-RP-998241',
    escrowHoldDate: '2026-07-20',
    notes: 'Token money deposited into Deal.pk Escrow. Physical site inspection scheduled.',
    createdAt: '2026-07-20'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-2026-001',
    bookingId: 'book-101',
    date: '2026-07-20',
    dueDate: '2026-07-27',
    customerName: 'Usman Chaudhry',
    customerEmail: 'usman@gmail.com',
    propertyTitle: 'Luxury 1 Kanal Modern Designer Villa in DHA Phase 6',
    amount: 12500000,
    platformFee: 250000,
    commission: 6250000,
    status: 'paid',
    paymentMethod: 'RapidPaisa Online Gateway'
  }
];

export const INITIAL_KYC_RECORDS: KYCRecord[] = [
  {
    id: 'kyc-1',
    userId: 'user-agent-1',
    userName: 'Tariq Malik',
    userEmail: 'tariq.malik@zameenpro.pk',
    userRole: 'agent',
    cnicFront: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600',
    cnicBack: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600',
    licenseDoc: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
    status: 'approved',
    submittedAt: '2026-06-01'
  },
  {
    id: 'kyc-2',
    userId: 'user-basic',
    userName: 'Usman Chaudhry',
    userEmail: 'usman@gmail.com',
    userRole: 'user',
    cnicFront: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600',
    cnicBack: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600',
    status: 'pending',
    submittedAt: '2026-07-22'
  }
];

export const INITIAL_BLOGS: BlogArticle[] = [
  {
    id: 'blog-1',
    title: 'Complete Guide to FBR Property Taxes & Capital Value Tax (CVT) in Pakistan 2026',
    slug: 'fbr-property-tax-cvt-guide-pakistan-2026',
    category: 'Legal & Tax',
    excerpt: 'Understand Filer vs. Non-Filer tax rates, Section 7E rules, stamp duty percentages, and property valuation tables for smart property transfers.',
    content: 'Buying or selling property in Pakistan involves tax obligations across federal and provincial jurisdictions. Filers benefit from lower tax slabs (3% advance tax under Section 236K), while Non-Filers face elevated slabs up to 12%. Learn how to calculate total transfer costs before sealing your deal on Deal.pk.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
    authorName: 'Barrister Zayd Khan',
    authorRole: 'Senior Property Legal Advisor',
    date: 'July 18, 2026',
    readTime: '6 min read'
  },
  {
    id: 'blog-2',
    title: 'Why Escrow Payment Security is Revolutionizing Real Estate Deals in Karachi & Lahore',
    slug: 'escrow-payment-security-pakistan-real-estate',
    category: 'Market Insights',
    excerpt: 'How Deal.pk Escrow eliminates token fraud, double allotment risks, and fake document scams by holding buyer funds until physical verification.',
    content: 'Traditional property transactions in Pakistan relied on cash token payments directly to sellers or unverified brokers, exposing buyers to non-refundable deposit risks. Deal.pk introduced an automated 100% Escrow system protecting both buyers and authentic agents.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
    authorName: 'Sanaullah Sheikh',
    authorRole: 'Fintech Analyst',
    date: 'July 14, 2026',
    readTime: '4 min read'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-basic',
    title: 'Token Booking Confirmed',
    message: 'Your token payment of PKR 12.5 Lac for 1 Kanal Modern Villa DHA Phase 6 is secured in Deal.pk Escrow.',
    type: 'booking',
    isRead: false,
    timestamp: '2 hours ago'
  },
  {
    id: 'notif-2',
    userId: 'user-basic',
    title: 'New Message from Tariq Malik',
    message: 'Hello Usman, I have uploaded the NOC copy for your property inspection.',
    type: 'chat',
    isRead: false,
    timestamp: '5 hours ago'
  }
];

export const INITIAL_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'room-1',
    participants: [
      { id: 'user-basic', name: 'Usman Chaudhry', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', role: 'user', isOnline: true },
      { id: 'user-agent-1', name: 'Tariq Malik', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', role: 'agent', isOnline: true }
    ],
    lastMessage: 'I have uploaded the NOC copy for your property inspection.',
    lastMessageTime: '10:45 AM',
    unreadCount: 1,
    propertyId: 'prop-1',
    propertyTitle: 'Luxury 1 Kanal Modern Designer Villa in DHA Phase 6',
    propertyImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200'
  }
];

export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'room-1': [
    {
      id: 'm-1',
      roomId: 'room-1',
      senderId: 'user-basic',
      senderName: 'Usman Chaudhry',
      text: 'Assalam-o-Alaikum Tariq Sahab, is the price for the DHA Phase 6 villa negotiable?',
      timestamp: '10:30 AM',
      isRead: true
    },
    {
      id: 'm-2',
      roomId: 'room-1',
      senderId: 'user-agent-1',
      senderName: 'Tariq Malik',
      text: 'Walaikum Assalam Usman Sahab! The seller is open to reasonable offers for token buyers on Deal.pk.',
      timestamp: '10:35 AM',
      isRead: true
    },
    {
      id: 'm-3',
      roomId: 'room-1',
      senderId: 'user-agent-1',
      senderName: 'Tariq Malik',
      text: 'I have uploaded the NOC copy for your property inspection.',
      timestamp: '10:45 AM',
      isRead: false
    }
  ]
};
