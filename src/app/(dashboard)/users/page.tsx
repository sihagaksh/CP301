import Link from 'next/link'
import { Search } from 'lucide-react'
import { listUsers } from '@/lib/db/users'
import { UserList } from '@/components/features/users/UserList'
import { createServerClient } from '@/lib/supabase/server'

interface UsersPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    department?: string
  }>
}

export const metadata = {
  title: 'User Directory - Campus Connect',
  description: 'Find and connect with students and faculty',
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const search = params.search
  const department = params.department

  const { data: users, count, total_pages } = await listUsers({
    page,
    limit: 24,
    search,
    department,
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
            User Directory
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {count} {count === 1 ? 'member' : 'members'} in the community
          </p>
        </div>

        {user && (
          <Link
            href="/settings"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
          >
            Edit Profile
          </Link>
        )}
      </div>

      {/* Search */}
      <form method="get" className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name or bio..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg font-medium transition-colors"
        >
          Search
        </button>
      </form>

      {/* Users */}
      <UserList
        initialUsers={users}
        totalCount={count}
        currentUserId={user?.id}
        initialPage={page}
        pageSize={24}
      />

      {/* Pagination */}
      {total_pages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/users?page=${page - 1}${department ? `&department=${department}` : ''}${search ? `&search=${search}` : ''}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Previous
            </Link>
          )}
          {page < total_pages && (
            <Link
              href={`/users?page=${page + 1}${department ? `&department=${department}` : ''}${search ? `&search=${search}` : ''}`}
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
