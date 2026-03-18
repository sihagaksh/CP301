'use client'

import { useState } from 'react'
import { ItemCard } from './ItemCard'
import type { LostFoundItem } from '@/lib/types'

interface ItemListProps {
  initialItems: (LostFoundItem & {
    reporter?: { full_name: string; avatar_url: string | null }
  })[]
  totalCount: number
  initialPage?: number
  pageSize?: number
}

const STATUSES = ['lost', 'found', 'claimed']
const CATEGORIES = ['electronics', 'accessories', 'documents', 'clothing', 'books', 'other']

export function ItemList({
  initialItems,
  totalCount,
  initialPage = 1,
  pageSize = 20,
}: ItemListProps) {
  const [items, setItems] = useState(initialItems)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredItems = items.filter((item) => {
    if (selectedStatus && item.status !== selectedStatus) return false
    if (selectedCategory && item.category !== selectedCategory) return false
    return true
  })

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        {/* Status Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus(null)}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
                selectedStatus === null
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              All Items
            </button>
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
                  selectedStatus === status
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

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
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 font-medium">No items found</p>
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
