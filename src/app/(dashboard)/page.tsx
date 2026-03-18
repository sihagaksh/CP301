import Link from 'next/link'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { listEvents } from '@/lib/db/events'
import { listBlogs } from '@/lib/db/blogs'
import { listCommunities } from '@/lib/db/communities'
import { listListings } from '@/lib/db/marketplace'
import { listLostFoundItems } from '@/lib/db/lost-found'
import { getUnreadNotificationCount } from '@/lib/db/notifications'
import { getAdminStats } from '@/lib/db/admin'
import { EventCard } from '@/components/features/events/EventCard'
import { BlogCard } from '@/components/features/blogs/BlogCard'
import { CommunityCard } from '@/components/features/communities/CommunityCard'
import { ListingCard } from '@/components/features/marketplace/ListingCard'
import { ItemCard } from '@/components/features/lost-found/ItemCard'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to view the dashboard.</div>
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Fetch data for all modules
  const [
    { events },
    { data: blogs },
    { communities },
    { data: listings, count: listingsCount },
    { data: lostFoundItems, count: lostFoundCount },
    unreadNotifications,
    adminStats
  ] = await Promise.all([
    listEvents({ page: 1, limit: 5 }),
    listBlogs({ page: 1, limit: 5, published: true }),
    listCommunities({ page: 1, limit: 3 }),
    listListings({ page: 1, limit: 3 }),
    listLostFoundItems({ page: 1, limit: 3 }),
    getUnreadNotificationCount(user.id),
    isAdmin ? getAdminStats() : Promise.resolve(null)
  ])

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to DEP Campus
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your hub for campus events, communities, and collaboration
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Events</div>
          <div className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{events.length || 0}</div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Blogs</div>
          <div className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{blogs.length || 0}</div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Communities</div>
          <div className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{communities.length || 0}</div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Marketplace</div>
          <div className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{listingsCount || 0}</div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Lost & Found</div>
          <div className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{lostFoundCount || 0}</div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Notifications</div>
          <div className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{unreadNotifications || 0}</div>
        </div>

        {isAdmin && adminStats && (
          <>
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-6">
              <div className="text-sm font-medium text-amber-800 dark:text-amber-300">Total Users</div>
              <div className="mt-3 text-3xl font-bold text-amber-900 dark:text-amber-100">{adminStats.totalUsers}</div>
            </div>

            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-6">
              <div className="text-sm font-medium text-amber-800 dark:text-amber-300">Pending Events</div>
              <div className="mt-3 text-3xl font-bold text-amber-900 dark:text-amber-100">{adminStats.unapprovedEvents}</div>
            </div>
          </>
        )}
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Upcoming Events
          </h2>
          <Link
            href="/dashboard/events"
            className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 font-medium text-sm"
          >
            View all →
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400 font-medium">No upcoming events</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Check back soon for new events!
            </p>
          </div>
        )}
      </div>

      {/* Recent Blogs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recent Blogs
          </h2>
          <Link
            href="/dashboard/blogs"
            className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 font-medium text-sm"
          >
            View all →
          </Link>
        </div>

        {blogs.length > 0 ? (
          <div className="space-y-4">
            {blogs.slice(0, 3).map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400 font-medium">No blogs yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>

      {/* Recent Marketplace Listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recent Marketplace
          </h2>
          <Link
            href="/dashboard/marketplace"
            className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 font-medium text-sm"
          >
            View all →
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.slice(0, 3).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400 font-medium">No listings yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Be the first to list an item for sale!
            </p>
          </div>
        )}
      </div>

      {/* Recent Lost & Found Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lost & Found
          </h2>
          <Link
            href="/dashboard/lost-found"
            className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 font-medium text-sm"
          >
            View all →
          </Link>
        </div>

        {lostFoundItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lostFoundItems.slice(0, 3).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400 font-medium">No lost or found items</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Help others by reporting lost or found items!
            </p>
          </div>
        )}
      </div>

      {/* Communities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Active Communities
          </h2>
          <Link
            href="/dashboard/communities"
            className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 font-medium text-sm"
          >
            View all →
          </Link>
        </div>

        {communities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.slice(0, 3).map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400 font-medium">No communities yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Create the first community to get started!
            </p>
          </div>
        )}
      </div>

      {/* Admin Quick Actions - Only visible to admins */}
      {isAdmin && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-6">
          <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-4">
            Admin Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/events"
              className="flex flex-col items-center p-4 rounded-lg border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium text-amber-900 dark:text-amber-100">Approve Events</div>
              <div className="text-sm text-amber-700 dark:text-amber-300">
                {adminStats?.unapprovedEvents || 0} pending
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="flex flex-col items-center p-4 rounded-lg border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium text-amber-900 dark:text-amber-100">Manage Users</div>
              <div className="text-sm text-amber-700 dark:text-amber-300">
                {adminStats?.totalUsers || 0} total
              </div>
            </Link>

            <Link
              href="/admin/notices"
              className="flex flex-col items-center p-4 rounded-lg border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <div className="text-2xl mb-2">📢</div>
              <div className="font-medium text-amber-900 dark:text-amber-100">Notices</div>
              <div className="text-sm text-amber-700 dark:text-amber-300">
                Manage announcements
              </div>
            </Link>

            <Link
              href="/admin"
              className="flex flex-col items-center p-4 rounded-lg border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-medium text-amber-900 dark:text-amber-100">Admin Panel</div>
              <div className="text-sm text-amber-700 dark:text-amber-300">
                Full dashboard
              </div>
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Start Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Explore & Learn</h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
              <li>📚 <Link href="/dashboard/blogs" className="hover:text-amber-500">Read blogs and academic resources</Link></li>
              <li>📅 <Link href="/dashboard/events" className="hover:text-amber-500">Discover upcoming events</Link></li>
              <li>👥 <Link href="/dashboard/communities" className="hover:text-amber-500">Join communities and discussions</Link></li>
              <li>🗂️ <Link href="/dashboard/users" className="hover:text-amber-500">Browse campus directory</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Buy, Sell & Help</h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
              <li>🛒 <Link href="/dashboard/marketplace" className="hover:text-amber-500">Browse marketplace items</Link></li>
              <li>🔍 <Link href="/dashboard/lost-found" className="hover:text-amber-500">Check lost & found items</Link></li>
              <li>💬 <Link href="/dashboard/messages" className="hover:text-amber-500">Message other students</Link></li>
              <li>🔔 <Link href="/dashboard/notifications" className="hover:text-amber-500">Check your notifications</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Create & Share</h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
              <li>✏️ <Link href="/dashboard/blogs/create" className="hover:text-amber-500">Write a blog post</Link></li>
              <li>🎤 <Link href="/dashboard/events/create" className="hover:text-amber-500">Organize an event</Link></li>
              <li>👥 <Link href="/dashboard/communities/create" className="hover:text-amber-500">Start a new community</Link></li>
              <li>💰 <Link href="/dashboard/marketplace/create" className="hover:text-amber-500">List an item for sale</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
