import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { CommunityForm } from '@/components/features/communities/CommunityForm'

export const metadata: Metadata = {
  title: 'Create Community | DEP Campus Platform',
  description: 'Create a new campus community',
}

export default async function CreateCommunityPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Create Community</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Build a space for campus members to connect, share, and collaborate
        </p>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
        <CommunityForm userId={user.id} />
      </div>
    </div>
  )
}
