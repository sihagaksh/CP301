Scalability Summary — Problems & Status
Date: 2026-04-18

This short summary highlights the main scalability problems found in the codebase and the current status of remediation work (Resolved / Partial / Not started).

- Notices (server-side filtering & pagination): RESOLVED (server-side RPC implemented).
  - Follow-up: apply migrations and restart PostgREST/Supabase; run smoke tests for notices UI.

- Cursor pagination for large lists (feed, blogs, events, marketplace, lost & found, communities): PARTIAL.
  - What done: core cursor APIs implemented and multiple high-priority callers converted — feed, blogs and community posts now use cursor pagination; hooks updated for several modules.
  - Next: convert remaining callers (marketplace, lost & found, events) and validate UI behavior across filters, realtime updates, and infinite-scroll UX.
    - Tasks:
      - Add/complete cursor APIs in `lib/db/marketplace.ts`, `lib/db/lost-found.ts`, `lib/db/events.ts` (avoid `.range()` offsets).
      - Update consuming hooks: `lib/hooks/useMarketplace.ts`, `lib/hooks/useLostFound.ts`, `lib/hooks/useEvents.ts` to use cursors and reset cursor state on filter changes.
      - Replace offset callers in pages and server code (app routes and callers under `app/(dashboard)/*`) with cursor-based callers; remove deep-offset queries from hot routes.
      - Replace `select('*')` in converted callsites with explicit projections to avoid overfetch.
      - Add compound indexes to support efficient cursor seeks (e.g. `(created_at, id)` or `(published_at, id)`) and index common filter columns (status, community_id).
    - Acceptance criteria:
      - Hot paths no longer use `.range()` offsets for pagination.
      - Infinite-scroll / “load more” UX relies on stable cursor tuples and preserves ordering under concurrent inserts.
      - `tsc --noEmit` passes and smoke tests cover feed/blogs/marketplace retrieval paths.
      - Production metrics show reduced latency for deep-page navigations / load-more operations.
    - Rollout plan:
      1. Deploy DB changes first (indexes, RPCs/migrations where needed).
      2. Deploy application changes switching callers to cursor APIs.
      3. Run smoke tests and monitor query performance; rollback app changes if regressions appear.
    - Notes:
      - For realtime feeds, append incoming records to the top of the local feed and keep cursor state for pagination (avoid refetching whole pages on each realtime event).
      - Use NULL sentinels for enum-based RPC params (as done for notices RPC) to avoid ambiguous overloads.

- Broad `select('*')` (overfetch in hot paths): PARTIAL.
  - What done: explicit projections added in notices, marketplace, events, lost & found, and several dashboard/feed/post-detail pages; messages conversation selects updated in key callsites.
  - Next: sweep remaining hotspots (users, notifications, leftover dashboard pages) and remove wildcard projections in hot routes and RPCs.

- Offset pagination (deep offsets): PARTIAL.
  - What done: several high-priority lists converted to cursor pagination; offset usage still remains in some DB modules and legacy callsites.
  - Recommendation: complete conversion to cursor-based pagination for growth-prone lists and add appropriate compound indexes (e.g. `(created_at, id)` or `(published_at, id)`) to support efficient cursor seeks.

- Search using `ILIKE '%term%'`: NOT STARTED.
  - Recommendation: add `pg_trgm`/`tsvector` + GIN indexes (stage: trigram quick fix, then tsvector for content).

- Realtime full-list reloads (chat): RESOLVED.
  - Group chat now appends realtime payloads; full-list reload bug fixed.

- TypeScript / build safety: PARTIAL.
  - What done: several TS/JSX errors fixed; `tsc --noEmit` runs clean locally after fixes.
  - Next: disable `typescript.ignoreBuildErrors`, enforce `tsc` in CI.

- Map asset size & precaching: NOT STARTED.
  - Recommendation: move tiles to CDN/object storage; runtime-cache tiles, remove duplicate tile sets.

- Upload controls & auth cookie strategy: NOT STARTED.
  - Recommendation: centralize privileged uploads through server route, enforce size/MIME/path checks, make auth cookie httpOnly.

- Proxy logging & rate-limiting: NOT STARTED.
  - Recommendation: gate debug logs behind env flag and add rate limits on auth/upload endpoints.

- CI, automated tests, load testing: NOT STARTED.
  - Recommendation: add CI (lint/tsc/build), unit/integration tests, and basic load scripts (k6/Artillery).

Immediate next actions (short):
1. Apply and verify the new migrations (024, 027) in the running DB and restart Supabase/PostgREST.
2. Sweep remaining `select('*')` hotspots and convert callers to cursor pagination.
3. Commit/push changes and run CI/build + smoke tests.

File created from current repo state: see documentation/scalibility1504.md for full analysis and details.
