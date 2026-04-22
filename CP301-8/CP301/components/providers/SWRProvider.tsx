'use client';

import { SWRConfig } from 'swr';

/**
 * Global SWR configuration provider.
 *
 * Strategy:
 * - revalidateOnFocus: false          → Don't re-fetch when window regains focus
 * - revalidateOnReconnect: false      → Don't re-fetch when network reconnects
 * - revalidateIfStale: false          → Don't background-refresh stale data
 * - dedupingInterval: 86_400_000ms   → 24 hours — effectively keeps data for the
 *                                       entire browser session; only explicit
 *                                       mutate() calls will trigger a new fetch.
 *
 * Individual hooks can still OVERRIDE these values by passing their own config.
 */
export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        dedupingInterval: 86_400_000, // 24 hours
      }}
    >
      {children}
    </SWRConfig>
  );
}
