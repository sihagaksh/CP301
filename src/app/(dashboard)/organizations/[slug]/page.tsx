import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getOrganizationBySlug, getOrganizationMembers } from '@/lib/db/organizations'
import { OrganizationDetail } from './OrganizationDetail'

interface OrganizationPageProps {
  params: {
    slug: string
  }
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Handle non-authenticated users - they can view but not join
    const organization = await getOrganizationBySlug(params.slug)
    if (!organization) {
      notFound()
    }

    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Sign in to interact with organizations
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You can view organization details, but need to sign in to join or create organizations.
          </p>
        </div>
      </div>
    )
  }

  const organization = await getOrganizationBySlug(params.slug, user.id)

  if (!organization) {
    notFound()
  }

  return (
    <Suspense fallback={<OrganizationDetailSkeleton />}>
      <OrganizationDetail
        organization={organization}
        currentUserId={user.id}
      />
    </Suspense>
  )
}

function OrganizationDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start gap-6">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="flex-1 space-y-3">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
        <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}