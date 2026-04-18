// ============================================================
// lib/db/feed.ts
// Activity Feed queries
// ============================================================

import { db } from './client';
import { mapUser } from './users';
import type { FeedPost } from '@/lib/types';

/**
 * Get feed posts with pagination
 */
export async function getFeedPosts(limit = 20, offset = 0): Promise<FeedPost[]> {
    /**
     * Backwards-compatible wrapper that uses cursor API to emulate offset.
     * @deprecated Prefer `getFeedPostsCursor(limit, cursorCreatedAt, cursorId)` for efficient pagination.
     */
    console.warn('[getFeedPosts] DEPRECATED: use getFeedPostsCursor() directly for cursor-based pagination. This wrapper will be removed in a future release.');
    // Backwards-compatible wrapper that uses cursor API to emulate offset
    try {
        const page = Math.floor(offset / limit) + 1;
        let cursorCreatedAt: string | null | undefined = undefined;
        let cursorId: string | null | undefined = undefined;
        let pageData: FeedPost[] = [];

        for (let p = 1; p <= page; p++) {
            const batch = await getFeedPostsCursor(limit, cursorCreatedAt ?? null, cursorId ?? null);
            if (p === page) {
                pageData = batch;
                break;
            }
            if (batch.length === 0) {
                pageData = [];
                break;
            }
            const last = batch[batch.length - 1];
            cursorCreatedAt = last.createdAt;
            cursorId = last.id;
        }
        return pageData;
    } catch (err: any) {
        console.warn(`[getFeedPosts] ${err?.message ?? err}`);
        return [];
    }
}

/**
 * Cursor-based feed fetch (safer for large tables)
 * If cursorCreatedAt and cursorId are provided, fetch posts older than that cursor.
 */
export async function getFeedPostsCursor(limit = 20, cursorCreatedAt?: string | null, cursorId?: string | null): Promise<FeedPost[]> {
    let query = db
        .from('feed_posts')
        .select(`
      id, author_id, posting_identity_id, content, media_urls,
      source_type, source_id, like_count, comment_count, view_count,
      is_public, target_roles, created_at, updated_at,
      author:users!feed_posts_author_id_fkey(id, full_name, role, profile_picture_url)
    `)
        .eq('is_public', true);

    if (cursorCreatedAt && cursorId) {
        // use stable cursor: (created_at, id)
        query = query.or(`created_at.lt.${cursorCreatedAt},and(created_at.eq.${cursorCreatedAt},id.lt.${cursorId})`);
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit);

    if (error) {
        console.warn(`[getFeedPostsCursor] ${error.message} (code: ${error.code})`);
        return [];
    }
    return (data ?? []).map(mapFeedPost);
}

/**
 * Create a new feed post
 */
export async function createFeedPost(
    authorId: string,
    content: string,
    mediaUrls: string[] = []
): Promise<FeedPost> {
    const { data, error } = await db
        .from('feed_posts')
        .insert({
            author_id: authorId,
            content,
            media_urls: mediaUrls,
            source_type: 'post',
            is_public: true,
        })
        .select(`
      id, author_id, posting_identity_id, content, media_urls,
      source_type, source_id, like_count, comment_count, view_count,
      is_public, target_roles, created_at, updated_at,
      author:users!feed_posts_author_id_fkey(id, full_name, role, profile_picture_url)
    `)
        .single();

    if (error) throw new Error(`[createFeedPost] ${error.message}`);
    return mapFeedPost(data);
}

/**
 * Map database row to FeedPost type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapFeedPost(row: any): FeedPost {
    return {
        id: row.id,
        authorId: row.author_id,
        postingIdentityId: row.posting_identity_id,
        content: row.content,
        mediaUrls: row.media_urls || [],
        sourceType: row.source_type,
        sourceId: row.source_id,
        likeCount: row.like_count || 0,
        commentCount: row.comment_count || 0,
        viewCount: row.view_count || 0,
        isPublic: row.is_public,
        targetRoles: row.target_roles || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        author: row.author ? mapUser(row.author) : undefined,
    };
}
