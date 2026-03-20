(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ui/badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge,
    "badgeVariants",
    ()=>badgeVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])('inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden', {
    variants: {
        variant: {
            default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
            // Custom variants for the IIT Ropar app
            primary: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30',
            success: 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-500/30',
            warning: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-500/30',
            danger: 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-500/30',
            info: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30',
            secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
            destructive: 'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
            outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground'
        }
    },
    defaultVariants: {
        variant: 'default'
    }
});
function Badge({ className, variant, asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : 'span';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "badge",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(badgeVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/badge.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
_c = Badge;
;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/db/communities.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createCommunity",
    ()=>createCommunity,
    "getCommunities",
    ()=>getCommunities,
    "getCommunityBySlug",
    ()=>getCommunityBySlug,
    "getCommunityMembers",
    ()=>getCommunityMembers,
    "getCommunityPosts",
    ()=>getCommunityPosts,
    "mapCommunity",
    ()=>mapCommunity,
    "mapCommunityMember",
    ()=>mapCommunityMember,
    "mapCommunityPost",
    ()=>mapCommunityPost
]);
// ============================================================
// lib/db/communities.ts
// Database queries for Communities module
// ============================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/users.ts [app-client] (ecmascript)");
;
;
async function getCommunities(filters = {}) {
    const { page = 1, limit = 20, search, isPublic } = filters;
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    let query = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('communities').select(`
      id, creator_id, name, slug, description,
      is_public, requires_approval, allow_posts,
      member_count, post_count, created_at, updated_at,
      creator:users!communities_creator_id_fkey(id, full_name, role, profile_picture_url)
    `, {
        count: 'estimated'
    });
    if (isPublic !== undefined) {
        query = query.eq('is_public', isPublic);
    }
    if (search) {
        query = query.ilike('name', `%${search}%`);
    }
    query = query.order('member_count', {
        ascending: false
    }).range(start, end);
    const { data, error, count } = await query;
    if (error) {
        console.warn(`[getCommunities] ${error.message}`);
        return {
            data: [],
            total: 0,
            page,
            limit,
            hasMore: false
        };
    }
    return {
        data: (data ?? []).map(mapCommunity),
        total: count ?? 0,
        page,
        limit,
        hasMore: count ? start + limit < count : false
    };
}
async function getCommunityBySlug(slug) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('communities').select(`
      *,
      creator:users!communities_creator_id_fkey(id, email, full_name, role, profile_picture_url)
    `).eq('slug', slug).single();
    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`[getCommunityBySlug] ${error.message}`);
    }
    return data ? mapCommunity(data) : null;
}
async function createCommunity(communityData) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('communities').insert([
        {
            creator_id: communityData.creatorId,
            name: communityData.name,
            slug: communityData.slug,
            description: communityData.description || null,
            is_public: communityData.isPublic,
            requires_approval: communityData.requiresApproval,
            allow_posts: true
        }
    ]).select(`
      *,
      creator:users!communities_creator_id_fkey(id, email, full_name, role, profile_picture_url)
    `).single();
    if (error) throw new Error(`[createCommunity] ${error.message}`);
    const community = data ? mapCommunity(data) : null;
    if (community) {
        // Add creator as admin member of the community
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_members').insert([
            {
                community_id: community.id,
                user_id: communityData.creatorId,
                role: 'admin'
            }
        ]).select().maybeSingle();
        // Auto-create a Notice Board group
        const { data: nbGroup } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_groups').insert([
            {
                community_id: community.id,
                name: 'Notice Board',
                description: 'Official announcements — only admins can post',
                type: 'notice_board',
                send_permission: 'admins_only',
                created_by: communityData.creatorId
            }
        ]).select('id').single();
        // Add creator as admin of the notice board
        if (nbGroup) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_group_members').insert([
                {
                    group_id: nbGroup.id,
                    user_id: communityData.creatorId,
                    role: 'admin'
                }
            ]).maybeSingle();
        }
    }
    return community;
}
async function getCommunityMembers(communityId) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_members').select(`
      id, community_id, user_id, role, joined_at,
      user:users!community_members_user_id_fkey(id, email, full_name, role, profile_picture_url)
    `).eq('community_id', communityId).order('joined_at', {
        ascending: true
    });
    if (error) throw new Error(`[getCommunityMembers] ${error.message}`);
    return (data ?? []).map(mapCommunityMember);
}
async function getCommunityPosts(communityId, page = 1, limit = 20) {
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    const { data, error, count } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_posts').select(`
      id, community_id, author_id, title, content,
      media_urls, like_count, comment_count, is_pinned,
      created_at,
      author:users!community_posts_author_id_fkey(id, full_name, role, profile_picture_url)
    `, {
        count: 'estimated'
    }).eq('community_id', communityId).order('is_pinned', {
        ascending: false
    }).order('created_at', {
        ascending: false
    }).range(start, end);
    if (error) {
        console.warn(`[getCommunityPosts] ${error.message}`);
        return {
            data: [],
            total: 0,
            page,
            limit,
            hasMore: false
        };
    }
    return {
        data: (data ?? []).map(mapCommunityPost),
        total: count ?? 0,
        page,
        limit,
        hasMore: count ? start + limit < count : false
    };
}
function mapCommunity(row) {
    return {
        id: row.id,
        creatorId: row.creator_id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        isPublic: row.is_public,
        requiresApproval: row.requires_approval,
        allowPosts: row.allow_posts,
        memberCount: row.member_count || 0,
        postCount: row.post_count || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        creator: row.creator ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapUser"])(row.creator) : undefined
    };
}
function mapCommunityMember(row) {
    return {
        id: row.id,
        communityId: row.community_id,
        userId: row.user_id,
        role: row.role,
        joinedAt: row.joined_at,
        user: row.user ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapUser"])(row.user) : undefined
    };
}
function mapCommunityPost(row) {
    return {
        id: row.id,
        communityId: row.community_id,
        authorId: row.author_id,
        title: row.title,
        content: row.content,
        mediaUrls: row.media_urls || [],
        likeCount: row.like_count || 0,
        commentCount: row.comment_count || 0,
        isPinned: row.is_pinned,
        createdAt: row.created_at,
        author: row.author ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$users$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapUser"])(row.author) : undefined
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/db/communityGroups.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addGroupMember",
    ()=>addGroupMember,
    "createCommunityGroup",
    ()=>createCommunityGroup,
    "deleteGroup",
    ()=>deleteGroup,
    "demoteAdmin",
    ()=>demoteAdmin,
    "getCommunityGroups",
    ()=>getCommunityGroups,
    "getGroupMemberRole",
    ()=>getGroupMemberRole,
    "getGroupMembers",
    ()=>getGroupMembers,
    "getGroupMessages",
    ()=>getGroupMessages,
    "isGroupMember",
    ()=>isGroupMember,
    "joinGroup",
    ()=>joinGroup,
    "leaveGroup",
    ()=>leaveGroup,
    "promoteToAdmin",
    ()=>promoteToAdmin,
    "removeGroupMember",
    ()=>removeGroupMember,
    "sendGroupMessage",
    ()=>sendGroupMessage,
    "updateGroupSettings",
    ()=>updateGroupSettings
]);
// ============================================================
// lib/db/communityGroups.ts
// Database queries for Community Groups (WhatsApp-style)
// ============================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-client] (ecmascript)");
;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGroup(row) {
    return {
        id: row.id,
        communityId: row.community_id,
        name: row.name,
        description: row.description,
        type: row.type,
        sendPermission: row.send_permission,
        createdBy: row.created_by,
        memberCount: row.member_count || 0,
        iconUrl: row.icon_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMember(row) {
    return {
        id: row.id,
        groupId: row.group_id,
        userId: row.user_id,
        role: row.role,
        joinedAt: row.joined_at,
        user: row.user ? {
            id: row.user.id,
            fullName: row.user.full_name,
            email: row.user.email,
            role: row.user.role,
            profilePictureUrl: row.user.profile_picture_url
        } : undefined
    };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMessage(row) {
    return {
        id: row.id,
        groupId: row.group_id,
        senderId: row.sender_id,
        content: row.content,
        createdAt: row.created_at,
        sender: row.sender ? {
            id: row.sender.id,
            fullName: row.sender.full_name,
            profilePictureUrl: row.sender.profile_picture_url
        } : undefined
    };
}
async function getCommunityGroups(communityId) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_groups').select('*').eq('community_id', communityId).order('type', {
        ascending: false
    }) // notice_board first (alphabetically)
    .order('created_at', {
        ascending: true
    });
    if (error) {
        console.warn('[getCommunityGroups]', error.message);
        return [];
    }
    return (data ?? []).map(mapGroup);
}
async function createCommunityGroup(params) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_groups').insert([
        {
            community_id: params.communityId,
            name: params.name,
            description: params.description || null,
            type: params.type,
            send_permission: params.sendPermission,
            created_by: params.createdBy
        }
    ]).select('*').single();
    if (error) throw new Error(`[createCommunityGroup] ${error.message}`);
    return data ? mapGroup(data) : null;
}
async function updateGroupSettings(groupId, updates) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.sendPermission !== undefined) payload.send_permission = updates.sendPermission;
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_groups').update(payload).eq('id', groupId);
    if (error) throw new Error(`[updateGroupSettings] ${error.message}`);
}
async function deleteGroup(groupId) {
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_groups').delete().eq('id', groupId);
    if (error) throw new Error(`[deleteGroup] ${error.message}`);
}
async function getGroupMembers(groupId) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_group_members').select(`
            id, group_id, user_id, role, joined_at,
            user:users!community_group_members_user_id_fkey(id, full_name, email, role, profile_picture_url)
        `).eq('group_id', groupId).order('joined_at', {
        ascending: true
    });
    if (error) {
        console.warn('[getGroupMembers]', error.message);
        return [];
    }
    return (data ?? []).map(mapMember);
}
async function isGroupMember(groupId, userId) {
    const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_group_members').select('id').eq('group_id', groupId).eq('user_id', userId).maybeSingle();
    return !!data;
}
async function getGroupMemberRole(groupId, userId) {
    const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_group_members').select('role').eq('group_id', groupId).eq('user_id', userId).maybeSingle();
    return data?.role;
}
async function joinGroup(groupId, userId) {
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_group_members').insert([
        {
            group_id: groupId,
            user_id: userId,
            role: 'member'
        }
    ]);
    if (error && error.code !== '23505') throw new Error(`[joinGroup] ${error.message}`);
}
async function addGroupMember(groupId, userId, role = 'member') {
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_group_members').insert([
        {
            group_id: groupId,
            user_id: userId,
            role
        }
    ]);
    if (error && error.code !== '23505') throw new Error(`[addGroupMember] ${error.message}`);
}
async function leaveGroup(groupId, userId) {
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_group_members').delete().eq('group_id', groupId).eq('user_id', userId);
    if (error) throw new Error(`[leaveGroup] ${error.message}`);
}
async function removeGroupMember(groupId, userId) {
    // Uses the user's own delete policy — only works if current user IS the target.
    // For admin removal of others, this requires the admin RLS update on community_group_members.
    // For now we rely on the admin having been given delete access via the policy above.
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_group_members').delete().eq('group_id', groupId).eq('user_id', userId);
    if (error) throw new Error(`[removeGroupMember] ${error.message}`);
}
async function promoteToAdmin(groupId, userId) {
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_group_members').update({
        role: 'admin'
    }).eq('group_id', groupId).eq('user_id', userId);
    if (error) throw new Error(`[promoteToAdmin] ${error.message}`);
}
async function demoteAdmin(groupId, userId) {
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_group_members').update({
        role: 'member'
    }).eq('group_id', groupId).eq('user_id', userId);
    if (error) throw new Error(`[demoteAdmin] ${error.message}`);
}
async function getGroupMessages(groupId, limit = 100) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_group_messages').select(`
            id, group_id, sender_id, content, created_at,
            sender:users!community_group_messages_sender_id_fkey(id, full_name, profile_picture_url)
        `).eq('group_id', groupId).order('created_at', {
        ascending: true
    }).limit(limit);
    if (error) {
        console.warn('[getGroupMessages]', error.message);
        return [];
    }
    return (data ?? []).map(mapMessage);
}
async function sendGroupMessage(groupId, senderId, content) {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_group_messages').insert([
        {
            group_id: groupId,
            sender_id: senderId,
            content
        }
    ]).select(`
            id, group_id, sender_id, content, created_at,
            sender:users!community_group_messages_sender_id_fkey(id, full_name, profile_picture_url)
        `).single();
    if (error) throw new Error(`[sendGroupMessage] ${error.message}`);
    return data ? mapMessage(data) : null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/hooks/useGroupChat.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCommunityGroups",
    ()=>useCommunityGroups,
    "useGroupChat",
    ()=>useGroupChat
]);
// ============================================================
// lib/hooks/useGroupChat.ts
// Real-time group chat hook for WhatsApp-style community groups
// ============================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/db/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/communityGroups.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/AuthContext.tsx [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
;
;
function useGroupChat(groupId) {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [members, setMembers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [myRole, setMyRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isMember, setIsMember] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [sending, setSending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const groupIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(groupId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useGroupChat.useEffect": ()=>{
            groupIdRef.current = groupId;
        }
    }["useGroupChat.useEffect"], [
        groupId
    ]);
    const loadMessages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGroupChat.useCallback[loadMessages]": async (gid)=>{
            const msgs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGroupMessages"])(gid);
            setMessages(msgs);
        }
    }["useGroupChat.useCallback[loadMessages]"], []);
    const loadGroupInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGroupChat.useCallback[loadGroupInfo]": async (gid, uid)=>{
            const [role, memberStatus, memberList] = await Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGroupMemberRole"])(gid, uid),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isGroupMember"])(gid, uid),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGroupMembers"])(gid)
            ]);
            setMyRole(role);
            setIsMember(memberStatus);
            setMembers(memberList);
        }
    }["useGroupChat.useCallback[loadGroupInfo]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useGroupChat.useEffect": ()=>{
            if (!groupId || !user) return;
            setLoading(true);
            Promise.all([
                loadMessages(groupId),
                loadGroupInfo(groupId, user.id)
            ]).finally({
                "useGroupChat.useEffect": ()=>setLoading(false)
            }["useGroupChat.useEffect"]);
        }
    }["useGroupChat.useEffect"], [
        groupId,
        user,
        loadMessages,
        loadGroupInfo
    ]);
    // Realtime subscription
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useGroupChat.useEffect": ()=>{
            if (!groupId || !user) return;
            const channel = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].channel(`group-chat-${groupId}`).on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'community_group_messages',
                filter: `group_id=eq.${groupId}`
            }, {
                "useGroupChat.useEffect.channel": ()=>{
                    if (groupIdRef.current) loadMessages(groupIdRef.current);
                }
            }["useGroupChat.useEffect.channel"]).subscribe();
            return ({
                "useGroupChat.useEffect": ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].removeChannel(channel);
                }
            })["useGroupChat.useEffect"];
        }
    }["useGroupChat.useEffect"], [
        groupId,
        user,
        loadMessages
    ]);
    const send = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGroupChat.useCallback[send]": async (content)=>{
            if (!groupId || !user || !content.trim() || sending) return;
            setSending(true);
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sendGroupMessage"])(groupId, user.id, content.trim());
                await loadMessages(groupId);
            } finally{
                setSending(false);
            }
        }
    }["useGroupChat.useCallback[send]"], [
        groupId,
        user,
        sending,
        loadMessages
    ]);
    const join = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGroupChat.useCallback[join]": async ()=>{
            if (!groupId || !user) return;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["joinGroup"])(groupId, user.id);
            await loadGroupInfo(groupId, user.id);
        }
    }["useGroupChat.useCallback[join]"], [
        groupId,
        user,
        loadGroupInfo
    ]);
    const leave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGroupChat.useCallback[leave]": async ()=>{
            if (!groupId || !user) return;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["leaveGroup"])(groupId, user.id);
            setIsMember(false);
            setMyRole(null);
        }
    }["useGroupChat.useCallback[leave]"], [
        groupId,
        user
    ]);
    const refreshMembers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGroupChat.useCallback[refreshMembers]": async ()=>{
            if (!groupId || !user) return;
            await loadGroupInfo(groupId, user.id);
        }
    }["useGroupChat.useCallback[refreshMembers]"], [
        groupId,
        user,
        loadGroupInfo
    ]);
    return {
        messages,
        members,
        myRole,
        isMember,
        loading,
        sending,
        send,
        join,
        leave,
        refreshMembers
    };
}
_s(useGroupChat, "V0PaedUhtHhpyMFdi/bZoNpOURg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
function useCommunityGroups(communityId) {
    _s1();
    const [groups, setGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const refresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useCommunityGroups.useCallback[refresh]": async ()=>{
            if (!communityId) {
                setGroups([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCommunityGroups"])(communityId);
                setGroups(data);
            } finally{
                setLoading(false);
            }
        }
    }["useCommunityGroups.useCallback[refresh]"], [
        communityId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCommunityGroups.useEffect": ()=>{
            refresh();
        }
    }["useCommunityGroups.useEffect"], [
        refresh
    ]);
    return {
        groups,
        loading,
        refresh
    };
}
_s1(useCommunityGroups, "iRcoczKBuuUXUjqKunAOSaVhiv4=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/switch.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Switch",
    ()=>Switch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-switch/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
;
function Switch({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "switch",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50', className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Thumb"], {
            "data-slot": "switch-thumb",
            className: 'bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0'
        }, void 0, false, {
            fileName: "[project]/components/ui/switch.tsx",
            lineNumber: 21,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ui/switch.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = Switch;
;
var _c;
__turbopack_context__.k.register(_c, "Switch");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/label.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-label/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
;
function Label({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/label.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = Label;
;
var _c;
__turbopack_context__.k.register(_c, "Label");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
function Input({ className, type, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        "data-slot": "input",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/input.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Input;
;
var _c;
__turbopack_context__.k.register(_c, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/features/communities/GroupSettings.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GroupSettings",
    ()=>GroupSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-off.js [app-client] (ecmascript) <export default as ShieldOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserMinus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-minus.js [app-client] (ecmascript) <export default as UserMinus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-plus.js [app-client] (ecmascript) <export default as UserPlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/megaphone.js [app-client] (ecmascript) <export default as Megaphone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/avatar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/switch.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/communityGroups.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/db/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
function GroupSettings({ group, members, communityId, creatorId, onClose, onUpdated }) {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(group.name);
    const [description, setDescription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(group.description || '');
    const [adminsOnly, setAdminsOnly] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(group.sendPermission === 'admins_only');
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [addSearch, setAddSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [addResults, setAddResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [searching, setSearching] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const searchTimer = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useRef(null);
    const isNoticeboard = group.type === 'notice_board';
    const myMember = members.find((m)=>m.userId === user?.id);
    const amAdmin = myMember?.role === 'admin' || creatorId === user?.id;
    async function saveSettings() {
        setSaving(true);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateGroupSettings"])(group.id, {
                name,
                description,
                sendPermission: adminsOnly ? 'admins_only' : 'all_members'
            });
            onUpdated();
        } catch (e) {
            console.error(e);
        } finally{
            setSaving(false);
        }
    }
    async function handlePromote(userId) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["promoteToAdmin"])(group.id, userId);
        onUpdated();
    }
    async function handleDemote(userId) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["demoteAdmin"])(group.id, userId);
        onUpdated();
    }
    async function handleRemove(userId) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["removeGroupMember"])(group.id, userId);
        onUpdated();
    }
    async function handleDelete() {
        if (!confirm('Delete this group? All messages will be lost.')) return;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteGroup"])(group.id);
        onUpdated();
        onClose();
    }
    async function searchUsers(q) {
        if (!q.trim()) {
            setAddResults([]);
            return;
        }
        setSearching(true);
        const memberIds = members.map((m)=>m.userId);
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('users').select('id, full_name, email, profile_picture_url').or(`full_name.ilike.%${q}%,email.ilike.%${q}%`).limit(6);
        setAddResults((data || []).filter((u)=>!memberIds.includes(u.id)));
        setSearching(false);
    }
    function onSearchChange(val) {
        setAddSearch(val);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(()=>searchUsers(val), 300);
    }
    async function handleAdd(u) {
        // First add to community if not already
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_members').insert([
            {
                community_id: communityId,
                user_id: u.id,
                role: 'member'
            }
        ]).maybeSingle();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addGroupMember"])(group.id, u.id, 'member');
        setAddSearch('');
        setAddResults([]);
        onUpdated();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between p-4 border-b border-border flex-shrink-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            isNoticeboard ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__["Megaphone"], {
                                className: "w-4 h-4 text-amber-500"
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                lineNumber: 112,
                                columnNumber: 38
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                lineNumber: 112,
                                columnNumber: 89
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "font-semibold text-sm",
                                children: isNoticeboard ? 'Notice Board Settings' : 'Group Settings'
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                lineNumber: 113,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/features/communities/GroupSettings.tsx",
                        lineNumber: 111,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onClose,
                        className: "p-1 rounded hover:bg-accent transition-colors",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/components/features/communities/GroupSettings.tsx",
                            lineNumber: 116,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/features/communities/GroupSettings.tsx",
                        lineNumber: 115,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                lineNumber: 110,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto p-4 space-y-5",
                children: [
                    amAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-semibold uppercase text-muted-foreground tracking-wider",
                                children: "Group Info"
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                lineNumber: 124,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                value: name,
                                onChange: (e)=>setName(e.target.value),
                                placeholder: "Group name",
                                disabled: isNoticeboard
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                lineNumber: 125,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                value: description,
                                onChange: (e)=>setDescription(e.target.value),
                                placeholder: "Description (optional)"
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                lineNumber: 131,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/features/communities/GroupSettings.tsx",
                        lineNumber: 123,
                        columnNumber: 21
                    }, this),
                    amAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-semibold uppercase text-muted-foreground tracking-wider",
                                children: "Permissions"
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                lineNumber: 142,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between rounded-lg border border-border p-3 bg-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                        htmlFor: "admins-only",
                                        className: "text-sm font-medium cursor-pointer",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block",
                                                children: "Admins only can send"
                                            }, void 0, false, {
                                                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                lineNumber: 145,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-muted-foreground font-normal",
                                                children: "Non-admins can only read"
                                            }, void 0, false, {
                                                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                lineNumber: 146,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                        lineNumber: 144,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Switch"], {
                                        id: "admins-only",
                                        checked: adminsOnly,
                                        onCheckedChange: setAdminsOnly
                                    }, void 0, false, {
                                        fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                        lineNumber: 148,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                lineNumber: 143,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/features/communities/GroupSettings.tsx",
                        lineNumber: 141,
                        columnNumber: 21
                    }, this),
                    amAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-semibold uppercase text-muted-foreground tracking-wider",
                                children: "Add Member"
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                lineNumber: 160,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                value: addSearch,
                                onChange: (e)=>onSearchChange(e.target.value),
                                placeholder: "Search by name or email…"
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                lineNumber: 161,
                                columnNumber: 25
                            }, this),
                            searching && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground px-1",
                                children: "Searching…"
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                lineNumber: 166,
                                columnNumber: 39
                            }, this),
                            addResults.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-accent transition-colors",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Avatar"], {
                                            className: "h-7 w-7 flex-shrink-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarImage"], {
                                                    src: r.profile_picture_url
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                    lineNumber: 170,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarFallback"], {
                                                    className: "text-[10px]",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getInitials"])(r.full_name)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                    lineNumber: 171,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                            lineNumber: 169,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-medium truncate",
                                                    children: r.full_name
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                    lineNumber: 174,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-muted-foreground truncate",
                                                    children: r.email
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                    lineNumber: 175,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                            lineNumber: 173,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            size: "sm",
                                            variant: "outline",
                                            className: "h-7 text-xs shrink-0",
                                            onClick: ()=>handleAdd(r),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__["UserPlus"], {
                                                    className: "w-3 h-3 mr-1"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                    lineNumber: 178,
                                                    columnNumber: 37
                                                }, this),
                                                " Add"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                            lineNumber: 177,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, r.id, true, {
                                    fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                    lineNumber: 168,
                                    columnNumber: 29
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/features/communities/GroupSettings.tsx",
                        lineNumber: 159,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                        lineNumber: 188,
                                        columnNumber: 25
                                    }, this),
                                    " Members (",
                                    members.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                lineNumber: 187,
                                columnNumber: 21
                            }, this),
                            members.map((m)=>{
                                const isCreator = m.userId === creatorId;
                                const isMe = m.userId === user?.id;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2.5 py-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Avatar"], {
                                            className: "h-8 w-8 flex-shrink-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarImage"], {
                                                    src: m.user?.profilePictureUrl
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                    lineNumber: 196,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarFallback"], {
                                                    className: "text-[10px]",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getInitials"])(m.user?.fullName || '?')
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                    lineNumber: 197,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                            lineNumber: 195,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-medium text-foreground truncate",
                                                    children: [
                                                        m.user?.fullName,
                                                        " ",
                                                        isMe && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-muted-foreground font-normal",
                                                            children: "(you)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                            lineNumber: 201,
                                                            columnNumber: 69
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                    lineNumber: 200,
                                                    columnNumber: 37
                                                }, this),
                                                m.role === 'admin' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: "outline",
                                                    className: "text-[9px] h-4 border-amber-300 text-amber-600 dark:text-amber-400",
                                                    children: "Admin"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                    lineNumber: 204,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                            lineNumber: 199,
                                            columnNumber: 33
                                        }, this),
                                        amAdmin && !isMe && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1 flex-shrink-0",
                                            children: [
                                                m.role === 'member' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handlePromote(m.userId),
                                                    title: "Make admin",
                                                    className: "p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 transition-colors",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                                        className: "w-3.5 h-3.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                        lineNumber: 211,
                                                        columnNumber: 49
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                    lineNumber: 210,
                                                    columnNumber: 45
                                                }, this) : !isCreator && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleDemote(m.userId),
                                                    title: "Remove admin",
                                                    className: "p-1 rounded hover:bg-muted text-muted-foreground transition-colors",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldOff$3e$__["ShieldOff"], {
                                                        className: "w-3.5 h-3.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                        lineNumber: 215,
                                                        columnNumber: 49
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                    lineNumber: 214,
                                                    columnNumber: 45
                                                }, this),
                                                !isCreator && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleRemove(m.userId),
                                                    title: "Remove from group",
                                                    className: "p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserMinus$3e$__["UserMinus"], {
                                                        className: "w-3.5 h-3.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                        lineNumber: 220,
                                                        columnNumber: 49
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                                    lineNumber: 219,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                            lineNumber: 208,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, m.id, true, {
                                    fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                    lineNumber: 194,
                                    columnNumber: 29
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/features/communities/GroupSettings.tsx",
                        lineNumber: 186,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                lineNumber: 120,
                columnNumber: 13
            }, this),
            amAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-t border-border space-y-2 flex-shrink-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        onClick: saveSettings,
                        disabled: saving,
                        className: "w-full",
                        size: "sm",
                        children: saving ? 'Saving…' : 'Save Changes'
                    }, void 0, false, {
                        fileName: "[project]/components/features/communities/GroupSettings.tsx",
                        lineNumber: 234,
                        columnNumber: 21
                    }, this),
                    !isNoticeboard && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        onClick: handleDelete,
                        variant: "destructive",
                        size: "sm",
                        className: "w-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                className: "w-3.5 h-3.5 mr-1.5"
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                                lineNumber: 239,
                                columnNumber: 29
                            }, this),
                            " Delete Group"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/features/communities/GroupSettings.tsx",
                        lineNumber: 238,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/features/communities/GroupSettings.tsx",
                lineNumber: 233,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/features/communities/GroupSettings.tsx",
        lineNumber: 108,
        columnNumber: 9
    }, this);
}
_s(GroupSettings, "CwLy3ppW/Z4rK/Gwuy8qEDjfRyo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = GroupSettings;
var _c;
__turbopack_context__.k.register(_c, "GroupSettings");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/features/communities/GroupChat.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GroupChat",
    ()=>GroupChat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-in.js [app-client] (ecmascript) <export default as LogIn>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/megaphone.js [app-client] (ecmascript) <export default as Megaphone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/avatar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isToday$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/isToday.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isYesterday$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/isYesterday.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hooks$2f$useGroupChat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/hooks/useGroupChat.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$features$2f$communities$2f$GroupSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/features/communities/GroupSettings.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
function formatMsgTime(dateStr) {
    const d = new Date(dateStr);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isToday$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isToday"])(d)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(d, 'HH:mm');
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isYesterday$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isYesterday"])(d)) return `Yesterday ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(d, 'HH:mm')}`;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(d, 'MMM d, HH:mm');
}
function GroupChat({ group, communityId, communityCreatorId, onBack }) {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const { messages, members, myRole, isMember, loading, sending, send, join, leave, refreshMembers } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hooks$2f$useGroupChat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGroupChat"])(group.id);
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showSettings, setShowSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const endRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GroupChat.useEffect": ()=>{
            endRef.current?.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }["GroupChat.useEffect"], [
        messages.length
    ]);
    const isNoticeboard = group.type === 'notice_board';
    const canSend = isMember && (group.sendPermission === 'all_members' || myRole === 'admin');
    const amAdmin = myRole === 'admin' || communityCreatorId === user?.id;
    async function handleSend(e) {
        e.preventDefault();
        if (!input.trim()) return;
        await send(input);
        setInput('');
    }
    function handleSettingsUpdated() {
        refreshMembers();
        setShowSettings(false);
    }
    if (showSettings) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$features$2f$communities$2f$GroupSettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GroupSettings"], {
                group: group,
                members: members,
                communityId: communityId,
                creatorId: communityCreatorId,
                onClose: ()=>setShowSettings(false),
                onUpdated: handleSettingsUpdated
            }, void 0, false, {
                fileName: "[project]/components/features/communities/GroupChat.tsx",
                lineNumber: 57,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/features/communities/GroupChat.tsx",
            lineNumber: 56,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2.5 px-4 py-3 border-b border-border bg-card flex-shrink-0",
                children: [
                    onBack && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onBack,
                        className: "p-1 rounded hover:bg-accent transition-colors text-muted-foreground md:hidden",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                            className: "w-5 h-5"
                        }, void 0, false, {
                            fileName: "[project]/components/features/communities/GroupChat.tsx",
                            lineNumber: 75,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/features/communities/GroupChat.tsx",
                        lineNumber: 74,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
                        style: {
                            background: isNoticeboard ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                        },
                        children: isNoticeboard ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__["Megaphone"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/components/features/communities/GroupChat.tsx",
                            lineNumber: 80,
                            columnNumber: 38
                        }, this) : group.name[0].toUpperCase()
                    }, void 0, false, {
                        fileName: "[project]/components/features/communities/GroupChat.tsx",
                        lineNumber: 78,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-semibold text-sm text-foreground",
                                children: group.name
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupChat.tsx",
                                lineNumber: 83,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground",
                                children: [
                                    group.memberCount,
                                    " members"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/features/communities/GroupChat.tsx",
                                lineNumber: 84,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/features/communities/GroupChat.tsx",
                        lineNumber: 82,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1 flex-shrink-0",
                        children: [
                            !isMember && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: join,
                                className: "flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white px-2.5 py-1.5 rounded-lg font-medium transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__["LogIn"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/components/features/communities/GroupChat.tsx",
                                        lineNumber: 90,
                                        columnNumber: 29
                                    }, this),
                                    " Join"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/features/communities/GroupChat.tsx",
                                lineNumber: 88,
                                columnNumber: 25
                            }, this),
                            isMember && !amAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: leave,
                                className: "flex items-center gap-1 text-xs border border-border hover:bg-accent text-muted-foreground px-2.5 py-1.5 rounded-lg transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/components/features/communities/GroupChat.tsx",
                                        lineNumber: 96,
                                        columnNumber: 29
                                    }, this),
                                    " Leave"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/features/communities/GroupChat.tsx",
                                lineNumber: 94,
                                columnNumber: 25
                            }, this),
                            amAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowSettings(true),
                                className: "p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/components/features/communities/GroupChat.tsx",
                                    lineNumber: 102,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupChat.tsx",
                                lineNumber: 100,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/features/communities/GroupChat.tsx",
                        lineNumber: 86,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/features/communities/GroupChat.tsx",
                lineNumber: 72,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 min-h-0",
                children: [
                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: "animate-spin w-6 h-6 text-muted-foreground"
                        }, void 0, false, {
                            fileName: "[project]/components/features/communities/GroupChat.tsx",
                            lineNumber: 112,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/features/communities/GroupChat.tsx",
                        lineNumber: 111,
                        columnNumber: 21
                    }, this) : messages.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground",
                        children: [
                            isNoticeboard ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__["Megaphone"], {
                                className: "w-10 h-10 opacity-20"
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupChat.tsx",
                                lineNumber: 116,
                                columnNumber: 42
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-3xl",
                                children: "💬"
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupChat.tsx",
                                lineNumber: 116,
                                columnNumber: 91
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm",
                                children: isNoticeboard ? 'No announcements yet' : 'No messages yet — say hi! 👋'
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupChat.tsx",
                                lineNumber: 117,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/features/communities/GroupChat.tsx",
                        lineNumber: 115,
                        columnNumber: 21
                    }, this) : messages.map((msg)=>{
                        const isMine = msg.senderId === user?.id;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `flex gap-2 items-end ${isMine ? 'flex-row-reverse' : 'flex-row'}`,
                            children: [
                                !isMine && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Avatar"], {
                                    className: "h-6 w-6 flex-shrink-0 mb-0.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarImage"], {
                                            src: msg.sender?.profilePictureUrl
                                        }, void 0, false, {
                                            fileName: "[project]/components/features/communities/GroupChat.tsx",
                                            lineNumber: 126,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarFallback"], {
                                            className: "text-[9px]",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getInitials"])(msg.sender?.fullName || '?')
                                        }, void 0, false, {
                                            fileName: "[project]/components/features/communities/GroupChat.tsx",
                                            lineNumber: 127,
                                            columnNumber: 41
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/features/communities/GroupChat.tsx",
                                    lineNumber: 125,
                                    columnNumber: 37
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `max-w-[65%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`,
                                    children: [
                                        !isMine && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] text-muted-foreground font-medium px-1",
                                            children: msg.sender?.fullName
                                        }, void 0, false, {
                                            fileName: "[project]/components/features/communities/GroupChat.tsx",
                                            lineNumber: 132,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words
                                        ${isMine ? 'bg-amber-500 text-white rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm border border-border'}`,
                                            children: msg.content
                                        }, void 0, false, {
                                            fileName: "[project]/components/features/communities/GroupChat.tsx",
                                            lineNumber: 134,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] text-muted-foreground px-1",
                                            children: formatMsgTime(msg.createdAt)
                                        }, void 0, false, {
                                            fileName: "[project]/components/features/communities/GroupChat.tsx",
                                            lineNumber: 141,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/features/communities/GroupChat.tsx",
                                    lineNumber: 130,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, msg.id, true, {
                            fileName: "[project]/components/features/communities/GroupChat.tsx",
                            lineNumber: 123,
                            columnNumber: 29
                        }, this);
                    }),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: endRef
                    }, void 0, false, {
                        fileName: "[project]/components/features/communities/GroupChat.tsx",
                        lineNumber: 149,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/features/communities/GroupChat.tsx",
                lineNumber: 109,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-shrink-0 border-t border-border p-3 bg-card",
                children: !isMember ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-center gap-2 py-2 text-muted-foreground text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__["LogIn"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/components/features/communities/GroupChat.tsx",
                            lineNumber: 156,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "Join the group to participate in the conversation"
                        }, void 0, false, {
                            fileName: "[project]/components/features/communities/GroupChat.tsx",
                            lineNumber: 157,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/features/communities/GroupChat.tsx",
                    lineNumber: 155,
                    columnNumber: 21
                }, this) : !canSend ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-center gap-2 py-2 text-muted-foreground text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/components/features/communities/GroupChat.tsx",
                            lineNumber: 161,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "Only admins can send messages here"
                        }, void 0, false, {
                            fileName: "[project]/components/features/communities/GroupChat.tsx",
                            lineNumber: 162,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/features/communities/GroupChat.tsx",
                    lineNumber: 160,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSend,
                    className: "flex gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            className: "flex-1 bg-muted border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-amber-400 transition-shadow",
                            placeholder: isNoticeboard ? 'Write an announcement…' : 'Type a message…',
                            value: input,
                            onChange: (e)=>setInput(e.target.value),
                            autoFocus: true
                        }, void 0, false, {
                            fileName: "[project]/components/features/communities/GroupChat.tsx",
                            lineNumber: 166,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            disabled: !input.trim() || sending,
                            className: "w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-colors",
                            children: sending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "w-4 h-4 animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupChat.tsx",
                                lineNumber: 178,
                                columnNumber: 40
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/GroupChat.tsx",
                                lineNumber: 178,
                                columnNumber: 87
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/features/communities/GroupChat.tsx",
                            lineNumber: 173,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/features/communities/GroupChat.tsx",
                    lineNumber: 165,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/features/communities/GroupChat.tsx",
                lineNumber: 153,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/features/communities/GroupChat.tsx",
        lineNumber: 70,
        columnNumber: 9
    }, this);
}
_s(GroupChat, "QeGdrw0dqJx6TTdQ31wJWTxzv78=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hooks$2f$useGroupChat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGroupChat"]
    ];
});
_c = GroupChat;
var _c;
__turbopack_context__.k.register(_c, "GroupChat");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/features/communities/CommunitySettings.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CommunitySettings",
    ()=>CommunitySettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings-2.js [app-client] (ecmascript) <export default as Settings2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/megaphone.js [app-client] (ecmascript) <export default as Megaphone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/switch.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/avatar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/db/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/communityGroups.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/AuthContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
function CommunitySettings({ community, groups, members, onClose, onUpdated, onDeleted }) {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newGroupName, setNewGroupName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [newGroupDesc, setNewGroupDesc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [newGroupAdminsOnly, setNewGroupAdminsOnly] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [creatingGroup, setCreatingGroup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showNewGroup, setShowNewGroup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const amAdmin = community.creatorId === user?.id || members.some((m)=>m.userId === user?.id && m.role === 'admin');
    async function handleRemoveMember(userId) {
        if (!confirm('Remove this member from the community?')) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_members').delete().eq('community_id', community.id).eq('user_id', userId);
        onUpdated();
    }
    async function handlePromoteMember(userId) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_members').update({
            role: 'admin'
        }).eq('community_id', community.id).eq('user_id', userId);
        onUpdated();
    }
    async function handleDemoteMember(userId) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_members').update({
            role: 'member'
        }).eq('community_id', community.id).eq('user_id', userId);
        onUpdated();
    }
    async function createGroup() {
        if (!newGroupName.trim() || !user) return;
        setCreatingGroup(true);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createCommunityGroup"])({
                communityId: community.id,
                name: newGroupName.trim(),
                description: newGroupDesc.trim() || undefined,
                type: 'group',
                sendPermission: newGroupAdminsOnly ? 'admins_only' : 'all_members',
                createdBy: user.id
            });
            // Add creator as admin of new group
            const { data: newGrp } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_groups').select('id').eq('community_id', community.id).eq('name', newGroupName.trim()).order('created_at', {
                ascending: false
            }).limit(1).single();
            if (newGrp) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_group_members').insert([
                    {
                        group_id: newGrp.id,
                        user_id: user.id,
                        role: 'admin'
                    }
                ]).maybeSingle();
            }
            setNewGroupName('');
            setNewGroupDesc('');
            setNewGroupAdminsOnly(false);
            setShowNewGroup(false);
            onUpdated();
        } finally{
            setCreatingGroup(false);
        }
    }
    async function deleteCommunity() {
        if (!confirm('Delete this entire community? This action cannot be undone.')) return;
        setSaving(true);
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('communities').delete().eq('id', community.id);
        setSaving(false);
        onDeleted(); // clear page state + refresh list
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between p-4 border-b border-border flex-shrink-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__["Settings2"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                lineNumber: 108,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "font-semibold text-sm",
                                children: "Community Settings"
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                lineNumber: 109,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                        lineNumber: 107,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onClose,
                        className: "p-1 rounded hover:bg-accent transition-colors",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                            lineNumber: 112,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                        lineNumber: 111,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                lineNumber: 106,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto p-4 space-y-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-semibold uppercase text-muted-foreground tracking-wider",
                                children: "Community"
                            }, void 0, false, {
                                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                lineNumber: 119,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 rounded-lg border border-border bg-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-semibold text-foreground",
                                        children: community.name
                                    }, void 0, false, {
                                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                        lineNumber: 121,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground mt-0.5",
                                        children: community.description || 'No description'
                                    }, void 0, false, {
                                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                        lineNumber: 122,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 mt-2",
                                        children: [
                                            community.isPublic ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                variant: "secondary",
                                                className: "text-[10px] gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                        className: "w-2.5 h-2.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                        lineNumber: 125,
                                                        columnNumber: 92
                                                    }, this),
                                                    "Public"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                lineNumber: 125,
                                                columnNumber: 35
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                variant: "outline",
                                                className: "text-[10px] gap-1 border-yellow-300 text-yellow-700",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                                        className: "w-2.5 h-2.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                        lineNumber: 126,
                                                        columnNumber: 124
                                                    }, this),
                                                    "Private"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                lineNumber: 126,
                                                columnNumber: 35
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                variant: "outline",
                                                className: "text-[10px] gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                        className: "w-2.5 h-2.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                        lineNumber: 128,
                                                        columnNumber: 84
                                                    }, this),
                                                    community.memberCount,
                                                    " members"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                lineNumber: 128,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                        lineNumber: 123,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                lineNumber: 120,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                        lineNumber: 118,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xs font-semibold uppercase text-muted-foreground tracking-wider",
                                        children: "Groups"
                                    }, void 0, false, {
                                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                        lineNumber: 136,
                                        columnNumber: 25
                                    }, this),
                                    amAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowNewGroup((v)=>!v),
                                        className: "text-xs text-amber-500 hover:text-amber-600 font-medium flex items-center gap-1 transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                className: "w-3.5 h-3.5"
                                            }, void 0, false, {
                                                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                lineNumber: 140,
                                                columnNumber: 33
                                            }, this),
                                            " New Group"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                        lineNumber: 138,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                lineNumber: 135,
                                columnNumber: 21
                            }, this),
                            showNewGroup && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                        value: newGroupName,
                                        onChange: (e)=>setNewGroupName(e.target.value),
                                        placeholder: "Group name",
                                        className: "h-8 text-sm"
                                    }, void 0, false, {
                                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                        lineNumber: 147,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                        value: newGroupDesc,
                                        onChange: (e)=>setNewGroupDesc(e.target.value),
                                        placeholder: "Description (optional)",
                                        className: "h-8 text-sm"
                                    }, void 0, false, {
                                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                        lineNumber: 148,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Switch"], {
                                                id: "ng-admins",
                                                checked: newGroupAdminsOnly,
                                                onCheckedChange: setNewGroupAdminsOnly
                                            }, void 0, false, {
                                                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                lineNumber: 150,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                htmlFor: "ng-admins",
                                                className: "text-xs cursor-pointer",
                                                children: "Admins only can send"
                                            }, void 0, false, {
                                                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                lineNumber: 151,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                        lineNumber: 149,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                size: "sm",
                                                className: "h-7 text-xs",
                                                onClick: createGroup,
                                                disabled: creatingGroup || !newGroupName.trim(),
                                                children: creatingGroup ? 'Creating…' : 'Create'
                                            }, void 0, false, {
                                                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                lineNumber: 154,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                size: "sm",
                                                variant: "ghost",
                                                className: "h-7 text-xs",
                                                onClick: ()=>setShowNewGroup(false),
                                                children: "Cancel"
                                            }, void 0, false, {
                                                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                lineNumber: 157,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                        lineNumber: 153,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                lineNumber: 146,
                                columnNumber: 25
                            }, this),
                            groups.map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2.5 p-2 rounded-lg border border-border bg-card",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0
                                ${g.type === 'notice_board' ? 'bg-amber-500' : 'bg-indigo-500'}`,
                                            children: g.type === 'notice_board' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__["Megaphone"], {
                                                className: "w-3.5 h-3.5"
                                            }, void 0, false, {
                                                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                lineNumber: 166,
                                                columnNumber: 62
                                            }, this) : g.name[0].toUpperCase()
                                        }, void 0, false, {
                                            fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                            lineNumber: 164,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-medium truncate",
                                                    children: g.name
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                    lineNumber: 169,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-muted-foreground",
                                                    children: [
                                                        g.memberCount,
                                                        " members · ",
                                                        g.sendPermission === 'admins_only' ? 'Admins only' : 'All members',
                                                        " can send"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                    lineNumber: 170,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                            lineNumber: 168,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, g.id, true, {
                                    fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                    lineNumber: 163,
                                    columnNumber: 25
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                        lineNumber: 134,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-semibold uppercase text-muted-foreground tracking-wider",
                                children: [
                                    "Members (",
                                    members.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                lineNumber: 178,
                                columnNumber: 21
                            }, this),
                            members.map((m)=>{
                                const isCreator = m.userId === community.creatorId;
                                const isMe = m.userId === user?.id;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2.5 py-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Avatar"], {
                                            className: "h-7 w-7 flex-shrink-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarImage"], {
                                                    src: m.user?.profilePictureUrl
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                    lineNumber: 185,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarFallback"], {
                                                    className: "text-[9px]",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getInitials"])(m.user?.fullName || '?')
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                    lineNumber: 186,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                            lineNumber: 184,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-medium truncate",
                                                    children: [
                                                        m.user?.fullName,
                                                        " ",
                                                        isMe && '(you)'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                    lineNumber: 189,
                                                    columnNumber: 37
                                                }, this),
                                                m.role === 'admin' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: "outline",
                                                    className: "text-[9px] h-3.5 border-amber-300 text-amber-600",
                                                    children: "Admin"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                    lineNumber: 190,
                                                    columnNumber: 60
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                            lineNumber: 188,
                                            columnNumber: 33
                                        }, this),
                                        amAdmin && !isMe && !isCreator && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>m.role === 'admin' ? handleDemoteMember(m.userId) : handlePromoteMember(m.userId),
                                                    className: "text-[10px] text-amber-600 hover:underline",
                                                    children: m.role === 'admin' ? 'Demote' : 'Make admin'
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                    lineNumber: 194,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-muted-foreground",
                                                    children: "·"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                    lineNumber: 198,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleRemoveMember(m.userId),
                                                    className: "text-[10px] text-red-500 hover:underline",
                                                    children: "Remove"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                                    lineNumber: 199,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                            lineNumber: 193,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, m.id, true, {
                                    fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                    lineNumber: 183,
                                    columnNumber: 29
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                        lineNumber: 177,
                        columnNumber: 17
                    }, this),
                    community.creatorId === user?.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pt-2 border-t border-red-200 dark:border-red-900",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "destructive",
                            size: "sm",
                            className: "w-full",
                            onClick: deleteCommunity,
                            disabled: saving,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                    className: "w-3.5 h-3.5 mr-1.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                                    lineNumber: 212,
                                    columnNumber: 29
                                }, this),
                                " Delete Community"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                            lineNumber: 211,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                        lineNumber: 210,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/features/communities/CommunitySettings.tsx",
                lineNumber: 116,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/features/communities/CommunitySettings.tsx",
        lineNumber: 104,
        columnNumber: 9
    }, this);
}
_s(CommunitySettings, "lrkyvYmeprC057Nfcw1LlMCSK6s=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = CommunitySettings;
var _c;
__turbopack_context__.k.register(_c, "CommunitySettings");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(dashboard)/communities/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CommunitiesPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-plus.js [app-client] (ecmascript) <export default as PlusCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/megaphone.js [app-client] (ecmascript) <export default as Megaphone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings-2.js [app-client] (ecmascript) <export default as Settings2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-plus.js [app-client] (ecmascript) <export default as UserPlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/db/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/communities.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/communityGroups.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$features$2f$communities$2f$GroupChat$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/features/communities/GroupChat.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$features$2f$communities$2f$CommunitySettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/features/communities/CommunitySettings.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
function CommunitiesPage() {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    // Panel state (mobile-friendly: only one panel visible at a time)
    const [panel, setPanel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('communities');
    // Data
    const [allCommunities, setAllCommunities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [myCommunities, setMyCommunities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [discoverList, setDiscoverList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('mine');
    const [loadingComm, setLoadingComm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Selected state
    const [selectedCommunity, setSelectedCommunity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [communityGroups, setCommunityGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [communityMembers, setCommunityMembers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loadingGroups, setLoadingGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showCommSettings, setShowCommSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Selected group for chat
    const [selectedGroup, setSelectedGroup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Community membership tracking
    const [myMemberships, setMyMemberships] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [joiningId, setJoiningId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchCommunities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CommunitiesPage.useCallback[fetchCommunities]": async ()=>{
            if (!user) return;
            setLoadingComm(true);
            try {
                // Get all communities
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCommunities"])({
                    limit: 50
                });
                setAllCommunities(result.data);
                // Get my memberships
                const { data: myMems } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_members').select('community_id').eq('user_id', user.id);
                const ids = new Set((myMems || []).map({
                    "CommunitiesPage.useCallback[fetchCommunities]": (m)=>m.community_id
                }["CommunitiesPage.useCallback[fetchCommunities]"]));
                setMyMemberships(ids);
                // Split
                const mine = result.data.filter({
                    "CommunitiesPage.useCallback[fetchCommunities].mine": (c)=>ids.has(c.id)
                }["CommunitiesPage.useCallback[fetchCommunities].mine"]);
                const discover = result.data.filter({
                    "CommunitiesPage.useCallback[fetchCommunities].discover": (c)=>!ids.has(c.id)
                }["CommunitiesPage.useCallback[fetchCommunities].discover"]);
                setMyCommunities(mine);
                setDiscoverList(discover);
            } finally{
                setLoadingComm(false);
            }
        }
    }["CommunitiesPage.useCallback[fetchCommunities]"], [
        user
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CommunitiesPage.useEffect": ()=>{
            fetchCommunities();
        }
    }["CommunitiesPage.useEffect"], [
        fetchCommunities
    ]);
    const selectCommunity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CommunitiesPage.useCallback[selectCommunity]": async (community)=>{
            setSelectedCommunity(community);
            setSelectedGroup(null);
            setShowCommSettings(false);
            setPanel('groups');
            setLoadingGroups(true);
            try {
                const [groups, members] = await Promise.all([
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCommunityGroups"])(community.id),
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCommunityMembers"])(community.id)
                ]);
                setCommunityGroups(groups);
                setCommunityMembers(members);
                // Auto-select notice board
                const nb = groups.find({
                    "CommunitiesPage.useCallback[selectCommunity].nb": (g)=>g.type === 'notice_board'
                }["CommunitiesPage.useCallback[selectCommunity].nb"]);
                if (nb) {
                    setSelectedGroup(nb);
                // We do NOT setPanel('chat') here so mobile users see the groups list first.
                // Desktop users will still see the chat on the right panel automatically.
                }
            } finally{
                setLoadingGroups(false);
            }
        }
    }["CommunitiesPage.useCallback[selectCommunity]"], []);
    const selectGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CommunitiesPage.useCallback[selectGroup]": (group)=>{
            setSelectedGroup(group);
            setShowCommSettings(false);
            setPanel('chat');
        }
    }["CommunitiesPage.useCallback[selectGroup]"], []);
    const joinCommunity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CommunitiesPage.useCallback[joinCommunity]": async (community)=>{
            if (!user) return;
            setJoiningId(community.id);
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_members').insert([
                    {
                        community_id: community.id,
                        user_id: user.id,
                        role: 'member'
                    }
                ]).maybeSingle();
                // Also join all groups
                const groups = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCommunityGroups"])(community.id);
                for (const g of groups){
                    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].from('community_group_members').insert([
                        {
                            group_id: g.id,
                            user_id: user.id,
                            role: 'member'
                        }
                    ]).maybeSingle();
                }
                await fetchCommunities();
                selectCommunity(community);
            } finally{
                setJoiningId(null);
            }
        }
    }["CommunitiesPage.useCallback[joinCommunity]"], [
        user,
        fetchCommunities,
        selectCommunity
    ]);
    const refreshCommunityData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CommunitiesPage.useCallback[refreshCommunityData]": async ()=>{
            if (!selectedCommunity) return;
            const [groups, members] = await Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communityGroups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCommunityGroups"])(selectedCommunity.id),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$communities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCommunityMembers"])(selectedCommunity.id)
            ]);
            setCommunityGroups(groups);
            setCommunityMembers(members);
            await fetchCommunities();
        }
    }["CommunitiesPage.useCallback[refreshCommunityData]"], [
        selectedCommunity,
        fetchCommunities
    ]);
    // Called after community is deleted — clears all selected state and refreshes list
    const handleCommunityDeleted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CommunitiesPage.useCallback[handleCommunityDeleted]": async ()=>{
            setSelectedCommunity(null);
            setSelectedGroup(null);
            setCommunityGroups([]);
            setCommunityMembers([]);
            setShowCommSettings(false);
            setPanel('communities');
            await fetchCommunities();
        }
    }["CommunitiesPage.useCallback[handleCommunityDeleted]"], [
        fetchCommunities
    ]);
    const listToShow = tab === 'mine' ? myCommunities : discoverList;
    const filtered = listToShow.filter((c)=>!search || c.name.toLowerCase().includes(search.toLowerCase()));
    const isMember = selectedCommunity ? myMemberships.has(selectedCommunity.id) : false;
    const isAdmin = selectedCommunity ? selectedCommunity.creatorId === user?.id || communityMembers.some((m)=>m.userId === user?.id && m.role === 'admin') : false;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-[calc(100vh-120px)] gap-0 rounded-xl overflow-hidden border border-border bg-card shadow-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `
                w-full md:w-[260px] flex-shrink-0 flex flex-col border-r border-border bg-card
                ${panel !== 'communities' ? 'hidden md:flex' : 'flex'}
            `,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-3 border-b border-border flex-shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "font-bold text-base",
                                        children: "Communities"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                        lineNumber: 184,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        asChild: true,
                                        size: "sm",
                                        variant: "ghost",
                                        className: "h-7 px-2 text-amber-500 hover:text-amber-600",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/communities/create",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__["PlusCircle"], {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                                lineNumber: 186,
                                                columnNumber: 62
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                            lineNumber: 186,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                        lineNumber: 185,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                lineNumber: 183,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-1 mb-2",
                                children: [
                                    'mine',
                                    'discover'
                                ].map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setTab(t),
                                        className: `flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors
                                    ${tab === t ? 'bg-amber-500 text-white' : 'hover:bg-accent text-muted-foreground'}`,
                                        children: t === 'mine' ? 'My Communities' : 'Discover'
                                    }, t, false, {
                                        fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                        lineNumber: 192,
                                        columnNumber: 29
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                lineNumber: 190,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                        className: "w-3.5 h-3.5 text-muted-foreground flex-shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                        lineNumber: 200,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        className: "flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground",
                                        placeholder: "Search…",
                                        value: search,
                                        onChange: (e)=>setSearch(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                        lineNumber: 201,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                lineNumber: 199,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/communities/page.tsx",
                        lineNumber: 182,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto p-1.5",
                        children: loadingComm ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-center py-8",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "animate-spin w-5 h-5 text-muted-foreground"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                lineNumber: 213,
                                columnNumber: 67
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                            lineNumber: 213,
                            columnNumber: 25
                        }, this) : filtered.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center py-10 text-muted-foreground",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                    className: "w-8 h-8 mx-auto mb-2 opacity-30"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                    lineNumber: 216,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs",
                                    children: tab === 'mine' ? 'Not in any community yet' : 'No communities to discover'
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                    lineNumber: 217,
                                    columnNumber: 29
                                }, this),
                                tab === 'mine' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setTab('discover'),
                                    className: "mt-1 text-xs text-amber-500 hover:underline",
                                    children: "Browse communities"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                    lineNumber: 219,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                            lineNumber: 215,
                            columnNumber: 25
                        }, this) : filtered.map((community)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>selectCommunity(community),
                                className: `w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-colors mb-0.5
                                    ${selectedCommunity?.id === community.id ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-700' : 'hover:bg-accent border border-transparent'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm",
                                        style: {
                                            background: 'linear-gradient(135deg,#f59e0b,#d97706)'
                                        },
                                        children: community.name[0].toUpperCase()
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                        lineNumber: 232,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-foreground truncate",
                                                children: community.name
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                                lineNumber: 237,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] text-muted-foreground",
                                                children: [
                                                    community.memberCount,
                                                    " members"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                                lineNumber: 238,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                        lineNumber: 236,
                                        columnNumber: 33
                                    }, this),
                                    !myMemberships.has(community.id) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "secondary",
                                        className: "text-[9px] shrink-0",
                                        children: "Join"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                        lineNumber: 241,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, community.id, true, {
                                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                lineNumber: 224,
                                columnNumber: 29
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/communities/page.tsx",
                        lineNumber: 211,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                lineNumber: 177,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `
                w-full md:w-[240px] flex-shrink-0 flex flex-col border-r border-border bg-background/50
                ${panel === 'groups' ? 'flex' : panel === 'communities' ? 'hidden md:flex' : 'hidden md:flex'}
            `,
                children: !selectedCommunity ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                            className: "w-10 h-10 opacity-20"
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                            lineNumber: 258,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-center",
                            children: "Select a community to see its groups"
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                            lineNumber: 259,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                    lineNumber: 257,
                    columnNumber: 21
                }, this) : showCommSettings ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$features$2f$communities$2f$CommunitySettings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CommunitySettings"], {
                    community: selectedCommunity,
                    groups: communityGroups,
                    members: communityMembers,
                    onClose: ()=>setShowCommSettings(false),
                    onUpdated: refreshCommunityData,
                    onDeleted: handleCommunityDeleted
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                    lineNumber: 262,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-3 border-b border-border flex-shrink-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setSelectedCommunity(null);
                                                setPanel('communities');
                                            },
                                            className: "p-1 rounded hover:bg-accent transition-colors text-muted-foreground md:hidden",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                                lineNumber: 277,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                            lineNumber: 275,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
                                            style: {
                                                background: 'linear-gradient(135deg,#f59e0b,#d97706)'
                                            },
                                            children: selectedCommunity.name[0].toUpperCase()
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                            lineNumber: 279,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-semibold truncate",
                                                    children: selectedCommunity.name
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                                    lineNumber: 284,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-muted-foreground",
                                                    children: [
                                                        selectedCommunity.memberCount,
                                                        " members"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                                    lineNumber: 285,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                            lineNumber: 283,
                                            columnNumber: 33
                                        }, this),
                                        isAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setShowCommSettings(true);
                                                setPanel('groups');
                                            },
                                            className: "p-1 rounded hover:bg-accent transition-colors text-muted-foreground flex-shrink-0",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__["Settings2"], {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                                lineNumber: 290,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                            lineNumber: 288,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                    lineNumber: 274,
                                    columnNumber: 29
                                }, this),
                                !isMember && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>joinCommunity(selectedCommunity),
                                    disabled: joiningId === selectedCommunity.id,
                                    className: "mt-2 w-full flex items-center justify-center gap-1.5 text-xs bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-lg font-medium transition-colors disabled:opacity-60",
                                    children: [
                                        joiningId === selectedCommunity.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                            className: "w-3 h-3 animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                            lineNumber: 302,
                                            columnNumber: 43
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__["UserPlus"], {
                                            className: "w-3.5 h-3.5"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                            lineNumber: 303,
                                            columnNumber: 43
                                        }, this),
                                        joiningId === selectedCommunity.id ? 'Joining…' : 'Join Community'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                    lineNumber: 297,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                            lineNumber: 273,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-3 py-2 border-b border-border flex-shrink-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1.5 mb-1",
                                    children: [
                                        selectedCommunity.isPublic ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                    className: "w-3 h-3 text-muted-foreground"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                                    lineNumber: 313,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] text-muted-foreground",
                                                    children: "Public community"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                                    lineNumber: 313,
                                                    columnNumber: 92
                                                }, this)
                                            ]
                                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                                    className: "w-3 h-3 text-muted-foreground"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                                    lineNumber: 314,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] text-muted-foreground",
                                                    children: "Private community"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                                    lineNumber: 314,
                                                    columnNumber: 91
                                                }, this)
                                            ]
                                        }, void 0, true),
                                        isMember && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-muted-foreground",
                                                    children: "·"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                                    lineNumber: 316,
                                                    columnNumber: 48
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                    className: "w-3 h-3 text-green-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                                    lineNumber: 316,
                                                    columnNumber: 96
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] text-green-600 dark:text-green-400",
                                                    children: "Joined"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                                    lineNumber: 316,
                                                    columnNumber: 140
                                                }, this)
                                            ]
                                        }, void 0, true)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                    lineNumber: 311,
                                    columnNumber: 29
                                }, this),
                                selectedCommunity.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[11px] text-muted-foreground line-clamp-2",
                                    children: selectedCommunity.description
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                    lineNumber: 319,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                            lineNumber: 310,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 overflow-y-auto p-2",
                            children: loadingGroups ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-center py-6",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    className: "animate-spin w-5 h-5 text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                    lineNumber: 326,
                                    columnNumber: 75
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                lineNumber: 326,
                                columnNumber: 33
                            }, this) : communityGroups.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center text-xs text-muted-foreground py-8",
                                children: "No groups yet"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                lineNumber: 328,
                                columnNumber: 33
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    communityGroups.filter((g)=>g.type === 'notice_board').map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GroupItem, {
                                            group: g,
                                            isSelected: selectedGroup?.id === g.id,
                                            onClick: ()=>selectGroup(g)
                                        }, g.id, false, {
                                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                            lineNumber: 333,
                                            columnNumber: 41
                                        }, this)),
                                    communityGroups.filter((g)=>g.type === 'group').length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[9px] font-bold uppercase text-muted-foreground tracking-wider px-2 mt-3 mb-1",
                                                children: "Groups"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                                lineNumber: 337,
                                                columnNumber: 45
                                            }, this),
                                            communityGroups.filter((g)=>g.type === 'group').map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GroupItem, {
                                                    group: g,
                                                    isSelected: selectedGroup?.id === g.id,
                                                    onClick: ()=>selectGroup(g)
                                                }, g.id, false, {
                                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                                    lineNumber: 339,
                                                    columnNumber: 49
                                                }, this))
                                        ]
                                    }, void 0, true)
                                ]
                            }, void 0, true)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                            lineNumber: 324,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                lineNumber: 252,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `
                flex-1 flex flex-col min-w-0
                ${panel === 'chat' ? 'flex' : 'hidden md:flex'}
            `,
                children: selectedGroup && selectedCommunity ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$features$2f$communities$2f$GroupChat$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GroupChat"], {
                    group: selectedGroup,
                    communityId: selectedCommunity.id,
                    communityCreatorId: selectedCommunity.creatorId,
                    onBack: ()=>setPanel('groups')
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                    lineNumber: 358,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground p-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-20 h-20 rounded-3xl flex items-center justify-center",
                            style: {
                                background: 'linear-gradient(135deg,#f59e0b20,#d97706)'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__["Megaphone"], {
                                className: "w-9 h-9 text-amber-500"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                lineNumber: 367,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                            lineNumber: 366,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-semibold text-base text-foreground mb-1",
                                    children: "Communities"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                    lineNumber: 370,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm",
                                    children: "Select a community and group to start chatting"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                    lineNumber: 371,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                            lineNumber: 369,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            asChild: true,
                            variant: "outline",
                            size: "sm",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/communities/create",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__["PlusCircle"], {
                                        className: "w-4 h-4 mr-1.5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                        lineNumber: 374,
                                        columnNumber: 62
                                    }, this),
                                    "Create Community"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                                lineNumber: 374,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/communities/page.tsx",
                            lineNumber: 373,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                    lineNumber: 365,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                lineNumber: 353,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/communities/page.tsx",
        lineNumber: 172,
        columnNumber: 9
    }, this);
}
_s(CommunitiesPage, "86FHjk5A+7T84FVyQuKQtsTHmpo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = CommunitiesPage;
function GroupItem({ group, isSelected, onClick }) {
    const isNoticeboard = group.type === 'notice_board';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        className: `w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left transition-colors mb-0.5
                ${isSelected ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-700' : 'hover:bg-accent border border-transparent'}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0
                ${isNoticeboard ? 'bg-amber-500' : 'bg-indigo-500'}`,
                children: isNoticeboard ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__["Megaphone"], {
                    className: "w-3.5 h-3.5"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/communities/page.tsx",
                    lineNumber: 396,
                    columnNumber: 34
                }, this) : group.name[0].toUpperCase()
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                lineNumber: 394,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-semibold text-foreground truncate",
                        children: group.name
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/communities/page.tsx",
                        lineNumber: 399,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[10px] text-muted-foreground",
                        children: [
                            group.memberCount,
                            " members · ",
                            group.sendPermission === 'admins_only' ? '🔒 Admins only' : '👥 All members'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/communities/page.tsx",
                        lineNumber: 400,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                lineNumber: 398,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                className: "w-3.5 h-3.5 text-muted-foreground flex-shrink-0"
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/communities/page.tsx",
                lineNumber: 404,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/communities/page.tsx",
        lineNumber: 386,
        columnNumber: 9
    }, this);
}
_c1 = GroupItem;
var _c, _c1;
__turbopack_context__.k.register(_c, "CommunitiesPage");
__turbopack_context__.k.register(_c1, "GroupItem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_33163fee._.js.map