// ============================================================
// lib/db/lost-found.ts
// Database queries for Lost & Found items
// ============================================================

import { db } from './client';
import { mapUser } from './users';
import type { LostFoundItem, LFCategory, LFStatus, PaginatedResponse, PaginationParams } from '@/lib/types';

export interface GetLFFilters extends PaginationParams {
    status?: LFStatus | 'all';
    category?: LFCategory | 'all';
    search?: string;
    locationSearch?: string;
    reporterId?: string;
}

/**
 * Fetch lost & found items with pagination and filters
 */
export async function getLFItems(filters: GetLFFilters = {}): Promise<PaginatedResponse<LostFoundItem>> {
    const { page = 1, limit = 20 } = filters;

    /**
     * Deprecated offset-wrapper. Prefer `getLFItemsCursor(filters, limit, cursorCreatedAt, cursorId)`
     * for cursor-based pagination.
     * @deprecated Use the cursor API directly; this wrapper exists only for compatibility.
     */
    console.warn('[getLFItems] DEPRECATED: use getLFItemsCursor() directly for cursor-based pagination.');

    // Deprecated offset-based pagination — use cursor API under the hood
    try {
        let cursorCreatedAt: string | null | undefined = undefined;
        let cursorId: string | null | undefined = undefined;
        let pageData: LostFoundItem[] = [];

        for (let p = 1; p <= page; p++) {
            const batch = await getLFItemsCursor(filters, limit, cursorCreatedAt ?? null, cursorId ?? null);
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
        console.warn(`[getLFItems] ${error?.message ?? error}`);
        return { data: [], total: 0, page, limit, hasMore: false };
    }
}

/**
 * Cursor-based lost & found fetch (created_at, id cursor)
 */
export async function getLFItemsCursor(filters: GetLFFilters = {}, limit = 20, cursorCreatedAt?: string | null, cursorId?: string | null): Promise<LostFoundItem[]> {
    const { status, category, search, reporterId } = filters;
    let query = db
        .from('lost_found_items')
        .select(`
      id, reporter_id, claimer_id, item_name, category, status,
      description, location_lost_found, date_lost_found,
      contact_info, images, claimed_at, returned_at,
      created_at, updated_at,
      reporter:users!lost_found_items_reporter_id_fkey(id, full_name, role, profile_picture_url),
      claimer:users!lost_found_items_claimer_id_fkey(id, full_name, role, profile_picture_url)
    `);

    if (status && status !== 'all') query = query.eq('status', status);
    if (category && category !== 'all') query = query.eq('category', category);
    if (reporterId) query = query.eq('reporter_id', reporterId);
    if (search) query = query.ilike('item_name', `%${search}%`);
    if (filters.locationSearch) query = query.ilike('location_lost_found', `%${filters.locationSearch}%`);

    if (cursorCreatedAt && cursorId) {
        query = query.or(`created_at.lt.${cursorCreatedAt},and(created_at.eq.${cursorCreatedAt},id.lt.${cursorId})`);
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit);

    if (error) {
        console.warn(`[getLFItemsCursor] ${error.message}`);
        return [];
    }
    return (data ?? []).map(mapLFItem);
}

/**
 * Get a single Lost & Found item by ID
 */
export async function getLFItemById(id: string): Promise<LostFoundItem | null> {
    const { data, error } = await db
        .from('lost_found_items')
                .select(`
            id, reporter_id, claimer_id, item_name, category, status,
            description, location_lost_found, date_lost_found,
            contact_info, images, claimed_at, returned_at,
            created_at, updated_at,
            reporter:users!lost_found_items_reporter_id_fkey(id, email, full_name, role, profile_picture_url),
            claimer:users!lost_found_items_claimer_id_fkey(id, email, full_name, role, profile_picture_url)
        `)
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`[getLFItemById] ${error.message}`);
    }
    return data ? mapLFItem(data) : null;
}

/**
 * Create a new Lost & Found report
 */
export async function createLFItem(
    itemData: Partial<LostFoundItem> & { reporterId: string, itemName: string, category: LFCategory, status: LFStatus }
): Promise<LostFoundItem | null> {
    const { data, error } = await db
        .from('lost_found_items')
        .insert([{
            reporter_id: itemData.reporterId,
            item_name: itemData.itemName,
            category: itemData.category,
            status: itemData.status,
            description: itemData.description || null,
            location_lost_found: itemData.locationLostFound || null,
            date_lost_found: itemData.dateLostFound || null,
            contact_info: itemData.contactInfo || null,
            images: itemData.images || [],
        }])
                .select(`
            id, reporter_id, claimer_id, item_name, category, status,
            description, location_lost_found, date_lost_found,
            contact_info, images, claimed_at, returned_at,
            created_at, updated_at,
            reporter:users!lost_found_items_reporter_id_fkey(id, email, full_name, role, profile_picture_url)
        `)
        .single();

    if (error) throw new Error(`[createLFItem] ${error.message}`);
    return data ? mapLFItem(data) : null;
}

/**
 * Update the status of an item (e.g. from lost to claimed)
 */
export async function updateLFItemStatus(
    id: string,
    status: LFStatus,
    claimerId?: string
): Promise<LostFoundItem | null> {

    const updates: any = { status };

    if (status === 'claimed' || status === 'returned') {
        if (claimerId) updates.claimer_id = claimerId;
        if (status === 'claimed') updates.claimed_at = new Date().toISOString();
        if (status === 'returned') updates.returned_at = new Date().toISOString();
    }

    const { data, error } = await db
        .from('lost_found_items')
        .update(updates)
        .eq('id', id)
                .select(`
            id, reporter_id, claimer_id, item_name, category, status,
            description, location_lost_found, date_lost_found,
            contact_info, images, claimed_at, returned_at,
            created_at, updated_at,
            reporter:users!lost_found_items_reporter_id_fkey(id, email, full_name, role, profile_picture_url),
            claimer:users!lost_found_items_claimer_id_fkey(id, email, full_name, role, profile_picture_url)
        `)
        .single();

    if (error) throw new Error(`[updateLFItemStatus] ${error.message}`);
    return data ? mapLFItem(data) : null;
}

/**
 * Map database row to LostFoundItem type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapLFItem(row: any): LostFoundItem {
    return {
        id: row.id,
        reporterId: row.reporter_id,
        claimerId: row.claimer_id,
        itemName: row.item_name,
        category: row.category,
        status: row.status,
        description: row.description,
        locationLostFound: row.location_lost_found,
        dateLostFound: row.date_lost_found,
        contactInfo: row.contact_info,
        images: row.images || [],
        claimedAt: row.claimed_at,
        returnedAt: row.returned_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        reporter: row.reporter ? mapUser(row.reporter) : undefined,
        claimer: row.claimer ? mapUser(row.claimer) : undefined,
    };
}
