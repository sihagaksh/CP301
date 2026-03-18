import { Suspense } from 'react'
import { getCampusLocations } from '@/lib/db/campus-map'
import { LocationCard } from '@/components/features/campus-map/LocationCard'
import { MapPin, Building, Search } from 'lucide-react'

interface LocationsPageProps {
  searchParams: {
    type?: string
    search?: string
  }
}

export default function LocationsPage({ searchParams }: LocationsPageProps) {
  const type = searchParams.type
  const search = searchParams.search

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Campus Locations
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Directory of all buildings, facilities, and points of interest on campus
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Building className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Buildings</p>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-100">25+</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <span className="text-2xl">🏗️</span>
          <div>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">Facilities</p>
            <p className="text-xl font-bold text-green-900 dark:text-green-100">15+</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <span className="text-2xl">🗿</span>
          <div>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Landmarks</p>
            <p className="text-xl font-bold text-purple-900 dark:text-purple-100">8+</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <span className="text-2xl">🚗</span>
          <div>
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Parking</p>
            <p className="text-xl font-bold text-orange-900 dark:text-orange-100">5+</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                defaultValue={search || ''}
                placeholder="Search locations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <select
            defaultValue={type || ''}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">All Types</option>
            <option value="building">Buildings</option>
            <option value="facility">Facilities</option>
            <option value="landmark">Landmarks</option>
            <option value="outdoor">Outdoor Areas</option>
            <option value="parking">Parking</option>
            <option value="entrance">Entrances</option>
          </select>
        </div>
      </div>

      {/* Locations Grid */}
      <Suspense fallback={<LocationsGridSkeleton />}>
        <LocationsGrid type={type} search={search} />
      </Suspense>
    </div>
  )
}

async function LocationsGrid({ type, search }: { type?: string; search?: string }) {
  const locations = await getCampusLocations({
    type,
    search,
    includeInactive: false
  })

  if (locations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No locations found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {search || type
            ? 'Try adjusting your search criteria or filters.'
            : 'Campus location information is being updated.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {locations.map((location) => (
        <LocationCard
          key={location.id}
          location={location}
          variant="detailed"
          showMapLink={true}
        />
      ))}
    </div>
  )
}

function LocationsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 animate-pulse">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}