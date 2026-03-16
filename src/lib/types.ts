// =====================================================
// TypeScript interfaces matching the database schema
// IIT Ropar Community Platform (dep-anti)
// =====================================================

export type UserRole = 'student' | 'faculty' | 'staff' | 'alumni' | 'guest'
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'archived'
export type BlogCategory = 'placement' | 'internship' | 'faculty_insight' | 'alumni_experience' | 'research' | 'general'
export type ContentStatus = 'draft' | 'published' | 'archived' | 'flagged'
export type ItemCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor'
export type TransactionStatus = 'available' | 'reserved' | 'sold' | 'cancelled'
export type LostFoundStatus = 'lost' | 'found' | 'returned'
export type NoticePriority = 'low' | 'medium' | 'high' | 'urgent'
export type EventType = 'ismp' | 'workshop' | 'seminar' | 'competition' | 'cultural' | 'sports' | 'esports' | 'literary' | 'club_activity' | 'fest' | 'general'
export type LocationType = 'academic' | 'hostel' | 'administrative' | 'recreational' | 'mess' | 'medical' | 'sports' | 'other'
export type OrgType = 'gymkhana' | 'board' | 'club' | 'society' | 'committee' | 'cell' | 'department' | 'fest_committee'
export type PorType = 'president' | 'general_secretary' | 'secretary' | 'representative' | 'mentor' | 'coordinator' | 'convenor' | 'faculty_advisor' | 'custom'
export type OrgMemberStatus = 'pending' | 'approved' | 'removed'

export interface User {
    id: string
    email: string
    full_name: string
    role: UserRole
    status: UserStatus
    profile_picture_url?: string
    phone_number?: string
    bio?: string
    linkedin_url?: string
    // Student fields
    enrollment_number?: string
    department?: string
    branch?: string
    batch?: string
    // Faculty/Staff fields
    employee_id?: string
    designation?: string
    // Alumni fields
    current_organization?: string
    current_position?: string
    // Guest fields
    guest_purpose?: string
    guest_valid_until?: string
    // Admin
    is_admin: boolean
    is_verified: boolean
    // Settings
    notification_preferences?: Record<string, unknown>
    privacy_settings?: Record<string, unknown>
    created_at: string
    updated_at: string
    last_login?: string
}

// =====================================================
// Organizations (Gymkhana hierarchy)
// =====================================================

export interface Organization {
    id: string
    name: string
    slug: string
    type: OrgType
    parent_id?: string
    description?: string
    logo_url?: string
    email?: string
    social_links?: Record<string, string>
    is_active: boolean
    founded_year?: number
    category?: string
    cover_image_url?: string
    member_count: number
    event_count: number
    created_at: string
    updated_at: string
    // Joined
    parent?: Organization
}

export interface OrgMember {
    id: string
    org_id: string
    user_id: string
    status: OrgMemberStatus
    joined_at: string
    // Joined
    user?: User
    organization?: Organization
}

export interface UserPosition {
    id: string
    user_id: string
    org_id: string
    title: string
    por_type: PorType
    valid_from: string
    valid_until?: string
    is_active: boolean
    created_at: string
    updated_at: string
    // Joined
    organization?: Organization
    user?: User
}

// =====================================================
// Posting Identity (for "Post as" dropdown)
// =====================================================

export interface PostingIdentity {
    id: string | null // null = base role
    label: string     // e.g. "Student" or "Secretary, Coding Club"
    org_name?: string
    org_slug?: string
}

// =====================================================
// Content Models
// =====================================================

export interface BlogPost {
    id: string
    author_id: string
    posting_identity_id?: string
    title: string
    slug: string
    content: string
    excerpt?: string
    featured_image_url?: string
    category: BlogCategory
    tags?: string[]
    company_name?: string
    role_applied?: string
    interview_round?: string
    status: ContentStatus
    is_featured: boolean
    allow_comments: boolean
    view_count: number
    like_count: number
    comment_count: number
    share_count: number
    published_at?: string
    created_at: string
    updated_at: string
    // Joined fields
    author?: User
    posting_identity?: UserPosition
}

export interface BlogComment {
    id: string
    blog_post_id: string
    user_id: string
    parent_comment_id?: string
    content: string
    is_edited: boolean
    is_flagged: boolean
    like_count: number
    created_at: string
    updated_at: string
    user?: User
}

export interface MarketplaceItem {
    id: string
    seller_id: string
    title: string
    description: string
    category: string
    price: number
    is_negotiable: boolean
    condition: ItemCondition
    status: TransactionStatus
    images?: string[]
    pickup_location?: string
    view_count: number
    favorite_count: number
    inquiry_count: number
    created_at: string
    updated_at: string
    expires_at?: string
    seller?: User
}

export interface LostFoundItem {
    id: string
    reporter_id: string
    claimer_id?: string
    item_name: string
    description: string
    category: string
    status: LostFoundStatus
    location_lost_found: string
    date_lost_found: string
    time_lost_found?: string
    contact_info?: string
    images?: string[]
    created_at: string
    updated_at: string
    claimed_at?: string
    returned_at?: string
    reporter?: User
}

export interface Community {
    id: string
    creator_id: string
    name: string
    slug: string
    description?: string
    icon_url?: string
    cover_image_url?: string
    is_public: boolean
    requires_approval: boolean
    allow_posts: boolean
    member_count: number
    post_count: number
    created_at: string
    updated_at: string
}

export interface CommunityPost {
    id: string
    community_id: string
    author_id: string
    title?: string
    content: string
    media_urls?: string[]
    like_count: number
    comment_count: number
    is_pinned: boolean
    is_flagged: boolean
    created_at: string
    updated_at: string
    author?: User
}

export interface Notice {
    id: string
    posted_by: string
    posting_identity_id?: string
    title: string
    content: string
    category: string
    priority: NoticePriority
    tags?: string[]
    target_roles?: UserRole[]
    target_departments?: string[]
    target_batches?: string[]
    attachments?: string[]
    is_active: boolean
    is_pinned: boolean
    view_count: number
    valid_from: string
    valid_until?: string
    created_at: string
    updated_at: string
    poster?: User
    posting_identity?: UserPosition
}

export interface Location {
    id: string
    name: string
    code?: string
    description?: string
    type: LocationType
    latitude: number
    longitude: number
    images?: string[]
    icon_url?: string
    floor_count?: number
    has_indoor_map: boolean
    facilities?: string[]
    is_accessible: boolean
    opening_time?: string
    closing_time?: string
    created_at: string
    updated_at: string
}

export interface Event {
    id: string
    organizer_id: string
    posting_identity_id?: string
    title: string
    slug: string
    description: string
    type: EventType
    start_time: string
    end_time: string
    registration_start?: string
    registration_end?: string
    location_id?: string
    venue_name?: string
    venue_details?: string
    poster_url?: string
    images?: string[]
    requires_registration: boolean
    max_participants?: number
    current_participants: number
    registration_fee: number
    target_roles?: UserRole[]
    target_departments?: string[]
    target_batches?: string[]
    registration_link?: string
    meeting_link?: string
    view_count: number
    interested_count: number
    is_published: boolean
    is_cancelled: boolean
    cancellation_reason?: string
    organizing_body?: string
    created_at: string
    updated_at: string
    organizer?: User
    location?: Location
    posting_identity?: UserPosition
}

export interface QuickLink {
    id: string
    created_by: string
    title: string
    description?: string
    url: string
    icon_url?: string
    category: string
    target_roles?: UserRole[]
    display_order: number
    is_featured: boolean
    is_active: boolean
    click_count: number
    created_at: string
    updated_at: string
}

export interface FeedPost {
    id: string
    author_id: string
    posting_identity_id?: string
    content: string
    media_urls?: string[]
    source_type?: string
    source_id?: string
    like_count: number
    comment_count: number
    share_count: number
    view_count: number
    is_public: boolean
    target_roles?: UserRole[]
    created_at: string
    updated_at: string
    author?: User
    posting_identity?: UserPosition
}

export interface Notification {
    id: string
    user_id: string
    title: string
    message: string
    type: string
    entity_type?: string
    entity_id?: string
    action_url?: string
    is_read: boolean
    read_at?: string
    created_at: string
}

export interface Feedback {
    id: string
    user_id?: string
    category: string
    title: string
    description: string
    status: string
    priority: string
    admin_response?: string
    created_at: string
}
