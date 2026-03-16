-- =====================================================
-- INSTITUTE COMMUNITY APP - COMPLETE DATABASE SCHEMA
-- IIT Ropar Community Platform (dep-anti)
-- =====================================================
-- DROP ORDER FIRST, THEN DEFINITIONS
-- No RLS - all policies disabled
-- Run directly on Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PHASE 1: DROP EVERYTHING (reverse dependency order)
-- =====================================================

-- Drop views first
DROP VIEW IF EXISTS active_marketplace_items CASCADE;
DROP VIEW IF EXISTS upcoming_events CASCADE;
DROP VIEW IF EXISTS active_lost_items CASCADE;
DROP VIEW IF EXISTS recent_blog_posts CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
DROP TRIGGER IF EXISTS update_marketplace_items_updated_at ON marketplace_items;
DROP TRIGGER IF EXISTS update_lost_found_items_updated_at ON lost_found_items;
DROP TRIGGER IF EXISTS update_communities_updated_at ON communities;
DROP TRIGGER IF EXISTS update_notices_updated_at ON notices;
DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
DROP TRIGGER IF EXISTS update_quick_links_updated_at ON quick_links;
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
DROP TRIGGER IF EXISTS blog_likes_insert ON blog_likes;
DROP TRIGGER IF EXISTS blog_likes_delete ON blog_likes;
DROP TRIGGER IF EXISTS community_members_insert ON community_members;
DROP TRIGGER IF EXISTS community_members_delete ON community_members;
DROP TRIGGER IF EXISTS event_interested_insert ON event_interested;
DROP TRIGGER IF EXISTS event_interested_delete ON event_interested;
DROP TRIGGER IF EXISTS marketplace_favorites_insert ON marketplace_favorites;
DROP TRIGGER IF EXISTS marketplace_favorites_delete ON marketplace_favorites;
DROP TRIGGER IF EXISTS blog_posts_search_update ON blog_posts;
DROP TRIGGER IF EXISTS marketplace_items_search_update ON marketplace_items;
DROP TRIGGER IF EXISTS feed_likes_insert ON feed_likes;
DROP TRIGGER IF EXISTS feed_likes_delete ON feed_likes;
DROP TRIGGER IF EXISTS org_members_insert ON org_members;
DROP TRIGGER IF EXISTS org_members_delete ON org_members;

-- Drop trigger functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS increment_counter() CASCADE;
DROP FUNCTION IF EXISTS decrement_counter() CASCADE;
DROP FUNCTION IF EXISTS blog_posts_search_trigger() CASCADE;
DROP FUNCTION IF EXISTS marketplace_items_search_trigger() CASCADE;

-- Drop tables (reverse dependency order - children first, parents last)
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS feed_likes CASCADE;
DROP TABLE IF EXISTS feed_posts CASCADE;
DROP TABLE IF EXISTS quick_links CASCADE;
DROP TABLE IF EXISTS org_members CASCADE;
DROP TABLE IF EXISTS user_positions CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS event_interested CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS navigation_routes CASCADE;
DROP TABLE IF EXISTS points_of_interest CASCADE;
DROP TABLE IF EXISTS indoor_maps CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS notice_views CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS community_post_comments CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS community_members CASCADE;
DROP TABLE IF EXISTS communities CASCADE;
DROP TABLE IF EXISTS lost_found_claims CASCADE;
DROP TABLE IF EXISTS lost_found_items CASCADE;
DROP TABLE IF EXISTS marketplace_favorites CASCADE;
DROP TABLE IF EXISTS marketplace_inquiries CASCADE;
DROP TABLE IF EXISTS marketplace_items CASCADE;
DROP TABLE IF EXISTS blog_likes CASCADE;
DROP TABLE IF EXISTS blog_comments CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop enums
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS blog_category CASCADE;
DROP TYPE IF EXISTS content_status CASCADE;
DROP TYPE IF EXISTS item_condition CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS lost_found_status CASCADE;
DROP TYPE IF EXISTS notice_priority CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;
DROP TYPE IF EXISTS location_type CASCADE;
DROP TYPE IF EXISTS org_type CASCADE;
DROP TYPE IF EXISTS por_type CASCADE;
DROP TYPE IF EXISTS org_member_status CASCADE;

-- =====================================================
-- PHASE 2: EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PHASE 3: ENUM DEFINITIONS
-- =====================================================

CREATE TYPE user_role AS ENUM (
    'student', 'faculty', 'staff', 'alumni', 'guest'
);

CREATE TYPE user_status AS ENUM (
    'active', 'inactive', 'suspended', 'archived'
);

CREATE TYPE blog_category AS ENUM (
    'placement', 'internship', 'faculty_insight', 'alumni_experience', 'research', 'general'
);

CREATE TYPE content_status AS ENUM (
    'draft', 'published', 'archived', 'flagged'
);

CREATE TYPE item_condition AS ENUM (
    'new', 'like_new', 'good', 'fair', 'poor'
);

CREATE TYPE transaction_status AS ENUM (
    'available', 'reserved', 'sold', 'cancelled'
);

CREATE TYPE lost_found_status AS ENUM (
    'lost', 'found', 'claimed', 'returned'
);

CREATE TYPE notice_priority AS ENUM (
    'low', 'medium', 'high', 'urgent'
);

CREATE TYPE event_type AS ENUM (
    'ismp', 'workshop', 'seminar', 'competition', 'cultural',
    'sports', 'esports', 'literary', 'club_activity', 'fest', 'general'
);

CREATE TYPE location_type AS ENUM (
    'academic', 'hostel', 'administrative', 'recreational',
    'mess', 'medical', 'sports', 'other'
);

CREATE TYPE org_type AS ENUM (
    'gymkhana', 'board', 'club', 'society', 'committee', 'cell', 'department', 'fest_committee'
);

CREATE TYPE por_type AS ENUM (
    'president', 'general_secretary', 'secretary', 'representative',
    'mentor', 'coordinator', 'convenor', 'faculty_advisor', 'custom'
);

CREATE TYPE org_member_status AS ENUM (
    'pending', 'approved', 'removed'
);

-- =====================================================
-- PHASE 4: TABLE DEFINITIONS
-- =====================================================

-- =====================================================
-- USERS (§21.1 of SRS)
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    status user_status DEFAULT 'active',

    -- Profile information
    profile_picture_url TEXT,
    phone_number VARCHAR(20),
    bio TEXT,
    linkedin_url TEXT,

    -- Student fields
    enrollment_number VARCHAR(50),
    department VARCHAR(100),
    branch VARCHAR(150),
    batch VARCHAR(20),

    -- Faculty/Staff fields
    employee_id VARCHAR(50),
    designation VARCHAR(100),

    -- Alumni fields
    current_organization VARCHAR(255),
    current_position VARCHAR(255),

    -- Guest fields
    guest_purpose VARCHAR(255),
    guest_valid_until TIMESTAMPTZ,

    -- Admin flag
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,

    -- Settings
    notification_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_batch ON users(batch);

-- =====================================================
-- ORGANIZATIONS (§21.2 - replaces old clubs table)
-- Gymkhana > Boards > Clubs, Societies, Fest Committees
-- =====================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    type org_type NOT NULL,
    parent_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    description TEXT,
    logo_url TEXT,
    email VARCHAR(255),
    social_links JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    founded_year INTEGER,
    category VARCHAR(100),
    cover_image_url TEXT,
    member_count INTEGER DEFAULT 0,
    event_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_parent ON organizations(parent_id);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

-- =====================================================
-- ORG_MEMBERS (§21.3 - club/board membership)
-- =====================================================

CREATE TABLE org_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status org_member_status DEFAULT 'pending',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

CREATE INDEX idx_org_members_org ON org_members(org_id);
CREATE INDEX idx_org_members_user ON org_members(user_id);
CREATE INDEX idx_org_members_status ON org_members(status);

-- =====================================================
-- USER_POSITIONS (§21.4 - POR tracking)
-- =====================================================

CREATE TABLE user_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    por_type por_type NOT NULL DEFAULT 'custom',
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_positions_user ON user_positions(user_id);
CREATE INDEX idx_user_positions_org ON user_positions(org_id);
CREATE INDEX idx_user_positions_active ON user_positions(is_active);

-- =====================================================
-- BLOG POSTS (§21.5)
-- =====================================================

CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    posting_identity_id UUID REFERENCES user_positions(id) ON DELETE SET NULL,

    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image_url TEXT,

    category blog_category NOT NULL,
    tags TEXT[],

    company_name VARCHAR(255),
    role_applied VARCHAR(255),
    interview_round VARCHAR(100),

    status content_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    allow_comments BOOLEAN DEFAULT TRUE,

    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,

    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX idx_blog_posts_identity ON blog_posts(posting_identity_id);

-- Blog Comments
CREATE TABLE blog_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_comments_post ON blog_comments(blog_post_id);
CREATE INDEX idx_blog_comments_user ON blog_comments(user_id);

-- Blog Likes
CREATE TABLE blog_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blog_post_id, user_id)
);

CREATE INDEX idx_blog_likes_post ON blog_likes(blog_post_id);
CREATE INDEX idx_blog_likes_user ON blog_likes(user_id);

-- =====================================================
-- MARKETPLACE (§21.6)
-- =====================================================

CREATE TABLE marketplace_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    is_negotiable BOOLEAN DEFAULT TRUE,
    condition item_condition NOT NULL,
    status transaction_status DEFAULT 'available',
    images TEXT[],
    pickup_location VARCHAR(255),

    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_marketplace_items_seller ON marketplace_items(seller_id);
CREATE INDEX idx_marketplace_items_category ON marketplace_items(category);
CREATE INDEX idx_marketplace_items_status ON marketplace_items(status);
CREATE INDEX idx_marketplace_items_price ON marketplace_items(price);

-- Marketplace Inquiries
CREATE TABLE marketplace_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    offered_price DECIMAL(10, 2),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketplace_inquiries_item ON marketplace_inquiries(item_id);
CREATE INDEX idx_marketplace_inquiries_buyer ON marketplace_inquiries(buyer_id);
CREATE INDEX idx_marketplace_inquiries_seller ON marketplace_inquiries(seller_id);

-- Marketplace Favorites
CREATE TABLE marketplace_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, user_id)
);

CREATE INDEX idx_marketplace_favorites_item ON marketplace_favorites(item_id);
CREATE INDEX idx_marketplace_favorites_user ON marketplace_favorites(user_id);

-- =====================================================
-- LOST & FOUND (§21.12)
-- =====================================================

CREATE TABLE lost_found_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    claimer_id UUID REFERENCES users(id) ON DELETE SET NULL,

    item_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    status lost_found_status NOT NULL,
    location_lost_found VARCHAR(255) NOT NULL,
    date_lost_found DATE NOT NULL,
    time_lost_found TIME,
    contact_info VARCHAR(255),
    images TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    claimed_at TIMESTAMPTZ,
    returned_at TIMESTAMPTZ
);

CREATE INDEX idx_lost_found_items_reporter ON lost_found_items(reporter_id);
CREATE INDEX idx_lost_found_items_status ON lost_found_items(status);
CREATE INDEX idx_lost_found_items_category ON lost_found_items(category);

-- Lost & Found Claims
CREATE TABLE lost_found_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES lost_found_items(id) ON DELETE CASCADE,
    claimer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    contact_info VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lost_found_claims_item ON lost_found_claims(item_id);
CREATE INDEX idx_lost_found_claims_claimer ON lost_found_claims(claimer_id);

-- =====================================================
-- COMMUNITIES (§21.8, §21.9)
-- =====================================================

CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    allow_posts BOOLEAN DEFAULT TRUE,
    member_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_communities_creator ON communities(creator_id);

-- Community Members
CREATE TABLE community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

CREATE INDEX idx_community_members_community ON community_members(community_id);
CREATE INDEX idx_community_members_user ON community_members(user_id);

-- Community Posts
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500),
    content TEXT NOT NULL,
    media_urls TEXT[],
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_community_posts_community ON community_posts(community_id);
CREATE INDEX idx_community_posts_author ON community_posts(author_id);

-- Community Post Comments
CREATE TABLE community_post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES community_post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_community_post_comments_post ON community_post_comments(post_id);
CREATE INDEX idx_community_post_comments_user ON community_post_comments(user_id);

-- =====================================================
-- NOTICES (§21.10)
-- =====================================================

CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    posted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    posting_identity_id UUID REFERENCES user_positions(id) ON DELETE SET NULL,

    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority notice_priority DEFAULT 'medium',
    tags TEXT[],

    target_roles user_role[],
    target_departments TEXT[],
    target_batches TEXT[],

    attachments TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,

    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notices_posted_by ON notices(posted_by);
CREATE INDEX idx_notices_category ON notices(category);
CREATE INDEX idx_notices_priority ON notices(priority);
CREATE INDEX idx_notices_is_active ON notices(is_active);
CREATE INDEX idx_notices_identity ON notices(posting_identity_id);

-- Notice Views
CREATE TABLE notice_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(notice_id, user_id)
);

CREATE INDEX idx_notice_views_notice ON notice_views(notice_id);
CREATE INDEX idx_notice_views_user ON notice_views(user_id);

-- =====================================================
-- LOCATIONS / CAMPUS MAP (§21.11)
-- =====================================================

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    type location_type NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL DEFAULT 0,
    longitude DECIMAL(11, 8) NOT NULL DEFAULT 0,
    images TEXT[],
    icon_url TEXT,
    floor_count INTEGER,
    has_indoor_map BOOLEAN DEFAULT FALSE,
    facilities TEXT[],
    is_accessible BOOLEAN DEFAULT TRUE,
    opening_time TIME,
    closing_time TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_locations_type ON locations(type);
CREATE INDEX idx_locations_code ON locations(code);

-- Indoor Maps
CREATE TABLE indoor_maps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    floor_number INTEGER NOT NULL,
    floor_name VARCHAR(100),
    map_image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(location_id, floor_number)
);

CREATE INDEX idx_indoor_maps_location ON indoor_maps(location_id);

-- Points of Interest
CREATE TABLE points_of_interest (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    indoor_map_id UUID REFERENCES indoor_maps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    floor_number INTEGER,
    room_number VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_poi_location ON points_of_interest(location_id);

-- Navigation Routes
CREATE TABLE navigation_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    to_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    distance_meters DECIMAL(10, 2),
    estimated_time_minutes INTEGER,
    path_coordinates JSONB,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(from_location_id, to_location_id)
);

CREATE INDEX idx_navigation_routes_from ON navigation_routes(from_location_id);
CREATE INDEX idx_navigation_routes_to ON navigation_routes(to_location_id);

-- =====================================================
-- EVENTS (§21.7)
-- =====================================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    posting_identity_id UUID REFERENCES user_positions(id) ON DELETE SET NULL,

    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    type event_type NOT NULL,

    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    registration_start TIMESTAMPTZ,
    registration_end TIMESTAMPTZ,

    location_id UUID REFERENCES locations(id),
    venue_name VARCHAR(255),
    venue_details TEXT,

    poster_url TEXT,
    images TEXT[],

    requires_registration BOOLEAN DEFAULT FALSE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    registration_fee DECIMAL(10, 2) DEFAULT 0,

    target_roles user_role[],
    target_departments TEXT[],
    target_batches TEXT[],

    registration_link TEXT,
    meeting_link TEXT,

    view_count INTEGER DEFAULT 0,
    interested_count INTEGER DEFAULT 0,

    is_published BOOLEAN DEFAULT TRUE,
    is_cancelled BOOLEAN DEFAULT FALSE,
    cancellation_reason TEXT,

    organizing_body VARCHAR(255),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_location ON events(location_id);
CREATE INDEX idx_events_identity ON events(posting_identity_id);

-- Event Registrations
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registration_data JSONB,
    payment_status VARCHAR(50) DEFAULT 'pending',
    attendance_status VARCHAR(50) DEFAULT 'registered',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);

-- Event Interested
CREATE TABLE event_interested (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_interested_event ON event_interested(event_id);
CREATE INDEX idx_event_interested_user ON event_interested(user_id);

-- =====================================================
-- QUICK LINKS (§21.14)
-- =====================================================

CREATE TABLE quick_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    icon_url TEXT,
    category VARCHAR(100) NOT NULL,
    target_roles user_role[],
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quick_links_category ON quick_links(category);
CREATE INDEX idx_quick_links_is_active ON quick_links(is_active);

-- =====================================================
-- FEED POSTS (§21.15)
-- =====================================================

CREATE TABLE feed_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    posting_identity_id UUID REFERENCES user_positions(id) ON DELETE SET NULL,

    content TEXT NOT NULL,
    media_urls TEXT[],
    source_type VARCHAR(50),
    source_id UUID,

    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,

    is_public BOOLEAN DEFAULT TRUE,
    target_roles user_role[],

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feed_posts_author ON feed_posts(author_id);
CREATE INDEX idx_feed_posts_source ON feed_posts(source_type, source_id);
CREATE INDEX idx_feed_posts_created ON feed_posts(created_at DESC);
CREATE INDEX idx_feed_posts_identity ON feed_posts(posting_identity_id);

-- Feed Likes
CREATE TABLE feed_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE INDEX idx_feed_likes_post ON feed_likes(post_id);
CREATE INDEX idx_feed_likes_user ON feed_likes(user_id);

-- =====================================================
-- NOTIFICATIONS (§21.16)
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =====================================================
-- MESSAGING (§21.13)
-- =====================================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_p1 ON conversations(participant1_id);
CREATE INDEX idx_conversations_p2 ON conversations(participant2_id);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- =====================================================
-- ANALYTICS & MODERATION
-- =====================================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    moderator_notes TEXT,
    action_taken VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_entity ON reports(entity_type, entity_id);
CREATE INDEX idx_reports_status ON reports(status);

CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted',
    priority VARCHAR(50) DEFAULT 'medium',
    admin_response TEXT,
    responded_by UUID REFERENCES users(id),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_user ON feedback(user_id);
CREATE INDEX idx_feedback_status ON feedback(status);

-- =====================================================
-- PHASE 5: TRIGGER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_counter()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'blog_likes' THEN
        UPDATE blog_posts SET like_count = like_count + 1 WHERE id = NEW.blog_post_id;
    END IF;
    IF TG_TABLE_NAME = 'community_members' THEN
        UPDATE communities SET member_count = member_count + 1 WHERE id = NEW.community_id;
    END IF;
    IF TG_TABLE_NAME = 'event_interested' THEN
        UPDATE events SET interested_count = interested_count + 1 WHERE id = NEW.event_id;
    END IF;
    IF TG_TABLE_NAME = 'marketplace_favorites' THEN
        UPDATE marketplace_items SET favorite_count = favorite_count + 1 WHERE id = NEW.item_id;
    END IF;
    IF TG_TABLE_NAME = 'feed_likes' THEN
        UPDATE feed_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    END IF;
    IF TG_TABLE_NAME = 'org_members' THEN
        UPDATE organizations SET member_count = member_count + 1 WHERE id = NEW.org_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_counter()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'blog_likes' THEN
        UPDATE blog_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.blog_post_id;
    END IF;
    IF TG_TABLE_NAME = 'community_members' THEN
        UPDATE communities SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.community_id;
    END IF;
    IF TG_TABLE_NAME = 'event_interested' THEN
        UPDATE events SET interested_count = GREATEST(interested_count - 1, 0) WHERE id = OLD.event_id;
    END IF;
    IF TG_TABLE_NAME = 'marketplace_favorites' THEN
        UPDATE marketplace_items SET favorite_count = GREATEST(favorite_count - 1, 0) WHERE id = OLD.item_id;
    END IF;
    IF TG_TABLE_NAME = 'feed_likes' THEN
        UPDATE feed_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    IF TG_TABLE_NAME = 'org_members' THEN
        UPDATE organizations SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.org_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PHASE 6: TRIGGERS
-- =====================================================

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_items_updated_at BEFORE UPDATE ON marketplace_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lost_found_items_updated_at BEFORE UPDATE ON lost_found_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quick_links_updated_at BEFORE UPDATE ON quick_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER blog_likes_insert AFTER INSERT ON blog_likes FOR EACH ROW EXECUTE FUNCTION increment_counter();
CREATE TRIGGER blog_likes_delete AFTER DELETE ON blog_likes FOR EACH ROW EXECUTE FUNCTION decrement_counter();
CREATE TRIGGER community_members_insert AFTER INSERT ON community_members FOR EACH ROW EXECUTE FUNCTION increment_counter();
CREATE TRIGGER community_members_delete AFTER DELETE ON community_members FOR EACH ROW EXECUTE FUNCTION decrement_counter();
CREATE TRIGGER event_interested_insert AFTER INSERT ON event_interested FOR EACH ROW EXECUTE FUNCTION increment_counter();
CREATE TRIGGER event_interested_delete AFTER DELETE ON event_interested FOR EACH ROW EXECUTE FUNCTION decrement_counter();
CREATE TRIGGER marketplace_favorites_insert AFTER INSERT ON marketplace_favorites FOR EACH ROW EXECUTE FUNCTION increment_counter();
CREATE TRIGGER marketplace_favorites_delete AFTER DELETE ON marketplace_favorites FOR EACH ROW EXECUTE FUNCTION decrement_counter();
CREATE TRIGGER feed_likes_insert AFTER INSERT ON feed_likes FOR EACH ROW EXECUTE FUNCTION increment_counter();
CREATE TRIGGER feed_likes_delete AFTER DELETE ON feed_likes FOR EACH ROW EXECUTE FUNCTION decrement_counter();
CREATE TRIGGER org_members_insert AFTER INSERT ON org_members FOR EACH ROW EXECUTE FUNCTION increment_counter();
CREATE TRIGGER org_members_delete AFTER DELETE ON org_members FOR EACH ROW EXECUTE FUNCTION decrement_counter();

-- =====================================================
-- PHASE 7: FULL TEXT SEARCH
-- =====================================================

ALTER TABLE blog_posts ADD COLUMN search_vector tsvector;
CREATE INDEX blog_posts_search_idx ON blog_posts USING GIN(search_vector);

CREATE OR REPLACE FUNCTION blog_posts_search_trigger()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_search_update
    BEFORE INSERT OR UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION blog_posts_search_trigger();

ALTER TABLE marketplace_items ADD COLUMN search_vector tsvector;
CREATE INDEX marketplace_items_search_idx ON marketplace_items USING GIN(search_vector);

CREATE OR REPLACE FUNCTION marketplace_items_search_trigger()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER marketplace_items_search_update
    BEFORE INSERT OR UPDATE ON marketplace_items
    FOR EACH ROW EXECUTE FUNCTION marketplace_items_search_trigger();

-- =====================================================
-- PHASE 8: VIEWS
-- =====================================================

CREATE VIEW active_marketplace_items AS
SELECT mi.*, u.full_name as seller_name, u.phone_number as seller_phone, u.email as seller_email
FROM marketplace_items mi
JOIN users u ON mi.seller_id = u.id
WHERE mi.status = 'available' AND (mi.expires_at IS NULL OR mi.expires_at > NOW());

CREATE VIEW upcoming_events AS
SELECT e.*, u.full_name as organizer_name, l.name as location_name, l.code as location_code
FROM events e
JOIN users u ON e.organizer_id = u.id
LEFT JOIN locations l ON e.location_id = l.id
WHERE e.is_published = TRUE AND e.is_cancelled = FALSE AND e.start_time > NOW()
ORDER BY e.start_time;

CREATE VIEW active_lost_items AS
SELECT lfi.*, u.full_name as reporter_name, u.phone_number as reporter_phone
FROM lost_found_items lfi
JOIN users u ON lfi.reporter_id = u.id
WHERE lfi.status IN ('lost', 'found')
ORDER BY lfi.created_at DESC;

CREATE VIEW recent_blog_posts AS
SELECT bp.*, u.full_name as author_name, u.role as author_role, u.profile_picture_url as author_avatar
FROM blog_posts bp
JOIN users u ON bp.author_id = u.id
WHERE bp.status = 'published'
ORDER BY bp.published_at DESC;

-- =====================================================
-- PHASE 9: DISABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE org_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE lost_found_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE lost_found_claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE communities DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE notice_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE indoor_maps DISABLE ROW LEVEL SECURITY;
ALTER TABLE points_of_interest DISABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_interested DISABLE ROW LEVEL SECURITY;
ALTER TABLE quick_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE feed_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE feed_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
