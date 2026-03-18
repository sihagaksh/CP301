import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Edit, MapPin, Calendar, Tag, Mail } from 'lucide-react'
import { getListingById } from '@/lib/db/marketplace'
import { createServerClient } from '@/lib/supabase/server'
import { ListingStatusButton } from '@/components/features/marketplace/ListingStatusButton'

interface ListingDetailPageProps {
  params: Promise<{ id: string }>
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

export async function generateMetadata({ params }: ListingDetailPageProps) {
  const { id } = await params
  const listing = await getListingById(id)

  if (!listing) {
    return {
      title: 'Listing Not Found',
    }
  }

  return {
    title: `${listing.title} - Marketplace`,
    description: listing.description.substring(0, 160),
  }
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params
  const listing = await getListingById(id)

  if (!listing) {
    notFound()
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwner = user && user.id === listing.created_by

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                STATUS_COLORS[listing.status]
              }`}
            >
              {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
            </span>
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                CONDITION_COLORS[listing.condition]
              }`}
            >
              {listing.condition === 'like-new'
                ? 'Like New'
                : listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {listing.title}
          </h1>
          <p className="text-4xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            ${listing.price.toFixed(2)}
          </p>
        </div>

        {isOwner && (
          <Link
            href={`/marketplace/${listing.id}/edit`}
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
          {listing.images && listing.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listing.images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                >
                  <img
                    src={image}
                    alt={`${listing.title} - Image ${index + 1}`}
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
              {listing.description}
            </p>
          </div>

          {/* Details */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Tag className="w-5 h-5 text-gray-400" />
                <span className="capitalize">{listing.category.replace('-', ' ')}</span>
              </div>
              {listing.location && (
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{listing.location}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>
                  Listed on {new Date(listing.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Seller Info and Actions */}
        <div className="space-y-6">
          {/* Seller Card */}
          {listing.seller && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Seller Information
              </h2>
              <div className="flex items-center gap-3 mb-4">
                {listing.seller.avatar_url ? (
                  <img
                    src={listing.seller.avatar_url}
                    alt={listing.seller.full_name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {listing.seller.full_name}
                  </p>
                  {listing.seller.email && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-3 h-3" />
                      <span>{listing.seller.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {!isOwner && user && listing.status === 'available' && (
                <a
                  href={`mailto:${listing.seller.email}?subject=Interest in ${listing.title}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Contact Seller
                </a>
              )}
            </div>
          )}

          {/* Status Management (Owner Only) */}
          {isOwner && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Manage Listing
              </h2>
              <ListingStatusButton listingId={listing.id} currentStatus={listing.status} />
            </div>
          )}

          {/* Login Prompt (Non-authenticated Users) */}
          {!user && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
              <p className="text-amber-800 dark:text-amber-200 mb-4">
                Sign in to contact the seller
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
