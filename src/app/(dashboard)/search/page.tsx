import { Suspense } from 'next'
import { searchAll } from '@/lib/db/search'
import { SearchInput } from '@/components/features/search/SearchInput'
import { SearchFilters } from '@/components/features/search/SearchFilters'
import { SearchResultCard } from '@/components/features/search/SearchResultCard'
import { SearchResults } from './SearchResults'

interface SearchPageProps {
  searchParams: {
    q?: string
    page?: string
    type?: string
    category?: string
    from?: string
    to?: string
    author?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ''
  const page = parseInt(searchParams.page || '1', 10)
  const types = searchParams.type ? searchParams.type.split(',') as any[] : undefined

  const filters = {
    type: types,
    category: searchParams.category,
    dateRange: {
      from: searchParams.from,
      to: searchParams.to
    },
    author: searchParams.author
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Search Campus Content
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Search across events, blogs, communities, marketplace, lost & found items, and user profiles
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-2xl">
        <SearchInput
          initialQuery={query}
          size="lg"
          placeholder="Search across all campus content..."
        />
      </div>

      {/* Search Results */}
      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults
          query={query}
          page={page}
          filters={filters}
        />
      </Suspense>
    </div>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}