import { createServerClient } from '@/lib/supabase/server'
import { createBrowserClient } from '@/lib/supabase/browser'
import type { Message } from '@/lib/types'

// ==================== SERVER QUERIES (Use in pages) ====================

/**
 * Get all conversations for a user with last message preview
 */
export async function listConversations(userId: string) {
  try {
    const supabase = await createServerClient()

    // Get all messages where user is sender or receiver
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
        receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return []
    }

    // Group by conversation partner
    const conversationsMap = new Map()

    messages?.forEach((message) => {
      const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id
      const partner = message.sender_id === userId ? message.receiver : message.sender

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partnerId,
          partner,
          lastMessage: message,
          unreadCount: 0,
        })
      }

      // Count unread messages
      if (message.receiver_id === userId && !message.read) {
        conversationsMap.get(partnerId).unreadCount++
      }
    })

    return Array.from(conversationsMap.values()).sort((a, b) =>
      new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    )
  } catch (error) {
    console.error('Unexpected error fetching conversations:', error)
    return []
  }
}

/**
 * Get all messages between two users
 */
export async function getMessages(userId: string, partnerId: string, limit: number = 50) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
        receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url)
      `)
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
      )
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error fetching messages:', error)
    return []
  }
}

/**
 * Get a single message by ID
 */
export async function getMessageById(messageId: string) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
        receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url)
      `)
      .eq('id', messageId)
      .single()

    if (error) {
      console.error('Error fetching message:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error fetching message:', error)
    return null
  }
}

/**
 * Get unread message count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const supabase = await createServerClient()
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false)

    if (error) {
      console.error('Error getting unread count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Unexpected error getting unread count:', error)
    return 0
  }
}

/**
 * Search messages by content
 */
export async function searchMessages(userId: string, query: string, limit: number = 20) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
        receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error searching messages:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error searching messages:', error)
    return []
  }
}

// ==================== CLIENT MUTATIONS (Use in components) ====================

/**
 * Send a new message
 */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
): Promise<Message> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        read: false,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`)
  }

  return data
}

/**
 * Mark a message as read
 */
export async function markAsRead(messageId: string): Promise<Message> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to mark message as read: ${error.message}`)
  }

  return data
}

/**
 * Mark all messages from a user as read
 */
export async function markAllAsRead(userId: string, partnerId: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('sender_id', partnerId)
    .eq('receiver_id', userId)
    .eq('read', false)

  if (error) {
    throw new Error(`Failed to mark messages as read: ${error.message}`)
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase.from('messages').delete().eq('id', messageId)

  if (error) {
    throw new Error(`Failed to delete message: ${error.message}`)
  }
}

/**
 * Update message content
 */
export async function updateMessage(messageId: string, content: string): Promise<Message> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('messages')
    .update({ content })
    .eq('id', messageId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update message: ${error.message}`)
  }

  return data
}
