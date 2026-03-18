'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBlog, updateBlog, publishBlog } from '@/lib/db/blogs'
import { blogCreateSchema } from '@/lib/validators'
import { BlogMarkdownEditor } from './BlogMarkdownEditor'
import { generateSlug } from '@/lib/utils'
import type { Blog } from '@/lib/types'
import type { z } from 'zod'

type BlogFormData = z.infer<typeof blogCreateSchema>

interface BlogFormProps {
  blog?: Blog
  onSuccess?: () => void
  userId: string
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

export function BlogForm({ blog, onSuccess, userId }: BlogFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState(blog?.content || '')

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogCreateSchema),
    defaultValues: blog
      ? {
          title: blog.title,
          slug: blog.slug,
          content: blog.content,
          excerpt: blog.excerpt || '',
          category: blog.category || '',
          featured_image_url: blog.featured_image_url || '',
        }
      : {
          title: '',
          slug: '',
          content: '',
          excerpt: '',
          category: '',
          featured_image_url: '',
        },
  })

  const handleTitleChange = (title: string) => {
    form.setValue('title', title)
    if (!blog) {
      // Auto-generate slug from title for new blogs
      const newSlug = generateSlug(title)
      form.setValue('slug', newSlug)
    }
  }

  async function onSubmit(data: BlogFormData) {
    setIsLoading(true)
    setError(null)

    try {
      if (blog) {
        await updateBlog(blog.id, {
          ...data,
          content,
          author_id: userId,
        })
        router.push(`/dashboard/blogs/${blog.slug}`)
      } else {
        const newBlog = await createBlog({
          ...data,
          content,
          author_id: userId,
        })
        router.push(`/dashboard/blogs/${newBlog.slug}`)
      }

      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blog')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
          Title *
        </label>
        <input
          type="text"
          value={form.watch('title')}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="Your blog title"
        />
        {form.formState.errors.title && (
          <p className="mt-1 text-sm text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
          URL Slug *
        </label>
        <div className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <code className="text-sm text-gray-700 dark:text-gray-300">
            /dashboard/blogs/{form.watch('slug')}
          </code>
        </div>
        <input
          type="hidden"
          {...form.register('slug')}
        />
        {form.formState.errors.slug && (
          <p className="mt-1 text-sm text-red-500">{form.formState.errors.slug.message}</p>
        )}
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
          Excerpt <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <textarea
          {...form.register('excerpt')}
          rows={2}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
          placeholder="Brief summary of your blog post"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          {form.watch('excerpt').length}/500 characters
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
          Category
        </label>
        <select
          {...form.register('category')}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
          <option value="">Select category</option>
          {BLOG_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Featured Image URL */}
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
          Featured Image URL <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          type="url"
          {...form.register('featured_image_url')}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Content Editor */}
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
          Content *
        </label>
        <BlogMarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Write your blog post here..."
        />
        {content.length < 10 && content.length > 0 && (
          <p className="mt-1 text-sm text-red-500">Content must be at least 10 characters</p>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : blog ? 'Update Blog' : 'Create Blog'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-500">
        💡 Blogs are saved as drafts. You can publish them from the blog detail page.
      </p>
    </form>
  )
}
