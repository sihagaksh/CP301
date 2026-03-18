'use client'

import { LucideIcon } from 'lucide-react'

interface AdminStatsCardProps {
  label: string
  value: number | string
  icon: LucideIcon
}

export function AdminStatsCard({ label, value, icon: Icon }: AdminStatsCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 flex items-center gap-4">
      <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-3">
        <Icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
      </div>
      <div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</div>
        <div className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
      </div>
    </div>
  )
}
