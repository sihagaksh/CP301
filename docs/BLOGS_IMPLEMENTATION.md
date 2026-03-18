# Blogs Module Implementation

**Completed**: March 17, 2026
**Status**: ✅ Complete and Ready to Test

## Overview

The Blogs module provides a content management system for campus community members to write, publish, and discover blog posts with markdown support, categories, and view tracking.

## Features Implemented

### 1. Blog Discovery
- **List Blogs** (`/dashboard/blogs`): Browse all published blogs
- **Filter by Category**: Filter posts by topic (Academic, Campus Life, Technology, etc.)
- **Search**: Find blogs by title or excerpt
- **Pagination**: Server-side pagination with page tracking
- **Featured Blog**: Prominent display of outstanding posts
- **Reading Time**: Estimated duration for each post

### 2. Blog Management
- **Write Blog** (`/dashboard/blogs/create`):
  - Title, content, excerpt, category
  - Featured image URL
  - Markdown editor with live preview
  - Auto-generated URL slugs from titles
  - Saved as drafts initially (not visible to others)

- **View Blog** (`/dashboard/blogs/[slug]`):
  - Full markdown-rendered content
  - Author information card
  - Publication date and reading time
  - View counter
  - Share button
  - Publish button (for draft posts)

- **Edit Blog** (`/dashboard/blogs/[slug]/edit`):
  - Creator only can edit
  - All form fields editable
  - Redirect to detail after save

### 3. Content Features
- **Markdown Support**:
  - Headers (#, ##, ###)
  - Lists (-, *)
  - Code blocks (```code```)
  - Bold and italic text
  - Live preview mode

- **Publishing System**:
  - Save as draft (private, not shown in listings)
  - Publish to make visible to all
  - Publication date tracking
  - View count incrementing

### 4. Dashboard Integration
- **Blog Widget**: Shows "156" total blogs (placeholder, updates with data)
- **Recent Blogs Carousel**: Displays last 3 published blogs
- **Quick Links**: Easy navigation to blog creation

## File Structure

```
v4/
├── src/
│   ├── lib/
│   │   └── db/
│   │       └── blogs.ts              (8 functions: 3 server, 5 client)
│   │
│   ├── components/
│   │   └── features/
│   │       └── blogs/
│   │           ├── BlogCard.tsx      (Grid/list card display)
│   │           ├── BlogList.tsx      (List with category filter)
│   │           ├── BlogForm.tsx      (Create/edit form)
│   │           ├── BlogMarkdownEditor.tsx (Markdown + preview)
│   │           └── BlogPublishButton.tsx (Publish action)
│   │
│   └── app/
│       └── (dashboard)/
│           ├── blogs/
│           │   ├── page.tsx          (List all blogs)
│           │   ├── create/
│           │   │   └── page.tsx      (Create form)
│           │   └── [slug]/
│           │       ├── page.tsx      (Detail view)
│           │       └── edit/
│           │           └── page.tsx  (Edit form)
│           │
│           └── page.tsx              (Updated with blogs widget)
```

## Database Functions (src/lib/db/blogs.ts)

### Server-Side Queries (Use in Pages)

```typescript
// Get paginated blogs with filtering
listBlogs(filters: {
  page?: number        // Default: 1
  limit?: number       // Default: 20
  published?: boolean  // Default: true
  category?: string
  search?: string
}) → { data, count, page, limit, total_pages }

// Get single blog by slug (published only)
getBlogBySlug(slug: string) → Blog | null

// Get single blog by ID (all blogs, draft or published)
getBlogById(id: string) → Blog | null
```

### Client-Side Mutations (Use in Components)

```typescript
// Create new blog
createBlog(data: {
  title, slug, content, author_id
  excerpt?, category?, featured_image_url?
}) → Blog
  - Sets: is_published=false (draft)
  - Sets: created_at=now, updated_at=now

// Update blog (any field)
updateBlog(id, updates: Partial<Blog>) → Blog
  - Sets: updated_at=now

// Delete blog
deleteBlog(id) → void

// Publish blog (make visible)
publishBlog(id) → Blog
  - Sets: is_published=true, published_at=now

// Increment view counter
incrementBlogViews(id) → void
  - RPC function to increment view_count
```

## Components

### BlogCard.tsx
**Props:**
- `blog`: Blog object with optional author
- `compact?: boolean`: Smaller version for lists
- `featured?: boolean`: Large featured card with image

**Features - Standard View:**
- Author avatar with initials fallback
- Author name and publication date
- Title (truncated on hover)
- Excerpt preview
- Category badge
- View count and reading time estimate
- Hover effects

**Features - Featured View:**
- Large featured image placeholder/display
- Category badge
- Full title (2-line limit)
- Excerpt
- Publication date and reading time
- Image hover zoom effect

**Features - Compact View:**
- Minimal design for carousels
- Title (truncated)
- Publication date

### BlogList.tsx
**Props:**
- `initialBlogs`: Array of published blogs
- `totalCount`: Total blogs for pagination
- `initialPage?: number`: Starting page
- `pageSize?: number`: Items per page
- `allCategories?: string[]`: Available filter categories
- `featuredBlog?: Blog`: Optional featured blog to show at top

**Features:**
- Optional featured blog section
- Category filter pills (All, Academic, Campus Life, etc.)
- Grid display with full post cards
- Empty state message
- Loading animation
- Pagination info

### BlogForm.tsx
**Props:**
- `blog?: Blog`: For editing (undefined for create)
- `userId: string`: Current user ID
- `onSuccess?: () => void`: Callback after save

**Features:**
- Validation via `blogCreateSchema` (Zod)
- Title input with auto-slug generation
- URL slug display (read-only computed)
- Excerpt textarea with character counter
- Category select dropdown (8 categories)
- Featured image URL input
- Markdown editor with preview tabs
- Submit/Cancel buttons
- Loading state with spinner
- Draft info message

### BlogMarkdownEditor.tsx
**Props:**
- `value: string`: Current markdown content
- `onChange: (value) => void`: Change handler
- `placeholder?: string`: Input placeholder

**Features:**
- **Edit Tab**: Full textarea for markdown input
- **Preview Tab**: Live markdown rendering
- Renders headlines (# ## ###)
- Renders lists (- or *)
- Renders code blocks (```code```)
- Renders paragraphs with line breaks
- Markdown cheat sheet at bottom
- Toggle between edit and preview modes
- Syntax highlighting for code blocks

### BlogPublishButton.tsx
**Props:**
- `blogId: string`: Blog ID to publish

**Features:**
- Publish button (draft blogs only)
- Loading spinner during publish
- Error message display
- Refresh page after successful publish
- Green styling for publish action

## Pages

### Blogs List Page (`/dashboard/blogs`)
- **Server component** with SSR
- Query parameters: `page`, `category`, `search`
- Displays BlogList component
- "Write Blog" button in header
- Shows total blog count

### Create Blog Page (`/dashboard/blogs/create`)
- **Auth required** (redirects to /login)
- Displays BlogForm for new blogs
- Descriptive header about draft publishing
- Calls `createBlog()` on submit

### Blog Detail Page (`/dashboard/blogs/[slug]`)
- Shows complete blog content
- Markdown-rendered with prose styling
- Author information card with avatar
- Publication date, reading time, view count
- Share button
- Edit button (visible to creator only)
- Publish button (if still draft)
- Increments view count on load

### Edit Blog Page (`/dashboard/blogs/[slug]/edit`)
- **Auth required** (redirects to /login)
- **Ownership check** (redirects if not author)
- Displays BlogForm in edit mode
- Form pre-filled with blog data
- Redirects to detail after save

## Styling Approach

- **Color scheme**: Amber primary (#f59e0b), gray backgrounds
- **Borders**: 1px gray-200/800 for light/dark mode
- **Spacing**: Consistent gap-4 margins, p-6 padding
- **Typography**: Bold titles, medium weights for subtitles
- **Responsive**: Mobile-first with md: and lg: breakpoints
- **Dark mode**: Full support with dark: prefix
- **Animations**: Hover effects, spinner animations
- **Prose**: Nice typography in article view

## Type Safety

All components use TypeScript strict mode with:
- Blog interface from `@/lib/types`
- Zod schema validation for forms
- Async function return types specified
- Optional props marked as `?`
- No `any` types used

## Validation

Blog creation uses `blogCreateSchema`:
```typescript
{
  title: string (5-200 chars)
  slug: string (1-200 chars)
  content: string (10+ chars)
  excerpt?: string (0-500 chars)
  category?: string
  featured_image_url?: URL
}
```

Validation errors display below form fields with specific messages.

## Integration Points

### Database
- Uses existing Supabase client setup
- Respects RLS policies on blogs table
- Handles relationship fetching (author)

### Authentication
- Uses `createServerClient()` for middleware auth
- Uses `useAuth()` hook for user context
- Redirects unauthenticated users to /login

### Sidebar
- Blogs link already present and styled with amber active color

### Dashboard
- Widget showing blog count
- Carousel of recent 3 published blogs
- Quick link to create blog
- Quick link to browse blogs

## Key Features vs Events

**Similarities:**
- Similar CRUD operations
- Server/client split for queries
- Form validation with Zod
- Responsive grid layouts
- Dark mode support

**Differences:**
- Blogs use slugs instead of IDs in URLs
- Markdown editor with preview instead of plain textarea
- Featured image support
- Category filtering instead of type
- Publishing workflow (draft→published)
- Reading time estimates
- View counters

## Known Limitations & TODOs

1. **Basic Markdown**: No rich text editor, plain markdown syntax
2. **Images**: No built-in image upload (external URLs only)
3. **Comments**: No blog comments system (future)
4. **Likes**: No like/reaction system (future)
5. **Social Sharing**: Share button uses native API (desktop/mobile only)
6. **Notifications**: No new blog notifications (future)
7. **Drafts List**: No separate view for draft blogs (vs published)
8. **Word Count**: No word count display (only reading time)

## Testing Checklist

- [ ] Create blog as logged-in user
- [ ] Blog saved as draft
- [ ] Draft blog not visible in /dashboard/blogs listing
- [ ] Cannot view draft blog via URL
- [ ] Can edit own draft blog
- [ ] Can publish draft blog
- [ ] Published blog appears in listing
- [ ] Can view published blog detail
- [ ] Markdown renders correctly (headers, lists, code)
- [ ] View count increments on page load
- [ ] Can search blogs by title
- [ ] Can filter by category
- [ ] Featured image displays if URL provided
- [ ] Author info shows correctly
- [ ] Cannot edit others' blogs
- [ ] Reading time calculates correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] Dark mode works
- [ ] Form validation rejects invalid data

## Next Steps

1. **Apply Database Migration**: Run `001_initial_schema.sql` in Supabase
2. **Test Blogs Locally**: `npm run dev` and test flow
3. **Implement Communities Module**: Similar pattern to blogs
4. **Add Blog Notifications**: Notify followers of new posts (future)
5. **Add Blog Comments**: Community engagement feature (future)

## Performance Notes

- **SSR**: Blog list/detail pages render on server initially
- **Pagination**: Limits to 20 per page by default
- **Indexes**: Database has indexes on slug, published_at, author_id
- **Filtering**: Category/search done at database level
- **Caching**: Static pages can be cached (adjust revalidation as needed)
- **Reading Time**: Calculated client-side (200 words/minute avg)

## Database Schema

- **Table**: `blogs`
- **Key Fields**: id, title, slug, content, excerpt, author_id, category, featured_image_url, is_published, published_at, view_count, created_at, updated_at
- **Author Relationship**: Foreign key to users table
- **RLS Policies**: Published blogs visible to all, drafts only to author

---

**Total Files Added**: 9 files (1 db module exists, 5 components, 4 pages updated)
**Total Lines of Code**: ~1000+ lines of well-structured TypeScript/TSX
**Time to Implement**: ~2-3 hours with reference patterns from Events
**Reusability**: All patterns from Events module applied successfully
