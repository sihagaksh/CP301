'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'

interface NotificationBadgeProps {
  unreadCount?: number
}

export function NotificationBadge({ unreadCount = 0 }: NotificationBadgeProps) {
  return (
    <Link
      href="/dashboard/notifications"
      className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      title="Notifications"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
