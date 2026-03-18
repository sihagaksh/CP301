'use client'

import { useState } from 'react'
import { UserPlus, UserMinus, Crown, Shield, Loader2 } from 'lucide-react'
import { joinOrganization, leaveOrganization } from '@/lib/db/organizations'

interface JoinOrganizationButtonProps {
  organizationId: string
  organizationName: string
  userId: string
  isUserMember: boolean
  userRole?: string
  memberCount: number
  onMembershipChange?: (isNowMember: boolean, newCount: number) => void
  className?: string
}

export function JoinOrganizationButton({
  organizationId,
  organizationName,
  userId,
  isUserMember,
  userRole,
  memberCount,
  onMembershipChange,
  className = ''
}: JoinOrganizationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [localIsMember, setLocalIsMember] = useState(isUserMember)
  const [localMemberCount, setLocalMemberCount] = useState(memberCount)

  const handleJoin = async () => {
    try {
      setIsLoading(true)
      await joinOrganization(organizationId, userId)
      setLocalIsMember(true)
      setLocalMemberCount(prev => prev + 1)
      onMembershipChange?.(true, localMemberCount + 1)
    } catch (error) {
      console.error('Error joining organization:', error)
      // Could add toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeave = async () => {
    if (!window.confirm(`Are you sure you want to leave ${organizationName}?`)) {
      return
    }

    try {
      setIsLoading(true)
      await leaveOrganization(organizationId, userId)
      setLocalIsMember(false)
      setLocalMemberCount(prev => Math.max(0, prev - 1))
      onMembershipChange?.(false, Math.max(0, localMemberCount - 1))
    } catch (error) {
      console.error('Error leaving organization:', error)
      // Could add toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin':
        return <Crown className="w-4 h-4" />
      case 'moderator':
        return <Shield className="w-4 h-4" />
      default:
        return null
    }
  }

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin':
        return 'Admin'
      case 'moderator':
        return 'Moderator'
      case 'member':
        return 'Member'
      default:
        return null
    }
  }

  if (localIsMember) {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Member Status */}
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 rounded-full font-medium">
            {getRoleIcon()}
            {getRoleLabel() || 'Member'}
          </span>
        </div>

        {/* Leave Button */}
        <button
          onClick={handleLeave}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-700 dark:border-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserMinus className="w-4 h-4" />
          )}
          {isLoading ? 'Leaving...' : 'Leave Organization'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleJoin}
      disabled={isLoading}
      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <UserPlus className="w-4 h-4" />
      )}
      {isLoading ? 'Joining...' : 'Join Organization'}
    </button>
  )
}