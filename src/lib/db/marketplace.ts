import { createServerClient } from '@/lib/supabase/server'
import { createBrowserClient } from '@/lib/supabase/browser'
import type { MarketplaceListing } from '@/lib/types'
import type {
  MarketplaceListingInput,
  MarketplaceUpdateInput,
} from '@/lib/validators'

// ==================== SERVER QUERIES (Use in pages) ====================

/**
 * List marketplace listings with pagination and filtering
 */
export async function listListings(options: {
  page?: number
  limit?: number
  category?: string
  condition?: string
  status?: 'available' | 'sold' | 'reserved'
  search?: string
} = {}) {
  const { page = 1, limit = 20, category, condition, status = 'available', search } = options

  try {
    const supabase = await createServerClient()
    let query = supabase
      .from('marketplace_listings')
      .select(
        `
        *,
        seller:profiles!marketplace_listings_created_by_fkey(
          id,
          full_name,
          avatar_url
        )
      `,
        { count: 'exact' }
      )
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (condition) {
      query = query.eq('condition', condition)
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`
      )
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Error listing marketplace listings:', error)
      return { data: [], count: 0, page, limit, total_pages: 0 }
    }

    const total_pages = count ? Math.ceil(count / limit) : 0

    return { data: data || [], count: count || 0, page, limit, total_pages }
  } catch (error) {
    console.error('Unexpected error listing marketplace listings:', error)
    return { data: [], count: 0, page, limit, total_pages: 0 }
  }
}

/**
 * Get a single marketplace listing by ID with seller info
 */
export async function getListingById(id: string) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select(
        `
        *,
        seller:profiles!marketplace_listings_created_by_fkey(
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
      console.error('Error fetching listing:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching listing:', error)
    return null
  }
}

/**
 * Get listings by a specific user (seller)
 */
export async function getListingsByUser(userId: string, status?: string) {
  try {
    const supabase = await createServerClient()
    let query = supabase
      .from('marketplace_listings')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching user listings:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error fetching user listings:', error)
    return []
  }
}

/**
 * Search marketplace listings by keyword
 */
export async function searchListings(keyword: string, limit: number = 20) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select(
        `
        *,
        seller:profiles!marketplace_listings_created_by_fkey(
          id,
          full_name,
          avatar_url
        )
      `
      )
      .eq('status', 'available')
      .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error searching listings:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error searching listings:', error)
    return []
  }
}

// ==================== CLIENT MUTATIONS (Use in components) ====================

/**
 * Create a new marketplace listing
 */
export async function createListing(
  listing: MarketplaceListingInput,
  userId: string
): Promise<MarketplaceListing> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('marketplace_listings')
    .insert([
      {
        ...listing,
        created_by: userId,
        status: 'available',
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create listing: ${error.message}`)
  }

  return data
}

/**
 * Update an existing marketplace listing
 */
export async function updateListing(
  id: string,
  updates: MarketplaceUpdateInput
): Promise<MarketplaceListing> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('marketplace_listings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update listing: ${error.message}`)
  }

  return data
}

/**
 * Delete a marketplace listing
 */
export async function deleteListing(id: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase.from('marketplace_listings').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete listing: ${error.message}`)
  }
}

/**
 * Mark a listing as sold
 */
export async function markAsSold(id: string): Promise<MarketplaceListing> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('marketplace_listings')
    .update({ status: 'sold' })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to mark listing as sold: ${error.message}`)
  }

  return data
}

/**
 * Mark a listing as reserved
 */
export async function markAsReserved(id: string): Promise<MarketplaceListing> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('marketplace_listings')
    .update({ status: 'reserved' })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to mark listing as reserved: ${error.message}`)
  }

  return data
}

/**
 * Mark a listing as available again
 */
export async function markAsAvailable(id: string): Promise<MarketplaceListing> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('marketplace_listings')
    .update({ status: 'available' })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to mark listing as available: ${error.message}`)
  }

  return data
}
