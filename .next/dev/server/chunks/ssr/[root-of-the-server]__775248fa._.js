module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/db/client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
// ============================================================
// lib/db/client.ts
// Supabase client initialization
// ============================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-ssr] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://jwaifhovjhjyrckmmtge.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3YWlmaG92amhqeXJja21tdGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NDEyOTUsImV4cCI6MjA4ODQxNzI5NX0._aJU-dhEAdwOC7pZrXd_rVDPosvMaxcqKauOVNqPGok");
const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
    }
});
}),
"[project]/lib/db/users.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAllUsers",
    ()=>getAllUsers,
    "getUserByEmail",
    ()=>getUserByEmail,
    "getUserById",
    ()=>getUserById,
    "mapUser",
    ()=>mapUser,
    "updateUserProfile",
    ()=>updateUserProfile,
    "updateUserRole",
    ()=>updateUserRole,
    "updateUserStatus",
    ()=>updateUserStatus
]);
// ============================================================
// lib/db/users.ts
// User-related database queries
// ============================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-ssr] (ecmascript)");
;
async function getUserById(userId) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('users').select('*').eq('id', userId).single();
    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`[getUserById] ${error.message}`);
    }
    return data ? mapUser(data) : null;
}
async function getUserByEmail(email) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('users').select('*').eq('email', email).single();
    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`[getUserByEmail] ${error.message}`);
    }
    return data ? mapUser(data) : null;
}
async function updateUserProfile(userId, updates) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('users').update({
        full_name: updates.fullName,
        department: updates.department,
        branch: updates.branch,
        batch: updates.batch,
        enrollment_number: updates.enrollmentNumber,
        employee_id: updates.employeeId,
        designation: updates.designation,
        current_organization: updates.currentOrganization,
        current_position: updates.currentPosition,
        phone_number: updates.phoneNumber,
        bio: updates.bio,
        linkedin_url: updates.linkedinUrl,
        profile_picture_url: updates.profilePictureUrl,
        updated_at: new Date().toISOString()
    }).eq('id', userId).select('*').single();
    if (error) throw new Error(`[updateUserProfile] ${error.message}`);
    return data ? mapUser(data) : null;
}
async function getAllUsers() {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('users').select('*').order('created_at', {
        ascending: false
    });
    if (error) throw new Error(`[getAllUsers] ${error.message}`);
    return data ? data.map(mapUser) : [];
}
async function updateUserRole(userId, role, isAdmin) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('users').update({
        role,
        is_admin: isAdmin,
        updated_at: new Date().toISOString()
    }).eq('id', userId).select('*').single();
    if (error) throw new Error(`[updateUserRole] ${error.message}`);
    return data ? mapUser(data) : null;
}
async function updateUserStatus(userId, status) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('users').update({
        status,
        updated_at: new Date().toISOString()
    }).eq('id', userId).select('*').single();
    if (error) throw new Error(`[updateUserStatus] ${error.message}`);
    return data ? mapUser(data) : null;
}
function mapUser(row) {
    return {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        status: row.status,
        department: row.department,
        branch: row.branch,
        batch: row.batch,
        enrollmentNumber: row.enrollment_number,
        employeeId: row.employee_id,
        designation: row.designation,
        currentOrganization: row.current_organization,
        currentPosition: row.current_position,
        phoneNumber: row.phone_number,
        bio: row.bio,
        linkedinUrl: row.linkedin_url,
        profilePictureUrl: row.profile_picture_url,
        isVerified: row.is_verified,
        isAdmin: row.is_admin,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}
}),
"[project]/lib/db/blogs.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createBlogPost",
    ()=>createBlogPost,
    "deleteBlogPost",
    ()=>deleteBlogPost,
    "getBlogBySlug",
    ()=>getBlogBySlug,
    "getFeaturedBlogs",
    ()=>getFeaturedBlogs,
    "getPublishedBlogs",
    ()=>getPublishedBlogs,
    "getUserDrafts",
    ()=>getUserDrafts,
    "incrementBlogViews",
    ()=>incrementBlogViews,
    "mapBlogPost",
    ()=>mapBlogPost,
    "publishBlogPost",
    ()=>publishBlogPost,
    "updateBlogPost",
    ()=>updateBlogPost
]);
// ============================================================
// lib/db/blogs.ts
// Blog posts queries
// ============================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/users.ts [app-ssr] (ecmascript)");
;
;
async function getPublishedBlogs(category, limit = 20, offset = 0) {
    let query = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('blog_posts').select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, company_name, role_applied, interview_round,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users(id, full_name, role, profile_picture_url)
    `).eq('status', 'published').order('published_at', {
        ascending: false
    }).range(offset, offset + limit - 1);
    if (category && category !== 'general') {
        query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) {
        console.warn(`[getPublishedBlogs] ${error.message}`);
        return [];
    }
    return (data ?? []).map(mapBlogPost);
}
async function getBlogBySlug(slug) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('blog_posts').select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, company_name, role_applied, interview_round,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users(id, full_name, role, profile_picture_url)
    `).eq('slug', slug).single();
    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`[getBlogBySlug] ${error.message}`);
    }
    return data ? mapBlogPost(data) : null;
}
async function getFeaturedBlogs(limit = 6) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('blog_posts').select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, company_name, role_applied, interview_round,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users(id, full_name, role, profile_picture_url)
    `).eq('status', 'published').eq('is_featured', true).order('published_at', {
        ascending: false
    }).limit(limit);
    if (error) {
        console.warn(`[getFeaturedBlogs] ${error.message}`);
        return [];
    }
    return (data ?? []).map(mapBlogPost);
}
async function createBlogPost(authorId, title, slug, content, category, excerpt, featuredImageUrl, companyName, roleApplied, interviewRound, publishNow = false) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('blog_posts').insert({
        author_id: authorId,
        title,
        slug,
        content,
        excerpt,
        featured_image_url: featuredImageUrl,
        category,
        company_name: companyName,
        role_applied: roleApplied,
        interview_round: interviewRound,
        status: publishNow ? 'published' : 'draft',
        published_at: publishNow ? new Date().toISOString() : null
    }).select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, company_name, role_applied, interview_round,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users(id, full_name, role, profile_picture_url)
    `).single();
    if (error) throw new Error(`[createBlogPost] ${error.message}`);
    return mapBlogPost(data);
}
async function publishBlogPost(blogId) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('blog_posts').update({
        status: 'published',
        published_at: new Date().toISOString()
    }).eq('id', blogId).select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, company_name, role_applied, interview_round,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users(id, full_name, role, profile_picture_url)
    `).single();
    if (error) throw new Error(`[publishBlogPost] ${error.message}`);
    return mapBlogPost(data);
}
async function updateBlogPost(blogId, updates) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('blog_posts').update({
        title: updates.title,
        slug: updates.slug,
        content: updates.content,
        category: updates.category,
        excerpt: updates.excerpt,
        featured_image_url: updates.featuredImageUrl,
        company_name: updates.companyName,
        role_applied: updates.roleApplied,
        interview_round: updates.interviewRound,
        status: updates.status,
        updated_at: new Date().toISOString()
    }).eq('id', blogId).select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, company_name, role_applied, interview_round,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users(id, full_name, role, profile_picture_url)
    `).single();
    if (error) throw new Error(`[updateBlogPost] ${error.message}`);
    return mapBlogPost(data);
}
async function deleteBlogPost(blogId) {
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('blog_posts').delete().eq('id', blogId);
    if (error) throw new Error(`[deleteBlogPost] ${error.message}`);
}
function mapBlogPost(row) {
    return {
        id: row.id,
        authorId: row.author_id,
        postingIdentityId: row.posting_identity_id,
        title: row.title,
        slug: row.slug,
        content: row.content,
        excerpt: row.excerpt,
        featuredImageUrl: row.featured_image_url,
        category: row.category,
        tags: row.tags || [],
        companyName: row.company_name,
        roleApplied: row.role_applied,
        interviewRound: row.interview_round,
        status: row.status,
        isFeatured: row.is_featured,
        allowComments: row.allow_comments,
        viewCount: row.view_count,
        likeCount: row.like_count,
        commentCount: row.comment_count,
        publishedAt: row.published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        author: row.author ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mapUser"])(row.author) : undefined
    };
}
async function incrementBlogViews(blogId) {
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].rpc('increment_blog_views', {
        blog_id: blogId
    });
    if (error) console.warn(`[incrementBlogViews] ${error.message}`);
}
async function getUserDrafts(userId) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('blog_posts').select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, company_name, role_applied, interview_round,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users(id, full_name, role, profile_picture_url)
    `).eq('author_id', userId).eq('status', 'draft').order('updated_at', {
        ascending: false
    });
    if (error) {
        console.warn(`[getUserDrafts] ${error.message}`);
        return [];
    }
    return (data ?? []).map(mapBlogPost);
}
}),
"[project]/lib/db/organizations.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addOrgMember",
    ()=>addOrgMember,
    "assignUserPosition",
    ()=>assignUserPosition,
    "createOrganization",
    ()=>createOrganization,
    "getAllOrgMembers",
    ()=>getAllOrgMembers,
    "getAllOrgPositions",
    ()=>getAllOrgPositions,
    "getChildOrganizations",
    ()=>getChildOrganizations,
    "getOrgMembers",
    ()=>getOrgMembers,
    "getOrgPositions",
    ()=>getOrgPositions,
    "getOrganizationBySlug",
    ()=>getOrganizationBySlug,
    "getOrganizations",
    ()=>getOrganizations,
    "getPositionById",
    ()=>getPositionById,
    "getUserPositions",
    ()=>getUserPositions,
    "mapOrgMember",
    ()=>mapOrgMember,
    "mapOrganization",
    ()=>mapOrganization,
    "mapUserPosition",
    ()=>mapUserPosition,
    "removeOrgMember",
    ()=>removeOrgMember,
    "revokeUserPosition",
    ()=>revokeUserPosition,
    "updateOrganization",
    ()=>updateOrganization,
    "upsertMemberByEntry",
    ()=>upsertMemberByEntry,
    "upsertOrganization",
    ()=>upsertOrganization,
    "upsertPORByEntry",
    ()=>upsertPORByEntry
]);
// ============================================================
// lib/db/organizations.ts
// Organizations and Positions of Responsibility queries
// ============================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/users.ts [app-ssr] (ecmascript)");
;
;
async function getUserPositions(userId) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('user_positions').select(`
      id, user_id, org_id, title, por_type, valid_from, valid_until, is_active, created_at,
      org:organizations(id, name, slug, type, parent_id, logo_url, is_active)
    `).eq('user_id', userId).eq('is_active', true);
    if (error) throw new Error(`[getUserPositions] ${error.message}`);
    return (data ?? []).map(mapUserPosition);
}
async function getPositionById(positionId) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('user_positions').select(`
      id, user_id, org_id, title, por_type, valid_from, valid_until, is_active, created_at,
      org:organizations(id, name, slug, type, parent_id, logo_url, is_active)
    `).eq('id', positionId).single();
    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`[getPositionById] ${error.message}`);
    }
    return data ? mapUserPosition(data) : null;
}
async function getOrganizations(type) {
    let query = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('organizations').select('*').eq('is_active', true).order('name');
    if (type) {
        query = query.eq('type', type);
    }
    const { data, error } = await query;
    if (error) throw new Error(`[getOrganizations] ${error.message}`);
    return (data ?? []).map(mapOrganization);
}
async function getOrganizationBySlug(slug) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('organizations').select('*').eq('slug', slug).single();
    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`[getOrganizationBySlug] ${error.message}`);
    }
    return data ? mapOrganization(data) : null;
}
async function getChildOrganizations(parentId) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('organizations').select('*').eq('parent_id', parentId).eq('is_active', true).order('name');
    if (error) throw new Error(`[getChildOrganizations] ${error.message}`);
    return (data ?? []).map(mapOrganization);
}
async function getOrgMembers(orgId) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('org_members').select(`
            id, org_id, user_id, status, joined_at,
            user:users!org_members_user_id_fkey(id, email, full_name, role, profile_picture_url, enrollment_number, employee_id)
        `).eq('org_id', orgId).eq('status', 'approved').order('joined_at', {
        ascending: true
    });
    if (error) throw new Error(`[getOrgMembers] ${error.message}`);
    return (data ?? []).map(mapOrgMember);
}
async function getOrgPositions(orgId) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('user_positions').select(`
            id, user_id, org_id, title, por_type, valid_from, valid_until, is_active, created_at,
            user:users!user_positions_user_id_fkey(id, email, full_name, role, profile_picture_url, enrollment_number, employee_id)
        `).eq('org_id', orgId).eq('is_active', true).order('por_type');
    if (error) throw new Error(`[getOrgPositions] ${error.message}`);
    return (data ?? []).map(mapUserPosition);
}
async function createOrganization(data) {
    const { data: newOrg, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].rpc('admin_create_organization', {
        p_name: data.name ?? null,
        p_slug: data.slug ?? null,
        p_type: data.type ?? null,
        p_parent_id: data.parentId ?? null,
        p_description: data.description ?? null,
        p_logo_url: data.logoUrl ?? null,
        p_email: data.email ?? null,
        p_social_links: data.socialLinks ?? null,
        p_founded_year: data.foundedYear ?? null,
        p_is_active: data.isActive ?? true
    });
    if (error) throw new Error(`[createOrganization] ${error.message}`);
    return newOrg ? mapOrganization(newOrg) : null;
}
async function updateOrganization(id, data) {
    const { data: updatedOrg, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].rpc('admin_update_organization', {
        p_id: id,
        p_name: data.name ?? null,
        p_slug: data.slug ?? null,
        p_type: data.type ?? null,
        p_parent_id: data.parentId ?? null,
        p_description: data.description ?? null,
        p_logo_url: data.logoUrl ?? null,
        p_email: data.email ?? null,
        p_social_links: data.socialLinks ?? null,
        p_founded_year: data.foundedYear ?? null,
        p_is_active: data.isActive ?? null
    });
    if (error) throw new Error(`[updateOrganization] ${error.message}`);
    return updatedOrg ? mapOrganization(updatedOrg) : null;
}
async function assignUserPosition(data) {
    // Safely derive a date string from validFrom (may be ISO datetime or date-only)
    const validFromDate = data.validFrom ? data.validFrom.substring(0, 10) : new Date().toISOString().substring(0, 10);
    const { data: newPosition, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].rpc('admin_assign_por', {
        p_user_id: data.userId,
        p_org_id: data.orgId,
        p_title: data.title,
        p_por_type: data.porType,
        p_valid_from: validFromDate,
        p_valid_until: data.validUntil ? data.validUntil.substring(0, 10) : null,
        p_is_active: data.isActive ?? true
    });
    if (error) throw new Error(`[assignUserPosition] ${error.message}`);
    // Since RPC doesn't do joins, fetch the fully-joined position after creation
    if (newPosition) {
        const { data: joinedPosition } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('user_positions').select(`
                id, user_id, org_id, title, por_type, valid_from, valid_until, is_active, created_at,
                user:users!user_positions_user_id_fkey(id, email, full_name, role, profile_picture_url, enrollment_number, employee_id),
                org:organizations(id, name, slug, type, parent_id, logo_url, is_active)
            `).eq('id', newPosition.id).single();
        return joinedPosition ? mapUserPosition(joinedPosition) : mapUserPosition(newPosition);
    }
    return null;
}
async function revokeUserPosition(positionId) {
    const { data: success, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].rpc('admin_revoke_por', {
        p_position_id: positionId
    });
    if (error) throw new Error(`[revokeUserPosition] ${error.message}`);
    return !!success;
}
async function upsertOrganization(row) {
    const { data: org, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].rpc('admin_upsert_organization', {
        p_name: row.name,
        p_slug: row.slug,
        p_type: row.type,
        p_parent_id: row.parent_id ?? null,
        p_description: row.description ?? null,
        p_logo_url: row.logo_url ?? null,
        p_email: row.email ?? null,
        p_social_links: row.social_links ?? null,
        p_founded_year: row.founded_year ?? null,
        p_is_active: row.is_active ?? true,
        p_id: row.id ?? null
    });
    if (error) throw new Error(`[upsertOrganization:${row.slug}] ${error.message}`);
    return org ? mapOrganization(org) : null;
}
async function getAllOrgMembers() {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('org_members').select(`
            id, org_id, user_id, status, joined_at,
            user:users!org_members_user_id_fkey(id, email, full_name, role, profile_picture_url, enrollment_number, employee_id),
            org:organizations(id, name, slug, type, parent_id, logo_url, is_active)
        `).eq('status', 'approved').order('joined_at', {
        ascending: false
    });
    if (error) throw new Error(`[getAllOrgMembers] ${error.message}`);
    return (data ?? []).map(mapOrgMember);
}
async function getAllOrgPositions() {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('user_positions').select(`
            id, user_id, org_id, title, por_type, valid_from, valid_until, is_active, created_at,
            user:users!user_positions_user_id_fkey(id, email, full_name, role, profile_picture_url, enrollment_number, employee_id),
            org:organizations(id, name, slug, type, parent_id, logo_url, is_active)
        `).order('created_at', {
        ascending: false
    });
    if (error) throw new Error(`[getAllOrgPositions] ${error.message}`);
    return (data ?? []).map(mapUserPosition);
}
async function upsertMemberByEntry(row) {
    const { data: member, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].rpc('admin_upsert_member', {
        p_entry_number: row.entry_number,
        p_org_slug: row.org_slug,
        p_status: row.status ?? 'approved'
    });
    if (error) {
        console.error(`[upsertMemberByEntry] Error for ${row.entry_number} in ${row.org_slug}:`, error.message);
        throw error;
    }
    return member?.[0] || null;
}
async function upsertPORByEntry(row) {
    const { data: por, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].rpc('admin_upsert_por', {
        p_entry_number: row.entry_number,
        p_org_slug: row.org_slug,
        p_title: row.title,
        p_por_type: row.por_type ?? 'custom',
        p_valid_from: row.valid_from ?? new Date().toISOString().slice(0, 10),
        p_valid_until: row.valid_until ?? null,
        p_is_active: row.is_active ?? true
    });
    if (error) {
        console.error(`[upsertPORByEntry] Error for ${row.entry_number} parsing ${row.title}:`, error.message);
        throw error;
    }
    return por?.[0] || null;
}
async function addOrgMember(orgId, userId) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('org_members').insert({
        org_id: orgId,
        user_id: userId,
        status: 'approved'
    }).select(`
            id, org_id, user_id, status, joined_at,
            user:users!org_members_user_id_fkey(id, email, full_name, role, profile_picture_url, enrollment_number, employee_id)
        `).single();
    if (error) throw new Error(`[addOrgMember] ${error.message}`);
    return data ? mapOrgMember(data) : null;
}
async function removeOrgMember(orgId, userId) {
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('org_members').update({
        status: 'removed'
    }).eq('org_id', orgId).eq('user_id', userId);
    if (error) throw new Error(`[removeOrgMember] ${error.message}`);
    return true;
}
function mapOrganization(row) {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        type: row.type,
        parentId: row.parent_id,
        description: row.description,
        logoUrl: row.logo_url,
        email: row.email,
        socialLinks: row.social_links,
        isActive: row.is_active,
        foundedYear: row.founded_year,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}
function mapUserPosition(row) {
    return {
        id: row.id,
        userId: row.user_id,
        orgId: row.org_id,
        title: row.title,
        porType: row.por_type,
        validFrom: row.valid_from,
        validUntil: row.valid_until,
        isActive: row.is_active,
        createdAt: row.created_at,
        org: row.org ? mapOrganization(row.org) : undefined,
        user: row.user ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mapUser"])(row.user) : undefined
    };
}
function mapOrgMember(row) {
    return {
        id: row.id,
        orgId: row.org_id,
        userId: row.user_id,
        status: row.status,
        joinedAt: row.joined_at,
        org: row.org ? mapOrganization(row.org) : undefined,
        user: row.user ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mapUser"])(row.user) : undefined
    };
}
}),
"[project]/lib/db/events.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createEvent",
    ()=>createEvent,
    "getEventById",
    ()=>getEventById,
    "getEventBySlug",
    ()=>getEventBySlug,
    "getEvents",
    ()=>getEvents,
    "getUpcomingEvents",
    ()=>getUpcomingEvents,
    "mapEvent",
    ()=>mapEvent
]);
// ============================================================
// lib/db/events.ts
// Events database queries
// ============================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/users.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$organizations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/organizations.ts [app-ssr] (ecmascript)");
;
;
;
async function getUpcomingEvents(type, limit = 20, page = 1) {
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    const now = new Date().toISOString();
    let query = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('events').select(`
      id, title, slug, type, start_time, end_time,
      venue_name, is_online, cover_image_url,
      registration_url, max_attendees, tags,
      is_published, created_at,
      organizer:organizations!events_organizer_id_fkey(id, name, slug, type, logo_url),
      postedBy:users!events_posted_by_fkey(id, full_name, role, profile_picture_url)
    `).eq('is_published', true).gte('start_time', now).order('start_time', {
        ascending: true
    }).range(start, end);
    if (type && type !== 'all') {
        query = query.eq('type', type);
    }
    const { data, error } = await query;
    if (error) {
        console.warn(`[getUpcomingEvents] ${error.message}`);
        return [];
    }
    return (data ?? []).map(mapEvent);
}
async function getEvents(filters = {}) {
    const { page = 1, limit = 20, type, search } = filters;
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    let query = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('events').select(`
      id, title, slug, type, start_time, end_time,
      venue_name, is_online, cover_image_url,
      registration_url, max_attendees, tags,
      is_published, created_at,
      organizer:organizations!events_organizer_id_fkey(id, name, slug, type, logo_url),
      postedBy:users!events_posted_by_fkey(id, full_name, role, profile_picture_url)
    `, {
        count: 'estimated'
    });
    query = query.eq('is_published', true);
    if (type && type !== 'all') {
        query = query.eq('type', type);
    }
    if (search) {
        query = query.ilike('title', `%${search}%`);
    }
    query = query.order('start_time', {
        ascending: true
    }).range(start, end);
    const { data, error, count } = await query;
    if (error) {
        console.warn(`[getEvents] ${error.message}`);
        return {
            data: [],
            total: 0,
            page,
            limit,
            hasMore: false
        };
    }
    return {
        data: (data ?? []).map(mapEvent),
        total: count ?? 0,
        page,
        limit,
        hasMore: count ? start + limit < count : false
    };
}
async function getEventBySlug(slug) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('events').select(`
      *,
      organizer:organizations!events_organizer_id_fkey(id, name, slug, type, logo_url),
      postedBy:users!events_posted_by_fkey(id, email, full_name, role, profile_picture_url)
    `).eq('slug', slug).single();
    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`[getEventBySlug] ${error.message}`);
    }
    return data ? mapEvent(data) : null;
}
async function getEventById(id) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('events').select(`
      *,
      organizer:organizations!events_organizer_id_fkey(id, name, slug, type, logo_url),
      postedBy:users!events_posted_by_fkey(id, email, full_name, role, profile_picture_url)
    `).eq('id', id).single();
    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`[getEventById] ${error.message}`);
    }
    return data ? mapEvent(data) : null;
}
async function createEvent(eventData) {
    // Generate slug
    const slug = eventData.title ? eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now() : `event-${Date.now()}`;
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('events').insert([
        {
            title: eventData.title,
            slug: slug,
            description: eventData.description,
            organizer_id: eventData.organizerId || null,
            posted_by: eventData.postedBy,
            type: eventData.type || 'other',
            start_time: eventData.startTime,
            end_time: eventData.endTime,
            venue_name: eventData.venueName,
            venue_map_url: eventData.venueMapUrl || null,
            is_online: eventData.isOnline || false,
            meeting_url: eventData.meetingUrl || null,
            cover_image_url: eventData.coverImageUrl || null,
            registration_url: eventData.registrationUrl || null,
            registration_deadline: eventData.registrationDeadline || null,
            max_attendees: eventData.maxAttendees || null,
            tags: eventData.tags || [],
            is_published: eventData.isPublished !== false
        }
    ]).select(`
      *,
      organizer:organizations!events_organizer_id_fkey(id, name, slug, type, logo_url),
      postedBy:users!events_posted_by_fkey(id, email, full_name, role, profile_picture_url)
    `).single();
    if (error) throw new Error(`[createEvent] ${error.message}`);
    return data ? mapEvent(data) : null;
}
function mapEvent(row) {
    return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        organizerId: row.organizer_id,
        postedBy: row.posted_by,
        type: row.type,
        startTime: row.start_time,
        endTime: row.end_time,
        venueName: row.venue_name,
        venueMapUrl: row.venue_map_url,
        isOnline: row.is_online,
        meetingUrl: row.meeting_url,
        coverImageUrl: row.cover_image_url,
        registrationUrl: row.registration_url,
        registrationDeadline: row.registration_deadline,
        maxAttendees: row.max_attendees,
        tags: row.tags || [],
        isPublished: row.is_published,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        organizer: row.organizer ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$organizations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mapOrganization"])(row.organizer) : undefined,
        // Note: Event interface expects `poster` to be populated for the ui
        poster: row.postedBy ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mapUser"])(row.postedBy) : undefined
    };
}
}),
"[project]/lib/db/marketplace.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createMarketplaceItem",
    ()=>createMarketplaceItem,
    "getMarketplaceItemById",
    ()=>getMarketplaceItemById,
    "getMarketplaceItems",
    ()=>getMarketplaceItems,
    "mapMarketplaceItem",
    ()=>mapMarketplaceItem,
    "updateMarketplaceItemStatus",
    ()=>updateMarketplaceItemStatus
]);
// ============================================================
// lib/db/marketplace.ts
// Database queries for Marketplace items
// ============================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/users.ts [app-ssr] (ecmascript)");
;
;
async function getMarketplaceItems(filters = {}) {
    const { page = 1, limit = 20, category, condition, status = 'available', search, sellerId, minPrice, maxPrice } = filters;
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    let query = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('marketplace_items').select(`
      id, seller_id, title, category, price, is_negotiable,
      condition, status, images, pickup_location,
      delivery_available, view_count, expires_at,
      created_at, updated_at,
      seller:users!marketplace_items_seller_id_fkey(id, full_name, role, profile_picture_url)
    `, {
        count: 'estimated'
    });
    if (status && status !== 'all') {
        query = query.eq('status', status);
    }
    if (category && category !== 'all') {
        query = query.eq('category', category);
    }
    if (condition && condition !== 'all') {
        query = query.eq('condition', condition);
    }
    if (sellerId) {
        query = query.eq('seller_id', sellerId);
    }
    if (search) {
        query = query.ilike('title', `%${search}%`);
    }
    if (minPrice !== undefined) {
        query = query.gte('price', minPrice);
    }
    if (maxPrice !== undefined) {
        query = query.lte('price', maxPrice);
    }
    query = query.order('created_at', {
        ascending: false
    }).range(start, end);
    const { data, error, count } = await query;
    if (error) {
        console.warn(`[getMarketplaceItems] ${error.message}`);
        return {
            data: [],
            total: 0,
            page,
            limit,
            hasMore: false
        };
    }
    return {
        data: (data ?? []).map(mapMarketplaceItem),
        total: count ?? 0,
        page,
        limit,
        hasMore: count ? start + limit < count : false
    };
}
async function getMarketplaceItemById(id) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('marketplace_items').select(`
      *,
      seller:users!marketplace_items_seller_id_fkey(id, email, full_name, role, profile_picture_url)
    `).eq('id', id).single();
    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`[getMarketplaceItemById] ${error.message}`);
    }
    // View count increment would be done via a DB function or trigger in production
    return data ? mapMarketplaceItem(data) : null;
}
async function createMarketplaceItem(itemData) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('marketplace_items').insert([
        {
            seller_id: itemData.sellerId,
            title: itemData.title,
            description: itemData.description || null,
            category: itemData.category,
            price: itemData.price,
            is_negotiable: itemData.isNegotiable ?? false,
            condition: itemData.condition,
            status: 'available',
            images: itemData.images || [],
            pickup_location: itemData.pickupLocation || null,
            delivery_available: itemData.deliveryAvailable ?? false,
            expires_at: itemData.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
    ]).select(`
      *,
      seller:users!marketplace_items_seller_id_fkey(id, email, full_name, role, profile_picture_url)
    `).single();
    if (error) throw new Error(`[createMarketplaceItem] ${error.message}`);
    return data ? mapMarketplaceItem(data) : null;
}
async function updateMarketplaceItemStatus(id, status) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('marketplace_items').update({
        status
    }).eq('id', id).select(`
      *,
      seller:users!marketplace_items_seller_id_fkey(id, email, full_name, role, profile_picture_url)
    `).single();
    if (error) throw new Error(`[updateMarketplaceItemStatus] ${error.message}`);
    return data ? mapMarketplaceItem(data) : null;
}
function mapMarketplaceItem(row) {
    return {
        id: row.id,
        sellerId: row.seller_id,
        title: row.title,
        description: row.description,
        category: row.category,
        price: parseFloat(row.price),
        isNegotiable: row.is_negotiable,
        condition: row.condition,
        status: row.status,
        images: row.images || [],
        pickupLocation: row.pickup_location,
        deliveryAvailable: row.delivery_available,
        viewCount: row.view_count || 0,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        seller: row.seller ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mapUser"])(row.seller) : undefined
    };
}
}),
"[project]/lib/db/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
// ============================================================
// lib/db/index.ts
// Re-export all database utilities
// ============================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/users.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$blogs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/blogs.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$events$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/events.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$marketplace$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/marketplace.ts [app-ssr] (ecmascript)");
;
;
;
;
;
}),
"[project]/contexts/AuthContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/db/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/users.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$organizations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/organizations.ts [app-ssr] (ecmascript)");
// ============================================================
// contexts/AuthContext.tsx
// Authentication context for managing user session and auth state
// ============================================================
'use client';
;
;
;
;
;
// Routes that don't require authentication
const PUBLIC_PATHS = [
    '/login',
    '/signup',
    '/forgot-password'
];
function isPublicPath(pathname) {
    return PUBLIC_PATHS.some((p)=>pathname === p || pathname.startsWith(p + '/'));
}
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activePositions, setActivePositions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedIdentityId, setSelectedIdentityId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const isInitialized = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(false);
    const fetchingUserRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(false);
    // Concurrency lock for syncCookie — prevents overlapping requests
    const syncingRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(false);
    const lastTokenRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(undefined);
    // ── Cookie sync (concurrency-safe) ──────────────────────────
    const syncCookie = async (accessToken)=>{
        // Skip if same token
        if (lastTokenRef.current === accessToken) return;
        // Skip if already syncing
        if (syncingRef.current) return;
        syncingRef.current = true;
        lastTokenRef.current = accessToken;
        try {
            const controller = new AbortController();
            const timeout = setTimeout(()=>controller.abort(), 5000);
            if (accessToken) {
                await fetch('/api/auth/set-cookie', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        access_token: accessToken
                    }),
                    signal: controller.signal
                });
            } else {
                await fetch('/api/auth/clear-cookie', {
                    method: 'POST',
                    signal: controller.signal
                });
            }
            clearTimeout(timeout);
        } catch (err) {
            // Silently handle aborts and network errors — cookie sync is best-effort
            if (err instanceof DOMException && err.name === 'AbortError') {
                console.warn('[AuthContext] syncCookie timed out after 5s');
            } else {
                console.error('[AuthContext] syncCookie error:', err);
            }
        } finally{
            syncingRef.current = false;
        }
    };
    // ── Initialize: getSession + listen for changes ─────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isInitialized.current) return;
        isInitialized.current = true;
        // Step 1: Get session on mount (no refreshSession — Supabase handles refresh automatically)
        async function checkAuth() {
            try {
                const { data: { session } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].auth.getSession();
                if (session) {
                    const userData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserById"])(session.user.id);
                    if (userData) {
                        setUser(userData);
                        const positions = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$organizations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserPositions"])(session.user.id);
                        setActivePositions(positions);
                    } else {
                        // They have a Supabase session but no profile in the DB.
                        // This is a broken user state — force sign out.
                        document.cookie = 'sb-auth-token=; path=/; max-age=0';
                        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].auth.signOut().catch(()=>{});
                        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                        ;
                    }
                } else {
                    // DESYNC DETECTION: Supabase client has no session (localStorage empty),
                    // BUT we are on a protected route like the dashboard.
                    // This means the proxy let us in because of a stale server cookie.
                    // We must destroy the stale cookie and redirect to login.
                    if (("TURBOPACK compile-time value", "undefined") !== 'undefined' && !isPublicPath(window.location.pathname)) //TURBOPACK unreachable
                    ;
                }
            } catch (err) {
                console.error('[AuthContext] checkAuth error:', err);
            } finally{
                setLoading(false);
            }
        }
        checkAuth();
        // Step 2: Listen for auth changes — THIS is the single source of truth for cookie sync
        const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].auth.onAuthStateChange((event, session)=>{
            if (event === 'SIGNED_IN') {
                // Full user load only on actual sign-in (not token refresh)
                if (session) {
                    if (!fetchingUserRef.current) {
                        fetchingUserRef.current = true;
                        void (async ()=>{
                            try {
                                const userData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserById"])(session.user.id);
                                if (userData) {
                                    setUser(userData);
                                    const positions = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$organizations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserPositions"])(session.user.id);
                                    setActivePositions(positions);
                                }
                            } finally{
                                fetchingUserRef.current = false;
                            }
                        })();
                    }
                    void syncCookie(session.access_token);
                }
            } else if (event === 'TOKEN_REFRESHED') {
                // Token rotated (e.g. tab regained focus) — only sync the cookie.
                // Do NOT re-fetch user from DB; user data hasn't changed.
                if (session) {
                    void syncCookie(session.access_token);
                }
            } else if (event === 'SIGNED_OUT') {
                // Clear cookie client-side (instant, no network).
                // Do NOT redirect here — this event fires in hidden tabs where
                // navigation is deferred and unreliable. MainLayout's visibility
                // handler detects the missing cookie and forces a hard reload
                // when the tab becomes visible.
                document.cookie = 'sb-auth-token=; path=/; max-age=0';
                setUser(null);
                setActivePositions(null);
                setSelectedIdentityId(null);
            }
        // INITIAL_SESSION is handled by checkAuth above — no action needed here
        });
        return ()=>subscription?.unsubscribe();
    }, []);
    // ── Sign Up ─────────────────────────────────────────────────
    const signUp = async (data)=>{
        try {
            setError(null);
            setLoading(true);
            const { data: authData, error: signUpError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].auth.signUp({
                email: data.email,
                password: data.password
            });
            if (signUpError) throw signUpError;
            if (!authData.user) throw new Error('Sign up failed');
            // Create user profile using service_role (SECURITY DEFINER function)
            const { error: profileError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].rpc('create_user_profile', {
                p_id: authData.user.id,
                p_email: data.email,
                p_full_name: data.fullName,
                p_role: data.role,
                p_department: data.department || null,
                p_branch: data.branch || null,
                p_batch: data.batch || null
            });
            if (profileError) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].auth.admin.deleteUser(authData.user.id);
                throw profileError;
            }
            // Load the created user
            const userData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserById"])(authData.user.id);
            if (userData) {
                setUser(userData);
                const positions = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$organizations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserPositions"])(authData.user.id);
                setActivePositions(positions);
            }
            // We MUST sync the cookie here and wait for it to finish, otherwise
            // the redirect on the signup page will happen before the cookie is set.
            await syncCookie(authData.session?.access_token || null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign up failed';
            setError(message);
            throw err;
        } finally{
            setLoading(false);
        }
    };
    // ── Sign In ─────────────────────────────────────────────────
    const signIn = async (data)=>{
        try {
            setError(null);
            setLoading(true);
            const { data: authData, error: signInError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].auth.signInWithPassword({
                email: data.email,
                password: data.password
            });
            if (signInError) throw signInError;
            if (!authData.user) throw new Error('Sign in failed');
            // Load user profile
            const userData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserById"])(authData.user.id);
            if (userData) {
                setUser(userData);
                const positions = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$organizations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserPositions"])(authData.user.id);
                setActivePositions(positions);
            }
            // We MUST sync the cookie here and wait for it to finish, otherwise
            // the redirect on the login page will happen before the cookie is set.
            await syncCookie(authData.session?.access_token || null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign in failed';
            setError(message);
            throw err;
        } finally{
            setLoading(false);
        }
    };
    // ── Sign Out ────────────────────────────────────────────────
    const signOut = async ()=>{
        try {
            setError(null);
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].auth.signOut();
            if (error) throw error;
        // Cookie clear + user null handled by onAuthStateChange(SIGNED_OUT)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign out failed';
            setError(message);
            throw err;
        }
    };
    // ── Update Profile ──────────────────────────────────────────
    const updateProfile = async (updates)=>{
        try {
            if (!user) throw new Error('No user logged in');
            setError(null);
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].from('users').update(updates).eq('id', user.id);
            if (error) throw error;
            const userData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserById"])(user.id);
            if (userData) setUser(userData);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Profile update failed';
            setError(message);
            throw err;
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            activePositions,
            selectedIdentityId,
            setSelectedIdentityId,
            loading,
            error,
            signUp,
            signIn,
            signOut,
            updateProfile
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/contexts/AuthContext.tsx",
        lineNumber: 301,
        columnNumber: 5
    }, this);
}
function useAuth() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__775248fa._.js.map