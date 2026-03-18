import Link from 'next/link'
import { Mail, Users } from 'lucide-react'
import type { Profile } from '@/lib/types'

interface UserCardProps {
  user: Profile
  showFollowButton?: boolean
  currentUserId?: string
}

export function UserCard({ user, showFollowButton = false, currentUserId }: UserCardProps) {
  const isCurrentUser = currentUserId === user.id

  return (
    <Link href={`/users/${user.id}`}>
      <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
        {/* Avatar & Name */}
        <div className="flex items-start gap-4 mb-4">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                {user.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {user.full_name}
            </h3>
            {user.email && (
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <Mail className="w-3 h-3" />
                <span className="truncate">{user.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
            {user.bio}
          </p>
        )}

        {/* Department & Year */}
        <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-col gap-1">
            {user.department && (
              <span className="text-gray-700 dark:text-gray-300">
                {user.department}
              </span>
            )}
            {user.year && (
              <span className="text-gray-500 dark:text-gray-500">
                Year {user.year}
              </span>
            )}
          </div>

          {!isCurrentUser && showFollowButton && (
            <button
              onClick={(e) => {
                e.preventDefault()
                // Follow action handled by parent
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
            >
              Follow
            </button>
          )}
        </div>

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            {user.interests.slice(0, 3).map((interest, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {interest}
              </span>
            ))}
            {user.interests.length > 3 && (
              <span className="text-xs px-2 py-1 text-gray-500 dark:text-gray-500">
                +{user.interests.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
