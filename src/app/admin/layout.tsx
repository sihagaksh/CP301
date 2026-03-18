import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { createServerClient } from '@/lib/supabase/server'
import { getUnreadNotificationCount } from '@/lib/db/notifications'

export const metadata = {
  title: 'Admin Panel - DEP Campus',
  description: 'Manage platform events, users, and content',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get current user and unread notification count
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const unreadNotificationCount = user ? await getUnreadNotificationCount(user.id) : 0

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header unreadNotificationCount={unreadNotificationCount} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-8 px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
