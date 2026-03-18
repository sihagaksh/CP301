import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { OrganizationForm } from '@/components/features/organizations/OrganizationForm'

export default async function CreateOrganizationPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create Organization
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Start a new organization to bring together people with shared interests and goals.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <OrganizationForm userId={user.id} />
      </div>
    </div>
  )
}