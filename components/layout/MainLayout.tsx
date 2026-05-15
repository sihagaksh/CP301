'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface MainLayoutProps {
  children: React.ReactNode;
  isGuest?: boolean;
}

export function MainLayout({ children, isGuest = false }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Pages that manage their own scroll and need full-bleed layout
  const isFullBleed = pathname === '/messages' || pathname === '/map';

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  // ── Cross-tab sign-out detection ────────────────────────────────
  // If the user signs out in Tab A, Tab B's Supabase auth listener fires
  // 'SIGNED_OUT', which clears the cookie but purposely avoids redirecting
  // (because Next.js struggles with navigations in hidden tabs).
  // When the user switches back to Tab B, this visibility check catches
  // the missing cookie and forces a clean reload to the login screen.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        const hasAuth = document.cookie.includes('sb-auth-token');
        const hasGuest = document.cookie.includes('guest-mode=1');
        // Only reload if neither authenticated nor in guest mode
        if (!hasAuth && !hasGuest) {
          window.location.reload();
        }
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // In development, unregister stale service workers so they don't serve
  // old cached bundles and cause hydration mismatches.
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) {
          reg.unregister();
          console.log('[SW-dev] Unregistered stale SW:', reg.scope);
        }
      });
      // Also clear all caches in dev to avoid stale asset serving
      if ('caches' in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
    }
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <Header onMenuClick={openSidebar} />

      <div className="flex flex-1 min-h-0">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} isGuest={isGuest} />

        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {isFullBleed ? (
            // Full-bleed pages (messages) handle their own height & scroll
            <div className="flex-1 min-h-0 pb-16 md:pb-0">
              {children}
            </div>
          ) : (
            // Regular pages: scrollable with padding
            <div className="flex-1 overflow-y-auto overscroll-contain pb-20 md:pb-0">
              <div className="max-w-screen-xl mx-auto px-3 py-4 sm:p-4 md:p-6">
                {children}
              </div>
            </div>
          )}
        </main>
      </div>

      <BottomNav onMoreClick={openSidebar} isGuest={isGuest} />
    </div>
  );
}
