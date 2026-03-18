import Link from 'next/link'
import { listEvents } from '@/lib/db/events'
import { EventList } from '@/components/features/events/EventList'

export const metadata = {
  title: 'Events | DEP Campus Platform',
  description: 'Discover and register for upcoming campus events',
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    type?: string
    search?: string
  }>
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const type = params.type
  const search = params.search

  const { events, count } = await listEvents({
    page,
    limit: 20,
    event_type: type,
    search,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Events</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Discover and register for {count} upcoming campus events
          </p>
        </div>

        <Link
          href="/events/create"
          className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
        >
          Create Event
        </Link>
      </div>

      {/* Events List */}
      <EventList
        initialEvents={events}
        totalCount={count}
        initialPage={page}
        pageSize={20}
      />
    </div>
  )
}
