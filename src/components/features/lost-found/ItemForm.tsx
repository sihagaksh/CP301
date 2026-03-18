'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { lostFoundItemSchema, type LostFoundItemInput } from '@/lib/validators'
import { reportLostFoundItem, updateLostFoundItem } from '@/lib/db/lost-found'
import type { LostFoundItem } from '@/lib/types'

interface ItemFormProps {
  userId: string
  item?: LostFoundItem
}

const CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'documents', label: 'Documents' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'books', label: 'Books & Stationery' },
  { value: 'other', label: 'Other' },
]

export function ItemForm({ userId, item }: ItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LostFoundItemInput>({
    resolver: zodResolver(lostFoundItemSchema),
    defaultValues: item
      ? {
          item_name: item.item_name,
          description: item.description,
          category: item.category,
          status: item.status as 'lost' | 'found',
          location: item.location,
          date_lost_found: new Date(item.date_lost_found).toISOString().split('T')[0],
          contact_info: item.contact_info || '',
          images: item.images || [],
        }
      : {
          images: [],
        },
  })

  const onSubmit = async (data: LostFoundItemInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      if (item) {
        await updateLostFoundItem(item.id, data)
        router.push(`/lost-found/${item.id}`)
      } else {
        const newItem = await reportLostFoundItem(data, userId)
        router.push(`/lost-found/${newItem.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="lost"
              {...register('status')}
              className="w-4 h-4 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-gray-700 dark:text-gray-300">I Lost Something</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="found"
              {...register('status')}
              className="w-4 h-4 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-gray-700 dark:text-gray-300">I Found Something</span>
          </label>
        </div>
        {errors.status && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.status.message}
          </p>
        )}
      </div>

      {/* Item Name */}
      <div>
        <label
          htmlFor="item_name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Item Name *
        </label>
        <input
          id="item_name"
          type="text"
          {...register('item_name')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
          placeholder="e.g., Black iPhone 14, Blue Backpack"
        />
        {errors.item_name && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.item_name.message}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Category *
        </label>
        <select
          id="category"
          {...register('category')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
        >
          <option value="">Select category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.category.message}
          </p>
        )}
      </div>

      {/* Location & Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Location *
          </label>
          <input
            id="location"
            type="text"
            {...register('location')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
            placeholder="e.g., Library 3rd Floor, Near Cafeteria"
          />
          {errors.location && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.location.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="date_lost_found"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Date Lost/Found *
          </label>
          <input
            id="date_lost_found"
            type="date"
            {...register('date_lost_found')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
          />
          {errors.date_lost_found && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.date_lost_found.message}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Description *
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent resize-none"
          placeholder="Provide detailed description including color, brand, distinctive features..."
        />
        {errors.description && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Contact Info */}
      <div>
        <label
          htmlFor="contact_info"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Contact Information
        </label>
        <input
          id="contact_info"
          type="text"
          {...register('contact_info')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
          placeholder="Phone number or alternate email (optional)"
        />
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Your campus email will be used by default
        </p>
        {errors.contact_info && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.contact_info.message}
          </p>
        )}
      </div>

      {/* Images */}
      <div>
        <label
          htmlFor="images"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Image URLs (comma-separated)
        </label>
        <input
          id="images"
          type="text"
          {...register('images', {
            setValueAs: (value) =>
              value ? value.split(',').map((url: string) => url.trim()) : [],
          })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
        />
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Optional: Add up to 3 image URLs separated by commas
        </p>
        {errors.images && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.images.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? item
              ? 'Updating...'
              : 'Reporting...'
            : item
              ? 'Update Report'
              : 'Submit Report'}
        </button>
      </div>
    </form>
  )
}
