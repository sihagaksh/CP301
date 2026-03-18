'use client'

import Link from 'next/link'
import { Users, Calendar, ExternalLink, Hash } from 'lucide-react'
import type { Organization } from '@/lib/types'

interface OrganizationCardProps {
  organization: Organization & {
    memberCount?: number
    eventCount?: number
  }
  variant?: 'default' | 'compact' | 'detailed'
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

export function OrganizationCard({ organization, variant = 'default' }: OrganizationCardProps) {
  const isCompact = variant === 'compact'
  const isDetailed = variant === 'detailed'

  return (
    <Link href={`/dashboard/organizations/${organization.slug}`}>
      <div className={`
        border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden
        hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md
        transition-all duration-200 group bg-white dark:bg-gray-900
        ${isCompact ? 'p-4' : 'p-6'}
      `}>
        {/* Header with logo and category */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={`${organization.name} logo`}
                className={`rounded-lg object-cover ${isCompact ? 'w-10 h-10' : 'w-12 h-12'}`}
              />
            ) : (
              <div className={`
                ${isCompact ? 'w-10 h-10' : 'w-12 h-12'}
                rounded-lg bg-gradient-to-br from-amber-400 to-amber-600
                flex items-center justify-center text-white font-bold
              `}>
                {organization.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className={`
                font-semibold text-gray-900 dark:text-white group-hover:text-amber-700
                dark:group-hover:text-amber-300 transition-colors line-clamp-1
                ${isCompact ? 'text-sm' : 'text-lg'}
              `}>
                {organization.name}
              </h3>
              {!isCompact && (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(organization.category || 'other')}`}>
                  <Hash className="w-3 h-3" />
                  {organization.category}
                </span>
              )}
            </div>
          </div>

          {/* External link icon for organizations with websites */}
          {organization.website_url && !isCompact && (
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-amber-500" />
          )}
        </div>

        {/* Description */}
        {organization.description && (
          <p className={`
            text-gray-600 dark:text-gray-400 mb-3
            ${isCompact ? 'text-sm line-clamp-1' : 'text-sm line-clamp-2'}
          `}>
            {organization.description}
          </p>
        )}

        {/* Stats */}
        <div className={`flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 ${isCompact ? 'text-xs' : ''}`}>
          {/* Member count */}
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>
              {organization.memberCount !== undefined
                ? `${organization.memberCount} ${organization.memberCount === 1 ? 'member' : 'members'}`
                : `${organization.member_count || 0} ${organization.member_count === 1 ? 'member' : 'members'}`
              }
            </span>
          </div>

          {/* Event count (if available) */}
          {isDetailed && organization.eventCount !== undefined && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{organization.eventCount} events</span>
            </div>
          )}

          {/* Creator info (if available and detailed) */}
          {isDetailed && organization.creator && (
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-xs">by</span>
              <span className="text-xs font-medium">{organization.creator.full_name}</span>
            </div>
          )}
        </div>

        {/* Contact info for detailed view */}
        {isDetailed && organization.contact_email && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
              <span>Contact:</span>
              <a
                href={`mailto:${organization.contact_email}`}
                className="text-amber-600 dark:text-amber-400 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {organization.contact_email}
              </a>
            </div>
          </div>
        )}

        {/* Inactive indicator */}
        {!organization.is_active && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
              Inactive
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}