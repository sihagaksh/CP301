import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bell, Check } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { listNotifications, getUnreadNotificationCount } from '@/lib/db/notifications'
import { NotificationList } from '@/components/features/notifications/NotificationList'
import { MarkAllAsReadButton } from '@/components/features/notifications/MarkAllAsReadButton'

interface NotificationsPageProps {
  searchParams: Promise<{
    page?: string
  }>
}

export const metadata = {
  title: 'Notifications - Campus Connect',
  description: 'View your notifications',
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const page = parseInt(params.page || '1', 10)

  const [{ data: notifications, count, total_pages }, unreadCount] = await Promise.all([
    listNotifications({ userId: user.id, page, limit: 20 }),
    getUnreadNotificationCount(user.id),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Bell className="w-8 h-8" />
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
            </p>
          )}
        </div>

        {unreadCount > 0 && <MarkAllAsReadButton userId={user.id} />}
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <NotificationList initialNotifications={notifications} />
      </div>

      {/* Pagination */}
      {total_pages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/notifications?page=${page - 1}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Previous
            </Link>
          )}
          {page < total_pages && (
            <Link
              href={`/notifications?page=${page + 1}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}

      {/* Help Text */}
      {notifications.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center">
          <Bell className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No notifications yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You'll see notifications here when there's activity on your account
          </p>
        </div>
      )}
    </div>
  )
}
