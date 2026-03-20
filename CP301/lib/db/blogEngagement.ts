// ============================================================
// lib/db/blogEngagement.ts
// Functions for liking and commenting on blogs
// ============================================================

import { db } from './client';
import { mapUser } from './users';

export interface BlogComment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    user?: {
        id: string;
        full_name: string;
        profile_picture_url?: string;
    };
}

/**
 * Get all comments for a specific blog post
 */
export async function getBlogComments(blogId: string): Promise<BlogComment[]> {
    const { data, error } = await db
        .from('blog_comments')
        .select(`
            *,
            user:users(id, full_name, profile_picture_url)
        `)
        .eq('post_id', blogId)
        .order('created_at', { ascending: true });

    if (error) {
        console.warn(`[getBlogComments] ${error.message}`);
        return [];
    }
    return data || [];
}

/**
 * Submit a new comment on a blog post
 */
export async function submitBlogComment(
    blogId: string,
    userId: string,
    content: string
): Promise<BlogComment | null> {
    const { data, error } = await db
        .from('blog_comments')
        .insert({
            post_id: blogId,
            user_id: userId,
            content,
        })
        .select(`
            *,
            user:users(id, full_name, profile_picture_url)
        `)
        .single();

    if (error) {
        console.error(`[submitBlogComment] ${error.message}`);
        return null;
    }
    return data;
}

/**
 * Toggle like status on a blog post for a user
 * Returns true if liked, false if unliked
 */
export async function toggleBlogLike(blogId: string, userId: string): Promise<boolean> {
    // 1. Check if already liked
    const { data: existing } = await db
        .from('blog_likes')
        .select('post_id')
        .eq('post_id', blogId)
        .eq('user_id', userId)
        .single();

    if (existing) {
        // 2. Un-like
        await db
            .from('blog_likes')
            .delete()
            .eq('post_id', blogId)
            .eq('user_id', userId);
        return false;
    } else {
        // 3. Like
        await db
            .from('blog_likes')
            .insert({
                post_id: blogId,
                user_id: userId,
            });
        return true;
    }
}

/**
 * Check if a user has liked a specific blog post
 */
export async function checkBlogLike(blogId: string, userId: string): Promise<boolean> {
    const { data, error } = await db
        .from('blog_likes')
        .select('post_id')
        .eq('post_id', blogId)
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.warn(`[checkBlogLike] ${error.message}`);
    }
    return !!data;
}

/**
 * Increment blog view count securely using RPC
 */
export async function incrementBlogViewsRPC(blogId: string): Promise<void> {
    const { error } = await db.rpc('increment_blog_views', { blog_id: blogId });
    if (error) {
        console.warn(`[incrementBlogViewsRPC] ${error.message}`);
    }
}

/**
 * Increment feed view count securely using RPC
 */
export async function incrementFeedViewsRPC(feedId: string): Promise<void> {
    const { error } = await db.rpc('increment_feed_views', { feed_id: feedId });
    if (error) {
        console.warn(`[incrementFeedViewsRPC] ${error.message}`);
    }
}
