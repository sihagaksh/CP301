import Link from 'next/link'
import { Plus } from 'lucide-react'
import { listLostFoundItems } from '@/lib/db/lost-found'
import { ItemList } from '@/components/features/lost-found/ItemList'
import { createServerClient } from '@/lib/supabase/server'

interface LostFoundPageProps {
  searchParams: Promise<{
    page?: string
    status?: string
    category?: string
    search?: string
  }>
}

export const metadata = {
  title: 'Lost & Found - Campus Connect',
  description: 'Report lost items or help reunite found items with their owners',
}

export default async function LostFoundPage({ searchParams }: LostFoundPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const status = params.status as 'lost' | 'found' | 'claimed' | undefined
  const category = params.category
  const search = params.search

  const { data: items, count, total_pages } = await listLostFoundItems({
    page,
    limit: 20,
    status,
    category,
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
            Lost & Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {count} {count === 1 ? 'item' : 'items'} reported
          </p>
        </div>

        {user && (
          <Link
            href="/lost-found/create"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Report Item
          </Link>
        )}
      </div>

      {/* Search */}
      <form method="get" className="flex gap-2">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search items..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg font-medium transition-colors"
        >
          Search
        </button>
      </form>

      {/* Items */}
      <ItemList
        initialItems={items}
        totalCount={count}
        initialPage={page}
        pageSize={20}
      />

      {/* Pagination */}
      {total_pages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/lost-found?page=${page - 1}${status ? `&status=${status}` : ''}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Previous
            </Link>
          )}
          {page < total_pages && (
            <Link
              href={`/lost-found?page=${page + 1}${status ? `&status=${status}` : ''}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`}
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
