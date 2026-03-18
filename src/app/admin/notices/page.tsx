'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBrowserClient } from '@/lib/supabase/browser'
import { listNotices, createNotice, publishNotice, deleteNotice } from '@/lib/db/admin'
import { noticeCreateSchema } from '@/lib/validators'
import { NoticeCard } from '@/components/features/admin/NoticeCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Notice, User, NoticeCreateInput } from '@/lib/types'

export default function AdminNoticesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1')

  const [notices, setNotices] = useState<(Notice & { author?: User })[]>([])
  const [pagination, setPagination] = useState<{ count: number; total_pages: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createBrowserClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setUser({ id: authUser.id })
        }
      } catch (err) {
        console.error('Error fetching user:', err)
      }
    }

    getUser()
  }, [])

  // Load notices on mount and when page changes
  useEffect(() => {
    const loadNotices = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await listNotices({ page, limit: 20 })
        setNotices(result.data)
        setPagination({ count: result.count, total_pages: result.total_pages })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notices')
      } finally {
        setIsLoading(false)
      }
    }

    loadNotices()
  }, [page])

  const form = useForm<NoticeCreateInput>({
    resolver: zodResolver(noticeCreateSchema),
    defaultValues: {
      title: '',
      content: '',
      priority: 'low',
    },
  })

  const onSubmit = async (data: NoticeCreateInput) => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    try {
      setError(null)
      setSuccessMessage(null)
      await createNotice({
        ...data,
        author_id: user.id,
      })
      form.reset()
      setShowForm(false)
      setSuccessMessage('Notice created successfully!')

      // Reload notices
      const result = await listNotices({ page: 1, limit: 20 })
      setNotices(result.data)
      setPagination({ count: result.count, total_pages: result.total_pages })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notice')
    }
  }

  const handlePublish = async (noticeId: string) => {
    try {
      await publishNotice(noticeId)
      // Reload notices
      const result = await listNotices({ page, limit: 20 })
      setNotices(result.data)
      setPagination({ count: result.count, total_pages: result.total_pages })
      setSuccessMessage('Notice published successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish notice')
    }
  }

  const handleDelete = async (noticeId: string) => {
    try {
      await deleteNotice(noticeId)
      setNotices(notices.filter((n) => n.id !== noticeId))
      setPagination((prev) => (prev ? { ...prev, count: prev.count - 1 } : null))
      setSuccessMessage('Notice deleted successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notice')
    }
  }

  const goToPage = (newPage: number) => {
    router.push(`/admin/notices?page=${newPage}`)
  }

  if (isLoading && notices.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notices Board</h1>
        <div className="text-center py-12">Loading notices...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notices Board</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage announcements</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
          >
            {showForm ? 'Cancel' : '+ Create Notice'}
          </button>
          <Link href="/admin" className="text-amber-500 hover:text-amber-600 font-medium">
            ← Back
          </Link>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-green-700 dark:text-green-300">
          {successMessage}
        </div>
      )}

      {/* Create Form */}
      {showForm && user && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New Notice</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              {...form.register('title')}
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
              placeholder="Notice title"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              {...form.register('content')}
              rows={5}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
              placeholder="Notice content"
            />
            {form.formState.errors.content && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.content.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              {...form.register('priority')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium transition-colors"
          >
            {form.formState.isSubmitting ? 'Creating...' : 'Create Notice'}
          </button>
        </form>
      )}

      {/* Stats */}
      {pagination && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Showing <span className="text-gray-900 dark:text-white font-bold">{notices.length}</span> of{' '}
            <span className="text-gray-900 dark:text-white font-bold">{pagination.count}</span> notices
          </p>
        </div>
      )}

      {/* Notices List */}
      {notices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onPublish={handlePublish}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400 font-medium">No notices yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Create your first announcement above</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`w-10 h-10 rounded-lg transition-colors ${
                p === page
                  ? 'bg-amber-500 text-white'
                  : 'border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === pagination.total_pages}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

  // Load notices on mount and when page changes
  useEffect(() => {
    const loadNotices = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await listNotices({ page, limit: 20 })
        setNotices(result.data)
        setPagination({ count: result.count, total_pages: result.total_pages })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notices')
      } finally {
        setIsLoading(false)
      }
    }

    loadNotices()
  }, [page])

  const form = useForm<NoticeCreateInput>({
    resolver: zodResolver(noticeCreateSchema),
    defaultValues: {
      title: '',
      content: '',
      priority: 'low',
    },
  })

  const onSubmit = async (data: NoticeCreateInput) => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    try {
      setError(null)
      setSuccessMessage(null)
      await createNotice({
        ...data,
        author_id: user.id,
      })
      form.reset()
      setShowForm(false)
      setSuccessMessage('Notice created successfully!')

      // Reload notices
      const result = await listNotices({ page: 1, limit: 20 })
      setNotices(result.data)
      setPagination({ count: result.count, total_pages: result.total_pages })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notice')
    }
  }

  const handlePublish = async (noticeId: string) => {
    try {
      await publishNotice(noticeId)
      // Reload notices
      const result = await listNotices({ page, limit: 20 })
      setNotices(result.data)
      setPagination({ count: result.count, total_pages: result.total_pages })
      setSuccessMessage('Notice published successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish notice')
    }
  }

  const handleDelete = async (noticeId: string) => {
    try {
      await deleteNotice(noticeId)
      setNotices(notices.filter((n) => n.id !== noticeId))
      setPagination((prev) => (prev ? { ...prev, count: prev.count - 1 } : null))
      setSuccessMessage('Notice deleted successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notice')
    }
  }

  const goToPage = (newPage: number) => {
    router.push(`/admin/notices?page=${newPage}`)
  }

  if (isLoading && notices.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notices Board</h1>
        <div className="text-center py-12">Loading notices...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notices Board</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage announcements</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
          >
            {showForm ? 'Cancel' : '+ Create Notice'}
          </button>
          <Link href="/admin" className="text-amber-500 hover:text-amber-600 font-medium">
            ← Back
          </Link>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-green-700 dark:text-green-300">
          {successMessage}
        </div>
      )}

      {/* Create Form */}
      {showForm && user && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New Notice</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              {...form.register('title')}
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
              placeholder="Notice title"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              {...form.register('content')}
              rows={5}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
              placeholder="Notice content"
            />
            {form.formState.errors.content && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.content.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              {...form.register('priority')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium transition-colors"
          >
            {form.formState.isSubmitting ? 'Creating...' : 'Create Notice'}
          </button>
        </form>
      )}

      {/* Stats */}
      {pagination && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Showing <span className="text-gray-900 dark:text-white font-bold">{notices.length}</span> of{' '}
            <span className="text-gray-900 dark:text-white font-bold">{pagination.count}</span> notices
          </p>
        </div>
      )}

      {/* Notices List */}
      {notices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onPublish={handlePublish}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400 font-medium">No notices yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Create your first announcement above</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`w-10 h-10 rounded-lg transition-colors ${
                p === page
                  ? 'bg-amber-500 text-white'
                  : 'border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === pagination.total_pages}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
