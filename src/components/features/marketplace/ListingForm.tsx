'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import {
  marketplaceListingSchema,
  type MarketplaceListingInput,
} from '@/lib/validators'
import { createListing, updateListing } from '@/lib/db/marketplace'
import type { MarketplaceListing } from '@/lib/types'

interface ListingFormProps {
  userId: string
  listing?: MarketplaceListing
}

const CATEGORIES = [
  { value: 'textbooks', label: 'Textbooks' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'sports', label: 'Sports Equipment' },
  { value: 'other', label: 'Other' },
]

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
]

export function ListingForm({ userId, listing }: ListingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MarketplaceListingInput>({
    resolver: zodResolver(marketplaceListingSchema),
    defaultValues: listing
      ? {
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: listing.category,
          condition: listing.condition,
          images: listing.images || [],
          location: listing.location || '',
        }
      : {
          images: [],
        },
  })

  const onSubmit = async (data: MarketplaceListingInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      if (listing) {
        await updateListing(listing.id, data)
        router.push(`/marketplace/${listing.id}`)
      } else {
        const newListing = await createListing(data, userId)
        router.push(`/marketplace/${newListing.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save listing')
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

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Title *
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
          placeholder="e.g., Calculus Textbook 5th Edition"
        />
        {errors.title && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Category & Condition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div>
          <label
            htmlFor="condition"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Condition *
          </label>
          <select
            id="condition"
            {...register('condition')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
          >
            <option value="">Select condition</option>
            {CONDITIONS.map((cond) => (
              <option key={cond.value} value={cond.value}>
                {cond.label}
              </option>
            ))}
          </select>
          {errors.condition && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.condition.message}
            </p>
          )}
        </div>
      </div>

      {/* Price & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Price ($) *
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
            placeholder="29.99"
          />
          {errors.price && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.price.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Location
          </label>
          <input
            id="location"
            type="text"
            {...register('location')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
            placeholder="e.g., North Campus, Building A"
          />
          {errors.location && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.location.message}
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
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent resize-none"
          placeholder="Describe the item condition, features, and any defects..."
        />
        {errors.description && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Images (simplified - just URL input for now) */}
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
          Optional: Add up to 5 image URLs separated by commas
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
            ? listing
              ? 'Updating...'
              : 'Creating...'
            : listing
              ? 'Update Listing'
              : 'Create Listing'}
        </button>
      </div>
    </form>
  )
}
