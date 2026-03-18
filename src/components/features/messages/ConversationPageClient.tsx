'use client'

import { useState, useEffect } from 'react'
import { notFound, redirect, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User } from 'lucide-react'
import { getMessages, markAllAsRead } from '@/lib/db/messages'
import { getUserProfile } from '@/lib/db/users'
import { MessageList } from '@/components/features/messages/MessageList'
import { MessageInput } from '@/components/features/messages/MessageInput'

interface ConversationPageProps {
  params: Promise<{ partnerId: string }>
  currentUserId: string
}

export function ConversationPageClient({ params, currentUserId }: ConversationPageProps) {
  const router = useRouter()
  const [partnerId, setPartnerId] = useState<string>('')
  const [partner, setPartner] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params
      setPartnerId(resolvedParams.partnerId)

      const [partnerProfile, conversationMessages] = await Promise.all([
        getUserProfile(resolvedParams.partnerId),
        getMessages(currentUserId, resolvedParams.partnerId),
      ])

      if (!partnerProfile) {
        notFound()
      }

      setPartner(partnerProfile)
      setMessages(conversationMessages)

      // Mark all messages as read
      await markAllAsRead(currentUserId, resolvedParams.partnerId)

      setIsLoading(false)
    }

    loadData()
  }, [params, currentUserId])

  async function handleMessageSent() {
    if (!partnerId) return

    // Reload messages
    const updatedMessages = await getMessages(currentUserId, partnerId)
    setMessages(updatedMessages)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  if (!partner) {
    notFound()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-4">
          <Link
            href="/messages"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Partner Info */}
          <Link href={`/users/${partner.id}`} className="flex items-center gap-3 flex-1">
            {partner.avatar_url ? (
              <img
                src={partner.avatar_url}
                alt={partner.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                {partner.full_name}
              </h2>
              {partner.department && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {partner.department}
                </p>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900/50">
        <MessageList messages={messages} currentUserId={currentUserId} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
        <MessageInput
          currentUserId={currentUserId}
          receiverId={partnerId}
          onMessageSent={handleMessageSent}
        />
      </div>
    </div>
  )
}
