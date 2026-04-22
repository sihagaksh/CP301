'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Megaphone, Map, Home, MessageSquare, Users, MoreHorizontal, MapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';

const NAV_ITEMS = [
  { href: '/notices', label: 'Notices', icon: Megaphone },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/', label: 'Feed', icon: Home },
  { href: '/map', label: 'Maps', icon: MapIcon },
];

const GUEST_NAV_ITEMS = [
  { href: '/notices', label: 'Notices', icon: Megaphone },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/map', label: 'Map', icon: Map },
];

interface BottomNavProps {
  onMoreClick?: () => void;
  isGuest?: boolean;
}

export function BottomNav({ onMoreClick, isGuest = false }: BottomNavProps) {
  const pathname = usePathname();

  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || isGuest) return;

    const fetchUnread = async () => {
      const { count } = await db
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };

    fetchUnread();

    const sub = db.channel('bottom_nav_unread')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => {
        fetchUnread();
      })
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [user, isGuest]);

  const items = isGuest ? GUEST_NAV_ITEMS : NAV_ITEMS;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t z-40 pb-safe">
      <div className="flex items-center justify-around px-1 py-1.5">
        {items.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 min-w-[56px] rounded-lg transition-colors',
                isActive
                  ? 'text-amber-500'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
            <div className="relative">
                <item.icon size={20} />
                {item.href === '/messages' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white border border-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
            </div>
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* More button → only show for non-guests */}
        {!isGuest && (
          <button
            onClick={onMoreClick}
            className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 min-w-[56px] rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <MoreHorizontal size={20} />
            <span className="text-[10px] font-medium leading-tight">More</span>
          </button>
        )}
      </div>
    </nav>
  );
}

