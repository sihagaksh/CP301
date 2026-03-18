import Link from 'next/link'
import { MapPin, Calendar, Tag } from 'lucide-react'
import type { LostFoundItem } from '@/lib/types'

interface ItemCardProps {
  item: LostFoundItem & {
    reporter?: {
      full_name: string
      avatar_url: string | null
    }
  }
}

const STATUS_COLORS = {
  lost: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  found: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  claimed: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
}

const CATEGORY_COLORS: Record<string, string> = {
  electronics: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  accessories: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  documents: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  clothing: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  books: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  other: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
}

export function ItemCard({ item }: ItemCardProps) {
  const firstImage = item.images && item.images.length > 0 ? item.images[0] : null

  return (
    <Link href={`/lost-found/${item.id}`}>
      <div className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
        {/* Image */}
        <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage}
              alt={item.item_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tag className="w-12 h-12 text-gray-400 dark:text-gray-600" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                STATUS_COLORS[item.status]
              }`}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title & Category */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {item.item_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {item.status === 'lost' ? 'Lost' : item.status === 'found' ? 'Found' : 'Claimed'}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other
              }`}
            >
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {item.description}
          </p>

          {/* Location & Date */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(item.date_lost_found).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Reporter */}
          {item.reporter && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              {item.reporter.avatar_url ? (
                <img
                  src={item.reporter.avatar_url}
                  alt={item.reporter.full_name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
              )}
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Reported by {item.reporter.full_name}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
