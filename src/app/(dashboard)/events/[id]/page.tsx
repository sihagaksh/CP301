import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar, MapPin, Users, Clock, ArrowLeft } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { getEventById, isUserRegistered } from '@/lib/db/events'
import { EventRegistrationButton } from '@/components/features/events/EventRegistrationButton'

interface EventDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EventDetailPageProps) {
  const { id } = await params
  const event = await getEventById(id)

  if (!event) {
    return { title: 'Event Not Found' }
  }

  return {
    title: `${event.title} | DEP Campus Platform`,
    description: event.description,
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params
  const event = await getEventById(id)

  if (!event) {
    notFound()
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isRegistered = user ? await isUserRegistered(id, user.id) : false
  const shouldShowEdit = user && user.id === event.created_by

  const eventDate = new Date(event.event_date)
  const formattedDate = format(eventDate, 'EEEE, MMMM d, yyyy')
  const isPast = eventDate < new Date()

  const creatorInitials = event.creator
    ? (event.creator.full_name || 'Unknown')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header with Back Button */}
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      {/* Event Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="inline-block">
              <span
                className={`text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full
                ${
                  event.event_type === 'workshop'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : event.event_type === 'seminar'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : event.event_type === 'sports'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : event.event_type === 'cultural'
                          ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {event.event_type?.replace('_', ' ') || 'Event'}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {event.title}
            </h1>

            {!event.is_approved && (
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                ⚠️ This event is pending admin approval
              </p>
            )}
          </div>

          {shouldShowEdit && (
            <Link
              href={`/events/${id}/edit`}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
            >
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Date</p>
                  <p className="text-gray-900 dark:text-white font-bold">{formattedDate}</p>
                  {event.event_time && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {format(new Date(`2000-01-01 ${event.event_time}`), 'h:mm a')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Location</p>
                    <p className="text-gray-900 dark:text-white font-bold">{event.location}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Capacity */}
            {event.capacity && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Capacity</p>
                    <p className="text-gray-900 dark:text-white font-bold">
                      {event.registered_count} / {event.capacity}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">About Event</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          {user && event.is_approved && !isPast && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
              <EventRegistrationButton
                eventId={id}
                userId={user.id}
                isRegistered={isRegistered}
                registeredCount={event.registered_count}
                capacity={event.capacity}
              />
            </div>
          )}

          {!user && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
              <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                Sign in to register for this event
              </p>
              <Link
                href="/login"
                className="block w-full px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors text-center"
              >
                Sign In
              </Link>
            </div>
          )}

          {isPast && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 p-6 text-center">
              <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Event has ended</p>
            </div>
          )}

          {/* Creator Card */}
          {event.creator && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Organized By</h3>
              <div className="flex items-center gap-3">
                {event.creator.avatar_url ? (
                  <img
                    src={event.creator.avatar_url}
                    alt={event.creator.full_name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                    {creatorInitials}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {event.creator.full_name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {event.creator.role}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
