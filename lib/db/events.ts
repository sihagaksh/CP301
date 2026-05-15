// ============================================================
// lib/db/events.ts
// Events database queries
// ============================================================

import { db } from './client';
import { mapUser } from './users';
import { mapUserPosition, mapOrganization } from './organizations';
import type { Event, EventType, PaginatedResponse, PaginationParams } from '@/lib/types';

export interface GetEventsFilters extends PaginationParams {
  type?: EventType | 'all';
  search?: string;
  startDate?: string | null;
  endDate?: string | null;
}

/**
 * Fetch events with pagination and optional filters
 */
export async function getUpcomingEvents(
  type?: EventType | 'all',
  limit: number = 20,
  page: number = 1
): Promise<Event[]> {
  /**
   * Deprecated offset-wrapper. Prefer `getUpcomingEventsCursor(type, limit, cursorStartTime, cursorId)`
   * for cursor-based pagination.
   * @deprecated Use the cursor API directly; this wrapper is only for backward compatibility.
   */
  console.warn('[getUpcomingEvents] DEPRECATED: use getUpcomingEventsCursor() directly for cursor-based pagination.');

  // Use cursor-based API to avoid offset `.range()` calls. If a caller
  // requests page > 1, iteratively fetch pages via the cursor API.
  const now = new Date().toISOString();
  try {
    let cursorStartTime: string | null | undefined = undefined;
    let cursorId: string | null | undefined = undefined;
    let pageData: Event[] = [];

    for (let p = 1; p <= page; p++) {
      const batch = await getUpcomingEventsCursor(type, limit, cursorStartTime ?? null, cursorId ?? null);
      if (p === page) {
        pageData = batch;
        break;
      }
      if (batch.length === 0) {
        pageData = [];
        break;
      }
      const last = batch[batch.length - 1];
      cursorStartTime = last.startTime ?? last.createdAt;
      cursorId = last.id;
    }
    return pageData;
  } catch (error: any) {
    console.warn(`[getUpcomingEvents] ${error?.message ?? error}`);
    return [];
  }
}

/**
 * Cursor-based upcoming events fetch.
 * If cursorStartTime and cursorId are provided, fetch events AFTER that cursor (ascending by start_time).
 */
export async function getUpcomingEventsCursor(
  type?: EventType | 'all',
  limit: number = 20,
  cursorStartTime?: string | null,
  cursorId?: string | null
): Promise<Event[]> {
  const now = new Date().toISOString();

  let query = db
    .from('events')
    .select(`
      id, title, slug, type, start_time, end_time,
      venue_name, is_online, cover_image_url,
      registration_url, max_attendees, tags,
      is_published, created_at,
      organizer:organizations!events_organizer_id_fkey(id, name, slug, type, logo_url),
      postedBy:users!events_posted_by_fkey(id, full_name, role, profile_picture_url)
    `)
    .eq('is_published', true)
    .gte('start_time', now);

  if (type && type !== 'all') {
    query = query.eq('type', type);
  }

  if (cursorStartTime && cursorId) {
    query = query.or(`start_time.gt.${cursorStartTime},and(start_time.eq.${cursorStartTime},id.gt.${cursorId})`);
  }

  const { data, error } = await query
    .order('start_time', { ascending: true })
    .order('id', { ascending: true })
    .limit(limit);

  if (error) {
    console.warn(`[getUpcomingEventsCursor] ${error.message}`);
    return [];
  }
  return (data ?? []).map(mapEvent);
}

/**
 * Cursor-based events fetch that supports the same filters as `getEvents`.
 * Accepts optional `search` and `type` filters and uses a cursor on `start_time,id`.
 */
export async function getEventsCursor(
  filters: GetEventsFilters = {},
  limit: number = 20,
  cursorStartTime?: string | null,
  cursorId?: string | null
): Promise<Event[]> {
  const { type, search, startDate, endDate } = filters;
  const now = new Date().toISOString();
  
  // Default search should only look forward from 'now' unless they explicitly select past dates
  const baseStartDate = startDate ? startDate : now;

  try {
    const rpcParams = {
      p_type: type === 'all' ? null : (type ?? null),
      p_search: search || null,
      p_start_date: baseStartDate,
      p_end_date: endDate || null,
      p_limit: limit,
      p_cursor_start_time: cursorStartTime || null,
      p_cursor_id: cursorId || null
    };

    const { data: rpcResult, error } = await db.rpc('get_visible_events_json', rpcParams as any) as any;

    if (error) {
      console.warn(`[getEventsCursor] RPC Error: ${error.message}`);
      return [];
    }
    
    // rpc payload: { data: [...], has_more: true/false }
    const rows = (rpcResult?.data ?? []) as any[];
    return rows.map(mapEvent);
  } catch (err: any) {
    console.warn(`[getEventsCursor] Exception: ${err.message}`);
    return [];
  }
}

export async function getEvents(filters: GetEventsFilters = {}): Promise<PaginatedResponse<Event>> {
  const { page = 1, limit = 20 } = filters;

  // Replace offset-based `.range()` with cursor-based retrieval. This will
  // iteratively page through the cursor API to reach the requested page.
  /**
   * Deprecated offset-wrapper. Prefer `getEventsCursor(filters, limit, cursorStartTime, cursorId)`
   * for cursor-based pagination.
   * @deprecated Use cursor APIs directly where possible.
   */
  console.warn('[getEvents] DEPRECATED: use getEventsCursor() directly for cursor-based pagination.');
  try {
    let cursorStartTime: string | null | undefined = undefined;
    let cursorId: string | null | undefined = undefined;
    let pageData: Event[] = [];

    for (let p = 1; p <= page; p++) {
      const batch = await getEventsCursor(filters, limit, cursorStartTime ?? null, cursorId ?? null);
      if (p === page) {
        pageData = batch;
        break;
      }
      if (batch.length === 0) {
        pageData = [];
        break;
      }
      const last = batch[batch.length - 1];
      cursorStartTime = last.startTime ?? last.createdAt;
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
    console.warn(`[getEvents] ${error?.message ?? error}`);
    return { data: [], total: 0, page, limit, hasMore: false };
  }
}

/**
 * Get a single event by slug
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  const { data, error } = await db
    .from('events')
    .select(`
      id, title, slug, description, organizer_id, posted_by, type, start_time, end_time,
      venue_name, venue_map_url, is_online, meeting_url, cover_image_url,
      registration_url, registration_deadline, max_attendees, tags, is_published, created_at, updated_at,
      organizer:organizations!events_organizer_id_fkey(id, name, slug, type, logo_url),
      postedBy:users!events_posted_by_fkey(id, email, full_name, role, profile_picture_url)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`[getEventBySlug] ${error.message}`);
  }
  return data ? mapEvent(data) : null;
}

/**
 * Get a single event by ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await db
    .from('events')
    .select(`
      id, title, slug, description, organizer_id, posted_by, type, start_time, end_time,
      venue_name, venue_map_url, is_online, meeting_url, cover_image_url,
      registration_url, registration_deadline, max_attendees, tags, is_published, created_at, updated_at,
      organizer:organizations!events_organizer_id_fkey(id, name, slug, type, logo_url),
      postedBy:users!events_posted_by_fkey(id, email, full_name, role, profile_picture_url)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`[getEventById] ${error.message}`);
  }
  return data ? mapEvent(data) : null;
}

/**
 * Create a new event
 */
export async function createEvent(
  eventData: Partial<Event> & { postedBy: string }
): Promise<Event | null> {
  // Generate slug
  const slug = eventData.title
    ? eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now()
    : `event-${Date.now()}`;

  const { data, error } = await db
    .from('events')
    .insert([{
      title: eventData.title,
      slug: slug,
      description: eventData.description,
      organizer_id: eventData.organizerId || null,
      posted_by: eventData.postedBy,
      type: eventData.type || 'other',
      start_time: eventData.startTime,
      end_time: eventData.endTime,
      venue_name: eventData.venueName,
      venue_map_url: eventData.venueMapUrl || null,
      is_online: eventData.isOnline || false,
      meeting_url: eventData.meetingUrl || null,
      cover_image_url: eventData.coverImageUrl || null,
      registration_url: eventData.registrationUrl || null,
      registration_deadline: eventData.registrationDeadline || null,
      max_attendees: eventData.maxAttendees || null,
      tags: eventData.tags || [],
      is_published: eventData.isPublished !== false,
    }])
    .select(`
      id, title, slug, description, organizer_id, posted_by, type, start_time, end_time,
      venue_name, venue_map_url, is_online, meeting_url, cover_image_url,
      registration_url, registration_deadline, max_attendees, tags, is_published, created_at, updated_at,
      organizer:organizations!events_organizer_id_fkey(id, name, slug, type, logo_url),
      postedBy:users!events_posted_by_fkey(id, email, full_name, role, profile_picture_url)
    `)
    .single();

  if (error) throw new Error(`[createEvent] ${error.message}`);
  return data ? mapEvent(data) : null;
}

/**
 * Map database row to Event type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapEvent(row: any): Event {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    organizerId: row.organizer_id,
    postedBy: row.posted_by,
    type: row.type,
    startTime: row.start_time,
    endTime: row.end_time,
    venueName: row.venue_name,
    venueMapUrl: row.venue_map_url,
    isOnline: row.is_online,
    meetingUrl: row.meeting_url,
    coverImageUrl: row.cover_image_url,
    registrationUrl: row.registration_url,
    registrationDeadline: row.registration_deadline,
    maxAttendees: row.max_attendees,
    tags: row.tags || [],
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    organizer: row.organizer ? mapOrganization(row.organizer) : undefined,
    // Note: Event interface expects `poster` to be populated for the ui
    poster: row.postedBy ? mapUser(row.postedBy) : undefined,
  };
}
