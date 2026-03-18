import { createServerClient } from '@/lib/supabase/server'
import { createBrowserClient } from '@/lib/supabase/browser'

export interface CampusLocation {
  id: string
  name: string
  description?: string
  location_type: 'building' | 'landmark' | 'facility' | 'outdoor' | 'parking' | 'entrance' | 'other'
  latitude: number
  longitude: number
  address?: string
  floor_number?: number
  room_number?: string
  capacity?: number
  amenities?: string[]
  operating_hours?: string
  contact_info?: string
  image_url?: string
  is_accessible: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CampusEvent {
  id: string
  title: string
  location_name?: string
  latitude?: number
  longitude?: number
  start_date: string
  event_type: string
}

export interface CampusOrganization {
  id: string
  name: string
  primary_location_id?: string
  location?: CampusLocation
}

// ==================== SERVER QUERIES ====================

/**
 * Get all campus locations with filtering
 */
export async function getCampusLocations(options: {
  type?: string
  search?: string
  includeInactive?: boolean
} = {}): Promise<CampusLocation[]> {
  const { type, search, includeInactive = false } = options

  try {
    const supabase = await createServerClient()
    let query = supabase
      .from('campus_locations')
      .select('*')
      .order('name', { ascending: true })

    // Filter by type
    if (type) {
      query = query.eq('location_type', type)
    }

    // Filter by search term
    if (search) {
      query = query.or(`name.ilike.%${search}%, description.ilike.%${search}%, address.ilike.%${search}%`)
    }

    // Filter by active status
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching campus locations:', error)
      return []
    }

    return (data as CampusLocation[]) || []
  } catch (error) {
    console.error('Unexpected error getting campus locations:', error)
    return []
  }
}

/**
 * Get location by ID
 */
export async function getLocationById(id: string): Promise<CampusLocation | null> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('campus_locations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching location by ID:', error)
      return null
    }

    return (data as CampusLocation) || null
  } catch (error) {
    console.error('Unexpected error getting location by ID:', error)
    return null
  }
}

/**
 * Get events with location data for map display
 */
export async function getEventsWithLocations(): Promise<CampusEvent[]> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('events')
      .select('id, title, location, latitude, longitude, start_date, event_type')
      .eq('is_approved', true)
      .gte('start_date', new Date().toISOString())
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('start_date', { ascending: true })
      .limit(50)

    if (error) {
      console.error('Error fetching events with locations:', error)
      return []
    }

    return (data as CampusEvent[]) || []
  } catch (error) {
    console.error('Unexpected error getting events with locations:', error)
    return []
  }
}

/**
 * Get organizations with their primary locations
 */
export async function getOrganizationsWithLocations(): Promise<CampusOrganization[]> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('organizations')
      .select(`
        id, name, primary_location_id,
        location:campus_locations(*)
      `)
      .eq('is_active', true)
      .not('primary_location_id', 'is', null)

    if (error) {
      console.error('Error fetching organizations with locations:', error)
      return []
    }

    return (data as CampusOrganization[]) || []
  } catch (error) {
    console.error('Unexpected error getting organizations with locations:', error)
    return []
  }
}

/**
 * Find nearby locations within a radius (in meters)
 */
export async function findNearbyLocations(
  latitude: number,
  longitude: number,
  radiusMeters: number = 1000
): Promise<CampusLocation[]> {
  try {
    const supabase = await createServerClient()

    // Using simple bounding box calculation for nearby search
    // For production, you might want to use PostGIS for more accurate distance calculation
    const latDelta = radiusMeters / 111000 // Rough conversion: 1 degree ≈ 111km
    const lonDelta = radiusMeters / (111000 * Math.cos(latitude * Math.PI / 180))

    const { data, error } = await supabase
      .from('campus_locations')
      .select('*')
      .gte('latitude', latitude - latDelta)
      .lte('latitude', latitude + latDelta)
      .gte('longitude', longitude - lonDelta)
      .lte('longitude', longitude + lonDelta)
      .eq('is_active', true)

    if (error) {
      console.error('Error finding nearby locations:', error)
      return []
    }

    // Filter by actual distance and sort by distance
    const locations = (data as CampusLocation[]) || []
    return locations
      .map(location => ({
        ...location,
        distance: calculateDistance(latitude, longitude, location.latitude, location.longitude)
      }))
      .filter(location => location.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance)
      .map(({ distance, ...location }) => location)
  } catch (error) {
    console.error('Unexpected error finding nearby locations:', error)
    return []
  }
}

/**
 * Search locations by name, type, or amenities
 */
export async function searchCampusLocations(query: string): Promise<CampusLocation[]> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('campus_locations')
      .select('*')
      .or(`name.ilike.%${query}%, description.ilike.%${query}%, location_type.ilike.%${query}%`)
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(20)

    if (error) {
      console.error('Error searching campus locations:', error)
      return []
    }

    return (data as CampusLocation[]) || []
  } catch (error) {
    console.error('Unexpected error searching campus locations:', error)
    return []
  }
}

// ==================== CLIENT MUTATIONS ====================

/**
 * Add a new campus location (admin only)
 */
export async function addCampusLocation(data: {
  name: string
  description?: string
  location_type: CampusLocation['location_type']
  latitude: number
  longitude: number
  address?: string
  floor_number?: number
  room_number?: string
  capacity?: number
  amenities?: string[]
  operating_hours?: string
  contact_info?: string
  is_accessible: boolean
}): Promise<CampusLocation> {
  const supabase = createBrowserClient()

  const { data: location, error } = await supabase
    .from('campus_locations')
    .insert([{
      name: data.name,
      description: data.description,
      location_type: data.location_type,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      floor_number: data.floor_number,
      room_number: data.room_number,
      capacity: data.capacity,
      amenities: data.amenities,
      operating_hours: data.operating_hours,
      contact_info: data.contact_info,
      is_accessible: data.is_accessible,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add campus location: ${error.message}`)
  }

  return location as CampusLocation
}

/**
 * Update campus location (admin only)
 */
export async function updateCampusLocation(
  id: string,
  data: Partial<Omit<CampusLocation, 'id' | 'created_at' | 'updated_at'>>
): Promise<CampusLocation> {
  const supabase = createBrowserClient()

  const { data: location, error } = await supabase
    .from('campus_locations')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update campus location: ${error.message}`)
  }

  return location as CampusLocation
}

/**
 * Delete campus location (admin only)
 */
export async function deleteCampusLocation(id: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase
    .from('campus_locations')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete campus location: ${error.message}`)
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

/**
 * Get location type display name and icon
 */
export function getLocationTypeInfo(type: CampusLocation['location_type']) {
  const typeMap = {
    building: { label: 'Building', icon: '🏢', color: 'blue' },
    landmark: { label: 'Landmark', icon: '🗿', color: 'purple' },
    facility: { label: 'Facility', icon: '🏗️', color: 'orange' },
    outdoor: { label: 'Outdoor Area', icon: '🌳', color: 'green' },
    parking: { label: 'Parking', icon: '🚗', color: 'gray' },
    entrance: { label: 'Entrance', icon: '🚪', color: 'amber' },
    other: { label: 'Other', icon: '📍', color: 'gray' }
  }

  return typeMap[type] || typeMap.other
}