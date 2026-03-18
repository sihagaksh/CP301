import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getCommunityBySlug } from '@/lib/db/communities'
import { CommunityForm } from '@/components/features/communities/CommunityForm'

interface EditCommunityPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: EditCommunityPageProps): Promise<Metadata> {
  const { slug } = await params
  const community = await getCommunityBySlug(slug)

  if (!community) {
    return { title: 'Community Not Found' }
  }

  return {
    title: `Edit ${community.name} | DEP Campus Platform`,
  }
}

export default async function EditCommunityPage({ params }: EditCommunityPageProps) {
  const { slug } = await params

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const community = await getCommunityBySlug(slug)

  if (!community) {
    notFound()
  }

  // Check if user is the community creator
  if (community.created_by !== user.id) {
    redirect('/dashboard/communities')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Edit Community</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Update community details</p>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
        <CommunityForm userId={user.id} community={community} />
      </div>
    </div>
  )
}
