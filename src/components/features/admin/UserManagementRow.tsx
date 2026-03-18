'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShieldAlert, ShieldCheck } from 'lucide-react'
import type { User } from '@/lib/types'

interface UserManagementRowProps {
  user: User
  onRoleChange: (userId: string, newRole: User['role']) => Promise<void>
  onSuspend: (userId: string) => Promise<void>
  onUnsuspend: (userId: string) => Promise<void>
}

export function UserManagementRow({ user, onRoleChange, onSuspend, onUnsuspend }: UserManagementRowProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRoleChange = async (newRole: User['role']) => {
    setIsLoading(true)
    setError(null)
    try {
      await onRoleChange(user.id, newRole)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuspend = async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (user.is_active) {
        await onSuspend(user.id)
      } else {
        await onUnsuspend(user.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status')
    } finally {
      setIsLoading(false)
    }
  }

  // Type guard for is_active
  const isActive = (user as any).is_active !== false

  return (
    <>
      <tr className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        {/* Avatar & Name */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.full_name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center font-medium text-gray-700 dark:text-gray-300">
                {user.full_name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{user.full_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
        </td>

        {/* Department */}
        <td className="px-6 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{user.department || '-'}</p>
        </td>

        {/* Current Role */}
        <td className="px-6 py-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            {user.role}
          </span>
        </td>

        {/* Role Dropdown */}
        <td className="px-6 py-4">
          <select
            value={user.role}
            onChange={(e) => handleRoleChange(e.target.value as User['role'])}
            disabled={isLoading}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </td>

        {/* Suspend/Unsuspend */}
        <td className="px-6 py-4">
          <button
            onClick={handleSuspend}
            disabled={isLoading}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isActive
                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
                : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
            }`}
          >
            {isActive ? (
              <>
                <ShieldAlert className="w-4 h-4" />
                Suspend
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Unsuspend
              </>
            )}
          </button>
        </td>
      </tr>

      {/* Error Row */}
      {error && (
        <tr>
          <td colSpan={5} className="px-6 py-3 bg-red-50 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </td>
        </tr>
      )}
    </>
  )
}
