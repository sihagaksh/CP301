import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Edit, MapPin, Calendar, Mail, Tag, Phone } from 'lucide-react'
import { getLostFoundItemById } from '@/lib/db/lost-found'
import { createServerClient } from '@/lib/supabase/server'
import { ItemStatusButton } from '@/components/features/lost-found/ItemStatusButton'

interface ItemDetailPageProps {
  params: Promise<{ id: string }>
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

export async function generateMetadata({ params }: ItemDetailPageProps) {
  const { id } = await params
  const item = await getLostFoundItemById(id)

  if (!item) {
    return {
      title: 'Item Not Found',
    }
  }

  return {
    title: `${item.item_name} - Lost & Found`,
    description: item.description.substring(0, 160),
  }
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params
  const item = await getLostFoundItemById(id)

  if (!item) {
    notFound()
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isReporter = user && user.id === item.reported_by

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                STATUS_COLORS[item.status]
              }`}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other
              }`}
            >
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {item.item_name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            {item.status === 'lost' ? 'Lost Item' : 'Found Item'}
          </p>
        </div>

        {isReporter && item.status !== 'claimed' && (
          <Link
            href={`/lost-found/${item.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images and Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {item.images && item.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                >
                  <img
                    src={image}
                    alt={`${item.item_name} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <Tag className="w-16 h-16 text-gray-400 dark:text-gray-600" />
            </div>
          )}

          {/* Description */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          {/* Details */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>
                  {item.status === 'lost' ? 'Lost on' : 'Found on'}{' '}
                  {new Date(item.date_lost_found).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Tag className="w-5 h-5 text-gray-400" />
                <span>
                  Reported on {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Reporter Info and Actions */}
        <div className="space-y-6">
          {/* Reporter Card */}
          {item.reporter && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Reporter Information
              </h2>
              <div className="flex items-center gap-3 mb-4">
                {item.reporter.avatar_url ? (
                  <img
                    src={item.reporter.avatar_url}
                    alt={item.reporter.full_name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {item.reporter.full_name}
                  </p>
                  {item.reporter.email && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-3 h-3" />
                      <span>{item.reporter.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              {item.contact_info && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Contact
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {item.contact_info}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isReporter && user && item.status !== 'claimed' && (
                <a
                  href={`mailto:${item.reporter.email}?subject=${item.status === 'lost' ? 'Found' : 'About'} ${item.item_name}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors mt-4"
                >
                  <Mail className="w-5 h-5" />
                  Contact Reporter
                </a>
              )}
            </div>
          )}

          {/* Status Management (Reporter Only) */}
          {isReporter && user && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Manage Status
              </h2>
              <ItemStatusButton
                itemId={item.id}
                currentStatus={item.status}
                userId={user.id}
              />
            </div>
          )}

          {/* Login Prompt (Non-authenticated Users) */}
          {!user && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
              <p className="text-amber-800 dark:text-amber-200 mb-4">
                Sign in to contact the reporter
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
