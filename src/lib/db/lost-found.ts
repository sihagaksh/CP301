import { createServerClient } from '@/lib/supabase/server'
import { createBrowserClient } from '@/lib/supabase/browser'
import type { LostFoundItem } from '@/lib/types'
import type { LostFoundItemInput, LostFoundUpdateInput } from '@/lib/validators'

// ==================== SERVER QUERIES (Use in pages) ====================

/**
 * List lost and found items with pagination and filtering
 */
export async function listLostFoundItems(options: {
  page?: number
  limit?: number
  status?: 'lost' | 'found' | 'claimed'
  category?: string
  search?: string
} = {}) {
  const { page = 1, limit = 20, status, category, search } = options

  try {
    const supabase = await createServerClient()
    let query = supabase
      .from('lost_found_items')
      .select(
        `
        *,
        reporter:profiles!lost_found_items_reported_by_fkey(
          id,
          full_name,
          avatar_url
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(
        `item_name.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`
      )
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Error listing lost/found items:', error)
      return { data: [], count: 0, page, limit, total_pages: 0 }
    }

    const total_pages = count ? Math.ceil(count / limit) : 0

    return { data: data || [], count: count || 0, page, limit, total_pages }
  } catch (error) {
    console.error('Unexpected error listing lost/found items:', error)
    return { data: [], count: 0, page, limit, total_pages: 0 }
  }
}

/**
 * Get a single lost/found item by ID with reporter info
 */
export async function getLostFoundItemById(id: string) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('lost_found_items')
      .select(
        `
        *,
        reporter:profiles!lost_found_items_reported_by_fkey(
          id,
          full_name,
          avatar_url,
          email
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching lost/found item:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching lost/found item:', error)
    return null
  }
}

/**
 * Get items by a specific user (reporter)
 */
export async function getItemsByUser(userId: string, status?: string) {
  try {
    const supabase = await createServerClient()
    let query = supabase
      .from('lost_found_items')
      .select('*')
      .eq('reported_by', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching user items:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error fetching user items:', error)
    return []
  }
}

/**
 * Search lost/found items by keyword
 */
export async function searchLostFoundItems(keyword: string, limit: number = 20) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('lost_found_items')
      .select(
        `
        *,
        reporter:profiles!lost_found_items_reported_by_fkey(
          id,
          full_name,
          avatar_url
        )
      `
      )
      .neq('status', 'claimed')
      .or(`item_name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error searching lost/found items:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error searching lost/found items:', error)
    return []
  }
}

// ==================== CLIENT MUTATIONS (Use in components) ====================

/**
 * Report a lost or found item
 */
export async function reportLostFoundItem(
  item: LostFoundItemInput,
  userId: string
): Promise<LostFoundItem> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('lost_found_items')
    .insert([
      {
        ...item,
        reported_by: userId,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to report item: ${error.message}`)
  }

  return data
}

/**
 * Update a lost/found item
 */
export async function updateLostFoundItem(
  id: string,
  updates: LostFoundUpdateInput
): Promise<LostFoundItem> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('lost_found_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update item: ${error.message}`)
  }

  return data
}

/**
 * Delete a lost/found item
 */
export async function deleteLostFoundItem(id: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase.from('lost_found_items').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete item: ${error.message}`)
  }
}

/**
 * Mark an item as claimed
 */
export async function markAsClaimed(
  id: string,
  claimedByUserId: string
): Promise<LostFoundItem> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('lost_found_items')
    .update({
      status: 'claimed',
      claimed_by: claimedByUserId,
      claimed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to mark item as claimed: ${error.message}`)
  }

  return data
}

/**
 * Reopen an item (mark as lost or found again)
 */
export async function reopenItem(
  id: string,
  status: 'lost' | 'found'
): Promise<LostFoundItem> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('lost_found_items')
    .update({
      status,
      claimed_by: null,
      claimed_at: null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to reopen item: ${error.message}`)
  }

  return data
}
