'use client'

import Link from 'next/link'
import { MapPin, Users, Clock, Accessibility, ExternalLink, Info } from 'lucide-react'
import { getLocationTypeInfo } from '@/lib/db/campus-map'
import type { CampusLocation } from '@/lib/types'

interface LocationCardProps {
  location: CampusLocation
  variant?: 'default' | 'compact' | 'detailed'
  showMapLink?: boolean
}

export function LocationCard({ location, variant = 'default', showMapLink = true }: LocationCardProps) {
  const isCompact = variant === 'compact'
  const isDetailed = variant === 'detailed'
  const typeInfo = getLocationTypeInfo(location.location_type)

  return (
    <div className={`
      border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden
      hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md
      transition-all duration-200 group bg-white dark:bg-gray-900
      ${isCompact ? 'p-4' : 'p-6'}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {/* Type Icon */}
          <div className={`
            ${isCompact ? 'w-8 h-8 text-lg' : 'w-10 h-10 text-xl'}
            rounded-lg bg-gray-100 dark:bg-gray-800
            flex items-center justify-center font-semibold
          `}>
            {typeInfo.icon}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`
              font-semibold text-gray-900 dark:text-white group-hover:text-amber-700
              dark:group-hover:text-amber-300 transition-colors line-clamp-1
              ${isCompact ? 'text-sm' : 'text-lg'}
            `}>
              {location.name}
            </h3>

            {!isCompact && (
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  typeInfo.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                  typeInfo.color === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                  typeInfo.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' :
                  typeInfo.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' :
                  typeInfo.color === 'amber' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                  {typeInfo.label}
                </span>

                {location.is_accessible && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Accessibility className="w-3 h-3" />
                    <span className="text-xs">Accessible</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {showMapLink && (
          <button
            className="p-2 text-gray-400 hover:text-amber-500 dark:text-gray-500 dark:hover:text-amber-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="View on map"
            onClick={() => {
              // In a real implementation, this would open the map focused on this location
              window.open(`/dashboard/campus-map?location=${location.id}`, '_blank')
            }}
          >
            <MapPin className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Description */}
      {location.description && (
        <p className={`
          text-gray-600 dark:text-gray-400 mb-3
          ${isCompact ? 'text-sm line-clamp-1' : 'text-sm line-clamp-2'}
        `}>
          {location.description}
        </p>
      )}

      {/* Address */}
      {location.address && (
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {location.address}
            {location.floor_number && ` (Floor ${location.floor_number})`}
            {location.room_number && `, Room ${location.room_number}`}
          </span>
        </div>
      )}

      {/* Details */}
      <div className="space-y-2">
        {/* Operating Hours */}
        {location.operating_hours && !isCompact && (
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {location.operating_hours}
            </span>
          </div>
        )}

        {/* Capacity */}
        {location.capacity && !isCompact && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Capacity: {location.capacity} people
            </span>
          </div>
        )}

        {/* Contact Info */}
        {location.contact_info && isDetailed && (
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {location.contact_info}
            </span>
          </div>
        )}

        {/* Amenities */}
        {location.amenities && location.amenities.length > 0 && isDetailed && (
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Amenities:</p>
            <div className="flex flex-wrap gap-1">
              {location.amenities.slice(0, isCompact ? 2 : 6).map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {amenity}
                </span>
              ))}
              {location.amenities.length > (isCompact ? 2 : 6) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  +{location.amenities.length - (isCompact ? 2 : 6)} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {isDetailed && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {typeInfo.label} • {location.is_accessible ? 'Accessible' : 'Limited Access'}
            </div>

            <div className="flex items-center gap-2">
              {showMapLink && (
                <button
                  className="text-amber-600 dark:text-amber-400 hover:underline text-sm font-medium"
                  onClick={() => {
                    window.open(`/dashboard/campus-map?location=${location.id}`, '_blank')
                  }}
                >
                  View on map
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}