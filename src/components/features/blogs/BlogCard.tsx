'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Eye, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Blog } from '@/lib/types'

interface BlogCardProps {
  blog: Blog & { author?: { full_name: string; avatar_url: string | null } | undefined }
  compact?: boolean
  featured?: boolean
}

export function BlogCard({ blog, compact = false, featured = false }: BlogCardProps) {
  const publishedDate = blog.published_at
    ? new Date(blog.published_at)
    : new Date(blog.created_at)

  const formattedDate = format(publishedDate, 'MMM d, yyyy')
  const readingTime = Math.ceil(blog.content.split(' ').length / 200) // ~200 words per minute

  const authorInitials = blog.author
    ? (blog.author.full_name || 'Unknown')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?'

  if (featured) {
    return (
      <Link href={`/dashboard/blogs/${blog.slug}`} className="block group">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden hover:shadow-lg transition-shadow">
          {/* Featured Image Placeholder */}
          <div className="h-48 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 flex items-center justify-center overflow-hidden">
            {blog.featured_image_url ? (
              <img
                src={blog.featured_image_url}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="text-4xl font-bold text-amber-200 dark:text-amber-900">📝</div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Category Badge */}
            {blog.category && (
              <div className="mb-3">
                <span className="text-xs uppercase tracking-wider font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  {blog.category}
                </span>
              </div>
            )}

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-2 line-clamp-2">
              {blog.title}
            </h3>

            {/* Excerpt */}
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
              {blog.excerpt || blog.content.substring(0, 120) + '...'}
            </p>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
              <span>{formattedDate}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readingTime} min read
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (compact) {
    return (
      <Link href={`/dashboard/blogs/${blog.slug}`} className="block group">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 hover:shadow-md transition-shadow">
          <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 truncate">
            {blog.title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{formattedDate}</p>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/dashboard/blogs/${blog.slug}`} className="block group">
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 hover:shadow-lg hover:-translate-y-1 transition-all">
        <div className="flex gap-4">
          {/* Author Avatar */}
          <div className="flex-shrink-0">
            {blog.author?.avatar_url ? (
              <img
                src={blog.author.avatar_url}
                alt={blog.author.full_name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-300">
                {authorInitials}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Author & Date */}
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {blog.author?.full_name || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">•</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{formattedDate}</p>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate mb-2">
              {blog.title}
            </h3>

            {/* Excerpt */}
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {blog.excerpt || blog.content.substring(0, 100) + '...'}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
              {blog.category && (
                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {blog.category}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {blog.view_count} views
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readingTime} min
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
