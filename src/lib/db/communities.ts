import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/browser'
import type { Community, CommunityPost, User } from '@/lib/types'

/**
 * SERVER QUERIES - Use in pages for SSR data fetching
 */

export async function listCommunities(filters: {
  page?: number
  limit?: number
  search?: string
  public_only?: boolean
} = {}) {
  const { page = 1, limit = 20, search, public_only = true } = filters
  const offset = (page - 1) * limit

  const supabase = await createServerClient()

  let query = supabase
    .from('communities')
    .select('*, creator:users!communities_created_by_fkey(id, full_name, avatar_url)', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (public_only) {
    query = query.eq('is_public', true)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching communities:', error)
    return { communities: [], count: 0, page, limit }
  }

  return {
    communities: (data as (Community & { creator: User })[]) || [],
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function getCommunityBySlug(slug: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('communities')
    .select('*, creator:users!communities_created_by_fkey(id, full_name, avatar_url, role)')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching community:', error)
  }

  return (data as Community & { creator: User }) | null
}

export async function getCommunityById(id: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('communities')
    .select('*, creator:users!communities_created_by_fkey(id, full_name, avatar_url, role)')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching community:', error)
  }

  return (data as Community & { creator: User }) | null
}

export async function getCommunityPosts(
  communityId: string,
  filters: { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 20 } = filters
  const offset = (page - 1) * limit

  const supabase = await createServerClient()

  const { data, error, count } = await supabase
    .from('community_posts')
    .select(
      `*,
      author:users!community_posts_author_id_fkey(id, full_name, avatar_url, role)`,
      { count: 'exact' }
    )
    .eq('community_id', communityId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching community posts:', error)
    return { posts: [], count: 0, page, limit }
  }

  return {
    posts: (data as (CommunityPost & { author: User })[]) || [],
    count: count || 0,
    page,
    limit,
  }
}

export async function searchCommunities(query: string, limit: number = 10) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('communities')
    .select('id, name, slug, description, member_count, creator:users!communities_created_by_fkey(id, full_name, avatar_url)')
    .eq('is_public', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(limit)

  if (error) {
    console.error('Error searching communities:', error)
    return []
  }

  return data || []
}

/**
 * CLIENT MUTATIONS - Use in components for form submissions
 */

export async function createCommunity(data: {
  name: string
  slug: string
  description?: string
  created_by: string
  is_public?: boolean
}) {
  const supabase = createBrowserClient()

  const { data: community, error } = await supabase
    .from('communities')
    .insert([
      {
        name: data.name,
        slug: data.slug,
        description: data.description,
        created_by: data.created_by,
        is_public: data.is_public ?? true,
      },
    ])
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to create community: ${error.message}`)
  }

  return community as Community
}

export async function updateCommunity(
  id: string,
  updates: Partial<Omit<Community, 'id' | 'created_at' | 'updated_at' | 'member_count'>>
) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('communities')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to update community: ${error.message}`)
  }

  return data as Community
}

export async function deleteCommunity(id: string) {
  const supabase = createBrowserClient()

  const { error } = await supabase.from('communities').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete community: ${error.message}`)
  }
}

export async function createPost(data: {
  community_id: string
  author_id: string
  content: string
  image_url?: string
}) {
  const supabase = createBrowserClient()

  const { data: post, error } = await supabase
    .from('community_posts')
    .insert([
      {
        community_id: data.community_id,
        author_id: data.author_id,
        content: data.content,
        image_url: data.image_url,
      },
    ])
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to create post: ${error.message}`)
  }

  return post as CommunityPost
}

export async function updatePost(
  id: string,
  updates: Partial<Omit<CommunityPost, 'id' | 'created_at' | 'updated_at'>>
) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('community_posts')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to update post: ${error.message}`)
  }

  return data as CommunityPost
}

export async function deletePost(id: string) {
  const supabase = createBrowserClient()

  const { error } = await supabase.from('community_posts').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete post: ${error.message}`)
  }
}

export async function togglePostLike(postId: string, likes: number) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('community_posts')
    .update({ like_count: Math.max(0, likes) })
    .eq('id', postId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update likes: ${error.message}`)
  }

  return data as CommunityPost
}
