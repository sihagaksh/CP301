'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Event } from '@/lib/types'

interface EventCardProps {
  event: Event & { creator?: { full_name: string; avatar_url: string | null } | undefined }
  compact?: boolean
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const eventDate = new Date(event.event_date)
  const isPast = eventDate < new Date()

  const month = format(eventDate, 'MMM').toUpperCase()
  const day = format(eventDate, 'dd')
  const time = event.event_time ? format(new Date(`2000-01-01 ${event.event_time}`), 'h:mm a') : 'All day'

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <div
        className={cn(
          'relative overflow-hidden flex gap-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
          compact ? 'p-3' : 'p-4 sm:p-5',
          isPast && 'opacity-60'
        )}
      >
        {/* Date Badge */}
        <div
          className={cn(
            'shrink-0 flex flex-col items-center justify-center rounded-lg overflow-hidden border text-white font-bold',
            compact ? 'w-14 h-16 text-xs' : 'w-16 h-20 text-sm',
            isPast ? 'bg-gray-400 border-gray-300' : 'bg-amber-500 border-amber-400'
          )}
        >
          <div className="text-[10px] tracking-wider">{month}</div>
          <div className="text-2xl font-bold">{day}</div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* Type Badge */}
          <div className="mb-1">
            <span
              className={cn(
                'text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full inline-block',
                event.event_type === 'workshop'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : event.event_type === 'seminar'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                    : event.event_type === 'sports'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : event.event_type === 'cultural'
                        ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              )}
            >
              {event.event_type?.replace('_', ' ') || 'Event'}
            </span>
          </div>

          {/* Title */}
          <h3
            className={cn(
              'font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate',
              compact ? 'text-sm mb-1' : 'text-base mb-2'
            )}
          >
            {event.title}
          </h3>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" />
              {time}
            </span>

            {event.location && (
              <span className="flex items-center gap-1 truncate max-w-[120px]">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{event.location}</span>
              </span>
            )}

            {event.capacity && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {event.registered_count}/{event.capacity}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
