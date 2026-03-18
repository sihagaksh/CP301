'use client'

import { useState } from 'react'
import { Eye, Code } from 'lucide-react'

interface BlogMarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function BlogMarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your blog content here... Supports Markdown.',
}: BlogMarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit')

  const renderBasicMarkdown = (text: string) => {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {text.split('\n\n').map((paragraph, i) => {
          // Handle headers
          if (paragraph.startsWith('###')) {
            return (
              <h3 key={i} className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2">
                {paragraph.replace(/^###\s*/, '')}
              </h3>
            )
          }
          if (paragraph.startsWith('##')) {
            return (
              <h2 key={i} className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
                {paragraph.replace(/^##\s*/, '')}
              </h2>
            )
          }
          if (paragraph.startsWith('#')) {
            return (
              <h1 key={i} className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
                {paragraph.replace(/^#\s*/, '')}
              </h1>
            )
          }

          // Handle lists
          if (paragraph.startsWith('-') || paragraph.startsWith('*')) {
            const items = paragraph.split('\n').filter((line) => line.trim())
            return (
              <ul key={i} className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 my-2">
                {items.map((item, j) => (
                  <li key={j}>{item.replace(/^[-*]\s*/, '')}</li>
                ))}
              </ul>
            )
          }

          // Handle code blocks
          if (paragraph.startsWith('```')) {
            const code = paragraph.replace(/```[\s\S]*/g, '').trim()
            return (
              <pre key={i} className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto my-2">
                <code>{code}</code>
              </pre>
            )
          }

          // Regular paragraph
          if (paragraph.trim()) {
            return (
              <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed my-2">
                {paragraph}
              </p>
            )
          }

          return null
        })}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* View Mode Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setViewMode('edit')}
          className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            viewMode === 'edit'
              ? 'text-amber-600 dark:text-amber-400 border-amber-600'
              : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <Code className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => setViewMode('preview')}
          className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            viewMode === 'preview'
              ? 'text-amber-600 dark:text-amber-400 border-amber-600'
              : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Editor */}
      {viewMode === 'edit' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={12}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      )}

      {/* Preview */}
      {viewMode === 'preview' && (
        <div className="min-h-[300px] p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-auto">
          {renderBasicMarkdown(value)}
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
        <p>💡 Markdown syntax:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li># Heading 1, ## Heading 2, ### Heading 3</li>
          <li>- List items</li>
          <li>**bold** and *italic*</li>
          <li>```code blocks```</li>
        </ul>
      </div>
    </div>
  )
}
