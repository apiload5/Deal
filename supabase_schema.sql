-- ==============================================================================
-- DEALFAST REAL ESTATE PLATFORM - ULTIMATE COMPLETE SUPABASE SQL SCHEMA
-- With All Pakistan Cities, Sectors, Societies, Areas, Projects & Entities
-- Run this in your Supabase Project -> SQL Editor
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. CITIES & SOCIETIES / AREAS TABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.cities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    province TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.city_areas (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    city_id TEXT REFERENCES public.cities(id) ON DELETE CASCADE,
    city_name TEXT NOT NULL,
    area_name TEXT NOT NULL,
    popular_society BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. USERS & PROFILES TABLE (Linked to Firebase Auth UID)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY, -- Firebase Auth UID
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'seller', 'agent', 'builder', 'agency', 'admin')),
    avatar TEXT,
    kyc_status TEXT DEFAULT 'none' CHECK (kyc_status IN ('none', 'pending', 'verified', 'rejected')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_overseas_pakistani BOOLEAN DEFAULT FALSE,
    overseas_country TEXT,
    nicop_number TEXT,
    has_rda_account BOOLEAN DEFAULT FALSE,
    father_name TEXT,
    cnic TEXT,
    city TEXT DEFAULT 'Islamabad',
    agency_id TEXT,
    agency_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. AGENCIES & BUILDERS TABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.agencies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    cover_image TEXT,
    description TEXT,
    city TEXT NOT NULL,
    address TEXT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    verified BOOLEAN DEFAULT TRUE,
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    total_properties INTEGER DEFAULT 0,
    active_agents INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.builders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    cover_image TEXT,
    description TEXT,
    city TEXT NOT NULL,
    address TEXT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    established_year INTEGER,
    delivered_projects INTEGER DEFAULT 0,
    active_projects INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    builder_id TEXT REFERENCES public.builders(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    city TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT,
    types JSONB DEFAULT '[]'::jsonb,
    price_starts_from NUMERIC NOT NULL,
    price_starts_formatted TEXT,
    total_units INTEGER DEFAULT 0,
    available_units INTEGER DEFAULT 0,
    completion_date TEXT,
    construction_status TEXT DEFAULT 'under_construction',
    images JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. AGENTS & AGENT TALENT DIRECTORY
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.agents (
    id TEXT PRIMARY KEY,
    agency_id TEXT REFERENCES public.agencies(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    title TEXT,
    agency_name TEXT,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    rating NUMERIC DEFAULT 5.0,
    active_listings INTEGER DEFAULT 0,
    total_deals INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agent_talents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT NOT NULL,
    target_societies TEXT,
    experience_years NUMERIC DEFAULT 1,
    specialization TEXT,
    expected_commission TEXT,
    bio TEXT,
    cnic_verified BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'hired', 'interviewing')),
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. PROPERTIES TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.properties (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    price_formatted TEXT,
    type TEXT NOT NULL, -- 'house', 'plot', 'commercial', 'apartment', 'villa', 'penthouse'
    purpose TEXT DEFAULT 'sale' CHECK (purpose IN ('sale', 'rent')),
    status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected', 'recycle_bin', 'sold', 'rented')),
    city TEXT NOT NULL,
    area TEXT NOT NULL,
    address TEXT NOT NULL,
    beds INTEGER DEFAULT 0,
    baths INTEGER DEFAULT 0,
    sqft NUMERIC DEFAULT 0,
    furnished TEXT DEFAULT 'unfurnished',
    images JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    virtual_tour_url TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    user_role TEXT DEFAULT 'seller',
    owner_name TEXT,
    owner_phone TEXT,
    owner_avatar TEXT,
    agency_name TEXT,
    lat NUMERIC DEFAULT 33.6844,
    lng NUMERIC DEFAULT 73.0479,
    features JSONB DEFAULT '[]'::jsonb,
    allow_online_token BOOLEAN DEFAULT TRUE,
    deletion_security_code TEXT,
    expires_at TIMESTAMPTZ,
    last_renewed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. BOOKINGS & ESCROW TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    property_id TEXT REFERENCES public.properties(id) ON DELETE CASCADE,
    property_title TEXT,
    property_price NUMERIC,
    property_image TEXT,
    buyer_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    buyer_name TEXT NOT NULL,
    buyer_email TEXT NOT NULL,
    buyer_phone TEXT,
    seller_id TEXT,
    seller_name TEXT,
    seller_email TEXT,
    seller_role TEXT,
    booking_type TEXT DEFAULT 'token' CHECK (booking_type IN ('token', 'booking', 'full')),
    amount_paid NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    platform_fee NUMERIC DEFAULT 0,
    agent_commission NUMERIC DEFAULT 0,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'escrow_held' CHECK (payment_status IN ('pending', 'paid', 'escrow_held', 'release_requested', 'released', 'refunded')),
    booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    transaction_id TEXT NOT NULL,
    escrow_hold_date TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. INVOICES TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    booking_id TEXT,
    date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    property_title TEXT,
    amount NUMERIC NOT NULL,
    platform_fee NUMERIC DEFAULT 0,
    commission NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'paid' CHECK (status IN ('unpaid', 'paid', 'overdue')),
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. JOB POSTS & DEAL ROOMS (AGENCY BOUNTY & FIELD SALES)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.job_posts (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    agency_name TEXT NOT NULL,
    agency_logo TEXT,
    title TEXT NOT NULL,
    property_title TEXT NOT NULL,
    society TEXT NOT NULL,
    city TEXT NOT NULL,
    property_type TEXT NOT NULL,
    bounty_amount NUMERIC NOT NULL,
    max_agents INTEGER DEFAULT 1,
    co_agent_splits JSONB DEFAULT '[100]'::jsonb,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    required_stake_per_agent NUMERIC DEFAULT 0,
    tax_details JSONB DEFAULT '{}'::jsonb,
    hired_agent_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deal_rooms (
    id TEXT PRIMARY KEY,
    job_id TEXT REFERENCES public.job_posts(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    agency_id TEXT NOT NULL,
    agency_name TEXT NOT NULL,
    agents JSONB DEFAULT '[]'::jsonb,
    total_bounty_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'disputed', 'cancelled')),
    current_milestone_index INTEGER DEFAULT 0,
    milestones JSONB DEFAULT '[]'::jsonb,
    dispute JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. CHAT SYSTEM (ROOMS & MESSAGES)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id TEXT PRIMARY KEY,
    property_id TEXT,
    property_title TEXT,
    property_image TEXT,
    participants JSONB DEFAULT '[]'::jsonb,
    last_message TEXT,
    last_message_time TEXT,
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id TEXT PRIMARY KEY,
    room_id TEXT REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_name TEXT,
    sender_avatar TEXT,
    text TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT,
    timestamp TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_delivered BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. WALLETS & TRANSACTIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.wallets (
    user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    available_balance NUMERIC DEFAULT 0,
    locked_stake NUMERIC DEFAULT 0,
    total_earned NUMERIC DEFAULT 0,
    total_spent NUMERIC DEFAULT 0,
    transactions JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. KYC RECORDS & INQUIRIES & NOTIFICATIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.kyc_records (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_role TEXT,
    cnic_front TEXT,
    cnic_back TEXT,
    license_doc TEXT,
    secp_doc TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inquiries (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    property_id TEXT REFERENCES public.properties(id) ON DELETE CASCADE,
    property_title TEXT,
    user_name TEXT NOT NULL,
    user_phone TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    timestamp TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. BLOGS & CONTENT
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.blogs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    author TEXT,
    category TEXT,
    read_time TEXT,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 13. INDEXES FOR PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_area ON public.properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_city_areas_city ON public.city_areas(city_name);
CREATE INDEX IF NOT EXISTS idx_bookings_buyer ON public.bookings(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_prop ON public.bookings(property_id);

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_talents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Allow Public/Authenticated Operations
CREATE POLICY "Public select cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Public select city_areas" ON public.city_areas FOR SELECT USING (true);
CREATE POLICY "Public all users" ON public.users FOR ALL USING (true);
CREATE POLICY "Public all agencies" ON public.agencies FOR ALL USING (true);
CREATE POLICY "Public all builders" ON public.builders FOR ALL USING (true);
CREATE POLICY "Public all projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Public all agents" ON public.agents FOR ALL USING (true);
CREATE POLICY "Public all agent_talents" ON public.agent_talents FOR ALL USING (true);
CREATE POLICY "Public all properties" ON public.properties FOR ALL USING (true);
CREATE POLICY "Public all bookings" ON public.bookings FOR ALL USING (true);
CREATE POLICY "Public all invoices" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Public all job_posts" ON public.job_posts FOR ALL USING (true);
CREATE POLICY "Public all deal_rooms" ON public.deal_rooms FOR ALL USING (true);
CREATE POLICY "Public all chat_rooms" ON public.chat_rooms FOR ALL USING (true);
CREATE POLICY "Public all chat_messages" ON public.chat_messages FOR ALL USING (true);
CREATE POLICY "Public all wallets" ON public.wallets FOR ALL USING (true);
CREATE POLICY "Public all kyc_records" ON public.kyc_records FOR ALL USING (true);
CREATE POLICY "Public all inquiries" ON public.inquiries FOR ALL USING (true);
CREATE POLICY "Public all notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Public all blogs" ON public.blogs FOR ALL USING (true);

-- Enable Realtime for active dynamic tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ==============================================================================
-- 15. SEED DATA - PAKISTAN CITIES & SOCIETIES / AREAS
-- ==============================================================================

INSERT INTO public.cities (id, name, province) VALUES
('city-isb', 'Islamabad', 'Federal Capital'),
('city-lhr', 'Lahore', 'Punjab'),
('city-khi', 'Karachi', 'Sindh'),
('city-rwp', 'Rawalpindi', 'Punjab'),
('city-pew', 'Peshawar', 'KPK'),
('city-fsd', 'Faisalabad', 'Punjab'),
('city-mux', 'Multan', 'Punjab'),
('city-qta', 'Quetta', 'Balochistan'),
('city-grw', 'Gujranwala', 'Punjab'),
('city-skt', 'Sialkot', 'Punjab'),
('city-hyd', 'Hyderabad', 'Sindh'),
('city-atd', 'Abbottabad', 'KPK'),
('city-bhv', 'Bahawalpur', 'Punjab'),
('city-sgd', 'Sargodha', 'Punjab'),
('city-skr', 'Sukkur', 'Sindh'),
('city-mrn', 'Mardan', 'KPK'),
('city-lrk', 'Larkana', 'Sindh'),
('city-skp', 'Sheikhupura', 'Punjab'),
('city-ryk', 'Rahim Yar Khan', 'Punjab'),
('city-jhm', 'Jhelum', 'Punjab'),
('city-wah', 'Wah Cantt', 'Punjab'),
('city-oka', 'Okara', 'Punjab'),
('city-swl', 'Sahiwal', 'Punjab'),
('city-gjt', 'Gujrat', 'Punjab'),
('city-gwd', 'Gwadar', 'Balochistan'),
('city-swt', 'Swat', 'KPK'),
('city-mpr', 'Mirpur (AK)', 'Azad Kashmir'),
('city-mzd', 'Muzaffarabad', 'Azad Kashmir')
ON CONFLICT (name) DO NOTHING;

-- SEED ISLAMABAD AREAS
INSERT INTO public.city_areas (city_id, city_name, area_name, popular_society) VALUES
('city-isb', 'Islamabad', 'DHA Phase 1', true),
('city-isb', 'Islamabad', 'DHA Phase 2', true),
('city-isb', 'Islamabad', 'DHA Phase 3', true),
('city-isb', 'Islamabad', 'DHA Phase 4', true),
('city-isb', 'Islamabad', 'DHA Phase 5', true),
('city-isb', 'Islamabad', 'DHA Phase 6', true),
('city-isb', 'Islamabad', 'Bahria Town Phase 1-8', true),
('city-isb', 'Islamabad', 'Bahria Enclave', true),
('city-isb', 'Islamabad', 'Gulberg Greens', true),
('city-isb', 'Islamabad', 'Gulberg Residencia', true),
('city-isb', 'Islamabad', 'F-5', false),
('city-isb', 'Islamabad', 'F-6', false),
('city-isb', 'Islamabad', 'F-7', false),
('city-isb', 'Islamabad', 'F-8', false),
('city-isb', 'Islamabad', 'F-10', false),
('city-isb', 'Islamabad', 'F-11', false),
('city-isb', 'Islamabad', 'E-7', false),
('city-isb', 'Islamabad', 'E-11', false),
('city-isb', 'Islamabad', 'G-11', false),
('city-isb', 'Islamabad', 'G-13', false),
('city-isb', 'Islamabad', 'G-14', false),
('city-isb', 'Islamabad', 'I-8', false),
('city-isb', 'Islamabad', 'B-17 Multi Gardens', true),
('city-isb', 'Islamabad', 'Park Enclave', true),
('city-isb', 'Islamabad', 'Capital Smart City', true),
('city-isb', 'Islamabad', 'Eighteen', true),
('city-isb', 'Islamabad', 'Top City-1', true),
('city-isb', 'Islamabad', 'Mumtaz City', true);

-- SEED LAHORE AREAS
INSERT INTO public.city_areas (city_id, city_name, area_name, popular_society) VALUES
('city-lhr', 'Lahore', 'DHA Phase 1', true),
('city-lhr', 'Lahore', 'DHA Phase 2', true),
('city-lhr', 'Lahore', 'DHA Phase 3', true),
('city-lhr', 'Lahore', 'DHA Phase 4', true),
('city-lhr', 'Lahore', 'DHA Phase 5', true),
('city-lhr', 'Lahore', 'DHA Phase 6', true),
('city-lhr', 'Lahore', 'DHA Phase 7', true),
('city-lhr', 'Lahore', 'DHA Phase 8', true),
('city-lhr', 'Lahore', 'DHA Phase 9 Prism', true),
('city-lhr', 'Lahore', 'Bahria Town Sector A-F', true),
('city-lhr', 'Lahore', 'Bahria Orchard', true),
('city-lhr', 'Lahore', 'Gulberg I-V', true),
('city-lhr', 'Lahore', 'Johar Town Phase 1-2', true),
('city-lhr', 'Lahore', 'Model Town', true),
('city-lhr', 'Lahore', 'Lake City', true),
('city-lhr', 'Lahore', 'Valencia Town', true),
('city-lhr', 'Lahore', 'Wapda Town Phase 1-2', true),
('city-lhr', 'Lahore', 'Park View City', true),
('city-lhr', 'Lahore', 'Etihad Town', true),
('city-lhr', 'Lahore', 'Central Park Housing Scheme', true),
('city-lhr', 'Lahore', 'State Life Housing Society', true),
('city-lhr', 'Lahore', 'Paragon City', true),
('city-lhr', 'Lahore', 'Askari 10 & 11', true);

-- SEED KARACHI AREAS
INSERT INTO public.city_areas (city_id, city_name, area_name, popular_society) VALUES
('city-khi', 'Karachi', 'Clifton Block 1-9', true),
('city-khi', 'Karachi', 'DHA Phase 1-8', true),
('city-khi', 'Karachi', 'DHA City Karachi', true),
('city-khi', 'Karachi', 'Bahria Town Karachi Precinct 1-35', true),
('city-khi', 'Karachi', 'Gulshan-e-Iqbal Block 1-19', true),
('city-khi', 'Karachi', 'Gulistan-e-Jauhar Block 1-20', true),
('city-khi', 'Karachi', 'North Nazimabad Block A-T', true),
('city-khi', 'Karachi', 'PECHS Block 1-6', true),
('city-khi', 'Karachi', 'Scheme 33', true),
('city-khi', 'Karachi', 'Malir Cantt', true),
('city-khi', 'Karachi', 'Saddar', false),
('city-khi', 'Karachi', 'Federal B Area', false),
('city-khi', 'Karachi', 'Navy Housing Scheme', true),
('city-khi', 'Karachi', 'Civil Lines & Bath Island', true);

-- SEED RAWALPINDI AREAS
INSERT INTO public.city_areas (city_id, city_name, area_name, popular_society) VALUES
('city-rwp', 'Rawalpindi', 'Bahria Town Phase 1-8', true),
('city-rwp', 'Rawalpindi', 'Chaklala Scheme 1-3', true),
('city-rwp', 'Rawalpindi', 'Saddar Rawalpindi', false),
('city-rwp', 'Rawalpindi', 'Askari 1-14', true),
('city-rwp', 'Rawalpindi', 'Westridge 1-3', true),
('city-rwp', 'Rawalpindi', 'Gulraiz Housing Scheme', true),
('city-rwp', 'Rawalpindi', 'PWD Housing Society', true),
('city-rwp', 'Rawalpindi', 'Media Town', true),
('city-rwp', 'Rawalpindi', 'Adiala Road', false),
('city-rwp', 'Rawalpindi', 'High Court Road', false);

-- SEED PESHAWAR & OTHER MAJOR CITIES AREAS
INSERT INTO public.city_areas (city_id, city_name, area_name, popular_society) VALUES
('city-pew', 'Peshawar', 'Hayatabad Phase 1-7', true),
('city-pew', 'Peshawar', 'University Town', true),
('city-pew', 'Peshawar', 'DHA Peshawar', true),
('city-pew', 'Peshawar', 'Regi Model Town', true),
('city-pew', 'Peshawar', 'Warsak Road', false),
('city-fsd', 'Faisalabad', 'Canal Road / Canal Express', true),
('city-fsd', 'Faisalabad', 'Kohinoor City', true),
('city-fsd', 'Faisalabad', 'People''s Colony 1-2', true),
('city-fsd', 'Faisalabad', 'Madina Town', true),
('city-fsd', 'Faisalabad', 'FDA City', true),
('city-mux', 'Multan', 'DHA Multan', true),
('city-mux', 'Multan', 'Royal Orchard Multan', true),
('city-mux', 'Multan', 'Gulgasht Colony', true),
('city-mux', 'Multan', 'Wapda Town Multan', true),
('city-qta', 'Quetta', 'Chiltan Housing Scheme', true),
('city-qta', 'Quetta', 'Jinnah Town', true),
('city-qta', 'Quetta', 'Samungli Road', false),
('city-grw', 'Gujranwala', 'Citi Housing Scheme', true),
('city-grw', 'Gujranwala', 'Master City', true),
('city-grw', 'Gujranwala', 'DC Colony', true),
('city-skt', 'Sialkot', 'Citi Housing Sialkot', true),
('city-skt', 'Sialkot', 'Cantt Area Sialkot', true),
('city-hyd', 'Hyderabad', 'Latifabad Unit 1-12', true),
('city-hyd', 'Hyderabad', 'Qasimabad', true),
('city-atd', 'Abbottabad', 'Jinnahabad & Mandian', true),
('city-atd', 'Abbottabad', 'Pine City Abbottabad', true),
('city-bhv', 'Bahawalpur', 'DHA Bahawalpur', true),
('city-gwd', 'Gwadar', 'Sangar Housing Scheme', true),
('city-gwd', 'Gwadar', 'Marine Drive', true),
('city-mpr', 'Mirpur (AK)', 'Sector F-1 to F-4', true),
('city-mpr', 'Mirpur (AK)', 'New City Mirpur', true);
