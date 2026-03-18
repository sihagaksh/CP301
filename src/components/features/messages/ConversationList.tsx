'use client'

import { useState } from 'react'
import { ConversationCard } from './ConversationCard'

interface Conversation {
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
}

interface ConversationListProps {
  conversations: Conversation[]
  currentUserId: string
}

export function ConversationList({ conversations, currentUserId }: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = searchQuery
    ? conversations.filter((conv) =>
        conv.partner.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
        />
      </div>

      {/* Conversations */}
      {filteredConversations.length > 0 ? (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <ConversationCard
              key={conversation.partnerId}
              partnerId={conversation.partnerId}
              partner={conversation.partner}
              lastMessage={conversation.lastMessage}
              unreadCount={conversation.unreadCount}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {searchQuery ? 'No conversations found' : 'No messages yet'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Start a conversation by visiting a user profile'}
          </p>
        </div>
      )}
    </div>
  )
}
