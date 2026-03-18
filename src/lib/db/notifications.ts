import { createServerClient } from '@/lib/supabase/server'
import { createBrowserClient } from '@/lib/supabase/browser'
import type { Notification } from '@/lib/types'

// ==================== SERVER QUERIES (Use in pages) ====================

/**
 * List all notifications for a user with pagination
 */
export async function listNotifications(options: {
  userId: string
  page?: number
  limit?: number
  unreadOnly?: boolean
} = { userId: '' }) {
  const { userId, page = 1, limit = 20, unreadOnly = false } = options

  try {
    const supabase = await createServerClient()
    let query = supabase
      .from('notifications')
      .select(
        `
        *,
        actor:profiles!notifications_actor_id_fkey(id, full_name, avatar_url)
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Error listing notifications:', error)
      return { data: [], count: 0, page, limit, total_pages: 0 }
    }

    const total_pages = count ? Math.ceil(count / limit) : 0

    return { data: data || [], count: count || 0, page, limit, total_pages }
  } catch (error) {
    console.error('Unexpected error listing notifications:', error)
    return { data: [], count: 0, page, limit, total_pages: 0 }
  }
}

/**
 * Get a single notification by ID
 */
export async function getNotificationById(notificationId: string) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('notifications')
      .select(
        `
        *,
        actor:profiles!notifications_actor_id_fkey(id, full_name, avatar_url)
      `
      )
      .eq('id', notificationId)
      .single()

    if (error) {
      console.error('Error fetching notification:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching notification:', error)
    return null
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const supabase = await createServerClient()
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      console.error('Error getting unread notification count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Unexpected error getting unread notification count:', error)
    return 0
  }
}

/**
 * Get recent notifications for a user (for dashboard widget)
 */
export async function getRecentNotifications(userId: string, limit: number = 5) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('notifications')
      .select(
        `
        *,
        actor:profiles!notifications_actor_id_fkey(id, full_name, avatar_url)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent notifications:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error fetching recent notifications:', error)
    return []
  }
}

// ==================== CLIENT MUTATIONS (Use in components) ====================

/**
 * Create a new notification
 */
export async function createNotification(notification: {
  user_id: string
  actor_id?: string
  type: string
  title: string
  message: string
  link?: string
}): Promise<Notification> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('notifications')
    .insert([
      {
        ...notification,
        read: false,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`)
  }

  return data
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`)
  }

  return data
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    throw new Error(`Failed to mark all notifications as read: ${error.message}`)
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase.from('notifications').delete().eq('id', notificationId)

  if (error) {
    throw new Error(`Failed to delete notification: ${error.message}`)
  }
}

/**
 * Delete all read notifications for a user
 */
export async function deleteAllReadNotifications(userId: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId)
    .eq('read', true)

  if (error) {
    throw new Error(`Failed to delete read notifications: ${error.message}`)
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Helper to create notification for new follower
 */
export async function notifyNewFollower(userId: string, followerId: string): Promise<void> {
  try {
    await createNotification({
      user_id: userId,
      actor_id: followerId,
      type: 'follow',
      title: 'New Follower',
      message: 'started following you',
      link: `/users/${followerId}`,
    })
  } catch (error) {
    console.error('Failed to create follower notification:', error)
  }
}

/**
 * Helper to create notification for new message
 */
export async function notifyNewMessage(userId: string, senderId: string): Promise<void> {
  try {
    await createNotification({
      user_id: userId,
      actor_id: senderId,
      type: 'message',
      title: 'New Message',
      message: 'sent you a message',
      link: `/messages/${senderId}`,
    })
  } catch (error) {
    console.error('Failed to create message notification:', error)
  }
}
