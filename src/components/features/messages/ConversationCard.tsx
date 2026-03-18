import Link from 'next/link'

interface ConversationCardProps {
  partnerId: string
  partner: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  lastMessage: {
    content: string
    created_at: string
    sender_id: string
  }
  unreadCount: number
  currentUserId: string
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

export function ConversationCard({
  partnerId,
  partner,
  lastMessage,
  unreadCount,
  currentUserId,
}: ConversationCardProps) {
  const isLastMessageFromMe = lastMessage.sender_id === currentUserId
  const hasUnread = unreadCount > 0

  return (
    <Link href={`/messages/${partnerId}`}>
      <div
        className={`group bg-white dark:bg-gray-900 border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
          hasUnread
            ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10'
            : 'border-gray-200 dark:border-gray-800'
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {partner.avatar_url ? (
            <img
              src={partner.avatar_url}
              alt={partner.full_name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-gray-500 dark:text-gray-400">
                {partner.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3
                className={`font-semibold truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors ${
                  hasUnread
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-800 dark:text-gray-200'
                }`}
              >
                {partner.full_name}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
                {formatTimeAgo(new Date(lastMessage.created_at))}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <p
                className={`text-sm truncate ${
                  hasUnread
                    ? 'text-gray-900 dark:text-gray-100 font-medium'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {isLastMessageFromMe && (
                  <span className="text-gray-500 dark:text-gray-500">You: </span>
                )}
                {lastMessage.content}
              </p>

              {hasUnread && (
                <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-amber-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
