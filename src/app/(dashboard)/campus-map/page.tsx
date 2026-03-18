import { Suspense } from 'react'
import { CampusMap } from '@/components/features/campus-map/CampusMap'
import { Map, Navigation, MapPin, Calendar, Building2 } from 'lucide-react'

export default function CampusMapPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Campus Map
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive map of DEP Campus with locations, events, and organizations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Campus Locations</p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">Buildings & Facilities</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
            <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">Upcoming Events</p>
            <p className="text-lg font-bold text-red-900 dark:text-red-100">With Locations</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
            <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Organizations</p>
            <p className="text-lg font-bold text-purple-900 dark:text-purple-100">With Offices</p>
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Map Legend
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Campus Locations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Organizations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded">
              🚗
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Parking Areas</span>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Map className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Interactive Campus Map
          </h2>
        </div>

        <Suspense fallback={<CampusMapSkeleton />}>
          <CampusMap
            height="600px"
            showControls={true}
            showSearch={true}
          />
        </Suspense>
      </div>

      {/* Map Instructions */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-3">
          <Navigation className="w-5 h-5 inline mr-2" />
          How to Use the Map
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-800 dark:text-amber-300">
          <div>
            <h4 className="font-medium mb-2">Navigation</h4>
            <ul className="space-y-1">
              <li>• Click on markers to see location details</li>
              <li>• Use the search bar to find specific locations</li>
              <li>• Toggle layers to show/hide different types of content</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Features</h4>
            <ul className="space-y-1">
              <li>• View upcoming events with their locations</li>
              <li>• Find organization offices and meeting spaces</li>
              <li>• Locate buildings, facilities, and amenities</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <MapPin className="w-5 h-5 text-blue-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Find Buildings</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Locate academic buildings</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Calendar className="w-5 h-5 text-red-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Event Locations</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">See where events happen</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Building2 className="w-5 h-5 text-purple-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Organization Offices</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Find club headquarters</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <span className="text-xl">🚗</span>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Parking Areas</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Find parking spots</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

function CampusMapSkeleton() {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" style={{ height: '600px' }}>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Map className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Loading campus map...</p>
        </div>
      </div>
    </div>
  )
}