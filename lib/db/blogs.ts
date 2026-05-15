// ============================================================
// lib/db/blogs.ts
// Blog posts queries
// ============================================================

import { db } from './client';
import { mapUser } from './users';
import type { BlogPost, BlogCategory, ContentStatus } from '@/lib/types';

/**
 * Get all published blogs with pagination
 */
export async function getPublishedBlogs(
  category?: BlogCategory,
  limit = 20,
  offset = 0
): Promise<BlogPost[]> {
  /**
   * Backwards-compatible wrapper that uses the cursor API to emulate offset
   * pagination.
   * @deprecated Prefer `getPublishedBlogsCursor` directly for efficient cursor-based pagination.
   */
  console.warn('[getPublishedBlogs] DEPRECATED: use getPublishedBlogsCursor() directly for cursor-based pagination. This wrapper will be removed in a future release.');
  try {
    const page = Math.floor(offset / limit) + 1;
    let cursorPublishedAt: string | null | undefined = undefined;
    let cursorId: string | null | undefined = undefined;
    let pageData: BlogPost[] = [];

    for (let p = 1; p <= page; p++) {
      const batch = await getPublishedBlogsCursor(category, limit, cursorPublishedAt ?? null, cursorId ?? null, undefined, undefined, undefined, 'newest');
      if (p === page) {
        pageData = batch;
        break;
      }
      if (batch.length === 0) {
        pageData = [];
        break;
      }
      const last = batch[batch.length - 1];
      cursorPublishedAt = last.publishedAt ?? last.createdAt;
      cursorId = last.id;
    }
    return pageData;
  } catch (err: any) {
    console.warn(`[getPublishedBlogs] ${err?.message ?? err}`);
    return [];
  }
}

/**
 * Cursor-based published blogs fetch (cursor on published_at + id)
 */
export async function getPublishedBlogsCursor(
  category?: BlogCategory,
  limit = 20,
  cursorPublishedAt?: string | null,
  cursorId?: string | null,
  tag?: string | null,
  authorId?: string | null,
  search?: string | null,
  sort: 'newest' | 'popular' = 'newest',
  cursorLikeCount?: number | null,
  cursorViewCount?: number | null,
  startDate?: string | null,
  endDate?: string | null,
  hiringType?: string | null
): Promise<BlogPost[]> {
  let selectFields = `
      id, title, slug, content, excerpt, featured_image_url,
      category, tags,
      company_name, role_applied, interview_round, hiring_type,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users!blog_posts_author_id_fkey(id, full_name, role, profile_picture_url)
    `;

  // No computed score column here for blogs; support a simple 'popular' sort using like_count, view_count

  let query = db
    .from('blog_posts')
    .select(selectFields)
    .eq('status', 'published');

  if (category && category !== 'general') {
    query = query.eq('category', category);
  }

  // filter by tag (array contains)
  if (tag) {
    try { query = query.contains('tags', [tag]); } catch (e) { /* ignore if driver unsupported */ }
  }

  // filter by author
  if (authorId) query = query.eq('author_id', authorId);
  // filter by hiring type
  if (hiringType && hiringType !== 'all') query = query.eq('hiring_type', hiringType);
  
  // filter by search keyword in title/content/company/role
  if (search) {
    try { 
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,company_name.ilike.%${search}%,role_applied.ilike.%${search}%`); 
    } catch (e) { /* ignore if driver unsupported */ }
  }

  // filter by date range
  if (startDate) query = query.gte('published_at', startDate);
  if (endDate) query = query.lte('published_at', endDate);
  if (sort === 'popular') {
    // cursor based on like_count, then view_count, then id (descending order)
    if (
      cursorLikeCount !== undefined && cursorLikeCount !== null &&
      cursorViewCount !== undefined && cursorViewCount !== null &&
      cursorId
    ) {
      // Find rows with like_count < cursorLikeCount OR (like_count = cursorLikeCount AND view_count < cursorViewCount) OR (like_count = cursorLikeCount AND view_count = cursorViewCount AND id < cursorId)
      try {
        query = query.or(`like_count.lt.${cursorLikeCount},and(like_count.eq.${cursorLikeCount},and(view_count.lt.${cursorViewCount},id.lt.${cursorId}))`);
      } catch (e) { /* ignore if driver doesn't support complex or */ }
    }
    const { data, error } = await query
      .order('like_count', { ascending: false })
      .order('view_count', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn(`[getPublishedBlogsCursor] ${error.message}`);
      return [];
    }
    return (data ?? []).map(mapBlogPost);
  }

  // default newest ordering (published_at desc)
  if (cursorPublishedAt && cursorId) {
    query = query.or(`published_at.lt.${cursorPublishedAt},and(published_at.eq.${cursorPublishedAt},id.lt.${cursorId})`);
  }

  const { data, error } = await query
    .order('published_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn(`[getPublishedBlogsCursor] ${error.message}`);
    return [];
  }
  return (data ?? []).map(mapBlogPost);
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await db
    .from('blog_posts')
    .select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, tags, company_name, role_applied, interview_round, hiring_type,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users!blog_posts_author_id_fkey(id, full_name, role, profile_picture_url)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`[getBlogBySlug] Error for slug "${slug}":`, error);
    if (error.code === 'PGRST116') return null;
    throw new Error(`[getBlogBySlug] ${error.message}`);
  }

  return data ? mapBlogPost(data) : null;
}

/**
 * Get featured blogs
 */
export async function getFeaturedBlogs(limit = 6): Promise<BlogPost[]> {
  const { data, error } = await db
    .from('blog_posts')
    .select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, tags, company_name, role_applied, interview_round,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users!blog_posts_author_id_fkey(id, full_name, role, profile_picture_url)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn(`[getFeaturedBlogs] ${error.message}`);
    return [];
  }
  return (data ?? []).map(mapBlogPost);
}

/**
 * Create blog post
 */
export async function createBlogPost(
  authorId: string,
  title: string,
  slug: string,
  content: string,
  category: BlogCategory,
  excerpt?: string,
  featuredImageUrl?: string,
  companyName?: string,
  roleApplied?: string,
  interviewRound?: string,
  hiringType?: string,
  publishNow = false
): Promise<BlogPost> {
  const { data, error } = await db
    .from('blog_posts')
    .insert({
      author_id: authorId,
      title,
      slug,
      content,
      excerpt,
      featured_image_url: featuredImageUrl,
      category,
      company_name: companyName,
      role_applied: roleApplied,
      interview_round: interviewRound,
      hiring_type: hiringType,
      status: publishNow ? 'published' : 'draft',
      published_at: publishNow ? new Date().toISOString() : null,
    })
    .select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, tags, company_name, role_applied, interview_round, hiring_type,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users!blog_posts_author_id_fkey(id, full_name, role, profile_picture_url)
    `)
    .single();

  if (error) throw new Error(`[createBlogPost] ${error.message}`);
  return mapBlogPost(data);
}

/**
 * Publish blog post
 */
export async function publishBlogPost(blogId: string): Promise<BlogPost> {
  const { data, error } = await db
    .from('blog_posts')
    .update({
      status: 'published' as ContentStatus,
      published_at: new Date().toISOString(),
    })
    .eq('id', blogId)
    .select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, tags, company_name, role_applied, interview_round, hiring_type,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users!blog_posts_author_id_fkey(id, full_name, role, profile_picture_url)
    `)
    .single();

  if (error) throw new Error(`[publishBlogPost] ${error.message}`);
  return mapBlogPost(data);
}

/**
 * Update blog post
 */
export async function updateBlogPost(
  blogId: string,
  updates: {
    title?: string;
    slug?: string;
    content?: string;
    category?: BlogCategory;
    excerpt?: string;
    featuredImageUrl?: string;
    companyName?: string;
    roleApplied?: string;
    interviewRound?: string;
    hiringType?: string;
    status?: ContentStatus;
  }
): Promise<BlogPost> {
  const { data, error } = await db
    .from('blog_posts')
    .update({
      title: updates.title,
      slug: updates.slug,
      content: updates.content,
      category: updates.category,
      excerpt: updates.excerpt,
      featured_image_url: updates.featuredImageUrl,
      company_name: updates.companyName,
      role_applied: updates.roleApplied,
      interview_round: updates.interviewRound,
      hiring_type: updates.hiringType,
      status: updates.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', blogId)
    .select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, company_name, role_applied, interview_round, hiring_type,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users!blog_posts_author_id_fkey(id, full_name, role, profile_picture_url)
    `)
    .single();

  if (error) throw new Error(`[updateBlogPost] ${error.message}`);
  return mapBlogPost(data);
}

/**
 * Delete blog post
 */
export async function deleteBlogPost(blogId: string): Promise<void> {
  const { error } = await db
    .from('blog_posts')
    .delete()
    .eq('id', blogId);

  if (error) throw new Error(`[deleteBlogPost] ${error.message}`);
}

/**
 * Map database row to BlogPost type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBlogPost(row: any): BlogPost {
    const featuredImageUrl = row.featured_image_url;
    // Resolve relative storage paths to full public URLs if necessary
    const resolvedImageUrl = featuredImageUrl && !featuredImageUrl.startsWith('http')
        ? db.storage.from('blogs-media').getPublicUrl(featuredImageUrl).data.publicUrl
        : featuredImageUrl;

  return {
    id: row.id,
    authorId: row.author_id,
    postingIdentityId: row.posting_identity_id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    featuredImageUrl: resolvedImageUrl,
    category: row.category,
    tags: row.tags || [],
    companyName: row.company_name,
    roleApplied: row.role_applied,
    interviewRound: row.interview_round,
    hiringType: row.hiring_type,
    status: row.status,
    isFeatured: row.is_featured,
    allowComments: row.allow_comments,
    viewCount: row.view_count,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: row.author ? mapUser(row.author) : undefined,
  };
}

/**
 * Increment blog view count
 */
export async function incrementBlogViews(blogId: string): Promise<void> {
  const { error } = await db.rpc('increment_blog_views', { blog_id: blogId });
  if (error) console.warn(`[incrementBlogViews] ${error.message}`);
}

/**
 * Get drafts for a specific user
 */
export async function getUserDrafts(userId: string): Promise<BlogPost[]> {
  const { data, error } = await db
    .from('blog_posts')
    .select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, tags, company_name, role_applied, interview_round, hiring_type,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users!blog_posts_author_id_fkey(id, full_name, role, profile_picture_url)
    `)
    .eq('author_id', userId)
    .eq('status', 'draft')
    .order('updated_at', { ascending: false });

  if (error) {
    console.warn(`[getUserDrafts] ${error.message}`);
    return [];
  }
  return (data ?? []).map(mapBlogPost);
}
