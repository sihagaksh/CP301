'use client'

import { useState } from 'react'
import { BlogCard } from './BlogCard'
import type { Blog } from '@/lib/types'

interface BlogListProps {
  initialBlogs: Blog[]
  totalCount: number
  initialPage?: number
  pageSize?: number
  allCategories?: string[]
  featuredBlog?: Blog
}

const BLOG_CATEGORIES = [
  'Academic',
  'Campus Life',
  'Technology',
  'Announcements',
  'Resources',
  'Tips & Tricks',
  'Events',
  'Other',
]

export function BlogList({
  initialBlogs,
  totalCount,
  initialPage = 1,
  pageSize = 20,
  allCategories = BLOG_CATEGORIES,
  featuredBlog,
}: BlogListProps) {
  const [blogs, setBlogs] = useState(initialBlogs)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredBlogs = selectedCategory
    ? blogs.filter((b) => b.category === selectedCategory)
    : blogs

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-8">
      {/* Featured Blog */}
      {featuredBlog && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Featured</h2>
          <BlogCard blog={featuredBlog} featured={true} />
        </div>
      )}

      {/* Category Filter */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center pb-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
              selectedCategory === null
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            All Posts
          </button>

          {allCategories.slice(0, 6).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Blogs Grid */}
      {filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400 font-medium">No blogs found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Try adjusting your filters or check back soon
          </p>
        </div>
      )}

      {/* Pagination Info */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Page {initialPage} of {totalPages}
        </div>
      )}
    </div>
  )
}
