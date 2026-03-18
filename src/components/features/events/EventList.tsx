'use client'

import { useState } from 'react'
import { EventCard } from './EventCard'
import type { Event } from '@/lib/types'

interface EventListProps {
  initialEvents: (Event & { creator?: { full_name: string; avatar_url: string | null } })[]
  totalCount: number
  initialPage?: number
  pageSize?: number
}

const EVENT_TYPES = ['workshop', 'seminar', 'conference', 'sports', 'cultural', 'academic', 'social']

export function EventList({
  initialEvents,
  totalCount,
  initialPage = 1,
  pageSize = 20,
}: EventListProps) {
  const [events, setEvents] = useState(initialEvents)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const filteredEvents = selectedType
    ? events.filter((e) => e.event_type === selectedType)
    : events

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 items-center pb-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setSelectedType(null)}
          className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
            selectedType === null
              ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          All Events
        </button>

        {EVENT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
              selectedType === type
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 font-medium">No events found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Try adjusting your filters or check back soon
          </p>
        </div>
      )}

      {/* Pagination Info */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Page {initialPage} of {totalPages}
        </div>
      )}
    </div>
  )
}
