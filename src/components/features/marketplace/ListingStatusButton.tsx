'use client'

import { useState } from 'react'
import { markAsSold, markAsReserved, markAsAvailable } from '@/lib/db/marketplace'
import { Check, Clock, RotateCcw } from 'lucide-react'

interface ListingStatusButtonProps {
  listingId: string
  currentStatus: 'available' | 'reserved' | 'sold'
  onStatusChange?: (newStatus: 'available' | 'reserved' | 'sold') => void
}

export function ListingStatusButton({
  listingId,
  currentStatus,
  onStatusChange,
}: ListingStatusButtonProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStatusChange(newStatus: 'available' | 'reserved' | 'sold') {
    if (newStatus === status) return

    setIsLoading(true)
    setError(null)

    try {
      if (newStatus === 'sold') {
        await markAsSold(listingId)
      } else if (newStatus === 'reserved') {
        await markAsReserved(listingId)
      } else {
        await markAsAvailable(listingId)
      }

      setStatus(newStatus)
      if (onStatusChange) {
        onStatusChange(newStatus)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-2">
        {/* Mark as Available */}
        {status !== 'available' && (
          <button
            onClick={() => handleStatusChange('available')}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Mark Available</span>
              </>
            )}
          </button>
        )}

        {/* Mark as Reserved */}
        {status === 'available' && (
          <button
            onClick={() => handleStatusChange('reserved')}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <Clock className="w-4 h-4" />
                <span>Mark Reserved</span>
              </>
            )}
          </button>
        )}

        {/* Mark as Sold */}
        {status !== 'sold' && (
          <button
            onClick={() => handleStatusChange('sold')}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Mark Sold</span>
              </>
            )}
          </button>
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
