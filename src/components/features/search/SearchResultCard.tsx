'use client'

import Link from 'next/link'
import { Calendar, MapPin, DollarSign, User, BookOpen, Users, ShoppingCart, Search, Hash } from 'lucide-react'
import type { SearchResult, SearchResultType } from '@/lib/db/search'

interface SearchResultCardProps {
  result: SearchResult
}

function getTypeIcon(type: SearchResultType) {
  switch (type) {
    case 'event':
      return <Calendar className="w-5 h-5 text-blue-500" />
    case 'blog':
      return <BookOpen className="w-5 h-5 text-green-500" />
    case 'community':
      return <Users className="w-5 h-5 text-purple-500" />
    case 'marketplace':
      return <ShoppingCart className="w-5 h-5 text-orange-500" />
    case 'lost_found':
      return <Search className="w-5 h-5 text-red-500" />
    case 'user':
      return <User className="w-5 h-5 text-gray-500" />
    default:
      return <Hash className="w-5 h-5 text-gray-400" />
  }
}

function getTypeBadge(type: SearchResultType) {
  const typeMap = {
    event: { label: 'Event', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    blog: { label: 'Blog', color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' },
    community: { label: 'Community', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
    marketplace: { label: 'Marketplace', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
    lost_found: { label: 'Lost & Found', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
    user: { label: 'User', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' }
  }

  const config = typeMap[type] || typeMap.user
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {getTypeIcon(type)}
      {config.label}
    </span>
  )
}

function formatTimeAgo(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return then.toLocaleDateString()
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  return (
    <Link href={result.url} className="block">
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/10 transition-all duration-200 group">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getTypeBadge(result.type)}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-300 line-clamp-2">
              {result.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        {result.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {result.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
          {/* Author */}
          {result.author && (
            <div className="flex items-center gap-1">
              {result.author.avatar_url ? (
                <img
                  src={result.author.avatar_url}
                  alt={result.author.full_name}
                  className="w-4 h-4 rounded-full"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span>{result.author.full_name}</span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatTimeAgo(result.created_at)}</span>
          </div>

          {/* Type-specific metadata */}
          {result.type === 'event' && result.metadata?.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{result.metadata.location}</span>
            </div>
          )}

          {result.type === 'marketplace' && result.metadata?.price && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>${result.metadata.price}</span>
            </div>
          )}

          {result.type === 'lost_found' && result.metadata?.status && (
            <div className="flex items-center gap-1">
              <span className={`inline-block w-2 h-2 rounded-full ${
                result.metadata.status === 'found' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="capitalize">{result.metadata.status}</span>
            </div>
          )}

          {(result.type === 'blog' || result.type === 'community' || result.type === 'marketplace' || result.type === 'event') &&
           result.metadata?.category && (
            <div className="flex items-center gap-1">
              <Hash className="w-4 h-4" />
              <span className="capitalize">{result.metadata.category}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}