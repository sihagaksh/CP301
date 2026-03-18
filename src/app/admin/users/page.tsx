'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { listAdminUsers, updateUserRole, suspendUser, unsuspendUser } from '@/lib/db/admin'
import { UserManagementRow } from '@/components/features/admin/UserManagementRow'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type { User } from '@/lib/types'

export default function AdminUsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1')
  const role = searchParams.get('role') || ''
  const search = searchParams.get('search') || ''

  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<{ count: number; total_pages: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(search)

  // Load users on mount and when filters change
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await listAdminUsers({
          page,
          limit: 20,
          role: role || undefined,
          search: search || undefined,
        })
        setUsers(result.data)
        setPagination({ count: result.count, total_pages: result.total_pages })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users')
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [page, role, search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/admin/users?search=${searchInput}`)
  }

  const handleRoleFilter = (selectedRole: string) => {
    router.push(`/admin/users${selectedRole ? `?role=${selectedRole}` : ''}`)
  }

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams()
    if (role) params.set('role', role)
    if (search) params.set('search', search)
    params.set('page', String(newPage))
    router.push(`/admin/users?${params.toString()}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <div className="text-center py-12">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage user roles and permissions</p>
        </div>
        <Link href="/admin" className="text-amber-500 hover:text-amber-600 font-medium">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
          >
            Search
          </button>
        </form>

        {/* Role Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => handleRoleFilter('')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !role
                ? 'bg-amber-500 text-white'
                : 'border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            All Roles
          </button>
          {['student', 'faculty', 'staff', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => handleRoleFilter(r)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                role === r
                  ? 'bg-amber-500 text-white'
                  : 'border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {pagination && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Showing <span className="text-gray-900 dark:text-white font-bold">{users.length}</span> of{' '}
            <span className="text-gray-900 dark:text-white font-bold">{pagination.count}</span> users
          </p>
        </div>
      )}

      {/* Users Table */}
      {users.length > 0 ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Change Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-950">
              {users.map((user) => (
                <UserManagementRow
                  key={user.id}
                  user={user}
                  onRoleChange={updateUserRole}
                  onSuspend={suspendUser}
                  onUnsuspend={unsuspendUser}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400 font-medium">No users found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Try adjusting your filters</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {Array.from({ length: Math.min(pagination.total_pages, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`w-10 h-10 rounded-lg transition-colors ${
                p === page
                  ? 'bg-amber-500 text-white'
                  : 'border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === pagination.total_pages}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
