import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  return format(parsed, 'MMM dd, yyyy')
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  return format(parsed, 'MMM dd, yyyy HH:mm')
}

/**
 * Format as relative time (e.g., "2 hours ago")
 */
export function timeAgo(date: string | Date): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(parsed, { addSuffix: true })
}

/**
 * Get initials from full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Format price to INR
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

/**
 * Generate URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Get role color for badges
 */
export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    admin: 'bg-red-500',
    faculty: 'bg-blue-500',
    staff: 'bg-green-500',
    student: 'bg-purple-500',
  }
  return colors[role] || 'bg-gray-500'
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Check if date is in past
 */
export function isPast(date: string | Date): boolean {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  return parsed < new Date()
}

/**
 * Check if date is in future
 */
export function isFuture(date: string | Date): boolean {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  return parsed > new Date()
}
