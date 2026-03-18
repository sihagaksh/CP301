import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/browser'
import type { Event, EventRegistration, User } from '@/lib/types'

/**
 * SERVER QUERIES - Use these in pages for SSR data fetching
 */

export async function listEvents(filters: {
  page?: number
  limit?: number
  event_type?: string
  search?: string
} = {}) {
  const { page = 1, limit = 20, event_type, search } = filters
  const offset = (page - 1) * limit

  const supabase = await createServerClient()

  let query = supabase
    .from('events')
    .select('*, creator:users!events_created_by_fkey(id, full_name, avatar_url, role)', {
      count: 'exact',
    })
    .eq('is_approved', true)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })
    .range(offset, offset + limit - 1)

  if (event_type) {
    query = query.eq('event_type', event_type)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching events:', error)
    return { events: [], count: 0, page, limit }
  }

  return {
    events: data as (Event & { creator: User })[] || [],
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function getEventById(id: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('events')
    .select(
      `
      *,
      creator:users!events_created_by_fkey(id, full_name, avatar_url, role, email),
      organization:organizations!events_organization_id_fkey(id, name, slug, logo_url),
      registrations:event_registrations(user_id)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching event:', error)
    return null
  }

  return data as Event & {
    creator: User
    registrations: EventRegistration[]
  } | null
}

export async function getEventsByOrganization(organizationId: string, filters: {
  page?: number
  limit?: number
} = {}) {
  const { page = 1, limit = 20 } = filters
  const offset = (page - 1) * limit

  const supabase = await createServerClient()

  const { data, error, count } = await supabase
    .from('events')
    .select('*, creator:users!events_created_by_fkey(id, full_name, avatar_url)', {
      count: 'exact',
    })
    .eq('organization_id', organizationId)
    .order('event_date', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching organization events:', error)
    return { events: [], count: 0, page, limit }
  }

  return {
    events: data as (Event & { creator: User })[] || [],
    count: count || 0,
    page,
    limit,
  }
}

export async function getUserRegistrations(userId: string, filters: {
  page?: number
  limit?: number
} = {}) {
  const { page = 1, limit = 20 } = filters
  const offset = (page - 1) * limit

  const supabase = await createServerClient()

  const { data, error, count } = await supabase
    .from('event_registrations')
    .select(
      `
      id,
      event_id,
      registered_at,
      events(
        id,
        title,
        event_date,
        event_time,
        location,
        capacity,
        registered_count,
        event_type,
        creator:users!events_created_by_fkey(id, full_name, avatar_url)
      )
    `,
      { count: 'exact' }
    )
    .eq('user_id', userId)
    .order('registered_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching registrations:', error)
    return { registrations: [], count: 0, page, limit }
  }

  return {
    registrations: data || [],
    count: count || 0,
    page,
    limit,
  }
}

export async function searchEvents(query: string, filters: {
  event_type?: string
  limit?: number
} = {}) {
  const { event_type, limit = 10 } = filters
  const supabase = await createServerClient()

  let search = supabase
    .from('events')
    .select('id, title, event_date, event_time, location, event_type, creator:users!events_created_by_fkey(id, full_name, avatar_url)')
    .eq('is_approved', true)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(limit)

  if (event_type) {
    search = search.eq('event_type', event_type)
  }

  const { data, error } = await search

  if (error) {
    console.error('Error searching events:', error)
    return []
  }

  return data || []
}

/**
 * CLIENT MUTATIONS - Use these in components for form submissions
 */

export async function createEvent(
  eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'registered_count'> & {
    created_by: string
  }
) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('events')
    .insert([
      {
        title: eventData.title,
        description: eventData.description,
        event_date: eventData.event_date,
        event_time: eventData.event_time,
        location: eventData.location,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        capacity: eventData.capacity,
        event_type: eventData.event_type,
        created_by: eventData.created_by,
        organization_id: eventData.organization_id,
        is_approved: false, // Events need admin approval
      },
    ])
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`)
  }

  return data as Event
}

export async function updateEvent(
  id: string,
  updates: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at' | 'registered_count'>>
) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('events')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to update event: ${error.message}`)
  }

  return data as Event
}

export async function deleteEvent(id: string) {
  const supabase = createBrowserClient()

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`)
  }
}

export async function registerForEvent(eventId: string, userId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('event_registrations')
    .insert([{ event_id: eventId, user_id: userId }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('Already registered for this event')
    }
    throw new Error(`Failed to register: ${error.message}`)
  }

  // Update registered_count
  await supabase.rpc('increment_event_registrations', { event_id: eventId })

  return data as EventRegistration
}

export async function unregisterFromEvent(eventId: string, userId: string) {
  const supabase = createBrowserClient()

  const { error } = await supabase
    .from('event_registrations')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to unregister: ${error.message}`)
  }

  // Update registered_count
  await supabase.rpc('decrement_event_registrations', { event_id: eventId })
}

export async function isUserRegistered(eventId: string, userId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking registration:', error)
  }

  return !!data
}

export async function getEventRegistrationCount(eventId: string) {
  const supabase = await createServerClient()

  const { count, error } = await supabase
    .from('event_registrations')
    .select('id', { count: 'exact' })
    .eq('event_id', eventId)

  if (error) {
    console.error('Error getting registration count:', error)
    return 0
  }

  return count || 0
}
