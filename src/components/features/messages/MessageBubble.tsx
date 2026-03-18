interface MessageBubbleProps {
  message: {
    id: string
    content: string
    sender_id: string
    created_at: string
    read: boolean
    sender?: {
      full_name: string
      avatar_url: string | null
    }
  }
  currentUserId: string
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const isOwnMessage = message.sender_id === currentUserId

  return (
    <div className={`flex items-start gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {!isOwnMessage && message.sender && (
        <>
          {message.sender.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt={message.sender.full_name}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {message.sender.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </>
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-amber-500 text-white rounded-br-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
          }`}
        >
          <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp & Read Status */}
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {formatTime(new Date(message.created_at))}
          </span>
          {isOwnMessage && (
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
