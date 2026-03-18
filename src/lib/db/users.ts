import { createServerClient } from '@/lib/supabase/server'
import { createBrowserClient } from '@/lib/supabase/browser'
import type { Profile } from '@/lib/types'

// ==================== SERVER QUERIES (Use in pages) ====================

/**
 * List all users with pagination and search
 */
export async function listUsers(options: {
  page?: number
  limit?: number
  search?: string
  department?: string
} = {}) {
  const { page = 1, limit = 24, search, department } = options

  try {
    const supabase = await createServerClient()
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('full_name', { ascending: true })

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,bio.ilike.%${search}%,interests.cs.{${search}}`
      )
    }

    if (department) {
      query = query.eq('department', department)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Error listing users:', error)
      return { data: [], count: 0, page, limit, total_pages: 0 }
    }

    const total_pages = count ? Math.ceil(count / limit) : 0

    return { data: data || [], count: count || 0, page, limit, total_pages }
  } catch (error) {
    console.error('Unexpected error listing users:', error)
    return { data: [], count: 0, page, limit, total_pages: 0 }
  }
}

/**
 * Get a user profile by ID
 */
export async function getUserProfile(userId: string) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error)
    return null
  }
}

/**
 * Get current user's profile (authenticated)
 */
export async function getCurrentUserProfile() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching current user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching current user profile:', error)
    return null
  }
}

/**
 * Search users by keyword
 */
export async function searchUsers(keyword: string, limit: number = 20) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`full_name.ilike.%${keyword}%,bio.ilike.%${keyword}%`)
      .order('full_name', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error searching users:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error searching users:', error)
    return []
  }
}

/**
 * Get users by department
 */
export async function getUsersByDepartment(department: string) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('department', department)
      .order('full_name', { ascending: true })

    if (error) {
      console.error('Error fetching users by department:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error fetching users by department:', error)
    return []
  }
}

// ==================== CLIENT MUTATIONS (Use in components) ====================

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: {
    full_name?: string
    bio?: string
    avatar_url?: string
    department?: string
    year?: string
    interests?: string[]
  }
): Promise<Profile> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  return data
}

/**
 * Update avatar URL
 */
export async function updateAvatar(userId: string, avatarUrl: string): Promise<Profile> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update avatar: ${error.message}`)
  }

  return data
}

/**
 * Check if user is following another user
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle()

    if (error) {
      console.error('Error checking follow status:', error)
      return false
    }

    return data !== null
  } catch (error) {
    console.error('Unexpected error checking follow status:', error)
    return false
  }
}

/**
 * Follow a user
 */
export async function followUser(
  followerId: string,
  followingId: string
): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase.from('followers').insert([
    {
      follower_id: followerId,
      following_id: followingId,
    },
  ])

  if (error) {
    throw new Error(`Failed to follow user: ${error.message}`)
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)

  if (error) {
    throw new Error(`Failed to unfollow user: ${error.message}`)
  }
}

/**
 * Get follower count for a user
 */
export async function getFollowerCount(userId: string): Promise<number> {
  try {
    const supabase = await createServerClient()
    const { count, error } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)

    if (error) {
      console.error('Error getting follower count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Unexpected error getting follower count:', error)
    return 0
  }
}

/**
 * Get following count for a user
 */
export async function getFollowingCount(userId: string): Promise<number> {
  try {
    const supabase = await createServerClient()
    const { count, error } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

    if (error) {
      console.error('Error getting following count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Unexpected error getting following count:', error)
    return 0
  }
}
