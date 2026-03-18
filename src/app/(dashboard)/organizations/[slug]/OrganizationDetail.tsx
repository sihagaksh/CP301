'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Users,
  Calendar,
  ExternalLink,
  Mail,
  Hash,
  Edit,
  Crown,
  Shield,
  MapPin,
  Clock
} from 'lucide-react'
import { getOrganizationMembers, type OrganizationMembership } from '@/lib/db/organizations'
import { JoinOrganizationButton } from '@/components/features/organizations/JoinOrganizationButton'
import type { Organization, User } from '@/lib/types'

interface OrganizationDetailProps {
  organization: Organization & {
    memberCount: number
    isUserMember: boolean
    userRole?: string
    recentEvents: any[]
    creator?: User
  }
  currentUserId: string
}

function getCategoryColor(category: string) {
  const colors = {
    academic: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    technology: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    hobby: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    social: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300',
    professional: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    sports: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    cultural: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
  return colors[category as keyof typeof colors] || colors.other
}

function formatTimeAgo(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return then.toLocaleDateString()
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'admin':
      return <Crown className="w-4 h-4 text-amber-500" />
    case 'moderator':
      return <Shield className="w-4 h-4 text-blue-500" />
    default:
      return <Users className="w-4 h-4 text-gray-400" />
  }
}

export function OrganizationDetail({ organization, currentUserId }: OrganizationDetailProps) {
  const [members, setMembers] = useState<(OrganizationMembership & { user?: User })[]>([])
  const [memberCount, setMemberCount] = useState(organization.memberCount)
  const [isUserMember, setIsUserMember] = useState(organization.isUserMember)
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)

  const isOwner = organization.created_by === currentUserId
  const canEdit = isOwner || organization.userRole === 'admin'

  // Load members
  useEffect(() => {
    const loadMembers = async () => {
      setIsLoadingMembers(true)
      try {
        const { data } = await getOrganizationMembers(organization.id, { limit: 10 })
        setMembers(data)
      } catch (error) {
        console.error('Error loading members:', error)
      } finally {
        setIsLoadingMembers(false)
      }
    }

    loadMembers()
  }, [organization.id])

  const handleMembershipChange = (isNowMember: boolean, newCount: number) => {
    setIsUserMember(isNowMember)
    setMemberCount(newCount)

    // Refresh members list if needed
    if (isNowMember && !members.some(m => m.user_id === currentUserId)) {
      // Would need to refetch members here
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Logo and Info */}
        <div className="flex items-start gap-6 flex-1">
          {/* Logo */}
          <div className="flex-shrink-0">
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={`${organization.name} logo`}
                className="w-24 h-24 rounded-lg object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold">
                {organization.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {organization.name}
              </h1>
              {canEdit && (
                <Link
                  href={`/dashboard/organizations/${organization.slug}/edit`}
                  className="p-2 text-gray-500 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Edit organization"
                >
                  <Edit className="w-4 h-4" />
                </Link>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(organization.category || 'other')}`}>
                <Hash className="w-3 h-3" />
                {organization.category}
              </span>

              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
              </div>

              {organization.recentEvents.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{organization.recentEvents.length} upcoming events</span>
                </div>
              )}
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {organization.description}
            </p>

            {/* Links */}
            <div className="flex items-center gap-4">
              {organization.website_url && (
                <a
                  href={organization.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Website
                </a>
              )}

              {organization.contact_email && (
                <a
                  href={`mailto:${organization.contact_email}`}
                  className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Contact
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Join Button */}
        <div className="flex-shrink-0 lg:w-64">
          <JoinOrganizationButton
            organizationId={organization.id}
            organizationName={organization.name}
            userId={currentUserId}
            isUserMember={isUserMember}
            userRole={organization.userRole}
            memberCount={memberCount}
            onMembershipChange={handleMembershipChange}
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Events */}
          {organization.recentEvents.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Upcoming Events
              </h2>
              <div className="space-y-4">
                {organization.recentEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/dashboard/events/${event.id}`}
                    className="block p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(event.start_date).toLocaleDateString()}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  href={`/dashboard/events?organization=${organization.id}`}
                  className="text-amber-600 dark:text-amber-400 hover:underline text-sm font-medium"
                >
                  View all events →
                </Link>
              </div>
            </div>
          )}

          {/* Organization Details */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              About This Organization
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Created
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTimeAgo(organization.created_at)}
                  </dd>
                </div>

                {organization.creator && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Founded by
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {organization.creator.full_name}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Category
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white capitalize">
                    {organization.category}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Members ({memberCount})
              </h3>
              {memberCount > members.length && (
                <Link
                  href={`/dashboard/organizations/${organization.slug}/members`}
                  className="text-amber-600 dark:text-amber-400 hover:underline text-sm"
                >
                  View all
                </Link>
              )}
            </div>

            {isLoadingMembers ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : members.length > 0 ? (
              <div className="space-y-2">
                {members.map((membership) => (
                  <div
                    key={membership.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    {membership.user?.avatar_url ? (
                      <img
                        src={membership.user.avatar_url}
                        alt={membership.user.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {membership.user?.full_name || 'Unknown User'}
                        </span>
                        {getRoleIcon(membership.role)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {membership.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                No members yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}