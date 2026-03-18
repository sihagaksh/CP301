// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  STAFF: 'staff',
  ADMIN: 'admin',
} as const

// Item Conditions
export const ITEM_CONDITIONS = {
  LIKE_NEW: 'like_new',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
} as const

// Event Types
export const EVENT_TYPES = {
  WORKSHOP: 'workshop',
  SEMINAR: 'seminar',
  CONFERENCE: 'conference',
  SPORTS: 'sports',
  CULTURAL: 'cultural',
  ACADEMIC: 'academic',
  SOCIAL: 'social',
  OTHER: 'other',
} as const

// Marketplace Categories
export const MARKETPLACE_CATEGORIES = {
  BOOKS: 'books',
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  FURNITURE: 'furniture',
  SPORTS: 'sports',
  NOTES: 'notes',
  OTHERS: 'others',
} as const

// Notification Types
export const NOTIFICATION_TYPES = {
  EVENT: 'event',
  MESSAGE: 'message',
  ACTIVITY: 'activity',
  SYSTEM: 'system',
  BLOG: 'blog',
} as const

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

// Organization Types
export const ORGANIZATION_TYPES = {
  CLUB: 'club',
  DEPARTMENT: 'department',
  HOSTEL: 'hostel',
  ACADEMIC: 'academic',
} as const

// Lost & Found Status
export const LOSTNFOUND_STATUS = {
  LOST: 'lost',
  FOUND: 'found',
  CLAIMED: 'claimed',
} as const

// Pagination
export const PAGINATION_SIZE = 20
export const PAGINATION_SIZES = [10, 20, 50, 100]

// Date Formats
export const DATE_FORMAT = 'MMM dd, yyyy'
export const DATE_TIME_FORMAT = 'MMM dd, yyyy HH:mm'

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_MESSAGING: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_PWA: true,
  ENABLE_ANALYTICS: true,
  ENABLE_ADMIN_PANEL: true,
} as const

// Public Routes (don't require authentication)
export const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/reset-password',
  '/api/auth/callback',
]

// Admin Routes (require admin role)
export const ADMIN_ROUTES = ['/admin']

// Re-exports as types
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]
export type ItemCondition = (typeof ITEM_CONDITIONS)[keyof typeof ITEM_CONDITIONS]
export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES]
export type MarketplaceCategory = (typeof MARKETPLACE_CATEGORIES)[keyof typeof MARKETPLACE_CATEGORIES]
export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]
export type PriorityLevel = (typeof PRIORITY_LEVELS)[keyof typeof PRIORITY_LEVELS]
export type OrganizationType = (typeof ORGANIZATION_TYPES)[keyof typeof ORGANIZATION_TYPES]
export type LostNFoundStatus = (typeof LOSTNFOUND_STATUS)[keyof typeof LOSTNFOUND_STATUS]
