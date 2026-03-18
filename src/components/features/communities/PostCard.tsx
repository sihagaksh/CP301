'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Heart, MessageCircle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deletePost, togglePostLike } from '@/lib/db/communities'
import type { CommunityPost } from '@/lib/types'

interface PostCardProps {
  post: CommunityPost & { author?: { full_name: string; avatar_url: string | null } | undefined }
  isAuthor?: boolean
  onDelete?: (postId: string) => void
}

export function PostCard({ post, isAuthor = false, onDelete }: PostCardProps) {
  const [likes, setLikes] = useState(post.like_count)
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const authorInitials = post.author
    ? (post.author.full_name || 'Unknown')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?'

  const handleLike = async () => {
    setIsLiking(true)
    try {
      await togglePostLike(post.id, likes + 1)
      setLikes(likes + 1)
    } catch (error) {
      console.error('Failed to like post:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return

    setIsDeleting(true)
    try {
      await deletePost(post.id)
      if (onDelete) onDelete(post.id)
    } catch (error) {
      console.error('Failed to delete post:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {post.author?.avatar_url ? (
            <img
              src={post.author.avatar_url}
              alt={post.author.full_name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-300">
              {authorInitials}
            </div>
          )}
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              {post.author?.full_name || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {format(new Date(post.created_at), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        </div>

        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>

      {/* Image */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post image"
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
        >
          <Heart
            className={cn('w-4 h-4', likes > 0 && 'fill-current')}
          />
          <span>{likes}</span>
        </button>

        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          <MessageCircle className="w-4 h-4" />
          <span>{post.comment_count}</span>
        </div>
      </div>
    </div>
  )
}
