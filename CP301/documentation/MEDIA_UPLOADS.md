# Media Uploads and Access Control

This document defines the intended upload architecture for the IIT Ropar Community Platform. It is meant to be the reference before adding or changing any upload feature.

The current user media uploads for feed, marketplace, lost and found, and blogs are working. Do not refactor those casually. The immediate goal is to document the correct long-term model and make future privileged uploads, such as mess menus and organization icons, consistent and secure.

## Goals

- Keep upload behavior predictable across the app.
- Avoid hidden Supabase dashboard setup dependencies.
- Clearly define who can upload, replace, and delete each kind of media.
- Keep service role keys strictly server-side.
- Avoid relying on Instagram or third-party scraping for profile images.
- Preserve currently working user-owned upload flows unless there is a deliberate migration plan.

## Upload Categories

There are two broad classes of uploads.

### User-Owned Media

These are files uploaded by a regular authenticated user for content they own.

Examples:

- Feed post images
- Marketplace listing images
- Lost and found item photos
- Blog featured images
- Profile pictures

These can continue using direct Supabase Storage upload if the bucket exists and storage policies enforce user-owned paths.

Expected path pattern:

```txt
{userId}/{entity-or-timestamp}/{filename}
```

The first folder must match `auth.uid()` when using direct client uploads.

### Privileged or Role-Controlled Media

These are files where upload permission depends on app-level roles, not just the logged-in user.

Examples:

- Mess menu original document
- Organization icon/logo
- Event posters or venue maps posted by an organization
- Notice attachments
- Community or group icons

These should go through a server-side upload endpoint that verifies the user and checks app permissions before uploading with the Supabase service role key.

## Current Upload Inventory

| Upload Type | Current Field | Current Bucket / Proposed Bucket | Who Should Upload | Read Access | Notes |
|---|---|---|---|---|---|
| Profile picture | `users.profile_picture_url` | `profile-pictures` | User themself, admin | Public/authenticated | User-owned. Path should start with user ID. |
| Feed media | `feed_posts.media_urls` | `feed-media` | Post author | Public/authenticated | Currently working. Keep stable unless migrating all media. |
| Blog featured image | `blog_posts.featured_image_url` | `blogs-media` | Blog author, admin | Public | Currently direct user upload. |
| Marketplace images | `marketplace_items.images` | `market-media` | Listing seller | Public/authenticated | Currently working. Max 5 images in UI. |
| Lost and found images | `lost_found_items.images` | `lost-found-media` | Reporter | Public/authenticated | Currently working. Max 5 images in UI. |
| Mess menu document | `mess_menus.document_url` | `mess-menus` | Admin only | Public/authenticated | Privileged upload. Should use server upload endpoint. |
| Organization icon/logo | `organizations.logo_url` | `org-icons` | Admin or active authorized org person | Public | Uploaded square image shown circularly. No Instagram DP fetching. |
| Organization Instagram link | `organizations.social_links.instagram` | none | Admin or active authorized org person | Public | Store as link only. |
| Event cover image | `events.cover_image_url` | `events-media` | Event creator, admin, organizer org manager | Public | Needs org-aware permission when organizer is an org. |
| Event poster | `events.poster_url` | `events-media` | Event creator, admin, organizer org manager | Public | Schema supports it. UI may not fully expose upload yet. |
| Event venue map | `events.venue_map_url` | `events-media` | Event creator, admin, organizer org manager | Public | Image or PDF. |
| Notice attachments | `notices.attachments` | `notices-media` | Admin, notice creator, authorized org poster | Public/authenticated | Needs explicit file type validation. |
| Community post media | `community_posts.media_urls` | `community-media` | Community member if posting allowed | Depends on community visibility | Schema supports media URLs. |
| Community/group icon | `community_groups.icon_url` | `community-media` | Community/group admin or moderator | Depends on visibility | Requires community role checks. |
| Static map/campus media | static files | public assets or admin bucket | Developer/admin only | Public | Not a normal user-facing upload. |
| CSV imports | not persisted | none | Admin only | n/a | Parsed and applied, usually not stored. |

## Role Control Matrix

| Media Kind | Upload | Replace | Delete |
|---|---|---|---|
| Profile picture | Self, admin | Self, admin | Self, admin |
| Feed media | Post author | Post author while editable | Post author, admin |
| Blog image | Blog author, admin | Blog author, admin | Blog author, admin |
| Marketplace images | Seller | Seller while listing editable | Seller, admin |
| Lost and found images | Reporter | Reporter while item editable | Reporter, admin |
| Mess menu document | Admin only | Admin only | Admin only |
| Organization icon | Admin or active authorized org person | Admin or active authorized org person | Admin or active authorized org person |
| Event media | Event creator, organizer org manager, admin | Same | Same |
| Notice attachments | Notice creator, authorized org manager, admin | Same | Same |
| Community media | Allowed community member | Author, community moderator/admin | Author, community moderator/admin |
| Community/group icon | Community/group moderator/admin | Same | Same |

## Organization Authorization

For organization-level uploads, such as organization icons or organization event media, the app should use one reusable permission check.

Recommended first version:

```txt
canManageOrgMedia(userId, orgId) =
  user is global admin
  OR user has an active user_positions row for orgId
```

Possible later extension:

```txt
OR user has an active POR in a parent board/governance body that controls orgId
```

Do not add parent-board inheritance until the product decision is clear.

## Recommended Upload Architecture

Use a central upload endpoint for privileged and role-controlled uploads.

Suggested endpoint:

```txt
POST /api/media/upload
```

Multipart payload:

```txt
file: File
kind: UploadKind
context: JSON string
```

Example:

```json
{
  "kind": "org-icon",
  "context": {
    "orgId": "..."
  }
}
```

Server responsibilities:

1. Verify Supabase JWT from the request.
2. Load the app user profile from `users`.
3. Authorize based on upload `kind` and `context`.
4. Validate file type, extension, and size.
5. Build a safe bucket/path.
6. Upload with `SUPABASE_SERVICE_ROLE_KEY`.
7. Return the public URL and metadata.

The service role key must never be exposed to the browser.

## Upload Kind Configuration

Each upload kind should have one config entry.

```ts
type UploadKindConfig = {
  bucket: string;
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  buildPath: (input: UploadContext) => string;
  authorize: (userId: string, context: UploadContext) => Promise<boolean>;
};
```

Example configs:

```txt
mess-menu-document
  bucket: mess-menus
  max size: 10 MB
  mime types: application/pdf, image/png, image/jpeg, image/webp
  authorization: admin only
  path: {year}/{month}/original-{timestamp}.{ext}

org-icon
  bucket: org-icons
  max size: 2 MB
  mime types: image/png, image/jpeg, image/webp
  authorization: admin or active org position holder
  path: {orgId}/icon-{timestamp}.{ext}
```

## Bucket Plan

Recommended buckets:

```txt
profile-pictures
feed-media
blogs-media
events-media
notices-media
market-media
lost-found-media
mess-menus
org-icons
community-media
```

Buckets should be created by migration, not manually in the Supabase dashboard.

All public display media can have public read policies. Write access should be either:

- direct client upload with strict user-folder RLS for simple user-owned buckets, or
- server-side service role upload after app authorization for privileged buckets.

## Path Plan

| Bucket | Path Pattern |
|---|---|
| `profile-pictures` | `{userId}/avatar-{timestamp}.{ext}` |
| `feed-media` | `{userId}/{timestamp}-{random}.{ext}` |
| `blogs-media` | `{userId}/{blogSlug-or-draftId}/cover-{timestamp}.{ext}` |
| `events-media` | `{orgId-or-userId}/{eventSlug-or-draftId}/{kind}-{timestamp}.{ext}` |
| `notices-media` | `{orgId-or-userId}/{noticeDraftId}/{filename}` |
| `market-media` | `{userId}/{listingDraftId-or-timestamp}/{index}-{timestamp}.{ext}` |
| `lost-found-media` | `{userId}/{itemDraftId-or-timestamp}/{index}-{timestamp}.{ext}` |
| `mess-menus` | `{year}/{month}/original-{timestamp}.{ext}` |
| `org-icons` | `{orgId}/icon-{timestamp}.{ext}` |
| `community-media` | `{communityId}/{userId}/{timestamp}.{ext}` |

## File Validation

Minimum validation rules:

| Media Kind | Allowed Types | Max Size | Max Count |
|---|---|---:|---:|
| Profile picture | PNG, JPEG, WebP | 2 MB | 1 |
| Feed media | PNG, JPEG, WebP | 5 MB | 4 |
| Blog featured image | PNG, JPEG, WebP | 5 MB | 1 |
| Marketplace images | PNG, JPEG, WebP | 5 MB each | 5 |
| Lost and found images | PNG, JPEG, WebP | 5 MB each | 5 |
| Mess menu document | PDF, PNG, JPEG, WebP | 10 MB | 1 |
| Organization icon | PNG, JPEG, WebP | 2 MB | 1 |
| Event media | PDF, PNG, JPEG, WebP | 10 MB | per field |
| Notice attachments | PDF, PNG, JPEG, WebP, DOC, DOCX | 10 MB each | product-defined |

Do not trust file extensions alone. Check MIME type server-side for server uploads.

## Instagram Policy

Organizations may store an Instagram URL in:

```txt
organizations.social_links.instagram
```

The app should not fetch or scrape the Instagram profile picture. Instagram profile-picture access is not reliable through a simple public API. The organization icon should always come from an explicit upload.

Display priority:

1. `organizations.logo_url`
2. fallback initials

## Optional Media Asset Table

For stronger auditing and cleanup, add a `media_assets` table later.

```sql
media_assets (
  id uuid primary key,
  bucket text not null,
  path text not null,
  public_url text not null,
  kind text not null,
  owner_user_id uuid references users(id),
  owner_org_id uuid references organizations(id),
  entity_type text,
  entity_id uuid,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references users(id),
  created_at timestamptz default now(),
  deleted_at timestamptz
);
```

Benefits:

- audit trail
- easier debugging
- cleanup of replaced files
- orphan detection
- future delete/revoke support

The app can still store direct URLs on existing entity tables for simple rendering.

## Migration Strategy

Do this in phases.

### Phase 1: Document and Stabilize

- Keep currently working user media uploads unchanged.
- Ensure all buckets are created by SQL migrations.
- Use the server upload path for admin-only or role-controlled media.
- Improve error messages for missing service role key, unauthorized upload, file too large, and unsupported type.

### Phase 2: Centralize Privileged Uploads

Move these to one central server upload endpoint:

- mess menu documents
- organization icons
- event media
- notice attachments
- community/group icons

### Phase 3: Optional User Media Unification

Only after the privileged path is stable, consider moving working user-owned media uploads behind the same upload service or a signed-upload service.

Do not break existing working feed/marketplace/lost-found/blog uploads unless there is a clear reason.

### Phase 4: Audit and Cleanup

- Add `media_assets`.
- Track uploaded files.
- Add cleanup for replaced organization icons and old document versions.
- Add admin diagnostics for failed uploads.

## Implementation Rules

- Never put `SUPABASE_SERVICE_ROLE_KEY` in client code.
- Never rely on manual dashboard bucket creation.
- Never allow app-level role checks only in UI. Enforce them server-side or via RLS.
- Never allow organization icon upload from Instagram profile picture fetching.
- Keep user-owned direct uploads scoped to `auth.uid()` folder paths.
- Prefer one reusable upload config over per-component upload logic.

## Current Known State

- Feed/user media uploads are reported as working and should be preserved.
- Mess menu upload should be admin-only.
- Organization icon upload should be admin or active authorized person of that organization.
- Organization Instagram should be a link only.
- Existing upload code is scattered across components; future upload work should consolidate it gradually instead of performing a risky one-shot rewrite.
