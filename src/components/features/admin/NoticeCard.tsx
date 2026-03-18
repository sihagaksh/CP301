'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Trash2, Send } from 'lucide-react'
import type { Notice, User } from '@/lib/types'

interface NoticeCardProps {
  notice: Notice & { author?: User }
  onPublish?: (noticeId: string) => Promise<void>
  onDelete?: (noticeId: string) => Promise<void>
}

export function NoticeCard({ notice, onPublish, onDelete }: NoticeCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePublish = async () => {
    if (!onPublish) return
    setIsLoading(true)
    setError(null)
    try {
      await onPublish(notice.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish notice')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setIsLoading(true)
    setError(null)
    try {
      await onDelete(notice.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notice')
    } finally {
      setIsLoading(false)
    }
  }

  const priorityColors = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{notice.title}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs uppercase tracking-wider font-semibold px-2 py-1 rounded-full ${priorityColors[notice.priority]}`}>
              {notice.priority} Priority
            </span>
            {notice.is_published && (
              <span className="text-xs uppercase tracking-wider font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                Published
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{notice.content}</p>

      {/* Author and Date */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-800">
        <div>
          {notice.author && (
            <p className="font-medium text-gray-600 dark:text-gray-400">{notice.author.full_name}</p>
          )}
          {notice.published_at ? (
            <p>Published {format(new Date(notice.published_at), 'MMM dd, yyyy')}</p>
          ) : (
            <p>Created {format(new Date(notice.created_at), 'MMM dd, yyyy')}</p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        {!notice.is_published && onPublish && (
          <button
            onClick={handlePublish}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Publishing...' : 'Publish'}
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed text-red-700 dark:text-red-300 font-medium py-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
