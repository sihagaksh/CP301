import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Eye, Clock, ArrowLeft, Share2 } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { getBlogBySlug, incrementBlogViews } from '@/lib/db/blogs'
import { BlogPublishButton } from '@/components/features/blogs/BlogPublishButton'

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)

  if (!blog) {
    return { title: 'Blog Not Found' }
  }

  return {
    title: `${blog.title} | DEP Campus Platform`,
    description: blog.excerpt || blog.content.substring(0, 160),
  }
}

const renderMarkdown = (content: string) => {
  const paragraphs = content.split('\n\n')

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
      {paragraphs.map((para, i) => {
        // Headers
        if (para.startsWith('### ')) {
          return (
            <h3 key={i} className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">
              {para.replace(/^### /, '')}
            </h3>
          )
        }
        if (para.startsWith('## ')) {
          return (
            <h2 key={i} className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-3">
              {para.replace(/^## /, '')}
            </h2>
          )
        }
        if (para.startsWith('# ')) {
          return (
            <h1 key={i} className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-3">
              {para.replace(/^# /, '')}
            </h1>
          )
        }

        // Lists
        if (para.startsWith('- ') || para.startsWith('* ')) {
          const items = para.split('\n').filter((line) => line.trim())
          return (
            <ul key={i} className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 my-4">
              {items.map((item, j) => (
                <li key={j} className="ml-2">
                  {item.replace(/^[-*]\s*/, '')}
                </li>
              ))}
            </ul>
          )
        }

        // Code blocks
        if (para.startsWith('```')) {
          const code = para.replace(/```[\w]*\n?/, '').replace(/```$/, '').trim()
          return (
            <pre key={i} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
              <code>{code}</code>
            </pre>
          )
        }

        // Regular paragraph
        if (para.trim()) {
          return (
            <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed my-4 text-base">
              {para}
            </p>
          )
        }

        return null
      })}
    </div>
  )
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)

  if (!blog) {
    notFound()
  }

  // Increment view count
  try {
    await incrementBlogViews(blog.id)
  } catch (error) {
    console.error('Failed to increment views:', error)
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthor = user && user.id === blog.author_id

  const publishedDate = blog.published_at
    ? new Date(blog.published_at)
    : new Date(blog.created_at)

  const formattedDate = format(publishedDate, 'MMMM d, yyyy')
  const readingTime = Math.ceil(blog.content.split(' ').length / 200)

  const authorInitials = blog.author
    ? (blog.author.full_name || 'Unknown')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/dashboard/blogs"
        className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 font-bold mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blogs
      </Link>

      {/* Header */}
      <div className="space-y-4 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {blog.category && (
              <div className="mb-3">
                <span className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  {blog.category}
                </span>
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {blog.title}
            </h1>

            {!blog.is_published && (
              <p className="text-sm text-orange-600 dark:text-orange-400 font-bold mb-4">
                📝 This blog is a draft and not yet published
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {readingTime} min read
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {blog.view_count} views
              </span>
            </div>
          </div>

          {isAuthor && (
            <div className="flex gap-2">
              <Link
                href={`/dashboard/blogs/${slug}/edit`}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 font-bold transition-colors"
              >
                Edit
              </Link>
              {!blog.is_published && (
                <BlogPublishButton blogId={blog.id} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Author Info */}
      {blog.author && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 mb-8 flex items-center gap-4">
          {blog.author.avatar_url ? (
            <img
              src={blog.author.avatar_url}
              alt={blog.author.full_name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
              {authorInitials}
            </div>
          )}
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              {blog.author.full_name || 'Anonymous'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {blog.author.role}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <article className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-8 md:p-12 mb-8">
        {renderMarkdown(blog.content)}
      </article>

      {/* Share & Actions */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Enjoying this post? Share with your community!
        </div>
        <button
          onClick={() => {
            const url = typeof window !== 'undefined' ? window.location.href : ''
            navigator.share?.({
              title: blog.title,
              text: blog.excerpt || blog.content.substring(0, 100),
              url,
            })
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 font-bold transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  )
}
