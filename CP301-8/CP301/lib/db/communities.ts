// ============================================================
// lib/db/communities.ts
// Database queries for Communities module
// ============================================================

import { db } from './client';
import { mapUser } from './users';
import type { Community, CommunityMember, CommunityPost, PaginatedResponse, PaginationParams } from '@/lib/types';

export interface GetCommunityFilters extends PaginationParams {
    search?: string;
    isPublic?: boolean;
}

/**
 * Fetch all communities with pagination
 */
export async function getCommunities(filters: GetCommunityFilters = {}): Promise<PaginatedResponse<Community>> {
    const { page = 1, limit = 20 } = filters;
    /**
     * Deprecated offset-wrapper. Prefer `getCommunitiesCursor(filters, limit, cursorMemberCount, cursorId)`
     * for efficient cursor-based pagination.
     * @deprecated Use the cursor API directly; this wrapper is maintained for backward compatibility.
     */
    console.warn('[getCommunities] DEPRECATED: use getCommunitiesCursor() directly for cursor-based pagination.');

    // Use cursor-based retrieval to avoid offset .range(). Iterate over
    // pages using the cursor API to return the requested page.
    try {
        let cursorMemberCount: number | null | undefined = undefined;
        let cursorId: string | null | undefined = undefined;
        let pageData: Community[] = [];

        for (let p = 1; p <= page; p++) {
            const batch = await getCommunitiesCursor(filters, limit, cursorMemberCount ?? null, cursorId ?? null);
            if (p === page) {
                pageData = batch;
                break;
            }
            if (batch.length === 0) {
                pageData = [];
                break;
            }
            const last = batch[batch.length - 1];
            cursorMemberCount = last.memberCount ?? 0;
            cursorId = last.id;
        }

        return {
            data: pageData,
            total: 0,
            page,
            limit,
            hasMore: pageData.length === limit,
        };
    } catch (error: any) {
        console.warn(`[getCommunities] ${error?.message ?? error}`);
        return { data: [], total: 0, page, limit, hasMore: false };
    }
}

/**
 * Cursor-based communities fetch (ordered by member_count desc, id desc)
 */
export async function getCommunitiesCursor(filters: GetCommunityFilters = {}, limit = 20, cursorMemberCount?: number | null, cursorId?: string | null): Promise<Community[]> {
    const { search, isPublic } = filters;

    let query = db
        .from('communities')
        .select(`
      id, creator_id, name, slug, description,
      is_public, requires_approval, allow_posts,
      member_count, post_count, created_at, updated_at,
      creator:users!communities_creator_id_fkey(id, full_name, role, profile_picture_url)
    `);

    if (isPublic !== undefined) query = query.eq('is_public', isPublic);
    if (search) query = query.ilike('name', `%${search}%`);

    if (cursorMemberCount !== undefined && cursorMemberCount !== null && cursorId) {
        query = query.or(`member_count.lt.${cursorMemberCount},and(member_count.eq.${cursorMemberCount},id.lt.${cursorId})`);
    }

    const { data, error } = await query
        .order('member_count', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit);

    if (error) {
        console.warn(`[getCommunitiesCursor] ${error.message}`);
        return [];
    }
    return (data ?? []).map(mapCommunity);
}

/**
 * Get a single community by slug
 */
export async function getCommunityBySlug(slug: string): Promise<Community | null> {
        const { data, error } = await db
                .from('communities')
                .select(`
            id, creator_id, name, slug, description,
            is_public, requires_approval, allow_posts,
            member_count, post_count, created_at, updated_at,
            creator:users!communities_creator_id_fkey(id, email, full_name, role, profile_picture_url)
        `)
                .eq('slug', slug)
                .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`[getCommunityBySlug] ${error.message}`);
    }
    return data ? mapCommunity(data) : null;
}

/**
 * Create a new community
 */
export async function createCommunity(communityData: {
    creatorId: string;
    name: string;
    slug: string;
    description?: string;
    isPublic: boolean;
    requiresApproval: boolean;
}): Promise<Community | null> {
    const { data, error } = await db
        .from('communities')
        .insert([{
            creator_id: communityData.creatorId,
            name: communityData.name,
            slug: communityData.slug,
            description: communityData.description || null,
            is_public: communityData.isPublic,
            requires_approval: communityData.requiresApproval,
            allow_posts: true,
        }])
        .select(`
      id, creator_id, name, slug, description,
      is_public, requires_approval, allow_posts,
      member_count, post_count, created_at, updated_at,
      creator:users!communities_creator_id_fkey(id, email, full_name, role, profile_picture_url)
    `)
        .single();

    if (error) throw new Error(`[createCommunity] ${error.message}`);
    const community = data ? mapCommunity(data) : null;

    if (community) {
        // Add creator as admin member of the community
        await db.from('community_members').insert([{
            community_id: community.id,
            user_id: communityData.creatorId,
            role: 'admin',
        }]).select('id').single();

        // Auto-create a Notice Board group
        const { data: nbGroup } = await db.from('community_groups').insert([{
            community_id: community.id,
            name: 'Notice Board',
            description: 'Official announcements — only admins can post',
            type: 'notice_board',
            send_permission: 'admins_only',
            created_by: communityData.creatorId,
        }]).select('id').single();

        // Add creator as admin of the notice board
        if (nbGroup) {
            await db.from('community_group_members').insert([{
                group_id: nbGroup.id,
                user_id: communityData.creatorId,
                role: 'admin',
            }]).select('id').single();
        }
    }

    return community;
}

/**
 * Get members of a community
 */
export async function getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
    const { data, error } = await db
        .from('community_members')
        .select(`
      id, community_id, user_id, role, joined_at,
      user:users!community_members_user_id_fkey(id, email, full_name, role, profile_picture_url)
    `)
        .eq('community_id', communityId)
        .order('joined_at', { ascending: true });

    if (error) throw new Error(`[getCommunityMembers] ${error.message}`);
    return (data ?? []).map(mapCommunityMember);
}

/**
 * Get posts in a community
 */
export async function getCommunityPosts(communityId: string, page = 1, limit = 20): Promise<PaginatedResponse<CommunityPost>> {
    try {
        console.warn('[getCommunityPosts] DEPRECATED: use getCommunityPostsCursor() directly for cursor-based pagination.');
        let cursorCreatedAt: string | null | undefined = undefined;
        let cursorId: string | null | undefined = undefined;
        let pageData: CommunityPost[] = [];

        for (let p = 1; p <= page; p++) {
            const batch = await getCommunityPostsCursor(communityId, limit, cursorCreatedAt ?? null, cursorId ?? null);
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

        return {
            data: pageData,
            total: 0,
            page,
            limit,
            hasMore: pageData.length === limit,
        };
    } catch (error: any) {
        console.warn(`[getCommunityPosts] ${error?.message ?? error}`);
        return { data: [], total: 0, page, limit, hasMore: false };
    }
}

/**
 * Cursor-based community posts fetch (is_pinned desc, created_at desc)
 */
export async function getCommunityPostsCursor(communityId: string, limit = 20, cursorCreatedAt?: string | null, cursorId?: string | null) : Promise<CommunityPost[]> {
    let query = db
        .from('community_posts')
        .select(`
      id, community_id, author_id, title, content,
      media_urls, like_count, comment_count, is_pinned,
      created_at,
      author:users!community_posts_author_id_fkey(id, full_name, role, profile_picture_url)
    `)
        .eq('community_id', communityId);

    if (cursorCreatedAt && cursorId) {
        query = query.or(`created_at.lt.${cursorCreatedAt},and(created_at.eq.${cursorCreatedAt},id.lt.${cursorId})`);
    }

    const { data, error } = await query
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit);

    if (error) {
        console.warn(`[getCommunityPostsCursor] ${error.message}`);
        return [];
    }
    return (data ?? []).map(mapCommunityPost);
}

// ========================
// MAPPERS
// ========================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCommunity(row: any): Community {
    return {
        id: row.id,
        creatorId: row.creator_id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        isPublic: row.is_public,
        requiresApproval: row.requires_approval,
        allowPosts: row.allow_posts,
        memberCount: row.member_count || 0,
        postCount: row.post_count || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        creator: row.creator ? mapUser(row.creator) : undefined,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCommunityMember(row: any): CommunityMember {
    return {
        id: row.id,
        communityId: row.community_id,
        userId: row.user_id,
        role: row.role,
        joinedAt: row.joined_at,
        user: row.user ? mapUser(row.user) : undefined,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCommunityPost(row: any): CommunityPost {
    return {
        id: row.id,
        communityId: row.community_id,
        authorId: row.author_id,
        title: row.title,
        content: row.content,
        mediaUrls: row.media_urls || [],
        likeCount: row.like_count || 0,
        commentCount: row.comment_count || 0,
        isPinned: row.is_pinned,
        createdAt: row.created_at,
        author: row.author ? mapUser(row.author) : undefined,
    };
}
