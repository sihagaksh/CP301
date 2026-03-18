import { createServerClient } from '@/lib/supabase/server'
import { createBrowserClient } from '@/lib/supabase/browser'
import type { Organization, User, PaginatedResponse } from '@/lib/types'

export interface OrganizationMembership {
  id: string
  organization_id: string
  user_id: string
  role: 'member' | 'moderator' | 'admin'
  joined_at: string
  user?: User
  organization?: Organization
}

export interface OrganizationEvent {
  id: string
  organization_id: string
  title: string
  description: string
  start_date: string
  location?: string
  created_by: string
  created_at: string
}

// ==================== SERVER QUERIES ====================

/**
 * List all organizations with pagination and filtering
 */
export async function listOrganizations(options: {
  page?: number
  limit?: number
  category?: string
  search?: string
  includeStats?: boolean
} = {}): Promise<PaginatedResponse<Organization & { memberCount?: number; eventCount?: number }>> {
  const { page = 1, limit = 20, category, search, includeStats = false } = options
  const offset = (page - 1) * limit

  try {
    const supabase = await createServerClient()
    let query = supabase
      .from('organizations')
      .select(`
        *,
        creator:users!organizations_created_by_fkey(id, full_name, avatar_url, role)
        ${includeStats ? `, memberships:organization_memberships(count)` : ''}
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply category filter
    if (category) {
      query = query.eq('category', category)
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%, description.ilike.%${search}%`)
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching organizations:', error)
      return { data: [], count: 0, page, limit, total_pages: 0 }
    }

    // Get additional stats if requested
    let enrichedData = data || []
    if (includeStats) {
      for (const org of enrichedData) {
        const [{ count: memberCount }, { count: eventCount }] = await Promise.all([
          supabase.from('organization_memberships').select('*', { count: 'exact', head: true }).eq('organization_id', org.id),
          supabase.from('events').select('*', { count: 'exact', head: true }).eq('organization_id', org.id)
        ])
        ;(org as any).memberCount = memberCount || 0
        ;(org as any).eventCount = eventCount || 0
      }
    }

    const total_pages = count ? Math.ceil(count / limit) : 0
    return { data: enrichedData as any, count: count || 0, page, limit, total_pages }
  } catch (error) {
    console.error('Unexpected error listing organizations:', error)
    return { data: [], count: 0, page, limit, total_pages: 0 }
  }
}

/**
 * Get organization by slug with detailed information
 */
export async function getOrganizationBySlug(slug: string, userId?: string): Promise<(Organization & {
  memberCount: number
  isUserMember: boolean
  userRole?: string
  recentEvents: OrganizationEvent[]
  creator?: User
}) | null> {
  try {
    const supabase = await createServerClient()

    const { data: organization, error } = await supabase
      .from('organizations')
      .select(`
        *,
        creator:users!organizations_created_by_fkey(id, full_name, avatar_url, department, role)
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching organization:', error)
      return null
    }

    // Get member count
    const { count: memberCount } = await supabase
      .from('organization_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization.id)

    // Check if user is member and get their role
    let isUserMember = false
    let userRole: string | undefined
    if (userId) {
      const { data: membership } = await supabase
        .from('organization_memberships')
        .select('role')
        .eq('organization_id', organization.id)
        .eq('user_id', userId)
        .single()

      isUserMember = !!membership
      userRole = membership?.role
    }

    // Get recent events
    const { data: recentEvents } = await supabase
      .from('events')
      .select('id, title, description, start_date, location, created_by, created_at')
      .eq('organization_id', organization.id)
      .eq('is_approved', true)
      .order('start_date', { ascending: true })
      .limit(3)

    return {
      ...organization,
      memberCount: memberCount || 0,
      isUserMember,
      userRole,
      recentEvents: (recentEvents as OrganizationEvent[]) || [],
      creator: organization.creator
    }
  } catch (error) {
    console.error('Unexpected error getting organization:', error)
    return null
  }
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(id: string): Promise<Organization | null> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        creator:users!organizations_created_by_fkey(id, full_name, avatar_url)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching organization by ID:', error)
      return null
    }

    return data as Organization
  } catch (error) {
    console.error('Unexpected error getting organization by ID:', error)
    return null
  }
}

/**
 * Get user's organization memberships
 */
export async function getUserOrganizations(userId: string): Promise<OrganizationMembership[]> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('organization_memberships')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Error fetching user organizations:', error)
      return []
    }

    return (data as OrganizationMembership[]) || []
  } catch (error) {
    console.error('Unexpected error getting user organizations:', error)
    return []
  }
}

/**
 * Get organization members with pagination
 */
export async function getOrganizationMembers(
  organizationId: string,
  options: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<OrganizationMembership & { user?: User }>> {
  const { page = 1, limit = 20 } = options
  const offset = (page - 1) * limit

  try {
    const supabase = await createServerClient()

    const { data, error, count } = await supabase
      .from('organization_memberships')
      .select(`
        *,
        user:users(id, full_name, avatar_url, department, role)
      `, { count: 'exact' })
      .eq('organization_id', organizationId)
      .order('joined_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching organization members:', error)
      return { data: [], count: 0, page, limit, total_pages: 0 }
    }

    const total_pages = count ? Math.ceil(count / limit) : 0
    return { data: (data as (OrganizationMembership & { user?: User })[]) || [], count: count || 0, page, limit, total_pages }
  } catch (error) {
    console.error('Unexpected error getting organization members:', error)
    return { data: [], count: 0, page, limit, total_pages: 0 }
  }
}

/**
 * Search organizations
 */
export async function searchOrganizations(query: string, limit = 10): Promise<Organization[]> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
      .limit(limit)

    if (error) {
      console.error('Error searching organizations:', error)
      return []
    }

    return (data as Organization[]) || []
  } catch (error) {
    console.error('Unexpected error searching organizations:', error)
    return []
  }
}

// ==================== CLIENT MUTATIONS ====================

/**
 * Create a new organization
 */
export async function createOrganization(data: {
  name: string
  description: string
  category: string
  website_url?: string
  contact_email?: string
  created_by: string
}): Promise<Organization> {
  const supabase = createBrowserClient()

  // Generate slug from name
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)

  // Check if slug exists and make it unique if necessary
  let uniqueSlug = slug
  let counter = 1
  while (true) {
    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', uniqueSlug)
      .single()

    if (!existing) break
    uniqueSlug = `${slug}-${counter}`
    counter++
  }

  const { data: organization, error } = await supabase
    .from('organizations')
    .insert([{
      name: data.name,
      description: data.description,
      category: data.category,
      slug: uniqueSlug,
      website_url: data.website_url,
      contact_email: data.contact_email,
      created_by: data.created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create organization: ${error.message}`)
  }

  // Auto-join creator as admin
  await joinOrganization(organization.id, data.created_by, 'admin')

  return organization as Organization
}

/**
 * Update organization
 */
export async function updateOrganization(
  id: string,
  data: Partial<{
    name: string
    description: string
    category: string
    website_url: string
    contact_email: string
  }>
): Promise<Organization> {
  const supabase = createBrowserClient()

  const { data: organization, error } = await supabase
    .from('organizations')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update organization: ${error.message}`)
  }

  return organization as Organization
}

/**
 * Delete organization
 */
export async function deleteOrganization(id: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete organization: ${error.message}`)
  }
}

/**
 * Join an organization
 */
export async function joinOrganization(organizationId: string, userId: string, role: 'member' | 'moderator' | 'admin' = 'member'): Promise<OrganizationMembership> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('organization_memberships')
    .insert([{
      organization_id: organizationId,
      user_id: userId,
      role,
      joined_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to join organization: ${error.message}`)
  }

  return data as OrganizationMembership
}

/**
 * Leave an organization
 */
export async function leaveOrganization(organizationId: string, userId: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase
    .from('organization_memberships')
    .delete()
    .eq('organization_id', organizationId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to leave organization: ${error.message}`)
  }
}

/**
 * Update member role
 */
export async function updateMemberRole(organizationId: string, userId: string, role: 'member' | 'moderator' | 'admin'): Promise<OrganizationMembership> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('organization_memberships')
    .update({ role })
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update member role: ${error.message}`)
  }

  return data as OrganizationMembership
}

/**
 * Remove member from organization
 */
export async function removeMember(organizationId: string, userId: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase
    .from('organization_memberships')
    .delete()
    .eq('organization_id', organizationId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to remove member: ${error.message}`)
  }
}