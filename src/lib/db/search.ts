import { createServerClient } from '@/lib/supabase/server'
import { createBrowserClient } from '@/lib/supabase/browser'
import type { Event, Blog, Community, MarketplaceListing, LostFoundItem, User } from '@/lib/types'

// Search result types
export type SearchResultType = 'event' | 'blog' | 'community' | 'marketplace' | 'lost_found' | 'user'

export interface SearchResult {
  id: string
  title: string
  description?: string
  type: SearchResultType
  url: string
  created_at: string
  author?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  metadata?: Record<string, any>
}

export interface SearchFilters {
  type?: SearchResultType[]
  dateRange?: {
    from?: string
    to?: string
  }
  category?: string
  author?: string
}

export interface SearchResponse {
  results: SearchResult[]
  totalCount: number
  page: number
  limit: number
  query: string
  filters: SearchFilters
}

// ==================== SERVER QUERIES ====================

/**
 * Advanced search across all modules
 */
export async function searchAll(
  query: string,
  options: {
    page?: number
    limit?: number
    filters?: SearchFilters
  } = {}
): Promise<SearchResponse> {
  const { page = 1, limit = 20, filters = {} } = options
  const offset = (page - 1) * limit

  try {
    const supabase = await createServerClient()
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0)

    if (searchTerms.length === 0) {
      return { results: [], totalCount: 0, page, limit, query, filters }
    }

    const searches = []
    const enabledTypes = filters.type || ['event', 'blog', 'community', 'marketplace', 'lost_found', 'user']

    // Search Events
    if (enabledTypes.includes('event')) {
      searches.push(searchEvents(supabase, searchTerms, filters))
    }

    // Search Blogs
    if (enabledTypes.includes('blog')) {
      searches.push(searchBlogs(supabase, searchTerms, filters))
    }

    // Search Communities
    if (enabledTypes.includes('community')) {
      searches.push(searchCommunities(supabase, searchTerms, filters))
    }

    // Search Marketplace
    if (enabledTypes.includes('marketplace')) {
      searches.push(searchMarketplace(supabase, searchTerms, filters))
    }

    // Search Lost & Found
    if (enabledTypes.includes('lost_found')) {
      searches.push(searchLostFound(supabase, searchTerms, filters))
    }

    // Search Users
    if (enabledTypes.includes('user')) {
      searches.push(searchUsers(supabase, searchTerms, filters))
    }

    const searchResults = await Promise.all(searches)
    const allResults = searchResults.flat()

    // Sort by relevance (exact matches first, then by date)
    allResults.sort((a, b) => {
      const aExactMatch = a.title.toLowerCase().includes(query.toLowerCase())
      const bExactMatch = b.title.toLowerCase().includes(query.toLowerCase())

      if (aExactMatch && !bExactMatch) return -1
      if (!aExactMatch && bExactMatch) return 1

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Apply pagination
    const paginatedResults = allResults.slice(offset, offset + limit)

    return {
      results: paginatedResults,
      totalCount: allResults.length,
      page,
      limit,
      query,
      filters
    }
  } catch (error) {
    console.error('Error searching all modules:', error)
    return { results: [], totalCount: 0, page, limit, query, filters }
  }
}

/**
 * Get search suggestions based on query
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 2) return []

  try {
    const supabase = await createServerClient()
    const suggestions = new Set<string>()

    // Get event titles
    const { data: events } = await supabase
      .from('events')
      .select('title')
      .ilike('title', `%${query}%`)
      .limit(5)

    events?.forEach(event => suggestions.add(event.title))

    // Get blog titles
    const { data: blogs } = await supabase
      .from('blogs')
      .select('title')
      .eq('published', true)
      .ilike('title', `%${query}%`)
      .limit(5)

    blogs?.forEach(blog => suggestions.add(blog.title))

    // Get community names
    const { data: communities } = await supabase
      .from('communities')
      .select('name')
      .ilike('name', `%${query}%`)
      .limit(3)

    communities?.forEach(community => suggestions.add(community.name))

    return Array.from(suggestions).slice(0, 8)
  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return []
  }
}

// ==================== HELPER FUNCTIONS ====================

async function searchEvents(supabase: any, searchTerms: string[], filters: SearchFilters): Promise<SearchResult[]> {
  let query = supabase
    .from('events')
    .select(`
      id, title, description, created_at, start_date, location, event_type,
      creator:users!events_created_by_fkey(id, full_name, avatar_url)
    `)
    .eq('is_approved', true)

  // Apply search terms
  const searchPattern = searchTerms.join(' | ')
  query = query.or(`title.ilike.%${searchTerms[0]}%, description.ilike.%${searchTerms[0]}%`)

  // Apply date filter
  if (filters.dateRange?.from) {
    query = query.gte('start_date', filters.dateRange.from)
  }
  if (filters.dateRange?.to) {
    query = query.lte('start_date', filters.dateRange.to)
  }

  // Apply category filter
  if (filters.category) {
    query = query.eq('event_type', filters.category)
  }

  const { data } = await query.limit(50)

  return (data as (Event & { creator?: User })[])?.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description || undefined,
    type: 'event' as SearchResultType,
    url: `/dashboard/events/${event.id}`,
    created_at: event.created_at,
    author: event.creator ? {
      id: event.creator.id,
      full_name: event.creator.full_name,
      avatar_url: event.creator.avatar_url
    } : undefined,
    metadata: {
      start_date: event.start_date,
      location: event.location,
      event_type: event.event_type
    }
  })) || []
}

async function searchBlogs(supabase: any, searchTerms: string[], filters: SearchFilters): Promise<SearchResult[]> {
  let query = supabase
    .from('blogs')
    .select(`
      id, title, excerpt, slug, created_at, category,
      author:users!blogs_author_id_fkey(id, full_name, avatar_url)
    `)
    .eq('published', true)

  // Apply search terms
  query = query.or(`title.ilike.%${searchTerms[0]}%, excerpt.ilike.%${searchTerms[0]}%`)

  // Apply date filter
  if (filters.dateRange?.from) {
    query = query.gte('created_at', filters.dateRange.from)
  }
  if (filters.dateRange?.to) {
    query = query.lte('created_at', filters.dateRange.to)
  }

  // Apply category filter
  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  const { data } = await query.limit(50)

  return (data as (Blog & { author?: User })[])?.map(blog => ({
    id: blog.id,
    title: blog.title,
    description: blog.excerpt || undefined,
    type: 'blog' as SearchResultType,
    url: `/dashboard/blogs/${blog.slug}`,
    created_at: blog.created_at,
    author: blog.author ? {
      id: blog.author.id,
      full_name: blog.author.full_name,
      avatar_url: blog.author.avatar_url
    } : undefined,
    metadata: {
      category: blog.category
    }
  })) || []
}

async function searchCommunities(supabase: any, searchTerms: string[], filters: SearchFilters): Promise<SearchResult[]> {
  let query = supabase
    .from('communities')
    .select(`
      id, name, description, slug, created_at, category,
      creator:users!communities_created_by_fkey(id, full_name, avatar_url)
    `)

  // Apply search terms
  query = query.or(`name.ilike.%${searchTerms[0]}%, description.ilike.%${searchTerms[0]}%`)

  // Apply date filter
  if (filters.dateRange?.from) {
    query = query.gte('created_at', filters.dateRange.from)
  }
  if (filters.dateRange?.to) {
    query = query.lte('created_at', filters.dateRange.to)
  }

  // Apply category filter
  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  const { data } = await query.limit(50)

  return (data as (Community & { creator?: User })[])?.map(community => ({
    id: community.id,
    title: community.name,
    description: community.description || undefined,
    type: 'community' as SearchResultType,
    url: `/dashboard/communities/${community.slug}`,
    created_at: community.created_at,
    author: community.creator ? {
      id: community.creator.id,
      full_name: community.creator.full_name,
      avatar_url: community.creator.avatar_url
    } : undefined,
    metadata: {
      category: community.category
    }
  })) || []
}

async function searchMarketplace(supabase: any, searchTerms: string[], filters: SearchFilters): Promise<SearchResult[]> {
  let query = supabase
    .from('marketplace_listings')
    .select(`
      id, title, description, created_at, price, category, condition,
      seller:users!marketplace_listings_seller_id_fkey(id, full_name, avatar_url)
    `)
    .eq('status', 'active')

  // Apply search terms
  query = query.or(`title.ilike.%${searchTerms[0]}%, description.ilike.%${searchTerms[0]}%`)

  // Apply date filter
  if (filters.dateRange?.from) {
    query = query.gte('created_at', filters.dateRange.from)
  }
  if (filters.dateRange?.to) {
    query = query.lte('created_at', filters.dateRange.to)
  }

  // Apply category filter
  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  const { data } = await query.limit(50)

  return (data as (MarketplaceListing & { seller?: User })[])?.map(listing => ({
    id: listing.id,
    title: listing.title,
    description: listing.description || undefined,
    type: 'marketplace' as SearchResultType,
    url: `/dashboard/marketplace/${listing.id}`,
    created_at: listing.created_at,
    author: listing.seller ? {
      id: listing.seller.id,
      full_name: listing.seller.full_name,
      avatar_url: listing.seller.avatar_url
    } : undefined,
    metadata: {
      price: listing.price,
      category: listing.category,
      condition: listing.condition
    }
  })) || []
}

async function searchLostFound(supabase: any, searchTerms: string[], filters: SearchFilters): Promise<SearchResult[]> {
  let query = supabase
    .from('lost_found_items')
    .select(`
      id, title, description, created_at, type, status, location,
      reporter:users!lost_found_items_reporter_id_fkey(id, full_name, avatar_url)
    `)
    .in('status', ['lost', 'found'])

  // Apply search terms
  query = query.or(`title.ilike.%${searchTerms[0]}%, description.ilike.%${searchTerms[0]}%`)

  // Apply date filter
  if (filters.dateRange?.from) {
    query = query.gte('created_at', filters.dateRange.from)
  }
  if (filters.dateRange?.to) {
    query = query.lte('created_at', filters.dateRange.to)
  }

  // Apply category filter (using type field)
  if (filters.category) {
    query = query.eq('type', filters.category)
  }

  const { data } = await query.limit(50)

  return (data as (LostFoundItem & { reporter?: User })[])?.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description || undefined,
    type: 'lost_found' as SearchResultType,
    url: `/dashboard/lost-found/${item.id}`,
    created_at: item.created_at,
    author: item.reporter ? {
      id: item.reporter.id,
      full_name: item.reporter.full_name,
      avatar_url: item.reporter.avatar_url
    } : undefined,
    metadata: {
      item_type: item.type,
      status: item.status,
      location: item.location
    }
  })) || []
}

async function searchUsers(supabase: any, searchTerms: string[], filters: SearchFilters): Promise<SearchResult[]> {
  let query = supabase
    .from('profiles')
    .select('id, full_name, bio, avatar_url, department, created_at')
    .eq('is_active', true)

  // Apply search terms
  query = query.or(`full_name.ilike.%${searchTerms[0]}%, bio.ilike.%${searchTerms[0]}%`)

  const { data } = await query.limit(20)

  return (data as User[])?.map(user => ({
    id: user.id,
    title: user.full_name,
    description: user.bio || undefined,
    type: 'user' as SearchResultType,
    url: `/dashboard/users/${user.id}`,
    created_at: user.created_at,
    author: {
      id: user.id,
      full_name: user.full_name,
      avatar_url: user.avatar_url
    },
    metadata: {
      department: user.department
    }
  })) || []
}

// ==================== CLIENT QUERIES ====================

/**
 * Save a search query for user history
 */
export async function saveSearchQuery(userId: string, query: string): Promise<void> {
  try {
    const supabase = createBrowserClient()

    await supabase
      .from('search_history')
      .insert([{
        user_id: userId,
        query,
        created_at: new Date().toISOString()
      }])
  } catch (error) {
    console.error('Error saving search query:', error)
    // Non-critical, don't throw
  }
}

/**
 * Get user's recent search history
 */
export async function getSearchHistory(userId: string, limit = 10): Promise<string[]> {
  try {
    const supabase = createBrowserClient()

    const { data } = await supabase
      .from('search_history')
      .select('query')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    return data?.map(item => item.query) || []
  } catch (error) {
    console.error('Error fetching search history:', error)
    return []
  }
}