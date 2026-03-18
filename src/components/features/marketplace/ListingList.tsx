'use client'

import { useState } from 'react'
import { ListingCard } from './ListingCard'
import type { MarketplaceListing } from '@/lib/types'

interface ListingListProps {
  initialListings: (MarketplaceListing & {
    seller?: { full_name: string; avatar_url: string | null }
  })[]
  totalCount: number
  initialPage?: number
  pageSize?: number
}

const CATEGORIES = [
  'textbooks',
  'electronics',
  'furniture',
  'clothing',
  'sports',
  'other',
]

const CONDITIONS = ['new', 'like-new', 'good', 'fair', 'poor']

export function ListingList({
  initialListings,
  totalCount,
  initialPage = 1,
  pageSize = 20,
}: ListingListProps) {
  const [listings, setListings] = useState(initialListings)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)

  const filteredListings = listings.filter((listing) => {
    if (selectedCategory && listing.category !== selectedCategory) return false
    if (selectedCondition && listing.condition !== selectedCondition) return false
    return true
  })

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Condition Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Condition
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCondition(null)}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
                selectedCondition === null
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              All Conditions
            </button>
            {CONDITIONS.map((condition) => (
              <button
                key={condition}
                onClick={() => setSelectedCondition(condition)}
                className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCondition === condition
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {condition === 'like-new'
                  ? 'Like New'
                  : condition.charAt(0).toUpperCase() + condition.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            No listings found
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Try adjusting your filters or check back soon
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
