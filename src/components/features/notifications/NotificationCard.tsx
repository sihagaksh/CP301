'use client'

import { Heart, MessageSquare, UserPlus, Bell } from 'lucide-react'
import type { Notification } from '@/lib/types'

interface NotificationCardProps {
  notification: Notification
  onMarkAsRead?: (id: string) => void
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'message':
      return <MessageSquare className="w-5 h-5 text-blue-500" />
    case 'follow':
      return <UserPlus className="w-5 h-5 text-green-500" />
    case 'like':
      return <Heart className="w-5 h-5 text-red-500" />
    default:
      return <Bell className="w-5 h-5 text-gray-500" />
  }
}

function formatTimeAgo(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return then.toLocaleDateString()
}

export function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
  const handleClick = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`flex gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
        notification.read
          ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
          : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/30'
      }`}
    >
      {/* Avatar or Icon */}
      <div className="flex-shrink-0">
        {notification.actor?.avatar_url ? (
          <img
            src={notification.actor.avatar_url}
            alt={notification.actor.full_name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {getNotificationIcon(notification.type)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {notification.title}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {notification.actor?.full_name && (
                <span className="font-medium">{notification.actor.full_name}</span>
              )}
              {notification.actor?.full_name && ' '}{notification.message}
            </p>
          </div>

          {/* Unread Indicator */}
          {!notification.read && (
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </div>

        {/* Time */}
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          {formatTimeAgo(notification.created_at)}
        </p>
      </div>
    </div>
  )
}
