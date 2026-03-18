'use client'

import { useState } from 'react'
import { CommunityCard } from './CommunityCard'
import type { Community } from '@/lib/types'

interface CommunityListProps {
  initialCommunities: Community[]
  totalCount: number
  initialPage?: number
  pageSize?: number
}

export function CommunityList({
  initialCommunities,
  totalCount,
  initialPage = 1,
  pageSize = 20,
}: CommunityListProps) {
  const [communities, setCommunities] = useState(initialCommunities)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCommunities = searchQuery
    ? communities.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : communities

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search communities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {/* Communities Grid */}
      {filteredCommunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCommunities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400 font-medium">No communities found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {searchQuery ? 'Try different search terms' : 'Be the first to create one!'}
          </p>
        </div>
      )}

      {/* Pagination Info */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Page {initialPage} of {totalPages}
        </div>
      )}
    </div>
  )
}
