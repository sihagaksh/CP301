// ============================================================
// lib/db/notices.ts
// Notices database queries
// ============================================================

import { db } from './client';
import { mapUser } from './users';
import { mapUserPosition } from './organizations';
import type { Notice, NoticeCategory, NoticePriority, NoticeStatus, PaginationParams, PaginatedResponse } from '@/lib/types';

export interface GetNoticesFilters extends PaginationParams {
    category?: NoticeCategory | 'all';
    priority?: NoticePriority;
    status?: NoticeStatus | 'all';
    isActive?: boolean;
    // Optional cursor pagination support (createdAt + id)
    cursorCreatedAt?: string | null;
    cursorId?: string | null;
    userContext?: {
        role: string;
        department?: string | null;
        batch?: string | null;
    };
}

/**
 * Fetch notices with pagination and user visibility logic
 */
export async function getNotices(filters: GetNoticesFilters = {}): Promise<PaginatedResponse<Notice>> {
    const { page = 1, limit = 20, category, priority, status = 'published', isActive = true, userContext, cursorCreatedAt, cursorId } = filters;

    try {
        const rpcParams: Record<string, any> = {
            p_user_role: userContext?.role ?? null,
            p_user_department: userContext?.department ?? null,
            p_user_batch: userContext?.batch ?? null,
            p_category: category === 'all' ? null : (category ?? null),
            p_priority: priority ?? null,
            p_status: status === 'all' ? null : (status ?? null),
            p_is_active: isActive,
            p_limit: limit,
            p_cursor_created_at: cursorCreatedAt ?? null,
            p_cursor_id: cursorId ?? null,
            p_page: page
        };

        const { data: rpcResult, error } = await db.rpc('get_visible_notices_json', rpcParams as any) as any;
        if (error) {
            console.warn(`[getNotices] rpc error: ${error.message}`);
            return { data: [], total: 0, page, limit, hasMore: false };
        }

        const payload = rpcResult as any;
        // payload expected shape: { data: [...rows...], total: <number>, has_more: <bool> }
        const rows = (payload?.data ?? []) as any[];
        const notices = rows.map(mapNotice);
        return {
            data: notices,
            total: payload?.total ?? notices.length,
            page,
            limit,
            hasMore: !!payload?.has_more,
        };
    } catch (err: any) {
        console.warn(`[getNotices] ${err?.message || err}`);
        return { data: [], total: 0, page, limit, hasMore: false };
    }
}

/**
 * Create a new notice
 */
export async function createNotice(
    noticeData: Partial<Notice> & { postedBy: string }
): Promise<Notice | null> {
    const { data, error } = await db
        .from('notices')
        .insert([{
            posted_by: noticeData.postedBy,
            posting_identity_id: noticeData.postingIdentityId || null,
            title: noticeData.title,
            content: noticeData.content,
            category: noticeData.category || 'general',
            priority: noticeData.priority || 'medium',
            status: noticeData.status || 'published',
            tags: noticeData.tags || [],
            target_roles: noticeData.targetRoles || [],
            target_departments: noticeData.targetDepartments || [],
            target_batches: noticeData.targetBatches || [],
            attachments: noticeData.attachments || [],
            is_active: noticeData.isActive !== false,
            is_pinned: noticeData.isPinned || false,
            valid_from: noticeData.validFrom || new Date().toISOString(),
            valid_until: noticeData.validUntil || null,
        }])
                .select(`
            id, posted_by, posting_identity_id, title, content,
            category, priority, status, tags, target_roles, target_departments, target_batches,
            attachments, is_active, is_pinned, valid_from, valid_until,
            created_at, updated_at,
            poster:users!notices_posted_by_fkey(id, email, full_name, role, profile_picture_url),
            postingIdentity:user_positions!notices_posting_identity_id_fkey(
                id, user_id, org_id, title, por_type, valid_from, valid_until, is_active,
                org:organizations(id, name, slug, type, logo_url)
            )
        `)
        .single();

    if (error) throw new Error(`[createNotice] ${error.message}`);
    return data ? mapNotice(data) : null;
}

/**
 * Fetch a single notice by ID
 */
export async function getNotice(noticeId: string): Promise<Notice | null> {
    const { data, error } = await db
        .from('notices')
        .select(`
            id, posted_by, posting_identity_id, title, content,
            category, priority, status, tags, target_roles, target_departments, target_batches,
            attachments, is_active, is_pinned, valid_from, valid_until,
            created_at, updated_at,
            poster:users!notices_posted_by_fkey(id, email, full_name, role, profile_picture_url),
            postingIdentity:user_positions!notices_posting_identity_id_fkey(
                id, user_id, org_id, title, por_type, valid_from, valid_until, is_active,
                org:organizations(id, name, slug, type, logo_url)
            )
        `)
        .eq('id', noticeId)
        .single();

    if (error) {
        console.warn(`[getNotice] ${error.message}`);
        return null;
    }
    return data ? mapNotice(data) : null;
}

/**
 * Update an existing notice
 */
export async function updateNotice(
    noticeId: string,
    noticeData: Partial<Notice>
): Promise<Notice | null> {
    const updatePayload: any = {
        updated_at: new Date().toISOString(),
    };

    // If publishing, check if transitioning from draft to update valid_from
    if (noticeData.status === 'published') {
        const { data: current } = await db.from('notices').select('status').eq('id', noticeId).single();
        if (current?.status === 'draft') {
            updatePayload.valid_from = new Date().toISOString();
        }
    }

    if (noticeData.title !== undefined) updatePayload.title = noticeData.title;
    if (noticeData.content !== undefined) updatePayload.content = noticeData.content;
    if (noticeData.category !== undefined) updatePayload.category = noticeData.category;
    if (noticeData.priority !== undefined) updatePayload.priority = noticeData.priority;
    if (noticeData.status !== undefined) updatePayload.status = noticeData.status;
    if (noticeData.postingIdentityId !== undefined) updatePayload.posting_identity_id = noticeData.postingIdentityId || null;
    if (noticeData.tags !== undefined) updatePayload.tags = noticeData.tags;
    if (noticeData.targetRoles !== undefined) updatePayload.target_roles = noticeData.targetRoles;
    if (noticeData.targetDepartments !== undefined) updatePayload.target_departments = noticeData.targetDepartments;
    if (noticeData.targetBatches !== undefined) updatePayload.target_batches = noticeData.targetBatches;
    if (noticeData.attachments !== undefined) updatePayload.attachments = noticeData.attachments;
    if (noticeData.isActive !== undefined) updatePayload.is_active = noticeData.isActive;
    if (noticeData.isPinned !== undefined) updatePayload.is_pinned = noticeData.isPinned;
    if (noticeData.validFrom !== undefined) updatePayload.valid_from = noticeData.validFrom;
    if (noticeData.validUntil !== undefined) updatePayload.valid_until = noticeData.validUntil;

    const { data, error } = await db
        .from('notices')
        .update(updatePayload)
        .eq('id', noticeId)
                .select(`
            id, posted_by, posting_identity_id, title, content,
            category, priority, status, tags, target_roles, target_departments, target_batches,
            attachments, is_active, is_pinned, valid_from, valid_until,
            created_at, updated_at,
            poster:users!notices_posted_by_fkey(id, email, full_name, role, profile_picture_url),
            postingIdentity:user_positions!notices_posting_identity_id_fkey(
                id, user_id, org_id, title, por_type, valid_from, valid_until, is_active,
                org:organizations(id, name, slug, type, logo_url)
            )
        `)
        .single();

    if (error) throw new Error(`[updateNotice] ${error.message}`);
    return data ? mapNotice(data) : null;
}

/**
 * Toggle pinned status (Admin/Staff only)
 */
export async function toggleNoticePin(noticeId: string, isPinned: boolean): Promise<boolean> {
    const { error } = await db
        .from('notices')
        .update({ is_pinned: isPinned, updated_at: new Date().toISOString() })
        .eq('id', noticeId);

    if (error) throw new Error(`[toggleNoticePin] ${error.message}`);
    return true;
}

/**
 * Map database row to Notice type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapNotice(row: any): Notice {
    return {
        id: row.id,
        postedBy: row.posted_by,
        postingIdentityId: row.posting_identity_id,
        title: row.title,
        content: row.content,
        category: row.category,
        priority: row.priority,
        status: row.status || 'published',
        tags: row.tags || [],
        targetRoles: row.target_roles || [],
        targetDepartments: row.target_departments || [],
        targetBatches: row.target_batches || [],
        attachments: row.attachments || [],
        isActive: row.is_active,
        isPinned: row.is_pinned,
        validFrom: row.valid_from,
        validUntil: row.valid_until,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        poster: row.poster ? mapUser(row.poster) : undefined,
        postingIdentity: row.postingIdentity ? mapUserPosition(row.postingIdentity) : undefined,
    };
}
