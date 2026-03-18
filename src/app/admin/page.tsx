import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { getAdminStats, listUnapprovedEvents } from '@/lib/db/admin'
import { AdminStatsCard } from '@/components/features/admin/AdminStatsCard'
import { EventApprovalCard } from '@/components/features/admin/EventApprovalCard'
import { Users, Calendar, FileText, Bell, CheckCircle, XCircle } from 'lucide-react'

export const metadata = {
  title: 'Admin Panel - DEP Campus',
  description: 'Manage events, users, and content on the DEP Campus platform',
}

export default async function AdminDashboard() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is authenticated and is admin
  if (!user) {
    return <div className="text-center py-12">Please log in to access the admin panel</div>
  }

  // Fetch user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return <div className="text-center py-12">You don't have permission to access the admin panel</div>
  }

  // Fetch stats and recent unapproved events
  const stats = await getAdminStats()
  const { data: recentUnapprovedEvents } = await listUnapprovedEvents({ page: 1, limit: 5 })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage platform events, users, and content</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminStatsCard label="Total Users" value={stats.totalUsers} icon={Users} />
        <AdminStatsCard label="Total Events" value={stats.totalEvents} icon={Calendar} />
        <AdminStatsCard label="Pending Approval" value={stats.unapprovedEvents} icon={FileText} />
        <AdminStatsCard label="Notices" value="—" icon={Bell} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/events"
          className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
        >
          <CheckCircle className="w-8 h-8 text-amber-500 mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Approve Events</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Review and approve pending events</p>
        </Link>

        <Link
          href="/admin/users"
          className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
        >
          <Users className="w-8 h-8 text-amber-500 mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Manage Users</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Update roles and suspend users</p>
        </Link>

        <Link
          href="/admin/notices"
          className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
        >
          <Bell className="w-8 h-8 text-amber-500 mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Create Notice</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Post announcements to all users</p>
        </Link>
      </div>

      {/* Recent Unapproved Events */}
      {recentUnapprovedEvents && recentUnapprovedEvents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Unapproved Events
            </h2>
            <Link
              href="/admin/events"
              className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 font-medium text-sm"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentUnapprovedEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                <p className="text-xs mt-1">Click "Approve Events" above to review and approve</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20 p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Admin Panel Help</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>• Use the Approve Events section to review pending events and make them visible to the campus</li>
          <li>• Manage user roles and permissions in the User Management section</li>
          <li>• Create and publish important announcements through the Notices board</li>
          <li>• Monitor platform statistics and activity from this dashboard</li>
        </ul>
      </div>
    </div>
  )
}
