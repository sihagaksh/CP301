# Scalability Analysis - Current Project State

Document date: 15 April 2026  
  Last updated: 18 April 2026
Project: IIT Ropar Community Platform / CP301  
Scope: Current working directory state, including uncommitted changes visible on 15 April 2026.  
Output file: `documentation/scalibility1504.md`

## Executive Verdict

The project has a solid campus-scale foundation, especially for a Supabase-backed Next.js PWA. The strongest parts are the modular feature layout, database-backed Row Level Security, indexed relational schema, counter-cache triggers, service-worker/PWA support, and a broad set of campus modules that already follow a recognizable pattern.

The project is not yet safely scalable to large concurrent usage without targeted cleanup. The biggest risks are offset pagination, in-memory notice filtering, broad `select('*')` queries, inconsistent caching strategy, large static map assets, realtime chat reload behavior, build/type safety being disabled, and some security/rate-limiting gaps. These are fixable, but they should be treated as production-readiness work rather than optional polish.

Overall rating: 7/10 for campus scalability today.

Target after the recommended fixes: 8.5/10 to 9/10 for a 5,000-10,000 registered-user campus deployment.

## Current State Considered

This assessment intentionally includes the current dirty working tree, not only committed code.

Important current changes observed:

| Area | Current state | Scalability impact |
|---|---|---|
| `components/features/admin/AdminMessMenu.tsx` | Admin UI for monthly mess-menu markdown plus optional document upload. | Good feature value, but direct client storage upload depends heavily on storage RLS and currently allows a wider upload path than the server-side admin upload route. |
| `app/api/admin/upload/route.ts` | New server-side service-role upload route with bearer-token verification and admin check. | Good scalable/security direction because upload authorization is centralized server-side. Needs file size/type limits and should be used consistently. |
| `db/migrations/023_fix_mess_menu_storage_policy.sql` | Changes `mess-menus` storage upload/update policy to any authenticated user. | Operationally simple, but weaker than the table-level admin model and not ideal for scale/security. |
| `.next/dev/*` | Generated development artifacts changed. | Not relevant to app scalability; should not be part of documentation or review conclusions. |

| [lib/hooks/useGroupChat.ts](lib/hooks/useGroupChat.ts) & [lib/db/communityGroups.ts](lib/db/communityGroups.ts) | Realtime/message-query fixes: hook now appends realtime inserts, exposes `loadOlderMessages()` and appends on `send()`; DB query now returns latest N messages and adds `getGroupMessagesBefore()` for cursored history. | Reduces websocket/database load for busy rooms, enables on-demand older-history loads, and adds a periodic reconciliation fallback (60s). |

## Architecture Summary

The application is a Next.js 16 App Router project with React 19, TypeScript, Supabase Auth/Postgres/Storage/Realtime, Tailwind CSS, Radix UI, PWA support through `next-pwa`, and static public map assets.

Primary layers:

| Layer | Implementation | Notes |
|---|---|---|
| Frontend shell | `app/`, `components/layout/`, dashboard route group | Good separation of route pages and feature components in many modules. |
| Feature UI | `components/features/*` | Broad module coverage: feed, blogs, notices, events, marketplace, lost-found, communities, messages, admin, mess menu. |
| Data hooks | `lib/hooks/*` | Consistent hook style with loading/error/data state. Mostly custom `useEffect` fetching rather than SWR. |
| DB query layer | `lib/db/*` | Strong pattern: central Supabase client and module-specific query files. Some files still use `select('*')`. |
| Auth | `contexts/AuthContext.tsx`, `proxy.ts`, `/api/auth/*` | Hybrid client session plus custom cookie/proxy route protection. Works conceptually, but cookie/token handling needs tightening. |
| Database | `db/migrations/*` | Good use of indexes, RLS, triggers, security-definer functions, and migration files. |
| Static/PWA assets | `public/`, `next-pwa` | PWA and offline capability exist; public map assets are large and heavily precached. |

## What Is Good For Scalability

### 1. Clear Modular Feature Boundaries

The codebase follows a healthy pattern in most feature areas:

`app route -> feature component -> custom hook -> lib/db query function -> Supabase`

Examples include feed, blogs, events, marketplace, lost-found, communities, notices, and mess-menu. This is good because new features can be added without touching unrelated areas, and expensive scalability improvements can be applied module by module.

| Strength | Why it matters |
|---|---|
| Feature folders are separated | Teams can work on modules independently. |
| Query functions live in `lib/db` | Easier to optimize database access centrally. |
| Hooks own loading/error behavior | UI remains simpler and consistent. |
| Shared types in `lib/types.ts` | Reduces accidental schema drift when maintained well. |

### 2. Supabase/Postgres Is A Reasonable Backend Choice

For a campus platform, Supabase is a pragmatic choice. It provides auth, PostgreSQL, storage, RLS, realtime, and generated APIs without requiring a custom backend for every feature.

| Strength | Why it matters |
|---|---|
| Postgres relational schema | Handles campus entities, memberships, posts, messages, and organizations well. |
| RLS policies | Security is enforced close to the data. |
| PostgREST query API | Reduces backend surface area. |
| Storage integration | Useful for images, PDFs, mess menus, marketplace media, and blogs. |
| Realtime support | Fits chat and live notification use cases. |

### 3. Database Indexes Exist For Core Access Patterns

The initial migration includes indexes for many major query paths.

| Table / area | Existing scalable support |
|---|---|
| Blogs | Category, published date, author, slug indexes. |
| Marketplace | Category/status/seller indexes. |
| Events | Type, start time, organizer indexes. |
| Notices | Category, priority, pinned indexes. |
| Messages | Conversation, sender, receiver indexes. |
| Feed | Created date and author indexes. |
| Lost and found | Status and reporter indexes. |
| Communities | Members and posts indexes. |
| Organizations | Type, parent, member, position indexes. |
| Notifications | User/read/created date index. |

This is a meaningful positive. The schema is not a toy schema; it already anticipates common read patterns.

### 4. Counter Caches And Triggers Are Already Present

The database uses denormalized counters such as `like_count`, `comment_count`, `member_count`, `post_count`, and `view_count`, with trigger migrations to keep several counts in sync.

| Migration | Benefit |
|---|---|
| `011_count_triggers.sql` | Maintains feed like/comment counts without per-request `COUNT(*)`. |
| `016_fix_community_member_count.sql` | Maintains community member counts. |
| `018_blogs_engagement_views.sql` | Adds blog likes/comments and safe view increment functions. |
| `014_communities_groups.sql` | Maintains community group member counts. |

This is exactly the right direction for read-heavy social features.

### 5. Realtime Is Used Selectively

Realtime is used for messages/group chat and header notifications instead of being applied everywhere. That is good because realtime at scale can become expensive and noisy if every list page subscribes to table changes.

| Strength | Why it matters |
|---|---|
| Realtime used where users expect freshness | Chat and notifications justify websockets. |
| Most list pages remain normal queries | Keeps baseline load simpler. |
| Group chat filters by `group_id` | Reduces cross-room noise. |

### 6. PWA And Offline Foundations Exist

The app has `next-pwa`, service worker registration, manifest, offline route, and static asset caching. This is useful for a campus app where mobile connectivity may vary.

| Strength | Why it matters |
|---|---|
| Offline shell capability | Better repeat visits and poor-network experience. |
| Cached static assets | Reduces repeated bandwidth. |
| App manifest and icons | Supports installability. |

### 7. Admin Upload Route Is A Strong Direction

The new `app/api/admin/upload/route.ts` is a good pattern: it uses a server-side service-role Supabase client, validates a bearer token, fetches the user's profile, checks `is_admin`, and then uploads server-side.

| Strength | Why it matters |
|---|---|
| Service role stays server-side | Avoids exposing privileged credentials. |
| Admin check is centralized | Better than relying only on client UI conditions. |
| Upload RLS can be stricter | Server route can bypass storage RLS after explicit authorization. |

This should become the standard for admin-only uploads.

### Update: 18 April 2026 — Recent Changes and Current Status

- **Completed in this session:**
  - Added server-side notices RPC and wired the client: `db/migrations/024_get_visible_notices_rpc.sql`, `lib/db/notices.ts` (now calls the RPC). Fixed enum/text operator errors by updating the RPC signature and added `db/migrations/027_drop_old_get_visible_notices_rpc.sql` to remove the old text-typed overload.
  - Introduced cursor-based DB APIs for several high-growth lists and updated many hooks: feed, blogs, events, marketplace, lost & found, communities (new/updated functions in `lib/db/*` and hooks in `lib/hooks/*`). Some callers were converted to use cursors.
  - Replaced several `select('*')` usages with explicit projections in hot paths (notices, marketplace, events, lost & found and related mapping functions). More replacements remain.
  - Fixed TypeScript/JSX issues uncovered by `tsc`: `components/features/notices/NoticeForm.tsx` and loosened a few strict typings in `app/api/media/upload/route.ts`. A `tsc --noEmit` run now completes successfully against the project tsconfig after these fixes.
  - Added a migration to drop the old text-typed `get_visible_notices_json` overload to avoid ambiguous RPC resolution.
  - Realtime group chat reload bug (full-list reload on each insert) was fixed earlier (see `lib/hooks/useGroupChat.ts`, `lib/db/communityGroups.ts`).

- **Current status (short):**
  - Notices: server-side filtering & cursor pagination implemented; client uses the RPC. Status: **Resolved** (server-side). Follow-up: apply migration to the running DB and restart PostgREST/Supabase so the new signature is picked up.
  - Cursor pagination: core cursor APIs added for many modules; Status: **Partially done** — callers across the codebase still need conversion and consolidation.
  - `select('*')` replacement: **Partial** — many hot paths updated, but remaining broad selects (users, messages, notifications, some dashboard pages) should be converted.

- **Remaining/high-priority work:**
  - Apply the new migrations to the database and restart local/remote Supabase/PostgREST so RPC signature and overload drop take effect.
  - Finish replacing remaining `select('*')` usages in hot paths (users, messages, notifications, dashboard detail pages).
  - Convert all callers to the new cursor APIs and remove offset pagination patterns or keep offsets only for small/static lists.
  - Commit & push these repo changes, run CI and a full `pnpm build` / integration smoke tests, and validate runtime behavior (notably notices UI, feed, and cursor flows).
  - Implement search indexing (FTS/trigram), SWR caching for repeated reads, map assets CDNization, and auth cookie hardening.

See the "Remaining work" lists at the end of this document for full context and prioritization.

## What Is Not Good Yet

### 1. Offset Pagination Will Degrade On Large Tables

Several high-traffic queries use `.range(start, end)` or offset-style paging.

| Area | Current pattern | Risk |
|---|---|---|
| Feed | `range(offset, offset + limit - 1)` | Slow deep scrolling as feed grows. |
| Blogs | `range(offset, offset + limit - 1)` | Placement season or years of posts can make offsets expensive. |
| Events | `range(start, end)` | Moderate risk. |
| Marketplace | `range(start, end)` | Risk grows with semester-end listing spikes. |
| Lost-found | `range(start, end)` | Moderate risk. |
| Communities | `range(start, end)` | Moderate risk. |
| Community posts | `range(start, end)` | High for active groups. |

Recommendation: move high-growth lists to cursor pagination using stable `(created_at, id)` or module-specific cursors like `(published_at, id)` for blogs and `(start_time, id)` for events.

Status update: **Partial progress** — cursor-based DB APIs and some hook updates were added for feed, blogs, events, marketplace, lost & found, and communities. Remaining callers and pages still need conversion and verification.

### 2. Notices — Server-side filtering & pagination (RESOLVED -> partial follow-up)

Status: **Resolved (server-side)** — The codebase now implements server-side targeting and pagination via an RPC (`get_visible_notices_json`) and the client `getNotices()` calls the RPC instead of fetching all rows and filtering in JavaScript.

What changed:
- New RPC migration: `db/migrations/024_get_visible_notices_rpc.sql` (server-side filtering, cursor/page support, enriched poster/postingIdentity payload).
- Client: `lib/db/notices.ts` updated to call the RPC and pass NULL for sentinel filters; mapping functions preserved.
- Migration added to drop the old text-typed overload: `db/migrations/027_drop_old_get_visible_notices_rpc.sql` to avoid ambiguous function resolution.

Follow-up actions (required):
- Apply the new migrations to the running database and restart PostgREST/Supabase so the updated function signature and overload removal are visible to the API.
- Verify UI flows (guest/public notices, pinned notices, and cursor-based paging) and run smoke tests for notices list and detail pages.

Why this improves scalability:
- Filtering and paging now occur in the database (can use indexes), significantly reducing network payloads and client CPU/memory work.

Recommendation: keep the RPC signature stable and complete remaining validation (migrations applied, tests passing) before marking notices as fully done.

### 3. Broad `select('*')` Queries Leak Performance And Data Shape

Several files still use `select('*')`, especially detail pages and older query modules.

| Area | Risk |
|---|---|
| `lib/db/users.ts` | User rows can grow and expose fields that pages do not need. |
| `lib/db/organizations.ts` | Organization/member queries may over-fetch. |
| `lib/db/communityGroups.ts` | Group rows are selected broadly. |
| `lib/db/mess-menu.ts` | Low risk due small table, but still inconsistent. |
| `app/(dashboard)/messages/page.tsx` | Messages and conversations include broad selections. |
| `app/(dashboard)/notifications/page.tsx` | Notifications use broad selection. |
| `app/(dashboard)/page.tsx` | Dashboard uses broad counts and feed select patterns. |
| `app/(dashboard)/posts/[id]/page.tsx` | Feed post detail selects broad post/comment fields. |
| `app/(dashboard)/users/[id]/page.tsx` | User profile selects broad rows. |
| `/api/auth/login` | User profile is fetched with `select('*')`. |

Recommendation: replace broad selects with explicit column lists, especially for user/profile, messages, dashboard, and public detail pages.

Status update: **Partial progress** — several hot-paths (notices, marketplace, events, lost & found) were updated to use explicit projections; a systematic sweep remains.

### 4. Search Uses `ILIKE '%term%'`

Search exists in marketplace, lost-found, events, communities, group settings, and messages user search via `ilike` patterns.

| Current approach | Risk |
|---|---|
| `ilike('%term%')` | Cannot efficiently use ordinary btree indexes. |
| OR searches across names/emails | Can become sequential scans. |
| Search tied directly to live tables | No ranking, typo tolerance, or indexing strategy. |

Recommendation: for campus scale, add Postgres full-text search with `tsvector` and GIN indexes for content modules. For people search, use prefix search or trigram indexes. For richer search later, add Meilisearch/Typesense.

### SOLVED: 5. Realtime Chat Reloads The Whole Message List On Each Insert

`useGroupChat` subscribes to `community_group_messages`, but on every inserted message it calls `loadMessages()`, which fetches the latest message list again.

| Event | Current result |
|---|---|
| New group message | Re-fetches up to 100 messages. |
| Busy room | Many clients repeatedly reload the same history. |
| Multiple rooms open | More websocket and database load. |

Status: Implemented (18 April 2026) — code fixes applied.

- **Files changed:** [lib/hooks/useGroupChat.ts](lib/hooks/useGroupChat.ts), [lib/db/communityGroups.ts](lib/db/communityGroups.ts).
- **What changed:**
  - Hook: `useGroupChat` now appends realtime payloads (de-duplicates by id), enriches sender info from the members cache when available, exposes `loadOlderMessages()` to prepend older messages on demand, and `send()` appends newly created messages instead of forcing a full reload. A periodic reconciliation fallback (60s) remains to recover any missed events.
  - DB: `getGroupMessages` now fetches the latest N messages (ordered descending then reversed for chronological display) and a new `getGroupMessagesBefore(groupId, before, limit)` supports cursor-based older-history loads.
- **Effect:** avoids full-list re-fetch on each INSERT, significantly reducing DB and websocket load in busy rooms and when multiple rooms are open.
- **Next steps:** wire `loadOlderMessages()` into the chat UI (infinite scroll), tune reconciliation interval and limits, and run light load tests to validate improvement.

### 6. Build Safety Is Disabled

`next.config.mjs` currently has settings that favor shipping despite problems.

| Setting | Current value | Risk |
|---|---|---|
| `typescript.ignoreBuildErrors` | `true` | Production builds can ship type-invalid code. |
| `reactStrictMode` | `false` | Some effect/idempotency issues are easier to miss. |
| `images.unoptimized` | `true` | Next image optimization is disabled. |

This helps development move quickly, but it is not a scalable production posture. At team scale, hidden type errors become deployment and runtime instability.

Recommendation: turn type checking back on before production and add CI that runs `npm run lint`, `npx tsc --noEmit`, and `npm run build`.

### 7. Static Map Assets Are Very Large

Measured from the current working directory:

| Asset area | Current size |
|---|---:|
| `public/` total | ~540 MiB |
| `public/maps/` | ~538 MiB |
| `public/maps/` file count | 1,610 files |
| `.next/` generated dev artifacts | ~862 MiB |

The map is valuable, but it dominates the static asset footprint. The current generated service worker also includes many map tile entries in the precache manifest.

| Problem | Result |
|---|---|
| Large public assets | Slower deployments and heavier hosting/CDN usage. |
| Precaching many map assets | Risk of unnecessary cache pressure on user devices. |
| Duplicate tile sets appear present (`tiles` and `tiles2`) | Potential wasted repo and deploy size. |

Recommendation: do not precache all map tiles. Serve map tiles on demand with long CDN cache headers. Remove duplicate/unused tile sets if confirmed unused. Consider moving map tiles to external object storage/CDN.

### 8. Proxy Logs Every Request

`proxy.ts` logs request processing and auth decisions. This is helpful while debugging auth, but noisy at scale.

| Issue | Impact |
|---|---|
| Console logging for every proxied request | Higher log volume and cost. |
| Auth state logs | Could expose sensitive operational patterns. |
| Broad matcher | More requests pass through proxy logic, though static extensions are skipped in code. |

Recommendation: guard logs behind `NODE_ENV !== 'production'` or a `DEBUG_AUTH_PROXY` env flag.

### 9. Auth Cookie Strategy Needs Hardening

The auth flow uses Supabase client sessions plus a custom `sb-auth-token` cookie for route protection.

Good parts:

| Good | Why |
|---|---|
| Proxy route protection exists | Prevents unauthenticated dashboard access. |
| Client detects stale cookie/session desync | Avoids some broken auth states. |
| Guest-mode routes are explicit | Useful for public notices/events/map/mess-menu. |

Risks:

| Risk | Why it matters |
|---|---|
| `sb-auth-token` is set `httpOnly: false` | Token is readable by browser JavaScript. |
| Proxy checks only cookie presence | It does not validate JWT expiry/signature at the edge. |
| Clear-cookie route exists but set-cookie route accepts any token payload shape | Should validate token before setting cookie. |
| `AuthContext` calls `db.auth.admin.deleteUser` from client code | Supabase admin API should not be usable from anon client; this cleanup path is fragile. |

Recommendation: move cookie issuance/validation to server-verified Supabase session handling or validate bearer tokens before setting cookies. Make auth cookies `httpOnly` if the client does not truly need to read them.

### 10. File Upload Controls Are Incomplete

The server-side admin upload route is good, but the current upload story is inconsistent.

| Path | Behavior |
|---|---|
| `app/api/admin/upload/route.ts` | Server-side service-role upload after admin validation. |
| `AdminMessMenu.tsx` | Direct client upload to `mess-menus` bucket. |
| `023_fix_mess_menu_storage_policy.sql` | Allows any authenticated user to insert/update `mess-menus` storage objects. |

Scalability/security concerns:

| Missing control | Risk |
|---|---|
| File size limit | Large uploads can increase storage and bandwidth costs. |
| MIME/type validation | Users may upload unexpected files. |
| Path normalization | Object keys should be constrained. |
| Rate limiting | Upload endpoint can be abused. |
| Consistent admin-only path | Current storage policy is broader than admin UI intent. |

Recommendation: route mess-menu uploads through `/api/admin/upload`, restore admin-only storage write policy, and add size/type/path/rate checks.

### 11. Client-Side Data Fetching Lacks Shared Cache

Although SWR is installed, most hooks use custom `useEffect` and local state. This is fine early, but high-navigation pages will refetch repeated data.

| Area | Risk |
|---|---|
| Dashboard widgets | Duplicate queries when users navigate back and forth. |
| Profile/auth positions | Repeated fetches per session/change. |
| Static-ish directories like clubs/orgs | Could be cached longer. |
| Notices/events | Public/guest users may create repeated identical queries. |

Recommendation: introduce SWR gradually for read-heavy, mostly cacheable queries: current user profile, positions, organizations/clubs, featured blogs, dashboard widgets, notices/events public lists.

### 12. Counts On Dashboard Can Be Expensive

The dashboard uses exact head counts for users, blog posts, and marketplace items. Exact counts on large tables can become expensive.

Recommendation: use estimated counts, cached summary tables, materialized views, or periodically refreshed counters for dashboard statistics.

### 13. Security-Definer Functions Need Ongoing Review

The database uses multiple `SECURITY DEFINER` functions. This is often necessary for RLS-safe admin operations, signup profile creation, counters, and trending functions. However, it requires care.

| Risk | Mitigation |
|---|---|
| Function bypasses RLS unexpectedly | Set `search_path`, keep function arguments narrow, validate caller role. |
| Public EXECUTE permissions too broad | Revoke and grant execute explicitly where needed. |
| Admin helper functions callable by regular users | Check `auth.uid()` and role/is_admin inside functions. |

The mess-menu `is_admin_user()` function does set `search_path = public`, which is good. Apply the same discipline consistently.
## Feature-By-Feature Scalability Assessment

### Feed

Rating: 7/10

Good:

| Good feature | Details |
|---|---|
| Indexed public feed order | `idx_feed_created` supports recent-public feed loading. |
| Counter caches | Like/comment/view counters avoid repeated aggregation. |
| Thin query layer exists | `lib/db/feed.ts` has explicit columns. |
| Load-more UX | Avoids loading entire feed initially. |

Not good:

| Issue | Impact | Recommendation |
|---|---|---|
| Offset pagination | Deep scrolling slows as `feed_posts` grows. | Cursor pagination on `(created_at, id)`. |
| No shared cache | Repeated visits reload feed. | SWR with short revalidation. |
| Comments in detail page load all comments ascending | Large posts can become heavy. | Paginate comments. |
| Realtime not used for feed | Acceptable now, but live campus feed may need selective updates. | Add optional refresh badge instead of full realtime stream. |

### Blogs

Rating: 7.5/10

Good:

| Good feature | Details |
|---|---|
| Category and published-date indexes | Good for placement/internship browsing. |
| Slug lookup exists | Good route model. |
| Engagement tables/triggers exist | Like/comment/view foundation is strong. |
| Explicit columns in list queries | Better than broad selects for list pages. |

Not good:

| Issue | Impact | Recommendation |
|---|---|---|
| Offset pagination | Grows poorly with years of posts. | Cursor by `(published_at, id)`. |
| Full content selected in list query | Pulls more data than card view needs. | Use separate list/detail projections. |
| Search is not clearly indexed | Blog search can be costly when added/used. | Add `tsvector` + GIN for title/excerpt/content. |
| Type/build errors ignored | Blog editor regressions could ship. | Enable CI checks. |

### Notices

Rating: 6.5/10 (improved - server-side RPC implemented; follow-up pending)

Good:

| Good feature | Details |
|---|---|
| Pinned/priority/category fields | Good for campus urgency. |
| Indexes for category, priority, pinned | Good starting point. |
| Target role/department/batch model | Useful institutional feature. |
| Guest access supported | Notices can reach public/guest users. |

Not good:

| Issue | Impact | Recommendation |
|---|---|---|
| In-memory filtering/pagination | Biggest scalability issue in notices. | Move targeting and pagination to SQL/RPC. |
| Attachments are array URLs | OK now, but metadata/search/permissions are limited. | Consider attachment table if usage grows. |
| No rate limiting for creation | Spam/admin abuse risk. | Add role checks and rate limits. |
| Guest route depends on proxy + RLS behavior | Needs careful testing. | Add guest/public access tests. |

### Events

Rating: 7/10

Good:

| Good feature | Details |
|---|---|
| Upcoming query filters by `start_time >= now` | Keeps old events out of main list. |
| Start-time and type indexes exist | Good for event listings. |
| Pagination exists | Initial query size is bounded. |
| Rich event model | Type, venue, organizer, online/registration fields. |

Not good:

| Issue | Impact | Recommendation |
|---|---|---|
| Offset pagination | Can degrade over years. | Cursor by `(start_time, id)`. |
| `ILIKE` title search | Slow at high row count. | FTS/trigram index. |
| Detail queries use `select('*')` | Overfetching. | Explicit detail projection. |
| No registration scaling model visible | Registration spikes can create race conditions. | Use DB constraints/functions for capacity updates. |

### Marketplace

Rating: 7/10

Good:

| Good feature | Details |
|---|---|
| Filters for status/category/condition/price | Good user experience. |
| Estimated count used | Better than exact count for paging. |
| Status and category indexes exist | Good for common browse path. |
| Expiry field exists | Helps keep listings fresh. |

Not good:

| Issue | Impact | Recommendation |
|---|---|---|
| `ILIKE` title search | Slow as listings grow. | Add full-text/trigram search. |
| Offset pagination | Deep browsing degrades. | Cursor by `(created_at, id)`. |
| Detail/create/update use `select('*')` | Overfetching and schema coupling. | Explicit columns. |
| Image arrays only | Harder moderation/deletion/metadata. | Consider media table for larger scale. |

### Lost And Found

Rating: 7/10

Good:

| Good feature | Details |
|---|---|
| Status/category filters | Fits user workflow. |
| Status index exists | Good browse pattern. |
| Reporter/claimer relationships | Good accountability. |
| Pagination exists | Bounded first load. |

Not good:

| Issue | Impact | Recommendation |
|---|---|---|
| `ILIKE` item search | Slow at high row counts. | FTS/trigram index. |
| Offset pagination | Degrades with long history. | Cursor by `(created_at, id)`. |
| Detail/create/update select broad rows | Overfetching. | Explicit detail columns. |
| No retention/archive strategy | Old items stay in active table. | Archive old returned/claimed records. |

### Communities And Groups

Rating: 6.5/10

Good:

| Good feature | Details |
|---|---|
| Community/group schema exists | Supports self-organized campus spaces. |
| Member count triggers | Avoids repeated member counts. |
| Group RLS policies exist | Important for private spaces. |
| Notice board group auto-created | Good product pattern. |

Not good:

| Issue | Impact | Recommendation |
|---|---|---|
| Member lists fetch all members | Large communities can load hundreds/thousands. | Paginate members and add search. |
| Group messages fetch last 100 ascending | OK now, but not enough for history and too much for realtime reloads. | Cursor history + append realtime payload. |
| `select('*')` in group queries | Overfetching. | Explicit columns. |
| Multiple insert operations during community creation are not transactional client-side | Partial creation can occur. | Move to RPC transaction. |

### Messages

Rating: 6/10

Good:

| Good feature | Details |
|---|---|
| Conversation/message indexes exist | Good foundation. |
| Realtime subscription exists | Required for chat UX. |
| Pagination constant for messages | Better than unbounded history. |
| Pinned conversation migration exists | Good UX foundation. |

Not good:

| Issue | Impact | Recommendation |
|---|---|---|
| Message page contains a lot of inline DB logic | Harder to optimize/test. | Move to `lib/db/messages.ts` and hooks. |
| Broad `select('*')` for messages | Overfetching. | Explicit columns. |
| Realtime scalability needs careful channel policy | Large active user base can stress realtime quotas. | Use per-conversation channels and append payloads. |
| User search uses `ILIKE` OR | Slow as user base grows. | Prefix/trigram index or server RPC. |

### Notifications

Rating: 6/10

Good:

| Good feature | Details |
|---|---|
| Notifications table and user/read index | Good base for personal notification center. |
| Header realtime channel exists | Freshness in navigation. |
| Notification page limit exists | Avoids infinite initial load. |

Not good:

| Issue | Impact | Recommendation |
|---|---|---|
| Notification generation is not fully systematized | Some events may not create notifications. | Add DB triggers or server-side event pipeline. |
| `select('*')` on notifications | Overfetching. | Explicit columns. |
| No unread counter caching strategy documented | Header can become noisy. | Store unread count or query count efficiently. |

### Admin And Organization Management

Rating: 7/10

Good:

| Good feature | Details |
|---|---|
| Admin RPC functions exist | Good for privileged mutations under RLS. |
| CSV organization/member/POR workflows exist | Useful for campus data setup. |
| Server-side admin upload route added | Strong pattern. |
| `is_admin` checks exist in new upload route and mess-menu SQL helper. | Good authorization direction. |

Not good:

| Issue | Impact | Recommendation |
|---|---|---|
| Verbose CSV/debug logs | Noisy in production. | Gate logs behind debug flag. |
| Security-definer functions need execute grants review | Privilege boundary risk. | Audit all functions and revoke broad execute where unnecessary. |
| Admin UI direct storage upload remains | Inconsistent with server route. | Use `/api/admin/upload`. |
| No audit log for admin changes | Hard to trace mistakes at scale. | Add admin action log table. |

### Mess Menu

Rating: 6.5/10

Good:

| Good feature | Details |
|---|---|
| Dedicated `mess_menus` table | Clean model for monthly menus. |
| Unique `(month, year)` index | Prevents duplicates. |
| Year/month index | Good lookup/order support. |
| Guest/public read policy | Fits product requirement. |
| Admin UI exists | Operationally useful. |

Not good:

| Issue | Impact | Recommendation |
|---|---|---|
| Direct client upload | Relies on storage RLS and broad auth policy. | Use server admin upload route. |
| Storage migration 023 allows any authenticated upload/update | Too broad for admin-only content. | Restore admin-only storage writes. |
| Upsert is read-then-write client-side | Race possible if two admins save same month. | Use DB `upsert(... onConflict: 'month,year')` or RPC. |
| No file size/type validation | Abuse/storage-cost risk. | Enforce size and MIME limits. |

### Campus Map

Rating: 6/10

Good:

| Good feature | Details |
|---|---|
| 2D and 3D map assets exist | Rich campus feature. |
| Static serving avoids DB pressure | Map browsing does not hit Postgres much. |
| Offline potential | Campus map can be useful without network. |

Not good:

| Issue | Impact | Recommendation |
|---|---|---|
| Map assets dominate public directory | ~538 MiB under `public/maps`. | Move tiles to object storage/CDN or trim unused sets. |
| Service worker precaches many map tiles | Heavy first install/cache pressure. | Runtime cache tiles on demand. |
| Duplicate tile folders appear present | Possible wasted storage/deploy size. | Confirm active tile set and remove unused. |
| Static HTML/JS map outside app architecture | Harder to share auth/theme/code. | Accept if isolated, but document maintenance boundary. |

### Auth And Guest Access

Rating: 6/10

Good:

| Good feature | Details |
|---|---|
| Route proxy protects dashboard | Basic access control exists. |
| Guest mode is explicit | Public paths are controlled. |
| AuthContext handles stale session cases | Better resilience. |
| PKCE configured in Supabase client | Good auth flow. |

Not good:

| Issue | Impact | Recommendation |
|---|---|---|
| Custom token cookie is JS-readable | XSS impact is higher. | Prefer httpOnly server-managed cookie. |
| Proxy validates presence, not token validity | Expired/invalid tokens can pass proxy until client detects. | Validate token or use Supabase SSR auth helpers. |
| Client attempts admin delete user | Fragile and inappropriate for anon client. | Move cleanup to server/RPC. |
| No global rate limiting | Login/signup/content endpoints can be abused. | Add rate limiting at edge/server. |
## Database Scalability Details

### Good Database Decisions

| Decision | Value |
|---|---|
| Migrations stored in repo | Repeatable setup and reviewable schema evolution. |
| RLS enabled broadly | Strong security-by-default direction. |
| Indexes for common list filters | Good baseline read performance. |
| Counter triggers | Avoid expensive read-time counts. |
| Security-definer signup/profile function | Solves profile creation under RLS. |
| Admin RPC functions | Avoids exposing service-role keys to browser for admin DB mutations. |
| Unique constraints and conflict handling | Prevents duplicate memberships/menus. |

### Database Weak Spots

| Weak spot | Why it matters | Fix |
|---|---|---|
| No cursor-pagination contract | Offset scans degrade. | Add cursor functions/queries per high-growth table. |
| No FTS/trigram indexes | Search becomes sequential scan. | Add `pg_trgm` and/or `tsvector` GIN indexes. |
| Notices targeting outside DB | DB cannot optimize visibility. | SQL/RPC visibility filtering. |
| Security-definer sprawl | Privilege bugs are possible. | Audit function grants/search paths. |
| Some multi-step flows are client-side | Partial writes possible. | Move to RPC transactions. |
| Exact counts in dashboard | Expensive at high row counts. | Cached counters/materialized views. |

## Frontend Scalability Details

### Good Frontend Decisions

| Decision | Value |
|---|---|
| App Router route groups | Clean separation of auth/dashboard/offline pages. |
| Feature component folders | Easy module-level ownership. |
| UI primitives | Reduces repeated UI code. |
| Skeleton/loading states | Better perceived performance. |
| PWA support | Repeat visits and offline behavior improve. |
| Mobile navigation exists | Campus app likely mobile-heavy. |

### Frontend Weak Spots

| Weak spot | Why it matters | Fix |
|---|---|---|
| Mostly custom fetching instead of SWR | Duplicate requests and no shared revalidation. | Adopt SWR for cacheable reads. |
| Large static assets in app repo | Slow builds/deploys/cache. | Externalize map tiles and trim duplicates. |
| Next image optimization disabled | More bandwidth and larger LCP risk. | Enable image optimization or use CDN transformations. |
| Build ignores TS errors | Runtime instability can ship. | Enforce `tsc` and build in CI. |
| Production logs not gated | More log noise and cost. | Debug env flags. |

## Security And Abuse-Resistance At Scale

Scalability is not only speed; it is also surviving misuse.

| Area | Current posture | Needed before production |
|---|---|---|
| Auth routes | Basic validation | Rate limit login/signup, avoid returning raw session unless necessary. |
| Content creation | Mostly RLS-protected | Add per-user rate limits and moderation/flagging. |
| Uploads | Mixed direct/client and server/admin upload | Centralize privileged uploads server-side, enforce size/type/path limits. |
| Admin actions | RPC and UI checks | Add admin action audit log. |
| Storage | Bucket policies exist | Ensure policies match actual role intent; migration 023 is too permissive for mess-menu admin content. |
| Guest mode | Useful but custom | Test RLS + proxy + guest access thoroughly. |

## Operational Readiness

### Current Good Points

| Area | Good state |
|---|---|
| Environment template | `.env.example` exists. |
| Build scripts | `dev`, `build`, `start`, `lint` exist. |
| PWA build hook | `postbuild` copies generated service worker. |
| SQL migrations | Numbered migration folder exists. |
| Documentation | Existing project guide, SRS, status audit, scalability docs. |

### Current Gaps

| Gap | Impact | Recommendation |
|---|---|---|
| No CI workflow visible | Bugs can merge unnoticed. | Add GitHub Actions for lint/type/build. |
| No automated tests visible | Regressions are hard to catch. | Add unit tests for mappers/hooks and integration tests for RLS/RPC. |
| No load testing scripts visible | Capacity claims are unverified. | Add k6 or Artillery scenarios. |
| No production monitoring plan | Bottlenecks discovered late. | Track Vercel analytics, Supabase slow queries, logs, realtime usage. |
| `.next` appears in working tree changes | Generated output should not matter to source review. | Ensure generated artifacts are ignored/cleaned in normal workflow. |

## Recommended Priority Roadmap

### Priority 0 - Production Safety Fixes

Do these before a real deployment or demo with many users.

| Task | Why | Suggested owner area |
|---|---|---|
| Stop ignoring TypeScript build errors | Prevents shipping broken code. | `next.config.mjs`, CI |
| Gate proxy/admin debug logs | Avoid log noise and possible leakage. | `proxy.ts`, admin components |
| Add upload size/type/path checks | Prevents abuse and cost spikes. | `/api/admin/upload`, storage clients |
| Use admin upload route for mess-menu | Aligns UI with admin security model. | `AdminMessMenu.tsx` |
| Revisit migration 023 storage policy | Any authenticated user should not upload official mess menus. | `db/migrations` |
| Add basic rate limiting | Protect login/signup/upload/create endpoints. | API/proxy/edge |

### Priority 1 - Database Query Scalability

| Task | Why | First modules |
|---|---|---|
| Convert notices to DB-side targeting and pagination | Current in-memory filtering is the biggest query smell. | Notices |
| Replace offset pagination in high-growth lists | Avoid slow deep pages. | Feed, blogs, marketplace, community posts |
| Replace `select('*')` in hot paths | Reduce payload size and coupling. | Messages, users, dashboard, detail pages |
| Add FTS/trigram indexes | Make search scale. | Marketplace, lost-found, users, communities, events/blogs |
| Move multi-step creation flows to RPC | Avoid partial writes. | Community creation, mess-menu upsert |

### Priority 2 - Realtime And Caching

| Task | Why | First modules |
|---|---|---|
| Append realtime message payloads instead of full reload — implemented ([lib/hooks/useGroupChat.ts](lib/hooks/useGroupChat.ts), [lib/db/communityGroups.ts](lib/db/communityGroups.ts)) | Reduces chat DB load. | Group chat, direct messages |
| Add SWR to cacheable reads | Reduces duplicate client requests. | Auth profile, positions, notices, events, dashboard widgets |
| Add notification count strategy | Header should stay cheap. | Notifications |
| Add stale-while-revalidate public lists | Better UX for guest paths. | Notices, events, mess-menu |

### Priority 3 - Static Assets And PWA Optimization

| Task | Why | First modules |
|---|---|---|
| Remove duplicate/unused map tiles | Shrink repo/deploy. | `public/maps` |
| Runtime-cache map tiles instead of precaching all | Lower install/cache pressure. | `next-pwa` config |
| Move map tiles to object storage/CDN | Faster deploy and better delivery. | Map module |
| Enable optimized images or CDN transforms | Lower bandwidth and faster pages. | Next config/media pipeline |

### Priority 4 - Observability And Testing

| Task | Why | Suggested tooling |
|---|---|---|
| Add CI | Prevent regressions. | GitHub Actions |
| Add unit tests for mappers | Catch schema mapping breakage. | Vitest |
| Add RLS/RPC integration tests | Protect security guarantees. | Supabase local/test DB |
| Add load tests | Verify real capacity. | k6/Artillery |
| Add slow-query monitoring | Find actual bottlenecks. | Supabase dashboard/Postgres logs |

## Capacity Expectations

These are practical estimates based on the current architecture, not guaranteed benchmarks.

| Scale | Current readiness | Notes |
|---|---|---|
| 100-500 active users | Good | Current architecture should handle normal campus browsing if Supabase limits are adequate. |
| 1,000-3,000 registered users | Good with minor cleanup | Most modules should be fine; notices/search/chat may need optimization. |
| 5,000-10,000 registered users | Possible after Priority 0-2 | Requires DB-side notice filtering, cursor pagination, upload controls, and less broad selection. |
| 500+ concurrent active users | Needs testing | Chat/realtime, dashboard counts, map assets, and upload paths need load validation. |
| 50,000+ users or multi-campus scale | Not ready without larger changes | Need stronger caching, queueing, search service, observability, and possibly backend services. |
## Concrete Implementation Recommendations

### Cursor Pagination Pattern

Use a cursor like `(created_at, id)` to avoid offset scans.

Example query shape:

```ts
const query = db
  .from('feed_posts')
  .select('id, content, created_at, author_id, like_count, comment_count')
  .eq('is_public', true)
  .or(`created_at.lt.${cursorCreatedAt},and(created_at.eq.${cursorCreatedAt},id.lt.${cursorId})`)
  .order('created_at', { ascending: false })
  .order('id', { ascending: false })
  .limit(limit);
```

### Notice Visibility RPC

Move visibility logic into the database.

| Input | Output |
|---|---|
| user role, department, batch, limit, cursor | only visible notices, already sorted and paginated |

This lets Postgres filter earlier and send only the page the client needs.

### Search Indexing

Recommended staged approach:

| Stage | Implementation |
|---|---|
| Quick fix | Add `pg_trgm` indexes for `title`, `name`, `item_name`, `email`, `full_name`. |
| Better content search | Add `tsvector` generated columns and GIN indexes for blogs/events/marketplace/lost-found. |
| Advanced search | Add Meilisearch/Typesense if typo tolerance, ranking, or faceting becomes important. |

### Upload Hardening

Recommended server route behavior:

| Control | Rule |
|---|---|
| Auth | Require bearer token and verify with Supabase. |
| Authorization | Check `users.is_admin = true` for admin uploads. |
| File size | Reject files above agreed cap, e.g. 5-10 MB for mess-menu documents. |
| MIME type | Allow only `application/pdf` and image MIME types for mess menus. |
| Path | Server should generate path; do not trust arbitrary client path. |
| Rate limit | Limit upload attempts per admin/IP. |

### PWA/Map Caching

Recommended cache policy:

| Asset type | Policy |
|---|---|
| App shell | Precache. |
| Icons/manifest/core CSS/JS | Precache. |
| Map tiles | Runtime cache on demand with high max entries and expiration. |
| User-uploaded media | Runtime cache with conservative max entries. |
| API responses | Avoid service-worker caching unless intentionally designed per endpoint. |

## Best Features In The Current Project

| Rank | Feature / quality | Why it is good |
|---:|---|---|
| 1 | Modular feature architecture | Makes the project maintainable and optimizable. |
| 2 | Database RLS and migrations | Strong security/scalability base. |
| 3 | Indexed schema for common queries | Avoids many beginner database bottlenecks. |
| 4 | Counter-cache triggers | Correctly avoids repeated expensive counts. |
| 5 | Campus-specific feature breadth | Product is coherent for IIT Ropar needs. |
| 6 | Server-side admin upload route | Good move toward secure privileged operations. |
| 7 | PWA/offline foundation | Good for mobile campus use. |
| 8 | Guest-access model | Public notices/events/map/mess-menu are practical. |

## Weakest Features / Technical Debt

| Rank | Weakness | Why it hurts scalability |
|---:|---|---|
| 1 | Notices in-memory filtering | Pulls too much data and bypasses DB optimization. |
| 2 | Offset pagination | Slows down as tables grow. |
| 3 | Broad `select('*')` hot paths | Overfetches and couples UI to schema. |
| 4 | `ILIKE '%term%'` search | Becomes sequential scans. |
| 5 | Realtime reloads whole chat list | Multiplies DB load in active rooms. |
| 6 | Type/build checks disabled | Allows production instability. |
| 7 | Huge map assets and precache | Heavy deploy/cache burden. |
| 8 | Upload/auth hardening gaps | Abuse can become cost/security incident. |
| 9 | No visible CI/tests/load tests | Scalability claims are not continuously verified. |
| 10 | Production logging not gated | Operational noise and possible leakage. |

## Final Assessment

The project is in a promising state. It is much closer to a scalable campus platform than a throwaway prototype because the database schema, feature boundaries, RLS, indexes, and counter triggers are already pointing in the right direction.

The most important correction is to stop treating all list queries as simple page/offset fetches and stop doing visibility/search work in the browser. Postgres should do the heavy filtering, pagination, and indexed search. The frontend should cache stable reads, avoid repeated realtime full reloads, and avoid shipping massive static assets unnecessarily.

If the team completes Priority 0 and Priority 1, the platform should be in good shape for a serious IIT Ropar campus rollout. Priority 2 and Priority 3 will make the experience smoother and cheaper as usage grows.
