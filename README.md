# IIT Ropar Community Platform (dep-anti)

<div style="text-align: center;">
  
**A unified, web-based Progressive Web Application for the IIT Ropar campus community**

[Live Demo](#deployment) • [Documentation](#documentation) • [Getting Started](#getting-started) • [Architecture](#architecture)

</div>

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Key Features](#key-features---15-core-modules)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Development Guidelines](#development-guidelines)
8. [Database Schema](#database-schema)
9. [Deployment](#deployment)
10. [Contributing](#contributing)
11. [Support & Documentation](#support--documentation)

---

## Project Overview

### What Is It?

The **IIT Ropar Community Platform** is a unified digital hub exclusively designed for the IIT Ropar community. It serves students, faculty, staff, alumni, and guests as a **single source of truth** for campus information, connection, and engagement.

### Problem Solved

IIT Ropar's community information is fragmented across:
- WhatsApp groups
- Departmental emails  
- Physical notice boards
- Separate portals (placements, hostel, library, etc.)
- Word-of-mouth communication

This creates friction for:
- **New students & faculty**: Difficult orientation and onboarding
- **Alumni**: Lack of maintained digital connection  
- **Club management**: Offline processes with no digital trail
- **Campus-wide communication**: Scattered, redundant announcements

### Core Goals

✅ **Campus Connectivity** — Connect all community members in unified spaces  
✅ **Information Hub** — Centralize announcements, events, clubs, notices  
✅ **Governance Digitization** — Manage Students' Gymkhana structure, PORs, memberships  
✅ **Commerce & Utility** — Peer-to-peer marketplace, lost-and-found services  
✅ **3D Campus Navigation** — Interactive explorable campus model  
✅ **Posting Identity** — Post under chosen role (e.g., as Club Secretary vs. Student)  
✅ **Knowledge Sharing** — Placements, internships, alumni journeys, faculty insights

---

## Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend Framework** | Next.js 16 (App Router) | File-based routing, server components, Vercel-native |
| **Language** | TypeScript 5 (strict) | Catch bugs at compile time, self-documenting code |
| **React Version** | React 19 | Latest hooks, server components, concurrent rendering |
| **Database/Auth/Storage** | Supabase (PostgreSQL) | One service for everything backend, easy to start, scalable |
| **Styling** | Tailwind CSS v4 + CSS Variables | Utility-first, consistent design system, dark/light themes |
| **Icons** | Lucide React | Tree-shakeable, consistent stroke-width, MIT license |
| **Date Handling** | date-fns | Lightweight, tree-shakeable, no timezone surprises |
| **3D Rendering** | Three.js (CDN) | Self-contained, served via iframe from `public/3d-campus/` |
| **Data Fetching** | SWR (Phase 2) | Client-side cache, background revalidation, minimal config |
| **PWA** | next-pwa | Offline support, service worker, installable on mobile |
| **Middleware** | Next.js Middleware | Route protection, session validation, global auth guard |

### Design Philosophy

> **Start simple, stay additive. The architecture is designed to grow. Phase 1 gets things working. Phase 2 makes them fast. Phase 3 makes them scale.**

Three non-negotiable rules:
1. **Start simple, stay additive** — Build foundations, add complexity only when needed
2. **The next developer is the user** — Code quality = developer experience
3. **No premature optimization** — Don't cache/abstract what doesn't exist yet

---

## Key Features — 15 Core Modules

### 1. **Authentication** 🔐
- Email + password via Supabase Auth
- Server-side cookie session management (SSR-safe)
- Role-based signup fields (student/faculty/alumni/staff/guest)
- RPC-based profile creation to avoid RLS blockers
- **Route**: `/login`, `/signup`, `/reset-password`, `/forgot-password`

### 2. **Activity Feed (Dashboard Home)** 📱
- Real-time activity stream blending posts, events, blogs, notices
- Latest 20 items sorted by creation time
- Each post shows source type (blog, event, notice, post), author, **posting identity badge**
- Quick action buttons (Write Blog, Sell Item, View Events, Join Communities)
- **Route**: `/` (Dashboard Landing)

### 3. **Blogs** 📝
- Knowledge sharing hub: placement interviews, internship reports, faculty insights, alumni stories, research, general campus life
- 6 categories: `placement`, `internship`, `faculty_insight`, `alumni_experience`, `research`, `general`
- Search & category filtering, featured badge, read statistics
- Guest posts under chosen **posting identity** (personal or official club role)
- **Routes**: `/blogs`, `/blogs/create`, `/blogs/[slug]`

### 4. **Campus Marketplace** 🛒
- Peer-to-peer commerce: buy, sell, trade campus items
- Popular items: bicycles, textbooks, furniture, electronics, clothing, sports gear
- 8 categories + 5 condition levels (new to poor)
- Negotiation flag, seller contact, location/delivery options
- Most active during semester-end and fresher welcome period (July-August)
- **Routes**: `/marketplace`, `/marketplace/create`, `/marketplace/[id]`

### 5. **Events** 🎯
- Unified campus event aggregator
- 12+ event types: ISMP, workshops, seminars, competitions, cultural, sports, e-sports, literary, club activities, fests, general
- Targeting system: `target_roles[]`, `target_departments[]`, `target_batches[]`
- Registration management, attendance tracking
- Annual fests: Advitiya (Tech), Zeitgeist (Cultural), Aarohan (Sports), Revanche (E-sports), Malhar (Literary)
- **Routes**: `/events`, `/events/create`, `/events/[slug]`

### 6. **Communities** 👥
- Interest-based student groups (competitive programming, research labs, hobby clubs, etc.)
- Public or private with optional approval flow
- Inner feed for community-specific discussions
- Member management
- **Routes**: `/communities`, `/communities/[slug]`, `/communities/[slug]/feed`

### 7. **Lost & Found** 🔍
- Report missing or found items on campus
- 8 categories: Electronics, Documents, Accessories, Clothing, Keys, Wallet, Bottle, Other
- Status lifecycle: `lost` → `found` → `claimed` → `returned`
- Location tagging, date tagging, contact information
- Most common: water bottles, ID cards, laptop chargers, hostel keys, earphones
- **Routes**: `/lost-found`, `/lost-found/report`, `/lost-found/[id]`

### 8. **Direct Messages** 💬
- Private one-on-one peer messaging
- Use cases: buyer ↔ seller, mentee ↔ mentor, general contact
- Two-panel layout: conversation list + active chat
- Message bubbles: sent (right, gold tint) / received (left, subtle)
- Real-time via Supabase Realtime subscription (Phase 2)
- **Route**: `/messages`

### 9. **Notices** 📢
- Official institute communications by faculty, staff, governance members
- 7 categories: Academic, Administrative, Placement, Hostel, Sports, Wellness, General
- Priority levels: urgent (red), high (gold), medium (blue), low (green)
- Pinned notices always at top
- Expiration dates (`valid_until`), targeting by role/department/batch
- Attachment support (PDFs, documents)
- Posted under **posting identity** (official role or personal)
- **Routes**: `/notices`, `/notices/[id]`

### 10. **Clubs & Bodies** 🏆
- Comprehensive directory of all 100+ registered organizations
- Hierarchical structure: Students' Gymkhana → 6 Boards → 80+ Clubs + Independent Societies
- **6 Governance Boards**: BOST (Tech), BOCA (Culture), BOLA (Literary), BOSA (Sports), BOHA (Hostel), BOAA (Academic)
- Organization details: logo, description, member count, contact, social links
- Member rosters with **POR** (Position of Responsibility) titles
- Events hosted by club, posts authored by club
- "Request to Join" with admin approval flow
- **Routes**: `/clubs`, `/clubs/[slug]`

### 11. **Campus Map — 2D/3D Mode** 🗺️
- **Two viewing modes**: toggle between 2D and 3D
  - **2D Mode** (Default): Leaflet.js/Mapbox blueprint-style map with searchable location markers
  - **3D Mode**: Fully explorable 3D campus model via Three.js (served from `/public/3d-campus/`)
- Shared DB-driven UI overlay: search, category filters, location detail panel
- 50+ seeded locations: Nalanda Library, SAC, Hostels, Medical Centre, Food Court, Sports Complex, Lecture Theatres, etc.
- Location metadata: facilities, opening hours, accessibility, floor plans
- Use cases: fresher orientation, visitor directions, facility search
- **Route**: `/map`

### 12. **Quick Links** 🔗
- Curated directory of 30+ essential official portals
- 7 link categories: Academic (ERP, Moodle), Administrative (Fee, Hostel), Library, Placement, Wellness, Hostel, General
- Featured/starred links in gold-bordered section
- Click tracking and analytics
- **Route**: `/quick-links`

### 13. **Notifications** 🔔
- Personal notification centre tracking all interactions
- Types: comment, like, event, notice, marketplace, club, governance, general
- Unread count badge in header
- Mark as read, mark all as read
- Auto-generated via PostgreSQL DB triggers (Phase 2)
- **Route**: `/notifications`

### 14. **User Profile** 👤
- Personalized profile page (role-adaptive fields)
- **Student fields**: Name, Email, Phone, Department, Branch, Batch, Enrollment #, Bio, LinkedIn
- **Faculty/Staff fields**: Name, Email, Dept, Designation, Employee ID, Bio, LinkedIn
- **Alumni fields**: Name, Dept, Batch, Current Organization, Current Position, LinkedIn
- **POR Display**: Primary role badge + all active POR badges (e.g., "Secretary, Coding Club · Coordinator, Advitiya")
- Past positions in dedicated section
- **Posting Identity Selector**: Dropdown on every content creation form
- **Route**: `/profile`, `/profile/[username]`

### 15. **Admin & Governance Portal** ⚙️
- **Who can access**: Platform admins, Board General Secretaries, Club Secretaries, Faculty Advisors
- **Features**:
  - **Organization Management**: Create/edit/archive boards, clubs, societies, fest committees (zero-code structural changes via data)
  - **Membership Management**: Add/remove students, approve memberships, `pending` → `approved` → `removed` status flow
  - **POR Assignment**: Assign positions with `valid_from` / `valid_until` dates, auto-expiry on date pass
  - **Content Authority Rules**: Only users with active POR can post on behalf of club/board
  - **Content Moderation**: Flag, hide, delete inappropriate content across all modules
  - **User Management**: Suspend, archive, or reactivate users
- **Extensibility**: Adding new clubs/boards requires no code changes — only data entries
- **Routes**: `/admin`, `/org-admin`

---

## Architecture

### 4-Layer Module Architecture

Every feature strictly follows this decoupled structure:

```
┌─────────────────────────────────────────────────────────────┐
│  Route Page Layer (src/app/(dashboard)/xyz/page.tsx)        │
│  └─ Thin shell (target: <25 lines), renders PageContainer   │
│     and Feature Component                                    │
├─────────────────────────────────────────────────────────────┤
│  Feature Component Layer (src/components/features/xyz/)     │
│  └─ Complex UI combining dumb components + hook data        │
│     e.g., BlogList, BlogCard, BlogForm, EventCard, etc.     │
├─────────────────────────────────────────────────────────────┤
│  Custom Hook Layer (src/lib/hooks/useXyz.ts)                │
│  └─ Manages React state (loading, error, data)              │
│     Calls DB query function                                 │
├─────────────────────────────────────────────────────────────┤
│  Database Query Layer (src/lib/db/xyz.ts)                   │
│  └─ Only place Supabase is imported                         │
│     Explicit column selection, error handling,              │
│     Snake_case → camelCase mapping                          │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

```
Browser Request
  │
  ▼
Next.js Middleware (src/middleware.ts)
  ├─ Reads Supabase session from cookies
  ├─ Unauthenticated + Protected Path → redirect /login
  └─ Authenticated + Auth Page → redirect /
  │
  ▼
Route Groups
  ├─ (auth)/login, /signup, /reset-password, /forgot-password
  └─ (dashboard)/ — all protected pages
  │
  ▼
DashboardLayout (components/layout/MainLayout.tsx)
  ├─ Header (search, notifications, profile, theme toggle)
  ├─ Sidebar (navigation)
  ├─ Main Content
  └─ BottomNav (mobile)
  │
  ▼
Individual Page Components
  └─ useAuth() for user identity + active PORs
  └─ DB queries via src/lib/db/ abstraction layer
```

### Authentication & Session Management

- **Supabase Auth**: Email + password authentication
- **Cookie-Based Sessions (SSR-Safe)**: 
  - Session token stored in `sb-auth-token` cookie (server-side, HttpOnly)
  - Browser client also maintains session in `localStorage` (for client-side auth context)
  - Synced via dedicated SSR routes: `/api/auth/set-cookie`, `/api/auth/clear-cookie`
- **Route Protection**: `middleware.ts` intercepts all requests
- **Database Security**: Row Level Security (RLS) enforced on all tables
- **Profile Creation**: Uses RPC (`create_user_profile`) to bypass RLS insert blockers on signup

### Posting Identity System

When creating **any content** (posts, blogs, events, notices), the author chooses a **posting identity**:

```
User with NO PORs
  └─ Can only post as "Student" (base role)

User with PORs (e.g., Secretary of Coding Club + Coordinator of Advitiya)
  ├─ Can post as "Student" (personal opinion)
  ├─ Can post as "Secretary, Coding Club" (official club capacity)
  └─ Can post as "Coordinator, Advitiya" (official event capacity)

Faculty member + Faculty Advisor of Board
  ├─ Can post as "Faculty" (personal opinion)
  └─ Can post as "Faculty Advisor, BOST" (official board capacity)
```

**Implementation**:
- Every content form includes "Post as" dropdown populated from active PORs + base role
- Selected identity stored as `posting_identity_id` (FK to `user_positions`, or `null` for base role)
- Display: author card shows chosen title and organization badge

### Navigation Hierarchy

```
IIT Ropar Community Platform
├─ Students' Gymkhana (governance_body)
│  ├─ BOST (Board of Science & Technology)
│  │  ├─ Aeromodelling Club
│  │  ├─ Coding Club
│  │  ├─ Robotics Club
│  │  ├─ Esportz
│  │  └─ ... (11 clubs)
│  ├─ BOCA (Board of Cultural Activities)
│  │  ├─ Dance Club
│  │  ├─ Dramatics Club
│  │  ├─ Music Club (Alankar)
│  │  └─ ... (8 clubs)
│  ├─ BOLA (Board of Literary Activities) — 7 clubs
│  ├─ BOSA (Board of Sports Affairs) — 12 clubs
│  ├─ BOHA (Board of Hostel Affairs)
│  └─ BOAA (Board of Academic Affairs)
└─ Independent Societies
   ├─ E-Cell, ENACTUS, BloodConnect, NSS, Women's Forum, etc.
   └─ ISMP Body
```

---

## Project Structure

```
CP301/
├── db/                                  ← All database SQL
│   ├── migrations/                      ← Schema changes (numbered SQL files)
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_indexes.sql
│   │   └── 003_add_rls_policies.sql
│   ├── seeds/                           ← Initial data (locations, clubs, quick links)
│   │   ├── 01_locations.sql
│   │   ├── 02_organizations.sql
│   │   └── dev_test_users.sql          ← LOCAL ONLY
│   └── README.md                        ← How to run migrations
│
├── src/
│   ├── app/                             ← Next.js routing (thin page shells)
│   │   ├── (auth)/                      ← Authentication route group
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (dashboard)/                 ← Protected route group
│   │   │   ├── layout.tsx               ← DashboardLayout with Sidebar, Header
│   │   │   ├── page.tsx                 ← Activity Feed (home)
│   │   │   ├── blogs/
│   │   │   │   ├── page.tsx             ← Blog listing
│   │   │   │   ├── create/page.tsx      ← Create blog form
│   │   │   │   └── [slug]/page.tsx      ← Blog detail
│   │   │   ├── events/
│   │   │   ├── marketplace/
│   │   │   ├── communities/
│   │   │   ├── lost-found/
│   │   │   ├── messages/
│   │   │   ├── notices/
│   │   │   ├── clubs/
│   │   │   ├── map/
│   │   │   ├── quick-links/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   ├── admin/                   ← Admin portal
│   │   │   └── org-admin/               ← Organization admin portal
│   │   ├── api/                         ← API routes
│   │   │   ├── auth/                    ← Auth endpoints (signin, signup, logout)
│   │   │   ├── profile/                 ← Profile endpoints
│   │   │   ├── admin/                   ← Admin endpoints
│   │   │   └── media/                   ← File upload endpoints
│   │   ├── offline/                     ← Offline fallback page
│   │   └── globals.css                  ← Global styles + Tailwind directives
│   │
│   ├── components/                      ← React components
│   │   ├── ui/                          ← Generic reusable primitives (no domain knowledge)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── empty.tsx
│   │   │   ├── input.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── filter-pills.tsx
│   │   │   └── ... (30+ UI components)
│   │   ├── layout/                      ← App chrome layouts
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Header.tsx               ← Top navigation
│   │   │   ├── Sidebar.tsx              ← Left navigation
│   │   │   ├── BottomNav.tsx            ← Mobile bottom tabs
│   │   │   └── PageContainer.tsx        ← Page wrapper
│   │   ├── features/                    ← Domain-specific feature components
│   │   │   ├── blogs/
│   │   │   │   ├── BlogList.tsx
│   │   │   │   ├── BlogCard.tsx
│   │   │   │   ├── BlogDetail.tsx
│   │   │   │   └── BlogForm.tsx
│   │   │   ├── events/
│   │   │   │   ├── EventList.tsx
│   │   │   │   ├── EventCard.tsx
│   │   │   │   └── EventForm.tsx
│   │   │   ├── marketplace/
│   │   │   ├── communities/
│   │   │   ├── admin/
│   │   │   └── ... (one folder per feature)
│   │   ├── providers/                   ← Context providers
│   │   │   └── SWRProvider.tsx
│   │   ├── ServiceWorkerRegistration.tsx ← PWA service worker setup
│   │   └── theme-provider.tsx           ← Dark/light theme provider
│   │
│   ├── contexts/                        ← React Context
│   │   └── AuthContext.tsx              ← Global auth state + user identity
│   │
│   ├── lib/
│   │   ├── db/                          ← DATABASE LAYER (only place Supabase is imported)
│   │   │   ├── client.ts                ← Supabase client initialization
│   │   │   ├── blogs.ts                 ← Blog queries
│   │   │   ├── events.ts                ← Event queries
│   │   │   ├── marketplace.ts
│   │   │   ├── users.ts
│   │   │   ├── notices.ts
│   │   │   ├── communities.ts
│   │   │   ├── lost-found.ts
│   │   │   ├── messages.ts
│   │   │   ├── clubs.ts                 ← Organization queries
│   │   │   ├── locations.ts
│   │   │   ├── notifications.ts
│   │   │   ├── quick-links.ts
│   │   │   └── index.ts                 ← Re-exports all DB functions
│   │   ├── hooks/                       ← Custom hooks (data fetching + state)
│   │   │   ├── useBlogs.ts
│   │   │   ├── useEvents.ts
│   │   │   ├── useMarketplace.ts
│   │   │   └── ...
│   │   ├── types.ts                     ← All TypeScript interfaces (200+ lines)
│   │   ├── utils.ts                     ← Pure utility functions
│   │   ├── constants.ts                 ← App constants (role lists, categories, etc.)
│   │   └── csv-utils.ts                 ← CSV import/export helpers
│   │
│   └── middleware.ts                    ← Next.js auth middleware

├── public/                              ← Static assets
│   ├── sw.js                            ← Service worker (next-pwa generates this)
│   ├── manifest.json                    ← PWA manifest
│   ├── theme-init.js                    ← Anti-FOUC dark theme setup
│   ├── 3d-campus/                       ← Three.js 3D model files
│   │   ├── index.html                   ← 3D viewer (served in iframe)
│   │   ├── model.gltf                   ← 3D model data
│   │   └── textures/
│   └── icons/                           ← App icons for PWA
│
├── styles/
│   └── globals.css                      ← Global CSS + Tailwind directives
│
├── documentation/                       ← Project documentation
│   ├── PROJECT_GUIDE.md                 ← Master developer guide
│   ├── CURSOR_PAGINATION_MIGRATION.md
│   ├── MEDIA_UPLOADS.md
│   ├── SCALABILITY_AND_MAINTAINABILITY.md
│   └── UI_PROBLEMS_SUMMARY.md
│
├── scratch/                             ← Development utilities (not deployed)
│   ├── check_blogs_v2.ts
│   └── check_schema.ts
│
├── package.json                         ← Dependencies, scripts, metadata
├── pnpm-lock.yaml                       ← Locked dependency versions
├── tailwind.config.mjs                  ← Tailwind CSS configuration
├── tsconfig.json                        ← TypeScript configuration
├── next.config.mjs                      ← Next.js configuration (PWA setup)
├── postcss.config.mjs                   ← PostCSS configuration
├── .env.example                         ← Environment variable template
└── README.md                            ← This file
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommended 20+)
- **pnpm** 9+ (or npm/yarn)
- **Supabase Account** (or local Supabase instance)
- **Git**

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-repo/CP301.git
cd CP301
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **Run Supabase migrations (if using local Supabase):**
```bash
# First, ensure your Supabase instance is running
# Then run all migrations in order
pnpm exec supabase migration up
```

5. **Seed initial data (optional, for development):**
```bash
# Run seed scripts to populate locations, organizations, clubs,etc.
pnpm exec supabase seed run
```

### Development

```bash
# Start dev server with Turbopack (fast)
pnpm run dev

# Or use Webpack (if there are issues)
pnpm run dev:webpack

# Open http://localhost:3000
```

**Development notes:**
- Hot Module Reloading enabled
- Middleware runs server-side (auth checks, redirects)
- TypeScript strict mode catches errors early
- Tailwind CSS utilities available in all components

### Build & Production

```bash
# Build for production (uses Webpack for PWA compatibility)
pnpm run build

# Start production server
pnpm run start

# Lint code
pnpm run lint
```

**PWA Features**:
- Installable on mobile/desktop
- Offline functionality (cached routes + API responses)
- Service worker for background sync (Phase 2)
- App manifest for home screen install

---

## Development Guidelines

### 1. The Only Supabase Import

**Rule**: Import `db` only from `src/lib/db/client.ts`. Never call `createClient()` in components.

```typescript
// src/lib/db/client.ts
import { createClient } from '@supabase/supabase-js'

export const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 2. Database Query Layer — Explicit Columns Always

```typescript
// src/lib/db/blogs.ts
import { db } from './client'
import type { BlogPost } from '@/lib/types'

export async function getPublishedBlogs(category?: string, limit = 20): Promise<BlogPost[]> {
  let query = db
    .from('blog_posts')
    .select(`
      id, title, slug, excerpt, featured_image_url,
      category, company_name, role_applied,
      view_count, like_count, published_at,
      author:users(id, full_name, role, profile_picture_url)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (category && category !== 'all') query = query.eq('category', category)

  const { data, error } = await query
  if (error) throw new Error(`[getPublishedBlogs] ${error.message}`)
  return (data ?? []) as BlogPost[]
}
```

**Golden Rules**:
- ❌ Never use `select('*')`  
- ✅ List columns explicitly
- ✅ Function name = verb + noun: `getPublishedBlogs`, `createBlog`
- ✅ Always throw named errors on failure
- ✅ Return strictly typed interfaces (`BlogPost[]`)

### 3. Custom Hooks — Separate Data from UI

```typescript
// src/lib/hooks/useBlogs.ts
import { useState, useEffect } from 'react'
import { getPublishedBlogs } from '@/lib/db'
import type { BlogPost } from '@/lib/types'

export function useBlogs(category?: string) {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await getPublishedBlogs(category)
        if (!cancelled) setBlogs(data)
      } catch (err) {
        if (!cancelled) setError('Could not load blogs. Try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }  // cleanup on unmount
  }, [category])

  return { blogs, loading, error }
}
```

### 4. Thin Page Shells (Target: <25 Lines)

```typescript
// src/app/(dashboard)/blogs/page.tsx
import { BlogList } from '@/components/features/blogs/BlogList'
import { PageContainer } from '@/components/layout/PageContainer'

export default function BlogsPage() {
  return (
    <PageContainer 
      title="📝 Blogs" 
      subtitle="IIT Ropar knowledge base"
    >
      <BlogList />
    </PageContainer>
  )
}
```

### 5. Feature Components — Bring Hooks & UI Together

```typescript
// src/components/features/blogs/BlogList.tsx
'use client'

import { useBlogs } from '@/lib/hooks/useBlogs'
import { BlogCard } from './BlogCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilterPills } from '@/components/ui/FilterPills'
import { useState } from 'react'

export function BlogList() {
  const [category, setCategory] = useState('all')
  const { blogs, loading, error } = useBlogs(category !== 'all' ? category : undefined)

  if (error) {
    return <EmptyState icon="⚠️" title="Error loading blogs" description={error} />
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} lines={3} />
        ))}
      </div>
    )
  }

  if (blogs.length === 0) {
    return <EmptyState icon="📝" title="No blogs yet" />
  }

  return (
    <div>
      <FilterPills
        options={['all', 'placement', 'internship', 'faculty_insight', 'alumni_experience', 'research', 'general']}
        active={category}
        onChange={setCategory}
        labels={{
          placement: '💼 Placement',
          internship: '🎓 Internship',
          faculty_insight: '🎓 Faculty',
          alumni_experience: '🎓 Alumni',
          research: '🔬 Research',
          general: '📰 General'
        }}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map(blog => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  )
}
```

### 6. Reusable UI Components with Tailwind

```typescript
// src/components/ui/Badge.tsx
type BadgeVariant = 'gold' | 'blue' | 'green' | 'red' | 'neutral'

const variants: Record<BadgeVariant, string> = {
  gold:    'bg-gold/15 text-gold border border-gold/25',
  blue:    'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  green:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  red:     'bg-red-500/15 text-red-400 border border-red-500/25',
  neutral: 'bg-white/5 text-white/50 border border-white/10',
}

export function Badge({ 
  label, 
  variant = 'neutral' 
}: { 
  label: string
  variant?: BadgeVariant 
}) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}
```

### 7. CSS & Tailwind Integration

**GlassSurface Pattern** (used for cards):
```tsx
className="rounded-xl p-5 bg-white/90 dark:bg-white/[0.04] backdrop-blur-md border border-black/8 dark:border-white/8 shadow-sm hover:shadow-md transition-shadow motion-safe:hover:scale-[1.005]"
```

**Tailwind Design Tokens**:
- `bg-base` — Page backgrounds
- `bg-surface` — Cards and panels
- `accent-gold` — CTA buttons, highlights (`#f59e0b`)
- `text-muted` — Secondary text
- Dark/light mode via Tailwind `dark:` class

---

## Database Schema

All database changes go through migrations in `db/migrations/`. Never modify schema via Supabase UI.

### Core Tables

#### `users`
Stores all platform members.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | Matches Supabase Auth user ID |
| `email` | text | Unique |
| `full_name` | text | |
| `role` | enum | `student`, `faculty`, `staff`, `alumni`, `guest` |
| `status` | enum | `active`, `inactive`, `suspended`, `archived` |
| `department` | text? | From official department list |
| `branch` | text? | B.Tech branch (students only) |
| `batch` | text? | Graduation year, e.g., "2025" |
| `enrollment_number` | text? | Students only |
| `employee_id` | text? | Faculty/staff only |
| `designation` | text? | Faculty/staff |
| `current_organization` | text? | Alumni |
| `current_position` | text? | Alumni |
| `phone_number` | text? | |
| `bio` | text? | |
| `linkedin_url` | text? | |
| `profile_picture_url` | text? | |
| `is_verified` | bool | Institutional email verification |
| `is_admin` | bool | Platform superuser flag |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `organizations`
Models the governance hierarchy: Gymkhana → Boards → Clubs → Committees.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `name` | text | E.g., "Coding Club", "BOST", "Students' Gymkhana" |
| `slug` | text UNIQUE | URL-safe identifier |
| `type` | enum | `governance_body`, `board`, `club`, `society`, `fest_committee` |
| `parent_id` | UUID? (FK) | Hierarchical parent (e.g., Coding Club → BOST) |
| `description` | text? | |
| `logo_url` | text? | Logo for club directory |
| `email` | text? | Official club email |
| `social_links` | JSONB? | `{instagram, website, linkedin}` |
| `is_active` | bool | Whether club is accepting members |
| `founded_year` | int? | |
| `member_count` | int | Cached count (updated via trigger) |
| `created_at` | timestamptz | |

#### `user_positions` (PORs)
Tracks Positions of Responsibility held by users.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK) | |
| `org_id` | UUID (FK) | Which org this POR belongs to |
| `title` | text | E.g., "Secretary", "Coordinator" |
| `por_type` | enum | `secretary`, `representative`, `mentor`, `coordinator`, `custom` |
| `valid_from` | date | When POR starts |
| `valid_until` | date? | When POR expires (null = indefinite) |
| `is_active` | bool | False once `valid_until` date passes |
| `created_at` | timestamptz | |

#### `blog_posts`
Knowledge sharing: placement, internship, faculty insights, alumni stories, research, general.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `author_id` | UUID (FK → users) | |
| `posting_identity_id` | UUID? (FK → user_positions) | Null = posted as base role |
| `title` | text | |
| `slug` | text UNIQUE | URL-safe identifier |
| `content` | text | Rich markdown content |
| `excerpt` | text? | Card preview |
| `featured_image_url` | text? | |
| `category` | enum | `placement`, `internship`, `faculty_insight`, `alumni_experience`, `research`, `general` |
| `tags` | text[]? | Searchable tags |
| `company_name` | text? | For placement blogs |
| `role_applied` | text? | E.g., "SDE", "PM" |
| `interview_round` | text? | E.g., "Round 1: Coding", "HR" |
| `status` | enum | `draft`, `published`, `archived` |
| `is_featured` | bool | Pinned at top |
| `view_count` | int | |
| `like_count` | int | |
| `comment_count` | int | |
| `published_at` | timestamptz? | When moved to published status |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `events`
Campus events: workshops, seminars, competitions, cultural, sports, e-sports, fests, etc.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `posted_by` | UUID (FK → users) | Event creator |
| `posting_identity_id` | UUID? (FK → user_positions) | Null = posted as base role |
| `title` | text | |
| `slug` | text UNIQUE | |
| `description` | text? | |
| `type` | enum | `ismp`, `workshop`, `seminar`, `competition`, `cultural`, `sports`, `esports`, `literary`, `club_activity`, `fest`, `general` |
| `start_time` | timestamptz | |
| `end_time` | timestamptz? | |
| `location_id` | UUID? (FK → locations)| Map location |
| `venue_name` | text? | Or free-form text |
| `poster_url` | text? | Event banner image |
| `requires_registration` | bool | |
| `max_attendees` | int? | Capacity limit |
| `target_roles` | text[]? | E.g., `['student', 'alumni']` |
| `target_departments` | text[]? | Targeted departments |
| `target_batches` | text[]? | E.g., `['2025', '2026']` |
| `registration_link` | text? | External form link |
| `meeting_link` | text? | Zoom/Google Meet URL |
| `interested_count` | int | |
| `is_published` | bool | |
| `created_at` | timestamptz | |

#### `marketplace_items`
Peer-to-peer buy/sell: books, electronics, furniture, cycles, etc.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `seller_id` | UUID (FK → users) | |
| `title` | text | E.g., "2nd-Hand Discrete Mathematics Textbook" |
| `description` | text? | |
| `category` | enum | `books`, `electronics`, `furniture`, `clothing`, `cycle`, `stationery`, `sports`, `other` |
| `price` | numeric | In ₹ (rupees) |
| `is_negotiable` | bool | |
| `condition` | enum | `new`, `like_new`, `good`, `fair`, `poor` |
| `status` | enum | `available`, `reserved`, `sold`, `cancelled` |
| `images` | text[] | Image URLs |
| `pickup_location` | text? | Building/hostel |
| `delivery_available` | bool | |
| `view_count` | int | |
| `expires_at` | timestamptz? | Auto-hide old listings |
| `created_at` | timestamptz | |

#### `communities`
Interest-based student groups (CP Society, research labs, hobby clubs, etc.).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `creator_id` | UUID (FK → users) | |
| `name` | text | E.g., "Competitive Programming" |
| `slug` | text UNIQUE | |
| `description` | text? | |
| `is_public` | bool | Public or private access |
| `requires_approval` | bool | Admin approval for new members |
| `member_count` | int | Cached |
| `post_count` | int | Cached |
| `created_at` | timestamptz | |

#### `notices`
Official announcements by faculty, staff, governance members.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `posted_by` | UUID (FK → users) | |
| `posting_identity_id` | UUID? (FK → user_positions) | |
| `title` | text | |
| `content` | text | Rich markdown |
| `category` | enum | `academic`, `administrative`, `placement`, `hostel`, `sports`, `wellness`, `general` |
| `priority` | enum | `urgent` (red), `high` (gold), `medium` (blue), `low` (green) |
| `target_roles` | text[]? | E.g., `['student', 'alumni']` |
| `target_departments` | text[]? | |
| `target_batches` | text[]? | |
| `tags` | text[]? | |
| `attachments` | JSONB[]? | PDF/document links |
| `is_active` | bool | |
| `is_pinned` | bool | Always at top if true |
| `valid_from` | timestamptz | When notice becomes visible |
| `valid_until` | timestamptz? | Auto-hide after this date |
| `created_at` | timestamptz | |

#### `locations`
Campus buildings, facilities, and landmarks.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `name` | text | E.g., "Nalanda Library", "SAC" |
| `code` | text? | Building identifier |
| `type` | enum | `academic`, `hostel`, `administrative`, `recreational`, `mess`, `medical`, `sports`, `other` |
| `latitude` | numeric? | GPS coordinate |
| `longitude` | numeric? | GPS coordinate |
| `floor_count` | int? | Number of floors |
| `has_indoor_map` | bool | |
| `facilities` | text[]? | E.g., `['wifi', 'projector', 'elevator']` |
| `is_accessible` | bool | Wheelchair accessible |
| `opening_time` | text? | E.g., "07:00" |
| `closing_time` | text? | E.g., "23:00" |
| `created_at` | timestamptz | |

#### `lost_found_items`
Missing or found item registry.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `reporter_id` | UUID (FK → users) | |
| `claimer_id` | UUID? (FK → users) | Who found/claimed it |
| `item_name` | text | E.g., "Blue HP Laptop" |
| `category` | enum | `electronics`, `documents`, `accessories`, `clothing`, `keys`, `wallet`, `bottle`, `other` |
| `status` | enum | `lost`, `found`, `claimed`, `returned` |
| `location_lost_found` | text | Where it was lost/found |
| `date_lost_found` | date | |
| `contact_info` | text? | Reporter phone/email |
| `images` | text[]? | Photo of item |
| `description` | text? | Detailed description |
| `created_at` | timestamptz | |

#### `messages` / `conversations`
Direct peer messaging.

**`conversations`**:
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `participant1_id` | UUID (FK → users) | |
| `participant2_id` | UUID (FK → users) | |
| `last_message` | text? | Preview |
| `last_message_at` | timestamptz? | |
| `created_at` | timestamptz | |

**`messages`**:
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `conversation_id` | UUID (FK) | |
| `sender_id` | UUID (FK → users) | |
| `receiver_id` | UUID (FK → users) | |
| `content` | text | |
| `is_read` | bool | |
| `read_at` | timestamptz? | |
| `created_at` | timestamptz | |

#### `notifications`
User notification centre.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK → users) | |
| `title` | text | |
| `message` | text | |
| `type` | enum | `comment`, `like`, `event`, `notice`, `marketplace`, `club`, `governance`, `general` |
| `entity_type` | text? | E.g., "blog_post", "event", "marketplace_item" |
| `entity_id` | UUID? | Link to the entity |
| `action_url` | text? | Where to navigate |
| `is_read` | bool | |
| `read_at` | timestamptz? | |
| `created_at` | timestamptz | |

#### `quick_links`
Curated directory of essential portals.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `created_by` | UUID? (FK → users) | Admin who created it |
| `title` | text | E.g., "ERP Portal" |
| `description` | text? | Brief description |
| `url` | text | Full URL |
| `category` | enum | `academic`, `administrative`, `library`, `placement`, `wellness`, `hostel`, `general` |
| `target_roles` | text[]? | Visibility filter |
| `display_order` | int | Sort order |
| `is_featured` | bool | Show in gold-bordered section |
| `click_count` | int | Usage analytics |
| `created_at` | timestamptz | |

### Row Level Security (RLS)

Every table has RLS enabled. Key policies:
- **`users`**: Users can see their own profile + public profiles of others
- **`blog_posts`**: Users can create their own; see published posts by others
- **`events`**: Users see events targeted to their role/department/batch
- **`notices`**: Users see notices targeted to them; admins see all
- **Sensitive data** (user emails, phone): Only data owner sees
- **Service role**: Never used in client-side code (security risk)

---

## Deployment

### Prerequisites

- A Supabase project (production)
- Vercel account (or other Next.js hosting)
- Environment variables configured

### Environment Variables

Create `.env.local` (development) and set variables in your hosting platform:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Optional: Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=<id>
```

### Deploy to Vercel

1. **Push code to GitHub:**
```bash
git push origin main
```

2. **Connect repo to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repo
   - Vercel auto-detects Next.js

3. **Set environment variables:**
   - In Vercel project settings → Environment Variables
   - Add all variables from `.env.local`

4. **Deploy:**
   - Vercel auto-deploys on every `main` push
   - First build takes ~2 min, then cached builds ~30s

### Database Migrations in Production

If you've created new migrations:

```bash
# Apply migrations to production Supabase
supabase migration up --project-id=<prod-project-id>

# Or manually run migrations via Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Paste migration file contents
# 3. Run
```

### PWA on Android/iOS

1. **Android**: Open site in Chrome → Menu → "Install app" → Installs to home screen
2. **iOS**: Open site in Safari → Share → "Add to Home Screen"
3. **Desktop**: Left-pane menu → "Install"

---

## Contributing

### Code Quality Standards

1. **TypeScript**: Strict mode. No `any` types.
2. **Naming**: Clear, descriptive names. `useBlogs()` not `useB()`.
3. **File Size**: Pages <25 lines. Components <100 lines (break into smaller components).
4. **Comments**: Only for "why", not "what" (code should be self-explanatory).
5. **Performance**: Pagination, lazy loading, no unnecessary re-renders.

### Branching & Commits

```bash
# Create feature branch
git checkout -b feature/add-blog-comments

# Commit with clear message
git commit -m "feat: add comment feature to blog posts"

# Push to remote
git push origin feature/add-blog-comments

# Create Pull Request on GitHub
```

### Testing

```bash
# (Phase 2 — not yet implemented)
pnpm run test
```

---

## Support & Documentation

### Key Documentation Files

- **[documentation/PROJECT_GUIDE.md](documentation/PROJECT_GUIDE.md)** — Master developer guide
- **[documentation/GROUND_TRUTH.md](documentation/GROUND_TRUTH.md)** — Architecture decisions & patterns
- **[SRS.md](SRS.md)** — Complete Software Requirements Specification
- **[GROUND_TRUTH.md](GROUND_TRUTH.md)** — Master ground truth for LLMs & agents

### Architecture Decisions

For architectural decisions (e.g., "Why Supabase?" "Why 4-layer structure?"), see [documentation/PROJECT_GUIDE.md](documentation/PROJECT_GUIDE.md).

### External Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Common Issues & Troubleshooting

**Q: "Cannot find Supabase client"**  
A: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`.

**Q: "Auth context undefined in component"**  
A: Ensure component is marked `'use client'` and inside `(dashboard)` route group.

**Q: "Dark mode not persisting"**  
A: Check `localStorage` is enabled and `theme-init.js` is in `<head>` before body renders.

**Q: "Migrations won't apply"**  
A: Check Supabase project is accessible and migration file is valid SQL.

---

## License

Private — IIT Ropar Community Platform. All rights reserved.

---

## Contact & Feedback

- **Project Lead**: [Contact info]
- **Tech Leads**: [Contact info]
- **Report Issues**: [GitHub Issues](#)
- **Feature Requests**: [GitHub Discussions](#)

---

**Last Updated:** March 2026  
**Version:** 2.0 (SRS Version 2.0)  
**Maintained By:** IIT Ropar Tech Team

