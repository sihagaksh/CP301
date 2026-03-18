import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { listConversations, getUnreadCount } from '@/lib/db/messages'
import { ConversationList } from '@/components/features/messages/ConversationList'

export const metadata = {
  title: 'Messages - Campus Connect',
  description: 'View your conversations',
}

export default async function MessagesPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [conversations, unreadCount] = await Promise.all([
    listConversations(user.id),
    getUnreadCount(user.id),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <MessageSquare className="w-8 h-8" />
            Messages
          </h1>
          {unreadCount > 0 && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
            </p>
          )}
        </div>

        <Link
          href="/users"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
        >
          New Chat
        </Link>
      </div>

      {/* Conversations List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <ConversationList conversations={conversations} currentUserId={user.id} />
      </div>

      {/* Help Text */}
      {conversations.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No conversations yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start a conversation by visiting a user's profile and sending them a message
          </p>
          <Link
            href="/users"
            className="inline-block px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
          >
            Browse Users
          </Link>
        </div>
      )}
    </div>
  )
}
