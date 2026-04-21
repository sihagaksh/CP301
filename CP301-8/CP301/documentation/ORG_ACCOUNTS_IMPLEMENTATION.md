# Org Accounts — Full Implementation Guide

**Project:** IIT Ropar Community Platform (CP301)  
**Last updated:** 2026-04-21  
**Status:** Planned — not yet implemented  

---

## Why this document exists

This document is the single source of truth for implementing organization accounts. It was written to be fully self-contained — you should be able to implement everything from scratch reading only this file, without needing to rediscover what was decided, why, or how.

---

## What is an Org Account?

Every club/body in college has an official email (e.g. `bost@iitrpr.ac.in`, `chess-club@iitrpr.ac.in`). An org account is a **Supabase auth user whose identity is that email address**, linked to exactly one `Organization` row in the database.

When someone logs in with `bost@iitrpr.ac.in`:
- The system detects this is an org account (`is_org_account = true`)
- It loads the organization this account controls (`linked_org_id`)
- It redirects them to `/org-admin` — a **dedicated portal, separate from `/admin`**
- Every post they create is attributed to the org, not a human name

**What this is NOT:**
- It is not a role change to the existing POR system
- It is not a new "owner/admin/manager/poster" role enum
- POR holders (students with `secretary`, `coordinator`, etc. titles) do NOT get org posting rights — they continue using the existing POR posting identity as-is
- There is no "Actor B" — no human-posting-as-org feature. Only the org account itself posts as the org.

---

## Finalized Design Decisions

| Question | Decision |
|---|---|
| Who can post as an org? | Only the org account user itself (`is_org_account = true`) |
| Who creates org accounts? | Super-admin only via `/admin` portal |
| Where is the org-admin UI? | `/org-admin` — completely separate from `/admin` |
| Do POR holders get org-posting rights? | No. They continue using POR posting identity unchanged |
| New role system? | None. `por_type` enum unchanged: `secretary \| representative \| mentor \| coordinator \| custom` |
| Org admin's scope of control? | Their own org + direct children only |
| CSV scope for org admin? | Downloads/uploads filtered to their org + child org slugs |
| UI pattern for `/org-admin`? | One template page, adapts to whichever org is logged in |

---

## Current Codebase — What Already Exists

Understanding these prevents re-inventing the wheel.

### DB schema (relevant parts)

```sql
-- organizations table (already has email col)
CREATE TABLE organizations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    type        org_type NOT NULL,  -- governance_body | board | club | society | fest_committee
    parent_id   UUID REFERENCES organizations(id) ON DELETE SET NULL,
    email       TEXT,               -- ← already exists, just not used for login
    ...
);

-- org_members (just membership, no role column — keep it that way)
CREATE TABLE org_members (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id    UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status    membership_status NOT NULL DEFAULT 'pending',  -- pending | approved | removed
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(org_id, user_id)
);

-- user_positions (POR system — do not change)
CREATE TABLE user_positions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    por_type    por_type NOT NULL DEFAULT 'custom',  -- secretary|representative|mentor|coordinator|custom
    valid_from  DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- users table (current, no org fields yet)
CREATE TABLE users (
    id                  UUID PRIMARY KEY,
    email               TEXT NOT NULL UNIQUE,
    full_name           TEXT NOT NULL,
    role                user_role NOT NULL DEFAULT 'student',
    status              user_status NOT NULL DEFAULT 'active',
    department          TEXT,       -- nullable (will be null for org accounts)
    branch              TEXT,       -- nullable (will be null for org accounts)
    batch               TEXT,       -- nullable (will be null for org accounts)
    enrollment_number   TEXT,
    employee_id         TEXT,
    ...
    is_verified         BOOLEAN NOT NULL DEFAULT false,
    is_admin            BOOLEAN NOT NULL DEFAULT false,
    ...
);

-- content tables (feed_posts, blog_posts, events, notices)
-- all have: author_id UUID NOT NULL REFERENCES users(id)
-- all have: posting_identity_id UUID REFERENCES user_positions(id)
-- MISSING: acting_as_org_id (to be added)
```

### Key existing components

| Component | Location | What it does |
|---|---|---|
| `AdminOrgManagement.tsx` | `components/features/admin/` | Full org CRUD + CSV bulk import/export. 1146 lines. |
| `AdminOrgRoster.tsx` | `components/features/admin/` | Per-org member list, assign POR, revoke POR. Takes `orgId` prop. |
| `useAdmin.ts` | `lib/hooks/` | All admin data operations (fetch orgs, bulk CSV, assign POR, etc.) |
| `AuthContext.tsx` | `contexts/` | Auth state, loads user + positions on login, builds posting identities |
| `buildPostingIdentities()` | inside `AuthContext.tsx` | Builds the "Act as" dropdown — POR identities only currently |
| `lib/db/organizations.ts` | `lib/db/` | All org DB queries: `getOrganizations`, `getOrgMembers`, `getOrgPositions`, `upsertOrganization`, `getAllOrgMembers`, `getAllOrgPositions`, etc. |
| `lib/db/users.ts` | `lib/db/` | `getUserById`, `mapUser`, `getAllUsers` |

### `AdminOrgRoster` is already generic — reuse it

```tsx
// Current signature — zero changes needed
interface AdminOrgRosterProps {
    orgId: string;
    orgName: string;
}
// It already handles: fetch members, fetch PORs, add member, remove member,
// assign POR (all por_types), revoke POR — all scoped to the orgId passed to it.
```

The org-admin portal just controls WHICH `orgId` values are selectable — the component itself needs no changes.

### CSV helpers in `AdminOrgManagement` — extract these

The following functions in `AdminOrgManagement.tsx` should be extracted to `lib/csv-utils.ts`:
- `parseCSV(text)` — parses CSV/TSV into array of objects
- `triggerDownload(csv, filename)` — triggers browser download
- `escape(v)` — CSV-safe escapes a value

Once extracted, both `AdminOrgManagement` and the new `OrgAdminCsvTools` component import from `lib/csv-utils.ts`.

---

## Implementation — Step by Step

### Step 1 — DB Migration

**File:** `db/migrations/038_org_accounts.sql`

```sql
-- ============================================================
-- 038_org_accounts.sql
-- Adds org account support: identifies a user as an org account
-- and adds acting_as_org_id to all content tables for attribution.
-- Additive only. Zero breakage.
-- ============================================================

-- 1. Extend users table
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_org_account BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS linked_org_id  UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- 2. Extend content tables with org attribution
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS acting_as_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE blog_posts  ADD COLUMN IF NOT EXISTS acting_as_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE events      ADD COLUMN IF NOT EXISTS acting_as_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE notices     ADD COLUMN IF NOT EXISTS acting_as_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- 3. Indexes for org content queries
CREATE INDEX IF NOT EXISTS idx_feed_acting_org   ON feed_posts(acting_as_org_id) WHERE acting_as_org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_acting_org  ON events(acting_as_org_id)    WHERE acting_as_org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notices_acting_org ON notices(acting_as_org_id)   WHERE acting_as_org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blogs_acting_org   ON blog_posts(acting_as_org_id) WHERE acting_as_org_id IS NOT NULL;

-- 4. Index to find org accounts quickly
CREATE INDEX IF NOT EXISTS idx_users_is_org ON users(is_org_account) WHERE is_org_account = true;

-- Track migration
INSERT INTO _migrations (filename) VALUES ('038_org_accounts.sql') ON CONFLICT DO NOTHING;
```

**RLS note:** No RLS changes needed. Org accounts log in via Supabase Auth with their own UUID. The existing `author_id = auth.uid()` policies work — because the org account IS the `auth.uid()` when it posts.

---

### Step 2 — TypeScript Types

**File:** `lib/types.ts`

```ts
// In the User interface, add:
export interface User {
  // ... all existing fields unchanged ...
  isOrgAccount?: boolean;     // true for org-account users
  linkedOrgId?: string;       // which org this account controls (null for human users)
}

// In FeedPost, BlogPost, Event, Notice interfaces, add:
actingAsOrgId?: string;       // set when content was created by an org account
```

---

### Step 3 — Data Layer

**File:** `lib/db/users.ts`

In `getUserById` (and `getUserByEmail` if used), add to every SELECT:
```ts
is_org_account, linked_org_id,
```

In `mapUser`:
```ts
isOrgAccount: row.is_org_account,
linkedOrgId: row.linked_org_id,
```

**File:** `lib/db/organizations.ts`

Add one new function:
```ts
export async function getOrganizationById(orgId: string): Promise<Organization | null> {
    const { data, error } = await db
        .from('organizations')
        .select(`id, name, slug, type, parent_id, description, logo_url, email, social_links, is_active, founded_year, created_at, updated_at`)
        .eq('id', orgId)
        .single();
    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`[getOrganizationById] ${error.message}`);
    }
    return data ? mapOrganization(data) : null;
}
```

Modify `getAllOrgMembers` and `getAllOrgPositions` to accept an optional scope filter:
```ts
export async function getAllOrgMembers(scopeOrgIds?: string[]): Promise<OrgMember[]> {
    let query = db.from('org_members')
        .select(`id, org_id, user_id, status, joined_at,
            user:users!org_members_user_id_fkey(id, email, full_name, role, profile_picture_url, enrollment_number, employee_id),
            org:organizations(id, name, slug, type, parent_id, logo_url, is_active)`)
        .eq('status', 'approved')
        .order('joined_at', { ascending: false });

    if (scopeOrgIds && scopeOrgIds.length > 0) {
        query = query.in('org_id', scopeOrgIds);
    }

    const { data, error } = await query;
    if (error) throw new Error(`[getAllOrgMembers] ${error.message}`);
    return (data ?? []).map(mapOrgMember);
}

// Same pattern for getAllOrgPositions — add scopeOrgIds?: string[] param
```

---

### Step 4 — AuthContext

**File:** `contexts/AuthContext.tsx`

Add two new state vars:
```ts
const [linkedOrg, setLinkedOrg] = useState<Organization | null>(null);
```

`isOrgAccount` is derived: `user?.isOrgAccount ?? false` — no extra state needed.

Modify `checkAuth` and the `SIGNED_IN` handler. After loading `userData`:

```ts
if (userData.isOrgAccount && userData.linkedOrgId) {
    // Org account path
    const org = await getOrganizationById(userData.linkedOrgId);
    setLinkedOrg(org);
    // Single posting identity — the org itself
    const orgIdentity: PostingIdentity = {
        id: null,
        label: org?.name ?? 'Organization',
        org_name: org?.name,
        org_slug: org?.slug,
    };
    setPostingIdentities([orgIdentity]);
    setActiveIdentity(orgIdentity);
    setActivePositions([]); // no POR positions for org accounts
} else {
    // Existing human user path — unchanged
    const positions = await getUserPositions(session.user.id);
    setActivePositions(positions);
    buildPostingIdentities(userData, positions);
    setLinkedOrg(null);
}
```

Add to `AuthContextType` interface:
```ts
isOrgAccount: boolean;
linkedOrg: Organization | null;
```

Add to the context value:
```ts
isOrgAccount: user?.isOrgAccount ?? false,
linkedOrg,
```

**Routing guard:** In the dashboard layout or in `checkAuth`, add:
```ts
// Org accounts must go to /org-admin, not the regular dashboard
if (userData.isOrgAccount && !window.location.pathname.startsWith('/org-admin')) {
    window.location.replace('/org-admin');
}
// Regular users cannot access /org-admin
if (!userData.isOrgAccount && window.location.pathname.startsWith('/org-admin')) {
    window.location.replace('/');
}
```

---

### Step 5 — CSV Utils Extraction

**File (NEW):** `lib/csv-utils.ts`

Cut these three functions out of `AdminOrgManagement.tsx` and put them here:

```ts
// Parse a CSV/TSV text into array of row objects
export function parseCSV(text: string): Record<string, string>[] { /* ... exact same code ... */ }

// Trigger a browser CSV file download
export function triggerDownload(csv: string, filename: string): void { /* ... exact same code ... */ }

// Escape a value for CSV output
export function escape(v: string | undefined | null): string { /* ... exact same code ... */ }
```

Update `AdminOrgManagement.tsx` to import from `lib/csv-utils.ts` instead.  
No behavioural change — pure refactor.

---

### Step 6 — API Route: Create Org Account

**File (NEW):** `app/api/admin/org-accounts/route.ts`

```ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserById } from '@/lib/db/users';
import { db } from '@/lib/db';

// Service role client (for admin ops)
const adminDb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET — list all org accounts
export async function GET(request: Request) {
    // 1. Verify caller is super-admin
    const session = await db.auth.getSession();
    if (!session.data.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const caller = await getUserById(session.data.session.user.id);
    if (!caller?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // 2. Fetch org accounts
    const { data, error } = await adminDb
        .from('users')
        .select('id, email, full_name, linked_org_id, created_at')
        .eq('is_org_account', true);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ accounts: data });
}

// POST — create a new org account
export async function POST(request: Request) {
    // 1. Verify caller is super-admin
    const { data: { session } } = await db.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const caller = await getUserById(session.user.id);
    if (!caller?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // 2. Parse body
    const { org_id, email, display_name, password } = await request.json();
    if (!org_id || !email || !display_name || !password) {
        return NextResponse.json({ error: 'Missing required fields: org_id, email, display_name, password' }, { status: 400 });
    }

    // 3. Create Supabase auth user
    const { data: authData, error: authError } = await adminDb.auth.admin.createUser({
        email,
        password,
        email_confirm: true,   // skip email verification for org accounts
    });
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });
    if (!authData.user) return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });

    // 4. Create users profile row (SECURITY DEFINER bypasses RLS)
    const { error: profileError } = await adminDb.rpc('create_org_account_profile', {
        p_id: authData.user.id,
        p_email: email,
        p_full_name: display_name,
        p_org_id: org_id,
    });

    if (profileError) {
        // Rollback auth user if profile creation fails
        await adminDb.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ userId: authData.user.id, email, org_id }, { status: 201 });
}
```

**Also add this SQL function to the migration (or a new migration `039_org_account_rpc.sql`):**

```sql
CREATE OR REPLACE FUNCTION create_org_account_profile(
    p_id UUID,
    p_email TEXT,
    p_full_name TEXT,
    p_org_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO users (
        id, email, full_name, role, is_org_account, linked_org_id,
        is_verified, is_admin
    ) VALUES (
        p_id, p_email, p_full_name, 'staff',
        true, p_org_id,
        true, false
    );
END;
$$;
```

---

### Step 7 — Super-admin portal addition

**File:** `app/(dashboard)/admin/page.tsx`

Add a 4th tab button:
```tsx
<button onClick={() => setActiveTab('org-accounts')} ...>
    Org Accounts
</button>
```

Add the tab state type:
```ts
const [activeTab, setActiveTab] = useState<'users' | 'organizations' | 'settings' | 'mess-menu' | 'org-accounts'>('users');
```

Add the tab content:
```tsx
{activeTab === 'org-accounts' && <AdminOrgAccounts />}
```

**File (NEW):** `components/features/admin/AdminOrgAccounts.tsx`

This component:
1. On mount, fetches from `GET /api/admin/org-accounts` — displays a table: Org Name | Email | Created At.
2. Has a "Create Org Account" button that opens a dialog:
   - Select org from dropdown (fetches all orgs, shows name + type)
   - Enter official email
   - Enter display name (e.g. "BOST Official")
   - Enter password (min 12 chars recommended)
   - Submit → `POST /api/admin/org-accounts`
3. Shows success/error state.
4. Has a "Reset Password" action on each row (calls `adminDb.auth.admin.updateUserById` — or add another API route for it).

---

### Step 8 — The `/org-admin` Page

This is the main deliverable. One template that works for any org account.

**File (NEW):** `app/(dashboard)/org-admin/page.tsx`

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { OrgAdminStructure } from '@/components/features/org-admin/OrgAdminStructure';
import { OrgAdminRoster } from '@/components/features/org-admin/OrgAdminRoster';
import { OrgAdminCsvTools } from '@/components/features/org-admin/OrgAdminCsvTools';
import { OrgAdminCompose } from '@/components/features/org-admin/OrgAdminCompose';

type OrgAdminTab = 'post' | 'structure' | 'roster' | 'csv';

export default function OrgAdminPage() {
    const { user, isOrgAccount, linkedOrg, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<OrgAdminTab>('post');

    useEffect(() => {
        if (!loading && (!user || !isOrgAccount)) {
            router.replace('/');
        }
    }, [user, isOrgAccount, loading, router]);

    if (loading || !linkedOrg) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <header>
                <div className="flex items-center gap-3 text-primary mb-2">
                    <Building2 className="h-6 w-6" />
                    <span className="font-medium tracking-wider uppercase text-sm">
                        {linkedOrg.type.replace('_', ' ')}
                    </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight font-serif">
                    {linkedOrg.name}
                </h1>
                <p className="text-muted-foreground text-lg mt-2">
                    Organization admin portal
                </p>
            </header>

            {/* Tab Bar */}
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl w-max">
                {[
                    { id: 'post', label: 'Post as Org' },
                    { id: 'structure', label: 'Our Structure' },
                    { id: 'roster', label: 'Members & PORs' },
                    { id: 'csv', label: 'CSV Tools' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as OrgAdminTab)}
                        className={`shrink-0 text-sm font-medium px-6 py-2.5 rounded-lg transition-all ${
                            activeTab === tab.id
                                ? 'bg-white text-primary shadow-sm dark:bg-zinc-800'
                                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="pt-2">
                {activeTab === 'post'      && <OrgAdminCompose   org={linkedOrg} />}
                {activeTab === 'structure' && <OrgAdminStructure org={linkedOrg} />}
                {activeTab === 'roster'    && <OrgAdminRoster    org={linkedOrg} />}
                {activeTab === 'csv'       && <OrgAdminCsvTools  org={linkedOrg} />}
            </div>
        </div>
    );
}
```

---

### Step 9 — Org Admin Components

All four components live in `components/features/org-admin/`.

---

#### `OrgAdminCompose.tsx`

Compose panel for posting as the org.

**What it does:**
- A text area for feed post content
- Media upload (optional)
- Submit → inserts into `feed_posts` with:
  - `author_id = user.id` (the org account's UUID)
  - `acting_as_org_id = org.id`
  - `posting_identity_id = null`
- Below the form: a list of recent posts where `acting_as_org_id = org.id`

**Note:** For Events and Notices, just show quick-link buttons to the existing event creation and notice creation pages — those pages already exist and work. The org account can use them normally; the `acting_as_org_id` gets set because `author_id` is the org account.  
_(Or, pass `actingAsOrgId` as a query param and pre-fill it on those pages — decide when implementing.)_

---

#### `OrgAdminStructure.tsx`

Scoped org structure manager.

**Props:** `{ org: Organization }`

**What it fetches:**
```ts
// All orgs in scope = the org itself + its direct children
const allOrgs = await getOrganizations(); // already exists
const inScope = allOrgs.filter(o => o.id === org.id || o.parentId === org.id);
```

**What it shows:**
- The org itself (editable: name, description, logo, social links)
- A list of its direct child orgs, each with an edit button
- A "New Child Org" button → form identical to AdminOrgManagement's create form BUT:
  - `parent_id` is locked to `org.id` (not user-selectable)
  - `type` options filtered to reasonable child types (club, society, fest_committee)

**What it blocks:**
- No option to change `parent_id` of any org
- No option to create top-level orgs
- Cannot see or touch orgs outside `inScope`

**Reuse:** The org create/edit dialogs are nearly identical to those in `AdminOrgManagement.tsx`. Share the form UI through a sub-component `OrgFormDialog.tsx` used by both.

---

#### `OrgAdminRoster.tsx`

Member and POR management, scoped to org + children.

**Props:** `{ org: Organization }`

**What it does:**
1. Fetches children: `allOrgs.filter(o => o.parentId === org.id)`
2. Renders a dropdown: `[Own Org Name | Child 1 | Child 2 | ...]`
3. The selected dropdown value controls which `orgId` is passed to `AdminOrgRoster`

```tsx
// Reuse AdminOrgRoster exactly as-is
<AdminOrgRoster orgId={selectedOrgId} orgName={selectedOrgName} />
```

That's the entire implementation. `AdminOrgRoster` already handles everything — the scoping here is just which IDs are selectable in the dropdown.

---

#### `OrgAdminCsvTools.tsx`

CSV import/export scoped to the org's subtree.

**Props:** `{ org: Organization }`

**What it does:**

First, compute the allowed scope:
```ts
const allOrgs = await getOrganizations();
const scopeOrgs = allOrgs.filter(o => o.id === org.id || o.parentId === org.id);
const scopeSlugs = new Set(scopeOrgs.map(o => o.slug));
const scopeIds = scopeOrgs.map(o => o.id);
```

**Members tab:**
- Download: calls `getAllOrgMembers(scopeIds)` → generates CSV filtered to scope. Uses same columns as super-admin (`entry_number, org_slug, status`).
- Upload: parses CSV, validates that every `org_slug` in the file is in `scopeSlugs`. Rejects rows outside scope with a clear error message before even attempting upsert.
- Then calls `bulkUpsertMembers(validRows)` — same function as super-admin.

**PORs tab:**
- Same pattern: download scoped PORs, upload validates org_slug in scope.
- Uses `getAllOrgPositions(scopeIds)` and `bulkUpsertPORs(validRows)`.

**Orgs tab:**
- Download: exports only the orgs in scope (the org itself + children).
- Upload: validates `parent_id` in each row must be `org.id` (only allow creating children, not arbitrary orgs). Rejects anything else.

The CSV parsing/download/escape logic is imported from `lib/csv-utils.ts` (Step 5).

---

### Step 10 — Content Attribution Display

Posts made by org accounts have `acting_as_org_id` set. Display needs to reflect this.

**Where to change:** Wherever the post author chip/line is rendered. Likely in:
- Feed card author section
- Notice card byline
- Event card organizer line

**Logic:**
```tsx
// Instead of always showing user.fullName:
{post.actingAsOrgId ? (
    <div className="flex items-center gap-2">
        <img src={org.logoUrl} className="h-5 w-5 rounded-full" />
        <span className="font-medium">{org.name}</span>
        <span className="text-muted-foreground text-xs">(Official)</span>
    </div>
) : (
    // existing author display — unchanged
    <AuthorChip user={post.author} identity={post.postingIdentity} />
)}
```

For this to work, the content queries need to join `acting_as_org_id` → org name/logo. Add to the relevant select queries in `lib/db/`:
```ts
acting_as_org:organizations!feed_posts_acting_as_org_id_fkey(id, name, slug, logo_url)
```

---

## Navigation

Add "Org Admin" to the sidebar/navbar — visible only when `isOrgAccount === true`:

```tsx
{isOrgAccount && (
    <NavLink href="/org-admin">
        <Building2 className="h-5 w-5" />
        Org Admin
    </NavLink>
)}
```

The main dashboard `is_admin` check already hides the `/admin` link for non-admins. Org accounts are not `is_admin`, so they naturally won't see the super-admin portal.

---

## Files to Create/Modify — Complete Checklist

```
NEW FILES:
□ db/migrations/038_org_accounts.sql
□ db/migrations/039_org_account_rpc.sql          (or merge into 038)
□ lib/csv-utils.ts
□ app/api/admin/org-accounts/route.ts
□ app/(dashboard)/org-admin/page.tsx
□ components/features/admin/AdminOrgAccounts.tsx
□ components/features/org-admin/OrgAdminCompose.tsx
□ components/features/org-admin/OrgAdminStructure.tsx
□ components/features/org-admin/OrgAdminRoster.tsx
□ components/features/org-admin/OrgAdminCsvTools.tsx

MODIFIED FILES:
□ lib/types.ts                          — add isOrgAccount, linkedOrgId to User; add actingAsOrgId to content types
□ lib/db/users.ts                       — select + map is_org_account, linked_org_id
□ lib/db/organizations.ts              — add getOrganizationById; add scopeOrgIds param to getAllOrgMembers/getAllOrgPositions
□ contexts/AuthContext.tsx             — detect org account, load linkedOrg, expose isOrgAccount + linkedOrg
□ app/(dashboard)/admin/page.tsx       — add "Org Accounts" tab
□ components/features/admin/AdminOrgManagement.tsx — import parseCSV/triggerDownload/escape from lib/csv-utils.ts
□ Feed card / Notice card / Event card  — show org name/logo when actingAsOrgId is set
□ Sidebar/navbar component             — show "Org Admin" link when isOrgAccount is true
```

---

## Execution Order (safe, each step builds on the last)

1. **`038_org_accounts.sql`** — Run migration. Additive only. No breakage.
2. **`lib/types.ts`** — Add new fields. Additive. No breakage.
3. **`lib/db/users.ts`** — Map new fields. No API change.
4. **`lib/db/organizations.ts`** — Add `getOrganizationById` + scope param. Backwards-compatible.
5. **`lib/csv-utils.ts`** — Extract CSV helpers. Pure refactor, no behaviour change.
6. **`AdminOrgManagement.tsx`** — Update imports. No behaviour change.
7. **`contexts/AuthContext.tsx`** — Org account detection + routing guard.
8. **`/api/admin/org-accounts/route.ts`** + RPC — Enables creating org accounts.
9. **`AdminOrgAccounts.tsx`** + `/admin` tab — Super-admin can now create org accounts.
10. **`/org-admin/page.tsx`** + all 4 org-admin components — The org portal is live.
11. **Content attribution** — Feed/notice/event cards now show org name when applicable.
12. **Navbar** — Org admin link appears for org accounts.

Steps 1–6: invisible to all users.  
Step 7: org accounts get routed correctly (but nothing to show yet).  
Steps 8–9: super-admin can create org accounts.  
Steps 10–12: the org-account experience is fully functional.

---

## Testing Checklist

### Create an org account (manual)
1. Log in as super-admin → `/admin` → "Org Accounts" tab
2. Create org account: select "BOST", enter `bost@test.com`, password
3. Verify row appears in the org accounts list

### Org account login
1. Log in as `bost@test.com`
2. Verify: redirected to `/org-admin`
3. Verify: page header shows "Board of Science and Technology"
4. Verify: no link to `/admin` in navbar
5. Verify: "Org Admin" link IS visible

### Post as org
1. Go to "Post as Org" tab
2. Write and submit a feed post
3. Verify: post appears in the main feed
4. Verify: author shown as "BOST (Official)" with org logo
5. Verify: `acting_as_org_id` is set in the DB row

### Scoped structure management
1. Go to "Our Structure" tab
2. Verify: only BOST and direct children are shown
3. Create a new child club — verify it is created with `parent_id = BOST.id`
4. Attempt to edit an org outside BOST's tree — verify it's not visible/accessible

### Scoped roster management
1. Go to "Members & PORs" tab
2. Org dropdown shows: BOST | [child clubs]
3. Select BOST → add a member → verify in DB
4. Assign POR → verify `user_positions` row created
5. Revoke POR → verify `is_active = false`

### Scoped CSV
1. Go to "CSV Tools" tab
2. Download members CSV — verify only BOST + children members appear
3. Upload a members CSV with an org_slug OUTSIDE scope → verify it's rejected with an error
4. Upload a valid scoped members CSV → verify members are added

### Human users unaffected
1. Log in as a regular student
2. Verify: no "Org Admin" link
3. Verify: existing POR posting identity still works in feed composer
4. Verify: `/org-admin` redirects away

---

## Common Pitfalls to Avoid

**1. Don't create a new role system.**  
`org_members` stays as-is (just `pending/approved/removed` status). `user_positions` stays as-is (`por_type` enum unchanged). The org account's power comes from `is_org_account + linked_org_id` — not from any member role.

**2. Don't change `AdminOrgRoster.tsx`.**  
It already works generically. Just control which `orgId` the org-admin can select.

**3. Scope enforcement is in the UI layer + API layer — not RLS.**  
RLS would require cross-table queries which break the "no RLS cross-table" rule in this codebase. The org-admin UI only shows/sends allowed org IDs. The API route for org account creation is guarded by `caller.isAdmin`. The CSV upload validates org slugs against the allowed scope before calling `upsertMemberByEntry`.

**4. `batch/branch/department` are already nullable in the schema.**  
No schema change needed for those fields. Just pass `null` when creating org account profiles.

**5. Don't show "BOST · via Rahul Kumar (Secretary)" style attribution.**  
That feature was explicitly decided against. POR holders post as themselves with their POR identity. Only the org account posts as the org. These are two separate, clean flows.

**6. The org account uses `role = 'staff'` in the DB.**  
This is just to satisfy the NOT NULL constraint on `role`. The `is_org_account = true` field is what identifies it, not the `role` column value.
