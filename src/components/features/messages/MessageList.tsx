'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'

interface Message {
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

interface MessageListProps {
  messages: Message[]
  currentUserId: string
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 font-medium">No messages yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Start the conversation by sending a message
          </p>
        </div>
      </div>
    )
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = []
  let currentDate = ''

  messages.forEach((message) => {
    const messageDate = new Date(message.created_at).toLocaleDateString()
    if (messageDate !== currentDate) {
      currentDate = messageDate
      groupedMessages.push({ date: messageDate, messages: [] })
    }
    groupedMessages[groupedMessages.length - 1].messages.push(message)
  })

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-6">
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          {/* Date Separator */}
          <div className="flex items-center justify-center">
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
              {group.date === new Date().toLocaleDateString()
                ? 'Today'
                : group.date === new Date(Date.now() - 86400000).toLocaleDateString()
                  ? 'Yesterday'
                  : group.date}
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4">
            {group.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  )
}
