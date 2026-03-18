'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react'
import type { Event, User } from '@/lib/types'

interface EventApprovalCardProps {
  event: Event & { creator?: User }
  onApprove: (eventId: string) => Promise<void>
  onReject: (eventId: string) => Promise<void>
}

export function EventApprovalCard({ event, onApprove, onReject }: EventApprovalCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await onApprove(event.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve event')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await onReject(event.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject event')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 space-y-4">
      {/* Title and Type */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{event.title}</h3>
        <div className="mt-1">
          <span className="inline-block text-xs uppercase tracking-wider font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {event.event_type?.replace('_', ' ') || 'Event'}
          </span>
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{event.description}</p>
      )}

      {/* Metadata */}
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        {event.event_date && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(event.event_date), 'MMM dd, yyyy')}
            {event.event_time && ` at ${event.event_time}`}
          </div>
        )}
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {event.location}
          </div>
        )}
      </div>

      {/* Organizer */}
      {event.creator && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Organizer</p>
          <p className="font-medium text-gray-900 dark:text-white">{event.creator.full_name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{event.creator.email}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <button
          onClick={handleApprove}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          {isLoading ? 'Processing...' : 'Approve'}
        </button>
        <button
          onClick={handleReject}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 transition-colors"
        >
          <XCircle className="w-4 h-4" />
          {isLoading ? 'Processing...' : 'Reject'}
        </button>
      </div>
    </div>
  )
}
