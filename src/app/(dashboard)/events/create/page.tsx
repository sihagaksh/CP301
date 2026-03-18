import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { EventForm } from '@/components/features/events/EventForm'

export const metadata: Metadata = {
  title: 'Create Event | DEP Campus Platform',
  description: 'Create a new campus event',
}

export default async function CreateEventPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Create Event</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Share an event with the campus community. Your event will be reviewed before publishing.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <EventForm userId={user.id} />
      </div>
    </div>
  )
}
