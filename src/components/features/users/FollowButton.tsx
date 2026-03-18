'use client'

import { useState } from 'react'
import { followUser, unfollowUser } from '@/lib/db/users'
import { UserPlus, UserMinus } from 'lucide-react'

interface FollowButtonProps {
  userId: string
  targetUserId: string
  initialIsFollowing: boolean
  onFollowChange?: (isFollowing: boolean) => void
}

export function FollowButton({
  userId,
  targetUserId,
  initialIsFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFollow() {
    setIsLoading(true)
    setError(null)

    try {
      const newFollowState = !isFollowing
      if (isFollowing) {
        await unfollowUser(userId, targetUserId)
        setIsFollowing(false)
      } else {
        await followUser(userId, targetUserId)
        setIsFollowing(true)
      }

      if (onFollowChange) {
        onFollowChange(newFollowState)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update follow status')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        onClick={handleFollow}
        disabled={isLoading}
        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          isFollowing
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            : 'bg-amber-500 hover:bg-amber-600 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
          </>
        ) : (
          <>
            {isFollowing ? (
              <>
                <UserMinus className="w-4 h-4" />
                <span>Unfollow</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Follow</span>
              </>
            )}
          </>
        )}
      </button>
    </div>
  )
}
