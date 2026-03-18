# DEP Campus Platform - V4 Implementation

**Status**: Foundation Phase Complete ✅
**Timeline**: Week 1 ✓ | Week 2-3 | Week 4-5 | Week 6-8

---

## What's Been Set Up

### ✅ Core Infrastructure
- [x] Next.js 16 with TypeScript (strict mode)
- [x] Tailwind CSS v4 styling
- [x] Supabase SSR integration (auth + database)
- [x] Middleware-based route protection
- [x] Environment configuration

### ✅ Authentication System
- [x] AuthContext (session management)
- [x] Login/Signup pages
- [x] Middleware protection for /dashboard routes
- [x] Auto-profile creation
- [x] Role-based access (student, faculty, staff, admin)

### ✅ Database Layer
- [x] Type definitions for all entities
- [x] Zod validation schemas
- [x] Database query modules (users.ts, blogs.ts)
- [x] Server + browser client separation

### ✅ UI Components
- [x] Header with user menu
- [x] Sidebar navigation
- [x] Dashboard layout
- [x] Login/Signup forms
- [x] Utility functions (date, currency, slug generation)

---

## Quick Start

### 1. Install Dependencies
```bash
cd v4
npm install
```

### 2. Set Up Environment
```bash
# Copy example to .env.local
cp .env.example .env.local

# Add your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### 3. Create Supabase Project
```bash
# If you have Supabase CLI
supabase login
supabase projects create --name "DEP Campus"

# Then push the database schema (will create in next steps)
```

### 4. Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000 → Auto-redirects to /login

---

## Database Schema Setup (CRITICAL NEXT STEP)

### Create Migration Files

Create `db/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  avatar_url VARCHAR,
  role VARCHAR CHECK (role IN ('student', 'faculty', 'staff', 'admin')) NOT NULL,
  department VARCHAR,
  branch VARCHAR,
  batch VARCHAR,
  enrollment_number VARCHAR,
  employee_id VARCHAR,
  designation VARCHAR,
  bio TEXT,
  phone VARCHAR,
  website VARCHAR,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true}',
  privacy_settings JSONB DEFAULT '{"profile_public": true}',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- [Rest of tables defined in FINAL_ARCHITECTURE.md section "Database Schema"]
```

### Apply Migrations
```bash
# Option 1: Via Supabase CLI
supabase db push

# Option 2: Via Supabase Dashboard
# Copy each migration to SQL Editor and run
```

---

## Next Phase Tasks (Week 2-3)

### Module 1: Create Events Module (Highest Priority)
- [ ] Create `src/lib/db/events.ts` (query functions)
- [ ] Create `src/components/features/events/EventCard.tsx`
- [ ] Create `src/components/features/events/EventList.tsx`
- [ ] Create `src/components/features/events/EventForm.tsx`
- [ ] Create `src/app/(dashboard)/events/page.tsx`
- [ ] Create `src/app/(dashboard)/events/create/page.tsx`
- [ ] Test CRUD operations

### Module 2: Create Blogs Module
- [ ] Create `src/lib/db/blogs.ts` ✅ (done)
- [ ] Create blog components
- [ ] Blog list page
- [ ] Blog create/edit pages
- [ ] Markdown editor

### Module 3: Create Marketplace Module
- [ ] Create `src/lib/db/marketplace.ts`
- [ ] Marketplace components
- [ ] Category filtering
- [ ] Image gallery

### Module 4: Create Communities Module
- [ ] Create `src/lib/db/communities.ts`
- [ ] Community components
- [ ] Community feed
- [ ] Member management

---

## File Structure Reference

```
v4/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/         ✅ Both ready
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx        ✅ Home page
│   │   │   ├── blogs/          (Next to implement)
│   │   │   ├── events/         (Next to implement)
│   │   │   ├── marketplace/    (Then)
│   │   │   └── communities/    (Then)
│   │   ├── layout.tsx          ✅ Root layout
│   │   └── globals.css         ✅ Tailwind
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx      ✅ Done
│   │   │   └── Sidebar.tsx     ✅ Done
│   │   └── features/
│   │       ├── auth/           ✅ Login/Signup
│   │       ├── events/         (Next)
│   │       ├── blogs/          (Next)
│   │       ├── marketplace/    (Then)
│   │       └── communities/    (Then)
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── browser.ts      ✅ Client init
│   │   │   └── server.ts       ✅ Server init
│   │   ├── db/
│   │   │   ├── users.ts        ✅ CRUD ready
│   │   │   ├── blogs.ts        ✅ CRUD ready
│   │   │   ├── events.ts       (TODO)
│   │   │   ├── marketplace.ts  (TODO)
│   │   │   └── communities.ts  (TODO)
│   │   ├── types.ts            ✅ All types
│   │   ├── validators.ts       ✅ Zod schemas
│   │   ├── utils.ts            ✅ Helpers
│   │   └── constants.ts        ✅ Config
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx     ✅ Auth done
│   │
│   └── middleware.ts           ✅ Route protection
│
├── db/
│   └── migrations/             (TODO: Create SQL)
│
└── package.json                ✅ All deps
```

---

## Code Patterns to Follow

### Creating a New Feature Module

#### Step 1: Database Queries (`src/lib/db/feature.ts`)
```typescript
// Server-side
export async function listFeatures(filters = {}) {
  const supabase = await createServerClient()
  // ... query with filters

// Client-side mutations
export async function createFeature(data) {
  const supabase = createBrowserClient()
  // ... insert and return
```

#### Step 2: Components (`src/components/features/feature/`)
```typescript
// FeatureList.tsx - Server component
export async function FeatureList() {
  const data = await listFeatures()
  return <FeatureListClient data={data} />
}

// FeatureListClient.tsx - Client component
'use client'
export function FeatureListClient({ data }) {
  return (
    <div>
      {data.map(item => <FeatureCard key={item.id} item={item} />)}
    </div>
  )
}

// FeatureForm.tsx - Client component for mutations
'use client'
export function FeatureForm() {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm({ resolver: zodResolver(featureSchema) })

  async function onSubmit(data) {
    const result = await createFeature(data)
    // toast success, redirect
  }
  return <form onSubmit={...}>...</form>
}
```

#### Step 3: Pages (`src/app/(dashboard)/feature/page.tsx`)
```typescript
// Server-side data fetching
export default async function FeaturePage() {
  const data = await listFeatures()
  return <FeatureList data={data} />
}
```

---

## Testing Checklist

### Authentication
- [ ] Sign up creates user + profile
- [ ] Login works with email/password
- [ ] Unauthenticated users redirected to /login
- [ ] Authenticated users can access /dashboard
- [ ] Logout clears session

### Database
- [ ] Users table stores profiles
- [ ] Queries return correct data
- [ ] RLS policies limit access
- [ ] Errors handled gracefully

### UI Components
- [ ] Sidebar navigation works
- [ ] Header shows user info
- [ ] Forms validate input (Zod)
- [ ] Loading states display
- [ ] Error messages show

---

## Deployment Checklist

Before pushing to production:

- [ ] All env vars set
- [ ] Database migrations applied
- [ ] RLS policies in place
- [ ] Error tracking (Sentry) configured
- [ ] Tests passing
- [ ] Lighthouse score > 85
- [ ] No console errors

---

## Common Tasks

### Add New Feature
```bash
# Create DB module
touch src/lib/db/feature.ts

# Create components
mkdir -p src/components/features/feature

# Create pages
mkdir -p src/app/(dashboard)/feature
```

### Generate DB Types
```bash
npm run db:generate-types
# Updates: src/lib/types/supabase.ts
```

### Deploy to Vercel
```bash
git push # Auto-deploys
# Monitor: vercel.com/dashboard
```

---

## Support Files

**Architecture Reference**: See `FINAL_ARCHITECTURE.md` for:
- Complete database schema
- Code patterns & examples
- Scaling configuration
- Solid principles implementation

**Quick Reference**: See `README.md` for quick decisions

---

## Week 1 Summary

✅ **Completed**:
1. Project structure
2. All configuration (TS, Tailwind, Next.js)
3. Supabase integration (SSR)
4. Authentication (login/signup/middleware)
5. Database types & validators
6. UI foundations (Header, Sidebar, pages)
7. Utility functions

🔥 **Ready for**: Database schema + Core module implementation

**Estimated Time to Launch**: 5-6 more weeks (18 development days for 3 devs)

---

## Key Files to Know

| File | Purpose | Status |
|------|---------|--------|
| `src/middleware.ts` | Route protection | ✅ |
| `src/contexts/AuthContext.tsx` | Auth state | ✅ |
| `src/lib/validators.ts` | Zod schemas | ✅ |
| `src/lib/db/*.ts` | Queries | 30% (need events, marketplace, communities) |
| `src/components/layout/` | Layout | ✅ |
| `src/components/features/` | Feature modules | 5% (only auth) |
| `.env.local` | Secrets | ❌ (create from .env.example) |
| `db/migrations/` | Schema | ❌ (need to create) |

---

**Next Action**: Create database schema & implement events module

Ready to continue? Let me know! 🚀
