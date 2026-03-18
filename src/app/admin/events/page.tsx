'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { listUnapprovedEvents, approveEvent, rejectEvent } from '@/lib/db/admin'
import { EventApprovalCard } from '@/components/features/admin/EventApprovalCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Event, User, PaginatedResponse } from '@/lib/types'

export default function AdminEventsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1')
  const [events, setEvents] = useState<(Event & { creator?: User })[]>([])
  const [pagination, setPagination] = useState<{
    count: number
    total_pages: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load events on mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const result = await listUnapprovedEvents({ page, limit: 20 })
        setEvents(result.data)
        setPagination({ count: result.count, total_pages: result.total_pages })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events')
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [page])

  const handleApprove = async (eventId: string) => {
    try {
      await approveEvent(eventId)
      setEvents(events.filter((e) => e.id !== eventId))
      setPagination((prev) => (prev ? { ...prev, count: prev.count - 1 } : null))
    } catch (err) {
      console.error('Error approving event:', err)
    }
  }

  const handleReject = async (eventId: string) => {
    try {
      await rejectEvent(eventId)
      setEvents(events.filter((e) => e.id !== eventId))
      setPagination((prev) => (prev ? { ...prev, count: prev.count - 1 } : null))
    } catch (err) {
      console.error('Error rejecting event:', err)
    }
  }

  const goToPage = (newPage: number) => {
    router.push(`/admin/events?page=${newPage}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Approval</h1>
        <div className="text-center py-12">Loading events...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Approval</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review and approve pending events</p>
        </div>
        <Link href="/admin" className="text-amber-500 hover:text-amber-600 font-medium">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Stats */}
      {pagination && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Showing <span className="text-gray-900 dark:text-white font-bold">{events.length}</span> of{' '}
            <span className="text-gray-900 dark:text-white font-bold">{pagination.count}</span> events
          </p>
        </div>
      )}

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventApprovalCard
              key={event.id}
              event={event}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400 font-medium">No events pending approval</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">All events have been reviewed</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`w-10 h-10 rounded-lg transition-colors ${
                p === page
                  ? 'bg-amber-500 text-white'
                  : 'border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === pagination.total_pages}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
