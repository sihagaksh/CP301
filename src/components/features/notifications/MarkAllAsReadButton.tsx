'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { markAllNotificationsAsRead } from '@/lib/db/notifications'

interface MarkAllAsReadButtonProps {
  userId: string
}

export function MarkAllAsReadButton({ userId }: MarkAllAsReadButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true)
      setError(null)
      await markAllNotificationsAsRead(userId)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read')
      console.error('Failed to mark all notifications as read:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleMarkAllAsRead}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white rounded-lg font-medium transition-colors"
      title={error || 'Mark all notifications as read'}
    >
      <Check className="w-4 h-4" />
      {loading ? 'Marking...' : 'Mark all as read'}
    </button>
  )
}
