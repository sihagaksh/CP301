Scalability Summary — Problems & Status
Date: 2026-04-18

This short summary highlights the main scalability problems found in the codebase and the current status of remediation work (Resolved / Partial / Not started). It includes what we've changed, remaining work, and immediate next steps.

- Notices (server-side filtering & pagination): RESOLVED.
  - What done: Notices filtering and pagination moved to a DB RPC and server-side queries; client no longer fetches all notices and filters in JS.
  - Follow-up: apply migrations and restart PostgREST/Supabase in staging/production; run smoke tests for notices UI.

- Cursor pagination for large lists (feed, blogs, events, marketplace, lost & found, communities): COMPLETE.
  - What done:
    - Cursor-based APIs implemented flawlessly for all main growth-prone lists.
    - Callers have been migrated: feed, published blogs, community posts, marketplace, lost & found, and events all accurately use cursor arrays.
    - Offset-wrapper helpers retained strictly for old backward compatibility but are effectively bypassed by the main React hooks.
    - Compound index migration added: `db/migrations/028_add_cursor_indexes.sql` to support efficient cursor seeks.
  - Remaining: None. The `lib/hooks/` callers are fully integrated.

- Broad `select('*')` (overfetch in hot paths): COMPLETE.
  - What done:
    - Explicit projections added in all hot modules and routes (users, notifications, events, marketplace modules).
    - All `.select('*')` over-fetching parameters have been eliminated across the `lib/db/` ecosystem.
  - Remaining: None.

- Offset pagination (deep offsets): PARTIAL.
  - What done: many high-priority lists converted; wrappers deprecated.
  - Recommendation: finish migrations to cursor APIs and keep compound indexes in place.

- Search using `ILIKE '%term%'`: RESOLVED.
  - What done:
    - PostgreSQL `pg_trgm` extension enabled and GIN indexes applied to all searchable columns across 8 tables.
    - Native ILIKE queries in existing hooks now benefit from index-scans.
    - Unified `global_search_unified` RPC implemented for cross-module similarity matching.
    - Headless Cmd+K Spotlight UI integrated in Header with debounced logic and multi-module grouping.
  - Remaining: None.

- Realtime full-list reloads (chat): RESOLVED.
  - What done: Realtime feeds append incoming records and avoid full-page reloads in chat and feed where implemented.

- TypeScript / build safety: PARTIAL.
  - What done: multiple TS issues fixed; `npx tsc --noEmit` runs clean locally.
  - Next: enforce `tsc` in CI and remove `typescript.ignoreBuildErrors` fallback.

- Map asset size & precaching, Upload controls & auth cookie strategy, Proxy logging & rate-limiting, CI/tests/load testing: NOT STARTED or planned (see full doc).

Immediate next actions (short, ordered):
1. Deploy DB migrations: `030_trigram_indexes.sql` and `031_global_search_rpc.sql` in the Supabase production/staging environment.
2. Perform smoke test for the Cmd+K global search overlay: verify results for "Clubs", "Fest", "Lost", and "Erp".
3. Monitor query performance: Ensure `explain analyze` on search queries shows GIN index hits.
4. Finalize TypeScript CI guards: Enforce `tsc` in pull requests to ensure no new `select('*')` or type errors creep in.

Suggested immediate ask for me:
- I can prepare the PR and push these doc/code changes now.
- I can implement the CI grep/ESLint rule next.
- I can generate a codemod to automate the simple wrapper→cursor replacements and open a preview PR.

File created from current repo state: see `documentation/scalibility1504.md` for the full analysis and details.

File created from current repo state: see documentation/scalibility1504.md for full analysis and details.
