'use client'

import Link from 'next/link'
import { Users, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Community } from '@/lib/types'

interface CommunityCardProps {
  community: Community & { creator?: { full_name: string; avatar_url: string | null } | undefined }
  compact?: boolean
}

export function CommunityCard({ community, compact = false }: CommunityCardProps) {
  const authorInitials = community.creator
    ? (community.creator.full_name || 'Unknown')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?'

  if (compact) {
    return (
      <Link href={`/dashboard/communities/${community.slug}`} className="block group">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 hover:shadow-md transition-shadow">
          <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 truncate">
            {community.name}
          </h4>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-600 dark:text-gray-400">
            <Users className="w-3 h-3" />
            <span>{community.member_count}</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/dashboard/communities/${community.slug}`} className="block group">
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
              {community.name}
            </h3>
            {!community.is_public && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-500">
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {community.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
            {community.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            {community.creator?.avatar_url ? (
              <img
                src={community.creator.avatar_url}
                alt={community.creator.full_name}
                className="w-7 h-7 rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-300">
                {authorInitials}
              </div>
            )}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {community.creator?.full_name || 'Unknown'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Users className="w-4 h-4" />
            <span>{community.member_count}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
