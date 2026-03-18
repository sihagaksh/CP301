import { createServerClient } from '@/lib/supabase/server'
import { createBrowserClient } from '@/lib/supabase/browser'
import type { User, Event, Notice, PaginatedResponse } from '@/lib/types'

export async function getAdminStats() {
  try {
    const supabase = await createServerClient()
    const [
      { count: totalUsers },
      { count: totalEvents },
      { count: unapprovedEvents },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('is_approved', false),
    ])
    return {
      totalUsers: totalUsers || 0,
      totalEvents: totalEvents || 0,
      unapprovedEvents: unapprovedEvents || 0,
    }
  } catch (error) {
    return { totalUsers: 0, totalEvents: 0, unapprovedEvents: 0 }
  }
}

// ==================== SERVER QUERIES ====================

/**
 * List all admin users with pagination, role filtering, and search
 */
export async function listAdminUsers(options: {
  page?: number
  limit?: number
  role?: string
  search?: string
} = {}): Promise<PaginatedResponse<User>> {
  const { page = 1, limit = 20, role, search } = options
  const offset = (page - 1) * limit

  try {
    const supabase = await createServerClient()
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('full_name', { ascending: true })

    if (role) {
      query = query.eq('role', role)
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching admin users:', error)
      return { data: [], count: 0, page, limit, total_pages: 0 }
    }

    const total_pages = count ? Math.ceil(count / limit) : 0
    return { data: (data as User[]) || [], count: count || 0, page, limit, total_pages }
  } catch (error) {
    console.error('Unexpected error listing admin users:', error)
    return { data: [], count: 0, page, limit, total_pages: 0 }
  }
}

/**
 * List unapproved events with organizer information
 */
export async function listUnapprovedEvents(options: {
  page?: number
  limit?: number
} = {}): Promise<PaginatedResponse<Event & { creator?: User }>> {
  const { page = 1, limit = 20 } = options
  const offset = (page - 1) * limit

  try {
    const supabase = await createServerClient()
    const { data, error, count } = await supabase
      .from('events')
      .select('*, creator:users!events_created_by_fkey(id, full_name, email, avatar_url, department)', {
        count: 'exact',
      })
      .eq('is_approved', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching unapproved events:', error)
      return { data: [], count: 0, page, limit, total_pages: 0 }
    }

    const total_pages = count ? Math.ceil(count / limit) : 0
    return { data: (data as (Event & { creator?: User })[]) || [], count: count || 0, page, limit, total_pages }
  } catch (error) {
    console.error('Unexpected error listing unapproved events:', error)
    return { data: [], count: 0, page, limit, total_pages: 0 }
  }
}

/**
 * Get a single event for review/approval
 */
export async function getEventForReview(eventId: string): Promise<Event & { creator?: User } | null> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('events')
      .select(
        `*,
        creator:users!events_created_by_fkey(id, full_name, email, avatar_url, department, role)`
      )
      .eq('id', eventId)
      .single()

    if (error) {
      console.error('Error fetching event for review:', error)
      return null
    }

    return (data as Event & { creator?: User }) || null
  } catch (error) {
    console.error('Unexpected error getting event for review:', error)
    return null
  }
}

/**
 * List all notices with pagination
 */
export async function listNotices(options: {
  page?: number
  limit?: number
} = {}): Promise<PaginatedResponse<Notice & { author?: User }>> {
  const { page = 1, limit = 20 } = options
  const offset = (page - 1) * limit

  try {
    const supabase = await createServerClient()
    const { data, error, count } = await supabase
      .from('notices')
      .select('*, author:users!notices_author_id_fkey(id, full_name, avatar_url)', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching notices:', error)
      return { data: [], count: 0, page, limit, total_pages: 0 }
    }

    const total_pages = count ? Math.ceil(count / limit) : 0
    return { data: (data as (Notice & { author?: User })[]) || [], count: count || 0, page, limit, total_pages }
  } catch (error) {
    console.error('Unexpected error listing notices:', error)
    return { data: [], count: 0, page, limit, total_pages: 0 }
  }
}

// ==================== CLIENT MUTATIONS ====================

/**
 * Approve an event (set is_approved to true)
 */
export async function approveEvent(eventId: string): Promise<Event> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('events')
    .update({ is_approved: true, updated_at: new Date().toISOString() })
    .eq('id', eventId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to approve event: ${error.message}`)
  }

  return data as Event
}

/**
 * Reject an event (delete it)
 */
export async function rejectEvent(eventId: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase.from('events').delete().eq('id', eventId)

  if (error) {
    throw new Error(`Failed to reject event: ${error.message}`)
  }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: 'student' | 'faculty' | 'staff' | 'admin'): Promise<User> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update user role: ${error.message}`)
  }

  return data as User
}

/**
 * Suspend a user (set is_active to false)
 */
export async function suspendUser(userId: string): Promise<User> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to suspend user: ${error.message}`)
  }

  return data as User
}

/**
 * Unsuspend a user (set is_active to true)
 */
export async function unsuspendUser(userId: string): Promise<User> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to unsuspend user: ${error.message}`)
  }

  return data as User
}

/**
 * Create a new notice/announcement
 */
export async function createNotice(data: {
  title: string
  content: string
  priority: 'low' | 'medium' | 'high'
  author_id: string
}): Promise<Notice> {
  const supabase = createBrowserClient()

  const { data: notice, error } = await supabase
    .from('notices')
    .insert([
      {
        title: data.title,
        content: data.content,
        priority: data.priority,
        author_id: data.author_id,
        is_published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create notice: ${error.message}`)
  }

  return notice as Notice
}

/**
 * Publish a notice
 */
export async function publishNotice(noticeId: string): Promise<Notice> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('notices')
    .update({ is_published: true, published_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', noticeId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to publish notice: ${error.message}`)
  }

  return data as Notice
}

/**
 * Delete a notice
 */
export async function deleteNotice(noticeId: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase.from('notices').delete().eq('id', noticeId)

  if (error) {
    throw new Error(`Failed to delete notice: ${error.message}`)
  }
}
