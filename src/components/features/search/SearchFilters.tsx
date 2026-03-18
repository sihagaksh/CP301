'use client'

import { useState, useEffect } from 'react'
import { Calendar, Filter, X } from 'lucide-react'
import type { SearchFilters, SearchResultType } from '@/lib/db/search'

interface SearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  className?: string
}

const typeOptions: { value: SearchResultType; label: string; color: string }[] = [
  { value: 'event', label: 'Events', color: 'text-blue-600' },
  { value: 'blog', label: 'Blogs', color: 'text-green-600' },
  { value: 'community', label: 'Communities', color: 'text-purple-600' },
  { value: 'marketplace', label: 'Marketplace', color: 'text-orange-600' },
  { value: 'lost_found', label: 'Lost & Found', color: 'text-red-600' },
  { value: 'user', label: 'Users', color: 'text-gray-600' }
]

const categoryOptions: Record<SearchResultType, string[]> = {
  event: ['conference', 'workshop', 'seminar', 'social', 'academic', 'sports', 'cultural', 'other'],
  blog: ['academic', 'technology', 'lifestyle', 'career', 'research', 'tutorial', 'other'],
  community: ['academic', 'technology', 'hobby', 'social', 'professional', 'other'],
  marketplace: ['electronics', 'books', 'clothing', 'furniture', 'sports', 'other'],
  lost_found: ['electronics', 'clothing', 'books', 'accessories', 'documents', 'other'],
  user: []
}

export function SearchFilters({ filters, onFiltersChange, className = '' }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...localFilters, ...newFilters }
    setLocalFilters(updated)
    onFiltersChange(updated)
  }

  const clearFilters = () => {
    const cleared = {}
    setLocalFilters(cleared)
    onFiltersChange(cleared)
    setIsOpen(false)
  }

  const toggleType = (type: SearchResultType) => {
    const currentTypes = localFilters.type || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]

    updateFilters({
      type: newTypes.length === typeOptions.length ? undefined : newTypes,
      category: undefined // Clear category when changing types
    })
  }

  const hasActiveFilters = !!(
    localFilters.type?.length ||
    localFilters.category ||
    localFilters.dateRange?.from ||
    localFilters.dateRange?.to ||
    localFilters.author
  )

  const getAvailableCategories = (): string[] => {
    if (!localFilters.type || localFilters.type.length !== 1) return []
    return categoryOptions[localFilters.type[0]] || []
  }

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          hasActiveFilters
            ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/20 dark:text-amber-300'
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">
          {hasActiveFilters ? 'Filters Applied' : 'Filters'}
        </span>
        {hasActiveFilters && (
          <span className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs px-2 py-0.5 rounded-full">
            {[
              localFilters.type?.length,
              localFilters.category ? 1 : 0,
              localFilters.dateRange?.from || localFilters.dateRange?.to ? 1 : 0,
              localFilters.author ? 1 : 0
            ].filter(n => n && n > 0).length}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Search Filters</h3>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Content Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Content Types
              </label>
              <div className="grid grid-cols-2 gap-2">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleType(option.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      !localFilters.type || localFilters.type.includes(option.value)
                        ? 'bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-700 dark:text-amber-300'
                        : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      !localFilters.type || localFilters.type.includes(option.value)
                        ? 'bg-amber-500'
                        : 'bg-gray-400'
                    }`} />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            {getAvailableCategories().length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Category
                </label>
                <select
                  value={localFilters.category || ''}
                  onChange={(e) => updateFilters({ category: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">All categories</option>
                  {getAvailableCategories().map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
                  <input
                    type="date"
                    value={localFilters.dateRange?.from || ''}
                    onChange={(e) => updateFilters({
                      dateRange: {
                        ...localFilters.dateRange,
                        from: e.target.value || undefined
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
                  <input
                    type="date"
                    value={localFilters.dateRange?.to || ''}
                    onChange={(e) => updateFilters({
                      dateRange: {
                        ...localFilters.dateRange,
                        to: e.target.value || undefined
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Author Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Author
              </label>
              <input
                type="text"
                placeholder="Search by author name..."
                value={localFilters.author || ''}
                onChange={(e) => updateFilters({ author: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}