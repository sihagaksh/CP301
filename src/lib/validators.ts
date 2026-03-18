import { z } from 'zod'

// Auth Validators
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['student', 'faculty', 'staff']),
  department: z.string().optional(),
  branch: z.string().optional(),
  batch: z.string().optional(),
  enrollment_number: z.string().optional(),
  employee_id: z.string().optional(),
  designation: z.string().optional(),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  avatar_url: z.string().url().optional(),
})

// Blog Validators
export const blogCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  slug: z.string().min(1).max(200),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  excerpt: z.string().max(500).optional(),
  category: z.string().optional(),
  featured_image_url: z.string().url().optional(),
})

export const blogUpdateSchema = blogCreateSchema.partial()

// Event Validators
export const eventCreateSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  event_date: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Event date must be in the future',
  }),
  event_time: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  event_type: z.string().optional(),
})

export const eventUpdateSchema = eventCreateSchema.partial()

// Marketplace Validators
export const marketplaceListingSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  category: z.string(),
  price: z.number().positive('Price must be greater than 0'),
  condition: z.enum(['like_new', 'good', 'fair', 'poor']),
  location: z.string().optional(),
})

export const marketplaceUpdateSchema = marketplaceListingSchema.partial()

// Lost & Found Validators
export const lostFoundItemSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  item_type: z.string(),
  status: z.enum(['lost', 'found', 'claimed']),
  location_found: z.string().optional(),
  date_lost_found: z.string(),
  reward_offered: z.string().optional(),
})

export const lostFoundUpdateSchema = lostFoundItemSchema.partial()

// Community Validators
export const communityCreateSchema = z.object({
  name: z.string().min(3).max(100),
  slug: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  is_public: z.boolean().default(true),
})

export const communityPostSchema = z.object({
  content: z.string().min(1).max(5000),
  image_url: z.string().url().optional(),
})

// Message Validators
export const messageSchema = z.object({
  content: z.string().min(1).max(5000),
  recipient_id: z.string().uuid(),
})

// Notice Validators
export const noticeCreateSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10),
  priority: z.enum(['low', 'medium', 'high']).default('low'),
})

export const noticeUpdateSchema = noticeCreateSchema.partial()

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type BlogCreateInput = z.infer<typeof blogCreateSchema>
export type BlogUpdateInput = z.infer<typeof blogUpdateSchema>
export type EventCreateInput = z.infer<typeof eventCreateSchema>
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>
export type MarketplaceListingInput = z.infer<typeof marketplaceListingSchema>
export type MarketplaceUpdateInput = z.infer<typeof marketplaceUpdateSchema>
export type LostFoundItemInput = z.infer<typeof lostFoundItemSchema>
export type LostFoundUpdateInput = z.infer<typeof lostFoundUpdateSchema>
export type CommunityCreateInput = z.infer<typeof communityCreateSchema>
export type CommunityPostInput = z.infer<typeof communityPostSchema>
export type MessageInput = z.infer<typeof messageSchema>
export type NoticeCreateInput = z.infer<typeof noticeCreateSchema>
export type NoticeUpdateInput = z.infer<typeof noticeUpdateSchema>
