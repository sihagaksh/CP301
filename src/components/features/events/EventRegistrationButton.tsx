'use client'

import { useState } from 'react'
import { registerForEvent, unregisterFromEvent } from '@/lib/db/events'
import { Users } from 'lucide-react'

interface EventRegistrationButtonProps {
  eventId: string
  userId: string
  isRegistered: boolean
  registeredCount: number
  capacity: number | null
  onRegistrationChange?: (isRegistered: boolean) => void
}

export function EventRegistrationButton({
  eventId,
  userId,
  isRegistered: initialIsRegistered,
  registeredCount,
  capacity,
  onRegistrationChange,
}: EventRegistrationButtonProps) {
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isFull = capacity ? registeredCount >= capacity : false
  const canRegister = !isFull && !isRegistered

  async function handleRegistration() {
    setIsLoading(true)
    setError(null)

    try {
      const newRegistrationState = !isRegistered
      if (isRegistered) {
        await unregisterFromEvent(eventId, userId)
        setIsRegistered(false)
      } else {
        await registerForEvent(eventId, userId)
        setIsRegistered(true)
      }

      if (onRegistrationChange) {
        onRegistrationChange(newRegistrationState)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        onClick={handleRegistration}
        disabled={isLoading || (canRegister && isFull)}
        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          isRegistered
            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50'
            : canRegister
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>{isRegistered ? 'Unregistering...' : 'Registering...'}</span>
          </>
        ) : (
          <>
            <Users className="w-4 h-4" />
            <span>{isRegistered ? 'Unregister' : isFull ? 'Event Full' : 'Register'}</span>
          </>
        )}
      </button>

      {capacity && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {registeredCount} / {capacity} registered
        </p>
      )}
    </div>
  )
}
