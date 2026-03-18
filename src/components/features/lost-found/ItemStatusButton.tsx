'use client'

import { useState } from 'react'
import { markAsClaimed, reopenItem } from '@/lib/db/lost-found'
import { Check, RotateCcw } from 'lucide-react'

interface ItemStatusButtonProps {
  itemId: string
  currentStatus: 'lost' | 'found' | 'claimed'
  userId: string
  onStatusChange?: (newStatus: 'lost' | 'found' | 'claimed') => void
}

export function ItemStatusButton({
  itemId,
  currentStatus,
  userId,
  onStatusChange,
}: ItemStatusButtonProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleMarkAsClaimed() {
    setIsLoading(true)
    setError(null)

    try {
      await markAsClaimed(itemId, userId)
      setStatus('claimed')
      if (onStatusChange) {
        onStatusChange('claimed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as claimed')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleReopen(newStatus: 'lost' | 'found') {
    setIsLoading(true)
    setError(null)

    try {
      await reopenItem(itemId, newStatus)
      setStatus(newStatus)
      if (onStatusChange) {
        onStatusChange(newStatus)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reopen item')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex flex-col gap-2">
        {/* Mark as Claimed */}
        {status !== 'claimed' && (
          <button
            onClick={handleMarkAsClaimed}
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Mark as Claimed/Resolved</span>
              </>
            )}
          </button>
        )}

        {/* Reopen Item */}
        {status === 'claimed' && (
          <div className="flex gap-2">
            <button
              onClick={() => handleReopen('lost')}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Reopen as Lost</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleReopen('found')}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Reopen as Found</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Current Status Indicator */}
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        Current status:{' '}
        <span className="font-medium">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </p>
    </div>
  )
}
