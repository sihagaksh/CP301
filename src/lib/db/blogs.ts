import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/browser'
import type { Blog } from '@/lib/types'

// Server-side queries
export async function listBlogs(filters?: {
  page?: number
  limit?: number
  published?: boolean
  category?: string
  search?: string
}) {
  const supabase = await createServerClient()
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('blogs')
    .select('*, author:users(*)', { count: 'exact' })

  if (filters?.published !== false) {
    query = query.eq('is_published', true)
  }

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`
    )
  }

  const { data, error, count } = await query
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching blogs:', error)
    return {
      data: [],
      count: 0,
      page,
      limit,
      total_pages: 0,
    }
  }
  return {
    data: data as Blog[],
    count: count || 0,
    page,
    limit,
    total_pages: Math.ceil((count || 0) / limit),
  }
}

export async function getBlogBySlug(slug: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('blogs')
    .select('*, author:users(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching blog by slug:', error)
  }
  return data as Blog | null
}

export async function getBlogById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('blogs')
    .select('*, author:users(*)')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching blog by ID:', error)
  }
  return data as Blog | null
}

// Client-side mutations
export async function createBlog(data: {
  title: string
  slug: string
  content: string
  excerpt?: string
  category?: string
  featured_image_url?: string
  author_id: string
}) {
  const supabase = createBrowserClient()
  const { data: blog, error } = await supabase
    .from('blogs')
    .insert([
      {
        ...data,
        is_published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) throw error
  return blog as Blog
}

export async function updateBlog(id: string, updates: Partial<Blog>) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('blogs')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Blog
}

export async function deleteBlog(id: string) {
  const supabase = createBrowserClient()
  const { error } = await supabase.from('blogs').delete().eq('id', id)

  if (error) throw error
}

export async function publishBlog(id: string) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('blogs')
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Blog
}

export async function incrementBlogViews(id: string) {
  const supabase = createBrowserClient()
  const { error } = await supabase.rpc('increment_blog_views', {
    blog_id: id,
  })

  if (error) throw error
}
