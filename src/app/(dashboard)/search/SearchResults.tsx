'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter } from 'lucide-react'
import { searchAll, type SearchFilters, type SearchResponse } from '@/lib/db/search'
import { SearchFilters as SearchFiltersComponent } from '@/components/features/search/SearchFilters'
import { SearchResultCard } from '@/components/features/search/SearchResultCard'

interface SearchResultsProps {
  query: string
  page: number
  filters: SearchFilters
}

export function SearchResults({ query, page, filters }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>(filters)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Perform search when query or filters change
  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      return
    }

    setIsLoading(true)
    searchAll(query, { page, filters: currentFilters })
      .then(setResults)
      .finally(() => setIsLoading(false))
  }, [query, page, currentFilters])

  // Update URL when filters change
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setCurrentFilters(newFilters)

    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (newFilters.type?.length) params.set('type', newFilters.type.join(','))
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.dateRange?.from) params.set('from', newFilters.dateRange.from)
    if (newFilters.dateRange?.to) params.set('to', newFilters.dateRange.to)
    if (newFilters.author) params.set('author', newFilters.author)

    router.push(`/dashboard/search?${params.toString()}`, { scroll: false })
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/dashboard/search?${params.toString()}`)
  }

  // Empty state when no query
  if (!query.trim()) {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Start Your Search
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Enter a search term above to find events, blogs, communities, marketplace items, and more across the campus platform.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Searching...</span>
            </div>
          ) : results ? (
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {results.totalCount === 0 ? 'No results' : `${results.totalCount} ${results.totalCount === 1 ? 'result' : 'results'}`} for "{query}"
              </p>
              {results.totalCount > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {((page - 1) * 20) + 1}-{Math.min(page * 20, results.totalCount)} of {results.totalCount}
                </p>
              )}
            </div>
          ) : null}
        </div>

        {/* Filters */}
        <SearchFiltersComponent
          filters={currentFilters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Results */}
      {isLoading ? (
        <SearchResultsSkeleton />
      ) : results?.results.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No results found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
            We couldn't find any content matching your search. Try adjusting your search terms or filters.
          </p>
          <button
            onClick={() => handleFiltersChange({})}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
          >
            <Filter className="w-4 h-4" />
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Results List */}
          <div className="space-y-4">
            {results?.results.map((result) => (
              <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
            ))}
          </div>

          {/* Pagination */}
          {results && results.totalCount > 20 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              {page > 1 && (
                <button
                  onClick={() => handlePageChange(page - 1)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Previous
                </button>
              )}

              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {Math.ceil(results.totalCount / 20)}
              </span>

              {page < Math.ceil(results.totalCount / 20) && (
                <button
                  onClick={() => handlePageChange(page + 1)}
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

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}