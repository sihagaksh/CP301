# Organization Accounts — Design Document

Last updated: 2026-04-21

---

## What this document covers

How org-specific accounts (e.g. `bost@iitrpr.ac.in`, `chess@iitrpr.ac.in`) work:
- What kind of user they are
- What they can post
- What admin power they have over their children
- How this fits into the existing POR system without changing it

---

## Core idea (one paragraph)

Every club or body in the college has an official email address. That email maps to a **dedicated org account** — a user in the system with `is_org_account = true` linked to exactly one `Organization` row. When that account logs in, it can post feed posts, blogs, notices, and events **under the name of that organization**. It can also perform the same structural admin actions the super-admin does, but **only for its own org and its direct children** — creating child orgs under itself and managing PORs (assigning/revoking positions) within its scope.

---

## What does NOT change

- The POR system (`user_positions` table, `por_type` enum) stays exactly as-is.
- The roles: `secretary | representative | mentor | coordinator | custom` — unchanged.
- How human users post using their POR identity — unchanged.
- `org_members` table — unchanged (still just membership tracking with `pending/approved/removed` status).
- No new role system. No `owner | admin | manager | poster` enum. None of that.

---

## What changes (minimal)

### 1. Two new columns on the `users` table

```sql
ALTER TABLE users ADD COLUMN is_org_account BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN linked_org_id  UUID REFERENCES organizations(id) ON DELETE SET NULL;
```

- `is_org_account = true` → this user is not a human student/faculty/staff — it is the official account of an org.
- `linked_org_id` → which `Organization` this account speaks for.
- `batch`, `branch`, `dept`, `enrollment_number` are all NULL for these accounts — that's fine, those columns are already nullable.

### 2. One new column on all content tables (feed, blogs, events, notices)

```sql
ALTER TABLE feed_posts ADD COLUMN acting_as_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE blog_posts  ADD COLUMN acting_as_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE events      ADD COLUMN acting_as_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE notices     ADD COLUMN acting_as_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
```

When `acting_as_org_id` is set on a post, that post is attributed to the org — it shows the org's name/logo, not just the human's name.

---

## The two kinds of actors who can post as an org

### Actor A — The org account itself

`bost@iitrpr.ac.in` logs in. The system detects `is_org_account = true`. Every post it creates has:
- `author_id = <bost user uuid>`
- `acting_as_org_id = <bost org uuid>`

That is it. Clean and simple.

### Actor B — A human with a POR in that org

`rahul@iitrpr.ac.in` logs in. He has a `user_positions` row: Secretary of BOST. When he composes a post, the existing "Act as" dropdown already shows his POR identities. After this change, it also shows **"Post as BOST (Official)"** as an option if he is an active POR holder in BOST.

His post has:
- `author_id = <rahul uuid>` (audit trail preserved)
- `posting_identity_id = <his user_position row>` (his POR identity)
- `acting_as_org_id = <bost org uuid>` (indicates it was posted on behalf of BOST)

So the display shows: **BOST · via Rahul Kumar (Secretary)**

---

## Admin power of an org account

An org account has the same controls as the super-admin *but scoped only to its own org and direct children*.

| Action | Super-admin (`is_admin=true`) | Org account (`is_org_account=true`) |
|---|---|---|
| Create a new org | Anywhere | Only as a child of its linked org |
| Assign/revoke a POR | Any org | Only within its linked org and its direct children |
| Post as org | N/A (posts as admin) | Posts as the linked org |
| Manage all users | ✅ | ❌ |
| Manage all orgs | ✅ | ❌ |

**Example:** BOST account (`linked_org_id = BOST`) can:
- Create "BOST Programming Club" as a child of BOST
- Assign a Secretary POR to Alice in BOST Programming Club
- Revoke a POR in BOST itself

BOST account **cannot**:
- Create a club under Gymkhana (not its child)
- Manage user accounts
- Change the structure of Music Club (not its child)

**Example:** Chess Club account (`linked_org_id = Chess Club`) can:
- Assign/revoke PORs within Chess Club
- Post as Chess Club

Chess Club account **cannot**:
- Create children under Chess Club (clubs typically don't have sub-clubs — but if they do, and parent allows it, the same rule applies)
- Touch anything outside Chess Club

---

## How the admin portal changes

### Super-admin view (`/admin` — gated by `user.isAdmin = true`)

No change to existing tabs. Add one new tab: **"Org Accounts"**
- Lists all org accounts (users where `is_org_account = true`)
- Allows creating a new org account for an existing org (sets the email, password via `supabase.auth.admin.createUser`)
- Allows resetting credentials

### Org-account view (new `/org-admin` or tab, gated by `user.isOrgAccount = true`)

When an org account logs in, instead of the main admin portal, it sees a focused panel:
- **Post** — compose a feed post / notice / event as the org
- **Our Structure** — view children orgs, create new child orgs, deactivate children
- **POR Management** — assign / revoke PORs for this org and its children (same UI as the admin "College Structure > Positions" tab, but scoped)

Human users with POR in an org do NOT get this panel — they just get the "Act as" dropdown in the post composer.

---

## Auth context changes (minimal)

In `AuthContext.tsx`, when `checkAuth` loads the user:

```
if (user.isOrgAccount) {
  // Build a single posting identity: "Act as <linked org>"
  // Load linked org details
  // Set a flag: isOrgAccount = true, linkedOrg = <org row>
} else {
  // Existing flow: load user_positions, build POR identities
  // New addition: also add "Post as [org]" for each org where user has an active POR
}
```

New context values added:
- `isOrgAccount: boolean`
- `linkedOrg: Organization | null` — the org this account controls (null for human users)

---

## Content display changes

On feed cards, event cards, notice cards:

- If `acting_as_org_id` is null → show as today (human name / POR identity)
- If `acting_as_org_id` is set → show org logo + org name as the primary author label

---

## Questions I need your answer on before building

**Q1 — Who can create org accounts?**
- Option A: Super-admin only (via `/admin` portal) — tight control
- Option B: The parent org account can create child org accounts (more autonomous)

**Q2 — Posting as org for POR holders: is this always on?**
Any POR holder in Chess Club can post as Chess Club? Or only specific por_types (e.g., only `secretary` / `coordinator`)?

**Q3 — New route `/org-admin` vs embedded tab in existing `/admin`?**
The org-account dashboard — should it be a completely separate page, or a conditional tab that appears inside `/admin` only for org accounts?

---

## Migration sequence (order of operations)

1. DB migration (one `.sql` file — additive only, no breaking changes)
2. Update TypeScript types (`lib/types.ts`)
3. Update `lib/db/users.ts` and `lib/db/organizations.ts`
4. Update `AuthContext.tsx`
5. Update post composers (add org option to "Act as" dropdown)
6. Update content cards (show org attribution)
7. Add org-admin portal surface
8. Add "Org Accounts" tab to super-admin panel

Each step is isolated. Steps 1–4 cause zero visible UI change. Steps 5–8 are additive new surfaces.
