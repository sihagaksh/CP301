# Cursor Pagination Migration — Summary & Next Steps

This short note captures what we changed, why, and the safe next steps for rollout.

## What changed
- Replaced offset-based `.range()`/offset wrappers with cursor-based APIs for high-growth lists (feed, blogs, events, marketplace, lost & found, communities).
- Deprecated offset-wrapper helpers (they now emit runtime warnings). Prefer calling `*Cursor` APIs directly (e.g. `getPublishedBlogsCursor`).
- Added explicit column projections in hot paths (avoid `select('*')`).
- Added a migration to create compound indexes supporting cursor seeks: `db/migrations/028_add_cursor_indexes.sql`.

## Where to look (examples)
- Cursor API: `src/lib/db/blogs.ts` → `getPublishedBlogsCursor(...)`
- Deprecated wrapper: `src/lib/db/blogs.ts` → `getPublishedBlogs(...)` (wrapper remains for compatibility)
- Quick-links projection updated: `src/lib/db/quick-links.ts`
- DB guide example updated: `documentation/temp/DB_GUIDE.md`

## How to call a cursor API (pattern)

Example (blogs):

```ts
import { getPublishedBlogsCursor } from '@/lib/db/blogs'

// initial load
const firstPage = await getPublishedBlogsCursor(category, 20)

// when loading more, use the last item's cursor columns
const last = firstPage[firstPage.length - 1]
const nextPage = await getPublishedBlogsCursor(category, 20, last.publishedAt ?? last.createdAt, last.id)
```

Notes:
- Cursor tuple is typically `(cursor_time_field, id)` (e.g. `(published_at, id)`).
- Cursor APIs return a page of rows; caller keeps the last row's cursor values for the next fetch.

## Validation & tests to run (recommended)
1. Apply migrations in a staging database (`028_add_cursor_indexes.sql`) using `CONCURRENTLY` where appropriate.
2. Run smoke functionality tests for all feed-like pages (feed, blogs, events, marketplace, lost & found, communities).
3. Run `npx tsc --noEmit` locally and in CI.
4. Capture `EXPLAIN ANALYZE` for representative queries to confirm index usage.

## CI / Prevent regressions
- Add a lightweight grep step in CI that fails the build if `select('*')` appears in server/hot-path files (or add an ESLint rule to disallow `select('*')` in `lib/db` and `app` server code).

## Follow-up work
1. Migrate any remaining consumer code that calls deprecated wrappers to call `*Cursor` APIs directly (automatable via a focused search/replace for simple patterns).
2. After rollout and monitoring, remove deprecated wrappers and update `src/lib/db/index.ts` exports.
3. Replace any remaining `ILIKE '%term%'` searches with trigram or FTS where appropriate.

## Questions for you / next actions I can take
- Open a PR with these doc changes and the code edits I made.
- Create an automated codemod to migrate simple wrapper callsites to cursor calls.
- Add a CI grep or ESLint rule to block `select('*')` in hot paths.

---
Copyright: project internal note — not public documentation.
