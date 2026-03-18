'use client'

import { useState } from 'react'
import { UserCard } from './UserCard'
import type { Profile } from '@/lib/types'

interface UserListProps {
  initialUsers: Profile[]
  totalCount: number
  currentUserId?: string
  initialPage?: number
  pageSize?: number
}

const DEPARTMENTS = [
  'Computer Science',
  'Engineering',
  'Business',
  'Arts',
  'Science',
  'Medicine',
]

export function UserList({
  initialUsers,
  totalCount,
  currentUserId,
  initialPage = 1,
  pageSize = 24,
}: UserListProps) {
  const [users, setUsers] = useState(initialUsers)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)

  const filteredUsers = selectedDepartment
    ? users.filter((user) => user.department === selectedDepartment)
    : users

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Department Filter */}
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filter by Department
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDepartment(null)}
            className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
              selectedDepartment === null
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            All Departments
          </button>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
                selectedDepartment === dept
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              currentUserId={currentUserId}
              showFollowButton={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 font-medium">No users found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Try adjusting your filters or search query
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
