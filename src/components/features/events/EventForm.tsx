'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEvent, updateEvent } from '@/lib/db/events'
import { eventCreateSchema } from '@/lib/validators'
import type { Event } from '@/lib/types'
import type { z } from 'zod'

type EventFormData = z.infer<typeof eventCreateSchema>

interface EventFormProps {
  event?: Event
  onSuccess?: () => void
  userId: string
}

const EVENT_TYPES = ['workshop', 'seminar', 'conference', 'sports', 'cultural', 'academic', 'social', 'other']

export function EventForm({ event, onSuccess, userId }: EventFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventCreateSchema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description,
          event_date: event.event_date,
          event_time: event.event_time || '',
          location: event.location || '',
          capacity: event.capacity || undefined,
          event_type: event.event_type || '',
        }
      : {
          title: '',
          description: '',
          event_date: '',
          event_time: '',
          location: '',
          capacity: undefined,
          event_type: 'workshop',
        },
  })

  async function onSubmit(data: EventFormData) {
    setIsLoading(true)
    setError(null)

    try {
      if (event) {
        await updateEvent(event.id, data)
        router.push(`/events/${event.id}`)
      } else {
        await createEvent({
          ...data,
          created_by: userId,
          registered_count: 0,
          is_approved: false,
          organization_id: null,
          latitude: null,
          longitude: null,
        })
        router.push('/events')
      }

      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
      {error && (
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Event Title *
        </label>
        <input
          type="text"
          {...form.register('title')}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="Enter event title"
        />
        {form.formState.errors.title && (
          <p className="mt-1 text-sm text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Description *
        </label>
        <textarea
          {...form.register('description')}
          rows={4}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="Event details and information"
        />
        {form.formState.errors.description && (
          <p className="mt-1 text-sm text-red-500">{form.formState.errors.description.message}</p>
        )}
      </div>

      {/* Date & Time Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Event Date *
          </label>
          <input
            type="date"
            {...form.register('event_date')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          {form.formState.errors.event_date && (
            <p className="mt-1 text-sm text-red-500">{form.formState.errors.event_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Event Time
          </label>
          <input
            type="time"
            {...form.register('event_time')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Location
        </label>
        <input
          type="text"
          {...form.register('location')}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="Event venue or online link"
        />
      </div>

      {/* Event Type & Capacity Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Event Type
          </label>
          <select
            {...form.register('event_type')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Select type</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Capacity
          </label>
          <input
            type="number"
            {...form.register('capacity', { valueAsNumber: true })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Max attendees (optional)"
            min="1"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
