'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Calendar,
  ShoppingBag,
  Users,
  Bell,
  MessageCircle,
  Search,
  ExternalLink,
  Activity,
  BookOpen,
  Megaphone,
  Coffee,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, LogOut, Building2 } from 'lucide-react';

import { db } from '@/lib/db';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isGuest?: boolean;
}

const MAIN_LINKS = [
  { href: '/', icon: Home, label: 'Feed' },
  { href: '/notices', icon: Megaphone, label: 'Notices' },
  { href: '/blogs', icon: BookOpen, label: 'Blogs' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/mess-menu', icon: Coffee, label: 'Mess Menu' },
  { href: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  { href: '/clubs', icon: Activity, label: 'Clubs' },
  { href: '/communities', icon: Users, label: 'Communities' },
  { href: '/map', icon: Search, label: 'Campus Map' },
  { href: '/lost-found', icon: FileText, label: 'Lost & Found' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/quick-links', icon: ExternalLink, label: 'Quick Links' },
];

const GUEST_LINKS = [
  { href: '/notices', icon: Megaphone, label: 'Notices' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/mess-menu', icon: Coffee, label: 'Mess Menu' },
  { href: '/map', icon: Search, label: 'Campus Map' },
];

export function Sidebar({ isOpen, onClose, isGuest = false }: SidebarProps) {
  const pathname = usePathname();
  const { user, isOrgAccount, signOutGuest } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      const { count } = await db
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };

    fetchUnread();

    const sub = db.channel('sidebar_unread')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => {
        fetchUnread();
      })
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchNotifs = async () => {
      const { count } = await db
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadNotifCount(count || 0);
    };

    fetchNotifs();

    const sub = db.channel('sidebar_notifs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        fetchNotifs();
      })
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [user]);

  const links = isGuest ? GUEST_LINKS : MAIN_LINKS;


  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Mobile: slide-in overlay panel (fixed, full-height, scrollable)
          'fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 overflow-hidden flex flex-col',
          // Desktop: sticky panel glued below the header, never scrolls
          'lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:z-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-sidebar-border">
          <span className="font-serif font-bold text-lg text-sidebar-foreground">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-2 overflow-y-hidden">
          <nav className="px-3 space-y-1">
            {links.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    {item.label}
                  </div>
                  {item.href === '/messages' && unreadCount > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {unreadCount}
                    </span>
                  )}
                  {item.href === '/notifications' && unreadNotifCount > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {unreadNotifCount}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Org Admin Link (Only for org accounts) */}
            {!isGuest && isOrgAccount && (
              <>
                <div className="pt-4 pb-2">
                  <div className="h-px bg-sidebar-border w-full" />
                </div>
                <Link
                  href="/org-admin"
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/org-admin')
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <Building2 size={18} className={pathname.startsWith('/org-admin') ? '' : 'text-primary'} />
                  Org Admin Portal
                </Link>
              </>
            )}

            {/* Admin Link (Only for authenticated super-admins, not org accounts) */}
            {!isGuest && user?.isAdmin && !isOrgAccount && (
              <>
                <div className="pt-4 pb-2">
                  <div className="h-px bg-sidebar-border w-full" />
                </div>
                <Link
                  href="/admin"
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/admin')
                      ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <Shield size={18} className={pathname.startsWith('/admin') ? '' : 'text-rose-500'} />
                  Admin Portal
                </Link>
              </>
            )}

            {/* Guest sign out */}
            {isGuest && (
              <>
                <div className="pt-4 pb-2">
                  <div className="h-px bg-sidebar-border w-full" />
                </div>
                <button
                  onClick={signOutGuest}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-sidebar-foreground hover:bg-sidebar-accent/50"
                >
                  <LogOut size={18} />
                  Exit Guest Mode
                </button>
              </>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}