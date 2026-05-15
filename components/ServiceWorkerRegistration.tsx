'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker and forces an immediate reload when a new
 * version is detected. This prevents hydration mismatches caused by the SW
 * serving stale JS bundles while the server renders fresh HTML.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV === 'development'
    ) {
      return;
    }

    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        console.log('[SW] Registered:', reg.scope);

        // When a new service worker installs, force it to activate immediately
        // by skipping the waiting state, then reload to serve fresh assets.
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New SW installed → tell it to skip waiting, then reload
              console.log('[SW] New version found, activating and reloading…');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        // When the SW controllers changes (because we just SKIP_WAITED), reload
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });
      } catch (err) {
        console.error('[SW] Registration failed:', err);
      }
    });
  }, []);

  return null;
}
