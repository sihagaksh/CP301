import Link from 'next/link'
import { MapPin, Tag } from 'lucide-react'
import type { MarketplaceListing } from '@/lib/types'

interface ListingCardProps {
  listing: MarketplaceListing & {
    seller?: {
      full_name: string
      avatar_url: string | null
    }
  }
}

const CONDITION_COLORS = {
  new: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  'like-new': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  good: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  fair: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  poor: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
}

const STATUS_COLORS = {
  available: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  reserved: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  sold: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
}

export function ListingCard({ listing }: ListingCardProps) {
  const firstImage = listing.images && listing.images.length > 0 ? listing.images[0] : null

  return (
    <Link href={`/marketplace/${listing.id}`}>
      <div className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
        {/* Image */}
        <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tag className="w-12 h-12 text-gray-400 dark:text-gray-600" />
            </div>
          )}

          {/* Status Badge */}
          {listing.status !== 'available' && (
            <div className="absolute top-2 right-2">
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  STATUS_COLORS[listing.status]
                }`}
              >
                {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Price & Condition */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {listing.title}
              </h3>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                ${listing.price.toFixed(2)}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                CONDITION_COLORS[listing.condition]
              }`}
            >
              {listing.condition === 'like-new'
                ? 'Like New'
                : listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {listing.description}
          </p>

          {/* Category & Location */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="capitalize">{listing.category.replace('-', ' ')}</span>
            {listing.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{listing.location}</span>
              </div>
            )}
          </div>

          {/* Seller */}
          {listing.seller && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              {listing.seller.avatar_url ? (
                <img
                  src={listing.seller.avatar_url}
                  alt={listing.seller.full_name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
              )}
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {listing.seller.full_name}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
