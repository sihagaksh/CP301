'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LogOut } from 'lucide-react'
import { NotificationBadge } from '@/components/features/notifications/NotificationBadge'
import { SearchInput } from '@/components/features/search/SearchInput'

interface HeaderProps {
  unreadNotificationCount?: number
}

export function Header({ unreadNotificationCount = 0 }: HeaderProps) {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            DEP Campus
          </h1>
        </div>

        {/* Search Bar - Hidden on small screens */}
        <div className="hidden lg:flex flex-1 max-w-2xl">
          <SearchInput
            placeholder="Search events, blogs, communities..."
            size="md"
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-4">
          <NotificationBadge unreadCount={unreadNotificationCount} />

          <div className="border-l border-gray-200 dark:border-gray-800 pl-4 flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.full_name}
              </p>
              {user?.role && (
                <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">
                  {user.role}
                </p>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden mt-4">
        <SearchInput
          placeholder="Search campus content..."
          size="md"
          className="w-full"
        />
      </div>
    </header>
  )
}
