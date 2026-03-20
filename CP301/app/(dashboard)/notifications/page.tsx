'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Check, CheckCheck, Loader2, MessageCircle, Heart, Megaphone, Calendar, ShoppingBag, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message?: string;
  type: string;
  entity_type?: string;
  entity_id?: string;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

const TYPE_ICON_MAP: Record<string, React.ReactNode> = {
  comment: <MessageCircle size={16} />,
  like: <Heart size={16} />,
  notice: <Megaphone size={16} />,
  event: <Calendar size={16} />,
  marketplace: <ShoppingBag size={16} />,
  club: <Users size={16} />,
  governance: <Users size={16} />,
  general: <Bell size={16} />,
};

const TYPE_COLOR_MAP: Record<string, string> = {
  comment: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
  like: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
  notice: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
  event: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
  marketplace: 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400',
  club: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
  governance: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
  general: 'bg-muted text-muted-foreground',
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (user) fetchNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchNotifications() {
    if (!user) return;
    const { data } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications(data || []);
    setLoading(false);
  }

  async function markAsRead(notifId: string) {
    await db
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notifId);
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, is_read: true } : n)
    );
  }

  async function markAllRead() {
    if (!user || unreadCount === 0) return;
    setMarkingAll(true);
    await db
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setMarkingAll(false);
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bell size={48} className="mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground">Please sign in to view notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">🔔 Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            className="flex items-center gap-1.5 border border-border hover:bg-accent text-sm px-3.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            onClick={markAllRead}
            disabled={markingAll}
          >
            {markingAll ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-3 p-4 bg-card border border-border rounded-xl animate-pulse">
              <div className="w-9 h-9 bg-muted rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-3.5 bg-muted rounded w-3/5 mb-2" />
                <div className="h-3 bg-muted rounded w-4/5 mb-2" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-card border border-border rounded-xl">
          <div className="text-center">
            <BellOff size={48} className="mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-semibold text-foreground mb-1">All caught up!</h3>
            <p className="text-sm text-muted-foreground">You have no notifications at the moment.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => { if (!notif.is_read) markAsRead(notif.id); }}
              className={`flex gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${notif.is_read ? 'bg-card border-border' : 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 hover:bg-amber-100/70 dark:hover:bg-amber-500/10'}`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${TYPE_COLOR_MAP[notif.type] || TYPE_COLOR_MAP.general}`}>
                {TYPE_ICON_MAP[notif.type] || TYPE_ICON_MAP.general}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium leading-snug ${notif.is_read ? 'text-foreground' : 'text-foreground font-semibold'}`}>
                    {notif.title}
                  </p>
                  {!notif.is_read && (
                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
                {notif.message && (
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] text-muted-foreground">{format(new Date(notif.created_at), 'MMM d, HH:mm')}</span>
                  {notif.is_read && <Check size={12} className="text-muted-foreground" />}
                  {notif.action_url && (
                    <a href={notif.action_url} onClick={e => e.stopPropagation()} className="text-[11px] text-amber-500 hover:underline">View →</a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
