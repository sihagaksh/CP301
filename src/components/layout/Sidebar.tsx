'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Home,
  BookOpen,
  Calendar,
  ShoppingCart,
  Users,
  MessageSquare,
  Bell,
  Search,
  Building2,
  MapPin,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Search', href: '/dashboard/search', icon: Search },
  { name: 'Blogs', href: '/dashboard/blogs', icon: BookOpen },
  { name: 'Events', href: '/dashboard/events', icon: Calendar },
  { name: 'Organizations', href: '/dashboard/organizations', icon: Building2 },
  { name: 'Marketplace', href: '/dashboard/marketplace', icon: ShoppingCart },
  { name: 'Communities', href: '/dashboard/communities', icon: Users },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Campus Map', href: '/dashboard/campus-map', icon: MapPin },
]

const adminNavigation = [
  { name: 'Admin Panel', href: '/admin', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const isAdmin = user?.role === 'admin'

  const navigation = isAdmin
    ? [...mainNavigation, ...adminNavigation]
    : mainNavigation

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">DEP</h1>
        <p className="text-xs text-gray-400 mt-1">Campus Platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-gray-800 p-4 space-y-4">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
