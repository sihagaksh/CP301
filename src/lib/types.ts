// User & Auth
export interface User {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: 'student' | 'faculty' | 'staff' | 'admin'
  department: string | null
  branch: string | null
  batch: string | null
  enrollment_number: string | null
  employee_id: string | null
  designation: string | null
  bio: string | null
  phone: string | null
  website: string | null
  notification_preferences: Record<string, boolean>
  privacy_settings: Record<string, boolean>
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface UserPosition {
  id: string
  user_id: string
  organization_id: string
  title: string
  is_active: boolean
  created_at: string
  organization?: Organization
}

// Organizations
export interface Organization {
  id: string
  name: string
  slug: string
  description: string | null
  category: 'academic' | 'technology' | 'hobby' | 'social' | 'professional' | 'sports' | 'cultural' | 'other'
  logo_url: string | null
  cover_url: string | null
  website_url: string | null
  contact_email: string | null
  member_count: number
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  creator?: User
}

// Blogs
export interface Blog {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  author_id: string | null
  category: string | null
  featured_image_url: string | null
  published_at: string | null
  view_count: number
  is_published: boolean
  created_at: string
  updated_at: string
  author?: User
}

// Events
export interface Event {
  id: string
  title: string
  description: string
  event_date: string
  event_time: string | null
  location: string | null
  latitude: number | null
  longitude: number | null
  capacity: number | null
  registered_count: number
  event_type: string | null
  created_by: string | null
  organization_id: string | null
  is_approved: boolean
  created_at: string
  updated_at: string
  creator?: User
}

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  registered_at: string
}

// Marketplace
export interface MarketplaceListing {
  id: string
  title: string
  description: string
  category: string
  price: number
  condition: 'like_new' | 'good' | 'fair' | 'poor'
  seller_id: string | null
  image_urls: string[]
  is_available: boolean
  location: string | null
  view_count: number
  created_at: string
  updated_at: string
  seller?: User
}

// Lost & Found
export interface LostFoundItem {
  id: string
  title: string
  description: string
  item_type: string
  status: 'lost' | 'found' | 'claimed'
  reporter_id: string | null
  location_found: string | null
  date_lost_found: string
  image_urls: string[]
  reward_offered: string | null
  is_resolved: boolean
  created_at: string
  updated_at: string
  reporter?: User
}

// Communities
export interface Community {
  id: string
  name: string
  slug: string
  description: string | null
  created_by: string | null
  member_count: number
  is_public: boolean
  created_at: string
  updated_at: string
  creator?: User
}

export interface CommunityPost {
  id: string
  community_id: string
  author_id: string | null
  content: string
  image_url: string | null
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
  author?: User
}

// Messages
export interface Message {
  id: string
  sender_id: string | null
  recipient_id: string | null
  content: string
  read: boolean
  read_at: string | null
  created_at: string
  sender?: User
  recipient?: User
}

// Notifications
export interface Notification {
  id: string
  user_id: string | null
  actor_id: string | null
  type: string
  title: string
  message: string
  related_id: string | null
  link: string | null
  read: boolean
  created_at: string
  user?: User
  actor?: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}

// Notices
export interface Notice {
  id: string
  title: string
  content: string
  author_id: string | null
  priority: 'low' | 'medium' | 'high'
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  author?: User
}

// Locations
export interface Location {
  id: string
  name: string
  type: string | null
  latitude: number | null
  longitude: number | null
  description: string | null
}

// Campus Locations (Extended)
export interface CampusLocation {
  id: string
  name: string
  description?: string
  location_type: 'building' | 'landmark' | 'facility' | 'outdoor' | 'parking' | 'entrance' | 'other'
  latitude: number
  longitude: number
  address?: string
  floor_number?: number
  room_number?: string
  capacity?: number
  amenities?: string[]
  operating_hours?: string
  contact_info?: string
  image_url?: string
  is_accessible: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// Request/Response Types
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  total_pages: number
}

export interface SignUpRequest {
  email: string
  password: string
  full_name: string
  role: 'student' | 'faculty' | 'staff'
  department?: string
  branch?: string
  batch?: string
  enrollment_number?: string
  employee_id?: string
  designation?: string
}

export interface SignInRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: User | null
  error: Error | null
}

// Posting Identity (for posting as different roles)
export interface PostingIdentity {
  id: string | null
  label: string
  org_name?: string
  org_slug?: string
}
