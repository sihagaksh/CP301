'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save, X, ExternalLink, Mail } from 'lucide-react'
import { createOrganization, updateOrganization } from '@/lib/db/organizations'
import type { Organization } from '@/lib/types'

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  category: z.enum(['academic', 'technology', 'hobby', 'social', 'professional', 'sports', 'cultural', 'other'], {
    required_error: 'Category is required'
  }),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  contact_email: z.string().email('Must be a valid email').optional().or(z.literal(''))
})

type OrganizationFormData = z.infer<typeof organizationSchema>

interface OrganizationFormProps {
  organization?: Organization
  userId: string
  onSuccess?: () => void
  onCancel?: () => void
}

const categoryOptions = [
  { value: 'academic', label: 'Academic', description: 'Study groups, research clubs, academic societies' },
  { value: 'technology', label: 'Technology', description: 'Programming clubs, tech communities, hackathon groups' },
  { value: 'hobby', label: 'Hobby', description: 'Photography, gaming, arts & crafts, reading clubs' },
  { value: 'social', label: 'Social', description: 'Social clubs, networking groups, cultural exchanges' },
  { value: 'professional', label: 'Professional', description: 'Career development, industry connections, professional bodies' },
  { value: 'sports', label: 'Sports', description: 'Athletic clubs, fitness groups, sports teams' },
  { value: 'cultural', label: 'Cultural', description: 'Music, dance, theater, cultural preservation groups' },
  { value: 'other', label: 'Other', description: 'Organizations that don\'t fit other categories' }
]

export function OrganizationForm({ organization, userId, onSuccess, onCancel }: OrganizationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const isEditing = !!organization

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization?.name || '',
      description: organization?.description || '',
      category: organization?.category || 'other',
      website_url: organization?.website_url || '',
      contact_email: organization?.contact_email || ''
    }
  })

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      setIsLoading(true)

      if (isEditing && organization) {
        await updateOrganization(organization.id, {
          name: data.name,
          description: data.description,
          category: data.category,
          website_url: data.website_url || undefined,
          contact_email: data.contact_email || undefined
        })
      } else {
        const newOrganization = await createOrganization({
          name: data.name,
          description: data.description,
          category: data.category,
          website_url: data.website_url || undefined,
          contact_email: data.contact_email || undefined,
          created_by: userId
        })
        router.push(`/dashboard/organizations/${newOrganization.slug}`)
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error saving organization:', error)
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Failed to save organization'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Form Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Organization' : 'Create Organization'}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Organization Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Organization Name *
        </label>
        <input
          {...form.register('name')}
          type="text"
          id="name"
          placeholder="Enter organization name..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
        {form.formState.errors.name && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          {...form.register('description')}
          id="description"
          rows={4}
          placeholder="Describe your organization, its mission, and activities..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
        />
        {form.formState.errors.description && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category *
        </label>
        <select
          {...form.register('category')}
          id="category"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.description}
            </option>
          ))}
        </select>
        {form.formState.errors.category && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.category.message}
          </p>
        )}
      </div>

      {/* Website URL */}
      <div>
        <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <ExternalLink className="w-4 h-4 inline mr-1" />
          Website URL
        </label>
        <input
          {...form.register('website_url')}
          type="url"
          id="website_url"
          placeholder="https://your-organization-website.com"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
        {form.formState.errors.website_url && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.website_url.message}
          </p>
        )}
      </div>

      {/* Contact Email */}
      <div>
        <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Mail className="w-4 h-4 inline mr-1" />
          Contact Email
        </label>
        <input
          {...form.register('contact_email')}
          type="email"
          id="contact_email"
          placeholder="contact@organization.com"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
        {form.formState.errors.contact_email && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.contact_email.message}
          </p>
        )}
      </div>

      {/* Form Error */}
      {form.formState.errors.root && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.root.message}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg font-medium transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isLoading ? 'Saving...' : (isEditing ? 'Update Organization' : 'Create Organization')}
        </button>
      </div>
    </form>
  )
}