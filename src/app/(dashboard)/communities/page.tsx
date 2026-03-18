import Link from 'next/link'
import { listCommunities } from '@/lib/db/communities'
import { CommunityList } from '@/components/features/communities/CommunityList'

export const metadata = {
  title: 'Communities | DEP Campus Platform',
  description: 'Discover and join campus communities',
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
  }>
}

export default async function CommunitiesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const search = params.search

  const { communities, count } = await listCommunities({
    page,
    limit: 20,
    public_only: true,
    search,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Communities</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Join {count} active communities on campus
          </p>
        </div>

        <Link
          href="/dashboard/communities/create"
          className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors"
        >
          Create Community
        </Link>
      </div>

      {/* Communities List */}
      <CommunityList initialCommunities={communities} totalCount={count} initialPage={page} pageSize={20} />
    </div>
  )
}
