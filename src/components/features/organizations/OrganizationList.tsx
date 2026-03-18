'use client'

import { useState } from 'react'
import { Search, Filter, Plus } from 'lucide-react'
import Link from 'next/link'
import { OrganizationCard } from './OrganizationCard'
import type { Organization } from '@/lib/types'

interface OrganizationListProps {
  organizations: (Organization & { memberCount?: number; eventCount?: number })[]
  totalCount: number
  currentPage: number
  totalPages: number
  currentCategory?: string
  currentSearch?: string
  showCreateButton?: boolean
  onPageChange?: (page: number) => void
  onFilterChange?: (filters: { category?: string; search?: string }) => void
}

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'academic', label: 'Academic' },
  { value: 'technology', label: 'Technology' },
  { value: 'hobby', label: 'Hobby' },
  { value: 'social', label: 'Social' },
  { value: 'professional', label: 'Professional' },
  { value: 'sports', label: 'Sports' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'other', label: 'Other' }
]

export function OrganizationList({
  organizations,
  totalCount,
  currentPage,
  totalPages,
  currentCategory = '',
  currentSearch = '',
  showCreateButton = true,
  onPageChange,
  onFilterChange
}: OrganizationListProps) {
  const [searchQuery, setSearchQuery] = useState(currentSearch)
  const [selectedCategory, setSelectedCategory] = useState(currentCategory)
  const [showFilters, setShowFilters] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange?.({ search: searchQuery, category: selectedCategory })
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    onFilterChange?.({ search: searchQuery, category })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    onFilterChange?.({ search: '', category: '' })
  }

  const hasActiveFilters = currentSearch || currentCategory

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Campus Organizations
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {totalCount} {totalCount === 1 ? 'organization' : 'organizations'} available
          </p>
        </div>

        {showCreateButton && (
          <Link
            href="/dashboard/organizations/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Organization
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search organizations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              hasActiveFilters
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/20 dark:text-amber-300'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            {hasActiveFilters ? 'Filters Applied' : 'Filter'}
          </button>
        </form>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {organizations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {hasActiveFilters ? 'No organizations found' : 'No organizations yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filter criteria.'
              : 'Be the first to create an organization and build a community around your interests!'
            }
          </p>
          {!hasActiveFilters && showCreateButton && (
            <Link
              href="/dashboard/organizations/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Organization
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Organization Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((organization) => (
              <OrganizationCard
                key={organization.id}
                organization={organization}
                variant="detailed"
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              {currentPage > 1 && (
                <button
                  onClick={() => onPageChange?.(currentPage - 1)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Previous
                </button>
              )}

              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages && (
                <button
                  onClick={() => onPageChange?.(currentPage + 1)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}