import {
  Property,
  Agency,
  Builder,
  Project,
  Agent,
  AgentTalent,
  BlogArticle,
  User,
  Booking,
  Invoice,
  KYCRecord,
  AppNotification,
  ChatRoom,
  ChatMessage,
  JobPost,
  DealRoom,
  UserWallet
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
  'Sialkot',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Mardan',
  'Larkana',
  'Sheikhupura',
  'Rahim Yar Khan',
  'Jhelum',
  'Wah Cantt',
  'Okara',
  'Sahiwal',
  'Gujrat',
  'Gwadar',
  'Swat',
  'Mirpur (AK)',
  'Muzaffarabad'
];

export const CITY_AREAS: Record<string, string[]> = {
  Islamabad: [
    'F-5', 'F-6', 'F-7', 'F-8', 'F-10', 'F-11', 'F-15', 'F-17',
    'E-7', 'E-8', 'E-9', 'E-11', 'E-12', 'E-16', 'E-17',
    'G-5', 'G-6', 'G-7', 'G-8', 'G-9', 'G-10', 'G-11', 'G-12', 'G-13', 'G-14', 'G-15', 'G-16',
    'H-8', 'H-9', 'H-10', 'H-11', 'H-12', 'H-13',
    'I-8', 'I-9', 'I-10', 'I-11', 'I-12', 'I-14', 'I-15', 'I-16',
    'DHA Phase 1', 'DHA Phase 2', 'DHA Phase 3', 'DHA Phase 4', 'DHA Phase 5', 'DHA Phase 6', 'DHA Valley',
    'Bahria Town Phase 1', 'Bahria Town Phase 2', 'Bahria Town Phase 3', 'Bahria Town Phase 4', 'Bahria Town Phase 5', 'Bahria Town Phase 6', 'Bahria Town Phase 7', 'Bahria Town Phase 8', 'Bahria Enclave',
    'Gulberg Greens', 'Gulberg Residencia', 'B-17 Multi Gardens', 'C-15', 'D-12', 'E-11/2', 'E-11/3', 'E-11/4',
    'Park Enclave', 'Naval Anchorage', 'Capital Smart City', 'Top City-1', 'Mumtaz City', 'Eighteen', 'Koral Town', 'Pakistan Town', 'Zone 4', 'Zone 5', 'Other / Custom Area'
  ],
  Lahore: [
    'DHA Phase 1', 'DHA Phase 2', 'DHA Phase 3', 'DHA Phase 4', 'DHA Phase 5', 'DHA Phase 6', 'DHA Phase 7', 'DHA Phase 8', 'DHA Phase 9 Town', 'DHA Phase 9 Prism', 'DHA Phase 10', 'DHA Rahbar (Phase 11)',
    'Gulberg I', 'Gulberg II', 'Gulberg III', 'Gulberg IV', 'Gulberg V',
    'Bahria Town Sector A', 'Bahria Town Sector B', 'Bahria Town Sector C', 'Bahria Town Sector D', 'Bahria Town Sector E', 'Bahria Town Sector F', 'Bahria Orchard',
    'Johar Town Phase 1', 'Johar Town Phase 2', 'Model Town Block A-K', 'Askari 1', 'Askari 2', 'Askari 3', 'Askari 4', 'Askari 5', 'Askari 9', 'Askari 10', 'Askari 11',
    'Lake City', 'Canal City', 'Garden Town', 'Wapda Town Phase 1', 'Wapda Town Phase 2', 'Faisal Town', 'Allama Iqbal Town', 'Valencia Town', 'Paragon City', 'State Life Society', 'Central Park Housing', 'Jubilee Town', 'Etihad Town', 'Park View City', 'Pine Enclave', 'Bediian Road', 'Raiwind Road', 'Cavalry Ground', 'Cantt', 'Samanabad', 'Township', 'Nishtar Town', 'Other / Custom Area'
  ],
  Karachi: [
    'Clifton Block 1', 'Clifton Block 2', 'Clifton Block 3', 'Clifton Block 4', 'Clifton Block 5', 'Clifton Block 6', 'Clifton Block 7', 'Clifton Block 8', 'Clifton Block 9',
    'DHA Phase 1', 'DHA Phase 2', 'DHA Phase 3', 'DHA Phase 4', 'DHA Phase 5', 'DHA Phase 6', 'DHA Phase 7', 'DHA Phase 8', 'DHA City Karachi',
    'Gulshan-e-Iqbal Block 1', 'Gulshan-e-Iqbal Block 2', 'Gulshan-e-Iqbal Block 3', 'Gulshan-e-Iqbal Block 4', 'Gulshan-e-Iqbal Block 5', 'Gulshan-e-Iqbal Block 6', 'Gulshan-e-Iqbal Block 7', 'Gulshan-e-Iqbal Block 10-13', 'Gulshan-e-Iqbal Block 14-19',
    'Gulistan-e-Jauhar Block 1-5', 'Gulistan-e-Jauhar Block 6-10', 'Gulistan-e-Jauhar Block 11-15', 'Gulistan-e-Jauhar Block 16-20',
    'Nazimabad Block 1-5', 'North Nazimabad Block A-T', 'Federal B Area Block 1-22',
    'Saddar', 'PECHS Block 1-6', 'Navy Housing Scheme', 'Zamzama', 'Bath Island', 'Frere Town', 'Civil Lines', 'Garden East', 'Tariq Road',
    'Malir Cantt', 'Malir City', 'Gadap Town', 'Safoora Goth', 'Scheme 33', 'Bahria Town Karachi Precinct 1-35',
    'Model Colony', 'Shah Faisal Colony', 'Korangi Industrial Area', 'Landhi', 'Orangi Town', 'Baldia Town', 'SITE Area', 'Hawkesbay Scheme 42', 'Other / Custom Area'
  ],
  Rawalpindi: [
    'Bahria Town Phase 1', 'Bahria Town Phase 2', 'Bahria Town Phase 3', 'Bahria Town Phase 4', 'Bahria Town Phase 5', 'Bahria Town Phase 6', 'Bahria Town Phase 7', 'Bahria Town Phase 8',
    'Saddar', 'Chaklala Scheme 1', 'Chaklala Scheme 2', 'Chaklala Scheme 3', 'Gulraiz Housing Scheme', 'Adiala Road', 'Westridge 1-3', 'Askari 1-14',
    'High Court Road', 'Peshawar Road', 'Satellite Town Block A-F', 'Airport Housing Society', 'Rawal Town', 'Gulshan-e-Abad', 'PWD Housing Society', 'Media Town', 'Agosh Society', 'CBR Town Phase 2', 'Other / Custom Area'
  ],
  Peshawar: [
    'Hayatabad Phase 1', 'Hayatabad Phase 2', 'Hayatabad Phase 3', 'Hayatabad Phase 4', 'Hayatabad Phase 5', 'Hayatabad Phase 6', 'Hayatabad Phase 7',
    'University Town', 'Regi Model Town', 'Warsak Road', 'Peshawar Enclave', 'DHA Peshawar', 'Canal Town', 'Gulberg Peshawar', 'University Road', 'Kohat Road', 'GT Road', 'Dalazak Road', 'Ring Road', 'Other / Custom Area'
  ],
  Faisalabad: [
    'Canal Express / Canal Road', 'Civil Lines', 'People\'s Colony 1', 'People\'s Colony 2', 'Madina Town', 'Gulberg', 'Kohinoor City', 'Eden Valley', 'FDA City', 'Samanabad', 'Sargodha Road', 'Satiana Road', 'Jinnah Colony', 'D Ground', 'Millat Road', 'Other / Custom Area'
  ],
  Multan: [
    'DHA Multan', 'Royal Orchard', 'Gulgasht Colony', 'Shalimar Colony', 'Cantt', 'Wapda Town', 'New Multan', 'Officers Colony', 'Model Town', 'Bosan Road', 'Northern Bypass', 'Multan Public School Road', 'Other / Custom Area'
  ],
  Quetta: [
    'Chiltan Housing Scheme', 'Airport Road', 'Jinnah Town', 'Zarghoon Housing', 'Samungli Road', 'Cantt', 'Satellite Town', 'Serena Road', 'Spinny Road', 'Nawa Killi', 'Gulshan-e-Jinnah', 'Other / Custom Area'
  ],
  Gujranwala: [
    'DC Colony', 'Master City', 'Citi Housing Scheme', 'Garden Town', 'Rahwali Cantt', 'Model Town', 'Satellite Town', 'Peoples Colony', 'Wapda Town', 'Sialkot Road', 'GT Road', 'Other / Custom Area'
  ],
  Sialkot: [
    'Citi Housing Sialkot', 'Cantt Area', 'Kashmir Road', 'Paris Road', 'Defense Road', 'Sambrial', 'Model Town', 'Ugoki', 'Airport Road Sialkot', 'Marala Road', 'Other / Custom Area'
  ],
  Hyderabad: [
    'Latifabad Unit 1-6', 'Latifabad Unit 7-12', 'Qasimabad', 'Saddar', 'Autobahn Road', 'Citizen Colony', 'Gulshan-e-Maymar Hyderabad', 'Abdullah Sports City', 'Jamshoro Road', 'Other / Custom Area'
  ],
  Abbottabad: [
    'Jinnahabad', 'Mandian', 'Supply Area', 'Habibullah Colony', 'Kakul Road', 'Mansehra Road', 'Pine City Abbottabad', 'Murree Road', 'Nawan Shehr', 'Other / Custom Area'
  ],
  Bahawalpur: [
    'DHA Bahawalpur', 'Satellite Town', 'Model Town A', 'Model Town B', 'Model Town C', 'Cheema Town', 'Cantt', 'Commercial Area', 'Yazman Road', 'Other / Custom Area'
  ],
  Sargodha: [
    'University Road', 'Satellite Town', 'Defence View', 'Queens Road', 'New Satellite Town', 'Club Road', 'Sillanwali Road', 'Other / Custom Area'
  ],
  Sukkur: [
    'Military Road', 'Cooperative Housing', 'Township', 'Barrage Road', 'Airport Road', 'Civil Lines', 'Shikarpur Road', 'Other / Custom Area'
  ],
  Mardan: [
    'Sheikh Maltoon Town', 'Baghdada', 'Nowshera Road', 'Mardan Cantt', 'College Road', 'Gaju Khan Avenue', 'Other / Custom Area'
  ],
  Larkana: [
    'VIP Road', 'Sachal Colony', 'Larkana Housing', 'Civil Lines', 'Station Road', 'Resham Gali', 'Other / Custom Area'
  ],
  Sheikhupura: [
    'Housing Colony', 'Lahore Road', 'Sargodha Road', 'Ferozewala', 'Jandiala Road', 'Civil Lines', 'Other / Custom Area'
  ],
  'Rahim Yar Khan': [
    'Model Town', 'Abbasia Town', 'Gulshan-e-Iqbal', 'Canal Bank', 'Cantt Area', 'Airport Road', 'Other / Custom Area'
  ],
  Jhelum: [
    'Citi Housing Jhelum', 'Cantt', 'GT Road', 'Satellite Town', 'Civil Lines', 'Rohtas Road', 'Other / Custom Area'
  ],
  'Wah Cantt': [
    'New City Phase 1', 'New City Phase 2', 'Lalarukh', 'Officers Colony', 'Aslam Market', 'GT Road Wah', 'Other / Custom Area'
  ],
  Okara: [
    'Gogera Road', 'Military Farm Road', 'Model Town', 'GT Road Okara', 'Depalpur Road', 'Other / Custom Area'
  ],
  Sahiwal: [
    'Farid Town', 'Scheme No 3', 'Tariq Bin Ziyad Colony', 'High Street', 'Canal Colony', 'Faisal Hospital Road', 'Other / Custom Area'
  ],
  Gujrat: [
    'Rehman Shaheed Road', 'Model Town', 'Court Road', 'Gujrat Cantt', 'Bhimber Road', 'GTS Chowk', 'Other / Custom Area'
  ],
  Gwadar: [
    'Sangar Housing Scheme', 'Newtown Housing Scheme', 'Coastal Highway', 'Marine Drive', 'New Port City', 'West Bay', 'East Bay', 'Other / Custom Area'
  ],
  Swat: [
    'Saidu Sharif', 'Fizagat', 'Kanju Township', 'Airport Road', 'Mingora Bazaar', 'Ghulambaba', 'Other / Custom Area'
  ],
  'Mirpur (AK)': [
    'Sector F-1', 'Sector F-2', 'Sector F-3', 'Sector F-4', 'Nangi', 'New City Mirpur', 'Kotli Road', 'Other / Custom Area'
  ],
  Muzaffarabad: [
    'Upper Chatter', 'Secretariate Road', 'Plate Area', 'Gojra', 'Neelum Road', 'Bank Road', 'Other / Custom Area'
  ]
};

export const GUEST_USER: User = {
  id: 'guest',
  name: 'Guest Visitor',
  email: '',
  role: 'guest',
  username: 'guest',
  avatar: '',
  phone: '',
  city: 'Karachi',
  kycStatus: 'none',
  createdAt: '2026-01-01'
};

export const INITIAL_USERS: User[] = [
  GUEST_USER
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-101',
    title: '1 Kanal Ultra Modern Luxury Villa with Swimming Pool',
    slug: '1-kanal-ultra-modern-luxury-villa-dha-phase-6-lahore',
    description: 'Brand new architectural masterpiece located in the prime block of DHA Phase 6 Lahore. Features 5 master bedrooms with Italian fitted bathrooms, basement home theater, heated swimming pool, double height ceiling lobby, Spanish tiled flooring, and complete smart home automation.',
    type: 'villa',
    purpose: 'sale',
    status: 'approved',
    price: 85000000,
    priceFormatted: 'PKR 8.5 Crore',
    city: 'Lahore',
    area: 'DHA Phase 6',
    address: 'Main Boulevard, Phase 6, DHA, Lahore',
    beds: 5,
    baths: 6,
    sqft: 4500,
    furnished: 'furnished',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
    ],
    isPremium: true,
    isFeatured: true,
    views: 1420,
    createdAt: '2026-07-28',
    userId: 'user-agent-1',
    userRole: 'agent',
    ownerName: 'Chaudhry Real Estate',
    ownerPhone: '+923001234567',
    ownerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    agencyName: 'Zameen Experts DHA',
    lat: 31.4697,
    lng: 74.4503,
    features: ['Swimming Pool', 'Smart Home Security', 'Solar Power System', 'Basement Cinema', 'Jacuzzi', 'Escrow Bayana Eligible'],
    allowOnlineToken: true
  },
  {
    id: 'prop-102',
    title: '3 Bed Luxury Corner Executive Apartment - Margalla View',
    slug: '3-bed-luxury-corner-executive-apartment-e11-islamabad',
    description: 'Spacious 3 bedroom luxury apartment overlooking the serene Margalla Hills in Sector E-11/2 Islamabad. Features modern kitchen, reserved underground parking, high-speed elevator, 24/7 backup generator, and LDA/CDA approved building.',
    type: 'apartment',
    purpose: 'sale',
    status: 'approved',
    price: 32000000,
    priceFormatted: 'PKR 3.2 Crore',
    city: 'Islamabad',
    area: 'E-11',
    address: 'Sector E-11/2, Main MPCHS Avenue, Islamabad',
    beds: 3,
    baths: 4,
    sqft: 2200,
    furnished: 'semi-furnished',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    isPremium: true,
    isFeatured: true,
    views: 980,
    createdAt: '2026-07-30',
    userId: 'user-agent-2',
    userRole: 'agent',
    ownerName: 'Capital Realtors',
    ownerPhone: '+923219876543',
    ownerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    agencyName: 'Islamabad Estate Network',
    lat: 33.6983,
    lng: 72.9792,
    features: ['Margalla View Balcony', '24/7 Power Backup', 'Gym & Fitness Center', 'Covered Parking', 'Fire Safety Sprinklers'],
    allowOnlineToken: true
  },
  {
    id: 'prop-103',
    title: '500 Sq Yds Prime Commercial Plot - Main Boulevard Clifton',
    slug: '500-sq-yds-prime-commercial-plot-clifton-block-4-karachi',
    description: 'Corner commercial plot situated in Block 4 Clifton Karachi. Ideal for corporate plaza, bank branch, or luxury showroom. SBCA approved clearance documents with zero litigation.',
    type: 'commercial',
    purpose: 'sale',
    status: 'approved',
    price: 140000000,
    priceFormatted: 'PKR 14 Crore',
    city: 'Karachi',
    area: 'Clifton',
    address: 'Block 4, Clifton, Marine Drive Junction, Karachi',
    beds: 0,
    baths: 0,
    sqft: 4500,
    furnished: 'unfurnished',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
    ],
    isPremium: true,
    isFeatured: false,
    views: 2100,
    createdAt: '2026-07-25',
    userId: 'user-agent-3',
    userRole: 'agency',
    ownerName: 'Premier Coastal Properties',
    ownerPhone: '+923335551212',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    agencyName: 'Clifton Commercial Group',
    lat: 24.8138,
    lng: 67.0319,
    features: ['Corner Plot', 'Main Road Frontage', 'SBCA Approved NOC', 'FBR Verified Title', 'Escrow Escrow Protected'],
    allowOnlineToken: true
  },
  {
    id: 'prop-104',
    title: '10 Marla Modern Spanish Design Corner House - Bahria Phase 8',
    slug: '10-marla-spanish-house-bahria-phase-8-rawalpindi',
    description: 'Genuinely constructed 10 Marla double story Spanish elevation house in Bahria Town Phase 8 Rawalpindi. 4 bedrooms with attach bath, servant quarter, ash wood doors, and imported fittings.',
    type: 'house',
    purpose: 'sale',
    status: 'approved',
    price: 48000000,
    priceFormatted: 'PKR 4.8 Crore',
    city: 'Rawalpindi',
    area: 'Bahria Town',
    address: 'Sector F-1, Phase 8, Bahria Town, Rawalpindi',
    beds: 4,
    baths: 5,
    sqft: 3200,
    furnished: 'semi-furnished',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80'
    ],
    isPremium: false,
    isFeatured: true,
    views: 850,
    createdAt: '2026-08-01',
    userId: 'user-agent-4',
    userRole: 'agent',
    ownerName: 'Twin City Builders',
    ownerPhone: '+923124443322',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    agencyName: 'Bahria Deals Center',
    lat: 33.5222,
    lng: 73.0981,
    features: ['Ash Wood Work', 'Servant Quarter', 'Gas & Water Connections On Point', 'Near Commercial Park'],
    allowOnlineToken: true
  },
  {
    id: 'prop-105',
    title: 'Labour Square S-I-T-E Area 2 Bed Executive Apartment - Karachi',
    slug: 'labour-square-site-area-2-bed-flat-karachi',
    description: 'Renovated 2 Bedroom flat in Labour Square, SITE Area Karachi. Prime access to industrial hub, Manghopir Road, and Habib Bank Chowrangi. Separate water line, gas connection, 24/7 security boundary, and complete ownership lease papers.',
    type: 'apartment',
    purpose: 'sale',
    status: 'approved',
    price: 8500000,
    priceFormatted: 'PKR 85 Lakh',
    city: 'Karachi',
    area: 'SITE Area',
    address: 'Block C, Labour Square, SITE Industrial Area, Karachi',
    beds: 2,
    baths: 2,
    sqft: 1100,
    furnished: 'semi-furnished',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    isPremium: true,
    isFeatured: true,
    views: 1240,
    createdAt: '2026-08-05',
    userId: 'user-agent-karachi',
    userRole: 'agent',
    ownerName: 'Karachi Property Network',
    ownerPhone: '+923002223344',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    agencyName: 'SITE Real Estate Karachi',
    lat: 24.9080,
    lng: 67.0120,
    features: ['SITE Area Prime Location', '24/7 Water & Gas', 'Lease Transferable', 'Escrow Protected Token'],
    allowOnlineToken: true
  }
];

export const INITIAL_AGENCIES: Agency[] = [
  {
    id: 'agency-1',
    name: 'Zameen Experts DHA',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    description: 'Premier licensed real estate agency specializing in DHA Phase 1 to 9 Lahore, Gulberg commercial properties, and escrow verified residential plots.',
    city: 'Lahore',
    address: 'Complex 12-CCA, Phase 5 DHA, Lahore',
    phone: '+92 42 35740000',
    email: 'info@zameenexperts.pk',
    verified: true,
    totalProperties: 48,
    activeAgents: 12,
    rating: 4.9,
    reviewCount: 184,
    socialLinks: {
      whatsapp: '+923001234567',
      website: 'https://zameenexperts.pk'
    }
  },
  {
    id: 'agency-2',
    name: 'Islamabad Estate Network',
    logo: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    description: 'Leading property advisors for Islamabad sectors F-6, F-7, F-10, E-11, and Park View City with transparent Bayana Escrow processing.',
    city: 'Islamabad',
    address: 'Plaza 14, F-7 Markaz, Islamabad',
    phone: '+92 51 2890000',
    email: 'contact@islamabadestate.pk',
    verified: true,
    totalProperties: 35,
    activeAgents: 8,
    rating: 4.8,
    reviewCount: 120,
    socialLinks: {
      whatsapp: '+923219876543'
    }
  }
];

export const INITIAL_BUILDERS: Builder[] = [
  {
    id: 'builder-1',
    name: 'Capital Smart Developers',
    logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    description: 'Pioneering futuristic mega housing and smart city projects across Islamabad, Lahore, and Gwadar with 100% NOC approval status.',
    city: 'Islamabad',
    address: 'Corporate Tower, Blue Area, Islamabad',
    phone: '+92 51 111 222 333',
    email: 'info@capitalsmart.pk',
    verified: true,
    totalProjects: 9,
    ongoingProjects: 3,
    rating: 4.9,
    reviewCount: 240
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'project-1',
    title: 'Margalla Smart Heights',
    builderId: 'builder-1',
    builderName: 'Capital Smart Developers',
    builderLogo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=200&q=80',
    city: 'Islamabad',
    area: 'E-11',
    startingPrice: 12500000,
    startingPriceFormatted: 'PKR 1.25 Crore',
    type: 'apartment',
    status: 'under_construction',
    completionDate: 'December 2027',
    description: 'Luxury high-rise residential & commercial tower offering 1, 2, and 3 bed executive suites with easy 3-year installment plans.',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    paymentPlan: {
      downPayment: '15% Down Payment',
      installments: '36 Monthly Installments',
      possession: '20% On Possession'
    },
    totalUnits: 120,
    availableUnits: 45
  }
];

// Explicitly 0 fake agents as requested by user
export const INITIAL_AGENTS: Agent[] = [];

export const INITIAL_AGENT_TALENTS: AgentTalent[] = [];

export const INITIAL_BOOKINGS: Booking[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_KYC_RECORDS: KYCRecord[] = [];

export const INITIAL_BLOGS: BlogArticle[] = [
  {
    id: 'blog-1',
    title: 'Complete FBR Property Tax Guide 2026: Filers vs Non-Filers Section 236K & 236C',
    slug: 'complete-fbr-property-tax-guide-2026-filers-non-filers',
    excerpt: 'Detailed breakdown of active tax rates under Section 236K (Advance Tax on Buyers) and 236C (Withholding Tax on Sellers) for 2026 real estate transactions in Pakistan.',
    content: 'Purchasing property in Pakistan in 2026 requires strict adherence to Federal Board of Revenue (FBR) regulations. Tax rates vary significantly depending on whether the buyer or seller is an active tax filer or non-filer. Under Section 236K, active filers pay a 3% advance tax on the FBR valuation rate, while non-filers face rates up to 12%. Utilizing DealFast Escrow guarantees that property token deposits remain protected while tax clearance and society NOC documentation are verified.',
    category: 'Legal & Tax',
    author: 'DealFast Legal & Tax Desk',
    date: '2026-07-30',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    tags: ['FBR Tax 2026', 'Section 236K', 'Section 236C', 'Escrow Security']
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_CHAT_ROOMS: ChatRoom[] = [];

export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {};

export const INITIAL_JOB_POSTS: JobPost[] = [];

export const INITIAL_DEAL_ROOMS: DealRoom[] = [];

export const INITIAL_WALLETS: Record<string, UserWallet> = {};



