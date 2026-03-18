import { Suspense } from 'react'
import { Users } from 'lucide-react'
import { listOrganizations } from '@/lib/db/organizations'
import { OrganizationCard } from '@/components/features/organizations/OrganizationCard'

interface OrganizationsPageProps {
  searchParams: {
    page?: string
    category?: string
    search?: string
  }
}

export default function OrganizationsPage({ searchParams }: OrganizationsPageProps) {
  const page = parseInt(searchParams.page || '1', 10)
  const category = searchParams.category
  const search = searchParams.search

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Organizations
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and join student organizations, clubs, and communities on campus
        </p>
      </div>

      <Suspense fallback={<OrganizationListSkeleton />}>
        <OrganizationListWrapper
          page={page}
          category={category}
          search={search}
        />
      </Suspense>
    </div>
  )
}

async function OrganizationListWrapper({
  page,
  category,
  search
}: {
  page: number
  category?: string
  search?: string
}) {
  const { data: organizations, count, total_pages } = await listOrganizations({
    page,
    limit: 12,
    category,
    search,
    includeStats: true
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {organizations.map((organization) => (
        <OrganizationCard
          key={organization.id}
          organization={organization}
          variant="detailed"
        />
      ))}

      {organizations.length === 0 && (
        <div className="col-span-full text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No organizations found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {search || category
              ? 'Try adjusting your search or filter criteria.'
              : 'Be the first to create an organization on campus!'
            }
          </p>
        </div>
      )}
    </div>
  )
}

function OrganizationListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 animate-pulse">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}