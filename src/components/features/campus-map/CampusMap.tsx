'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Map,
  Navigation,
  Search,
  Filter,
  MapPin,
  Calendar,
  Building2,
  Users,
  Info,
  X,
  Layers
} from 'lucide-react'
import {
  getCampusLocations,
  getEventsWithLocations,
  getOrganizationsWithLocations,
  getLocationTypeInfo,
  type CampusLocation
} from '@/lib/db/campus-map'

interface MapMarker {
  id: string
  type: 'location' | 'event' | 'organization'
  title: string
  description?: string
  latitude: number
  longitude: number
  icon: string
  color: string
  data: any
}

interface CampusMapProps {
  initialCenter?: { lat: number; lng: number }
  initialZoom?: number
  height?: string
  showControls?: boolean
  showSearch?: boolean
  markers?: MapMarker[]
}

// DEP Campus approximate coordinates (you should replace with actual coordinates)
const DEP_CAMPUS_CENTER = { lat: 28.6139, lng: 77.2090 } // New Delhi area

export function CampusMap({
  initialCenter = DEP_CAMPUS_CENTER,
  initialZoom = 16,
  height = '500px',
  showControls = true,
  showSearch = true,
  markers: externalMarkers
}: CampusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [locations, setLocations] = useState<CampusLocation[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [organizations, setOrganizations] = useState<any[]>([])
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [activeFilters, setActiveFilters] = useState<{
    locations: boolean
    events: boolean
    organizations: boolean
  }>({
    locations: true,
    events: true,
    organizations: true
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Load map data
  useEffect(() => {
    const loadMapData = async () => {
      setIsLoading(true)
      try {
        const [locationsData, eventsData, orgsData] = await Promise.all([
          getCampusLocations(),
          getEventsWithLocations(),
          getOrganizationsWithLocations()
        ])

        setLocations(locationsData)
        setEvents(eventsData)
        setOrganizations(orgsData)
      } catch (error) {
        console.error('Error loading map data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!externalMarkers) {
      loadMapData()
    }
  }, [externalMarkers])

  // Generate markers from data
  useEffect(() => {
    if (externalMarkers) {
      setMarkers(externalMarkers)
      return
    }

    const allMarkers: MapMarker[] = []

    // Add location markers
    if (activeFilters.locations) {
      locations.forEach(location => {
        const typeInfo = getLocationTypeInfo(location.location_type)
        allMarkers.push({
          id: `location-${location.id}`,
          type: 'location',
          title: location.name,
          description: location.description,
          latitude: location.latitude,
          longitude: location.longitude,
          icon: typeInfo.icon,
          color: typeInfo.color,
          data: location
        })
      })
    }

    // Add event markers
    if (activeFilters.events) {
      events.forEach(event => {
        if (event.latitude && event.longitude) {
          allMarkers.push({
            id: `event-${event.id}`,
            type: 'event',
            title: event.title,
            description: `${event.event_type} • ${new Date(event.start_date).toLocaleDateString()}`,
            latitude: event.latitude,
            longitude: event.longitude,
            icon: '📅',
            color: 'red',
            data: event
          })
        }
      })
    }

    // Add organization markers
    if (activeFilters.organizations) {
      organizations.forEach(org => {
        if (org.location) {
          allMarkers.push({
            id: `org-${org.id}`,
            type: 'organization',
            title: org.name,
            description: org.location.name,
            latitude: org.location.latitude,
            longitude: org.location.longitude,
            icon: '🏢',
            color: 'purple',
            data: org
          })
        }
      })
    }

    // Filter by search query
    const filteredMarkers = searchQuery
      ? allMarkers.filter(marker =>
          marker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          marker.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allMarkers

    setMarkers(filteredMarkers)
  }, [locations, events, organizations, activeFilters, searchQuery, externalMarkers])

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker)
  }

  const handleFilterToggle = (filterType: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }))
  }

  const getMarkerIcon = (marker: MapMarker) => {
    switch (marker.type) {
      case 'location':
        return MapPin
      case 'event':
        return Calendar
      case 'organization':
        return Building2
      default:
        return MapPin
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading campus map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Map Container */}
      <div
        ref={mapRef}
        className="relative bg-green-50 dark:bg-green-950/20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
        style={{ height }}
      >
        {/* Simple Grid Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #0002 1px, transparent 1px),
              linear-gradient(to bottom, #0002 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Campus Illustration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400 dark:text-gray-600">
            <Map className="w-16 h-16 mx-auto mb-2" />
            <p className="text-lg font-medium">DEP Campus</p>
            <p className="text-sm">Interactive Map</p>
          </div>
        </div>

        {/* Markers */}
        <div className="absolute inset-0">
          {markers.map((marker) => {
            // Simple positioning - in a real implementation, you'd convert lat/lng to pixel coordinates
            const x = ((marker.longitude - (initialCenter.lng - 0.01)) / 0.02) * 100
            const y = ((initialCenter.lat + 0.01 - marker.latitude) / 0.02) * 100

            if (x < 0 || x > 100 || y < 0 || y > 100) return null

            const IconComponent = getMarkerIcon(marker)

            return (
              <button
                key={marker.id}
                onClick={() => handleMarkerClick(marker)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full hover:scale-110 transition-transform z-10 ${
                  selectedMarker?.id === marker.id
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg'
                }`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`
                }}
                title={marker.title}
              >
                <IconComponent className="w-4 h-4" />
              </button>
            )
          })}
        </div>

        {/* Navigation Controls */}
        {showControls && (
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button className="p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Navigation className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Layer Controls */}
        {showControls && (
          <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2">
            <div className="flex items-center gap-1 mb-2">
              <Layers className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Layers</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleFilterToggle('locations')}
                className={`flex items-center gap-2 w-full px-2 py-1 text-xs rounded transition-colors ${
                  activeFilters.locations
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>Locations</span>
              </button>
              <button
                onClick={() => handleFilterToggle('events')}
                className={`flex items-center gap-2 w-full px-2 py-1 text-xs rounded transition-colors ${
                  activeFilters.events
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>Events</span>
              </button>
              <button
                onClick={() => handleFilterToggle('organizations')}
                className={`flex items-center gap-2 w-full px-2 py-1 text-xs rounded transition-colors ${
                  activeFilters.organizations
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Building2 className="w-3 h-3" />
                <span>Organizations</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search locations, events, organizations..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      )}

      {/* Info Panel */}
      {selectedMarker && (
        <div className="absolute top-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-20">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                selectedMarker.type === 'event' ? 'bg-red-100 text-red-600' :
                selectedMarker.type === 'organization' ? 'bg-purple-100 text-purple-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {React.createElement(getMarkerIcon(selectedMarker), { className: 'w-4 h-4' })}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedMarker.title}
                </h3>
                {selectedMarker.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedMarker.description}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedMarker(null)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Type-specific content */}
          {selectedMarker.type === 'location' && selectedMarker.data && (
            <div className="space-y-2 text-sm">
              {selectedMarker.data.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">{selectedMarker.data.address}</span>
                </div>
              )}
              {selectedMarker.data.operating_hours && (
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">{selectedMarker.data.operating_hours}</span>
                </div>
              )}
              {selectedMarker.data.amenities && selectedMarker.data.amenities.length > 0 && (
                <div>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">Amenities:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedMarker.data.amenities.map((amenity: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedMarker.type === 'event' && (
            <div className="mt-3">
              <button className="w-full px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">
                View Event Details
              </button>
            </div>
          )}

          {selectedMarker.type === 'organization' && (
            <div className="mt-3">
              <button className="w-full px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">
                View Organization
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="mt-4 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{markers.filter(m => m.type === 'location').length} locations</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{markers.filter(m => m.type === 'event').length} events</span>
        </div>
        <div className="flex items-center gap-1">
          <Building2 className="w-4 h-4" />
          <span>{markers.filter(m => m.type === 'organization').length} organizations</span>
        </div>
      </div>
    </div>
  )
}