import Link from 'next/link'
import { Plus } from 'lucide-react'
import { listListings } from '@/lib/db/marketplace'
import { ListingList } from '@/components/features/marketplace/ListingList'
import { createServerClient } from '@/lib/supabase/server'

interface MarketplacePageProps {
  searchParams: Promise<{
    page?: string
    category?: string
    condition?: string
    search?: string
  }>
}

export const metadata = {
  title: 'Marketplace - Campus Connect',
  description: 'Browse and buy items from other students',
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const category = params.category
  const condition = params.condition
  const search = params.search

  const { data: listings, count, total_pages } = await listListings({
    page,
    limit: 20,
    category,
    condition,
    status: 'available',
    search,
  })

  // Get current user
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {count} {count === 1 ? 'item' : 'items'} available
          </p>
        </div>

        {user && (
          <Link
            href="/marketplace/create"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Sell Item
          </Link>
        )}
      </div>

      {/* Search */}
      <form method="get" className="flex gap-2">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search listings..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg font-medium transition-colors"
        >
          Search
        </button>
      </form>

      {/* Listings */}
      <ListingList
        initialListings={listings}
        totalCount={count}
        initialPage={page}
        pageSize={20}
      />

      {/* Pagination */}
      {total_pages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/marketplace?page=${page - 1}${category ? `&category=${category}` : ''}${condition ? `&condition=${condition}` : ''}${search ? `&search=${search}` : ''}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Previous
            </Link>
          )}
          {page < total_pages && (
            <Link
              href={`/marketplace?page=${page + 1}${category ? `&category=${category}` : ''}${condition ? `&condition=${condition}` : ''}${search ? `&search=${search}` : ''}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
