module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/(dashboard)/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/(dashboard)/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/lib/utils.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "formatDate",
    ()=>formatDate,
    "formatDateTime",
    ()=>formatDateTime,
    "formatPrice",
    ()=>formatPrice,
    "generateSlug",
    ()=>generateSlug,
    "getBlogCategoryLabel",
    ()=>getBlogCategoryLabel,
    "getConditionColor",
    ()=>getConditionColor,
    "getEventTypeLabel",
    ()=>getEventTypeLabel,
    "getInitials",
    ()=>getInitials,
    "getRoleColor",
    ()=>getRoleColor,
    "isValidUrl",
    ()=>isValidUrl,
    "timeAgo",
    ()=>timeAgo,
    "truncate",
    ()=>truncate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-rsc] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);
}
function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}
function getInitials(fullName) {
    return fullName.split(' ').map((name)=>name[0]).join('').toUpperCase().slice(0, 2);
}
function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
function formatDateTime(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
}
function generateSlug(text) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch  {
        return false;
    }
}
function getRoleColor(role) {
    const colors = {
        student: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
        faculty: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
        staff: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
        alumni: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300',
        guest: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60'
    };
    return colors[role] || colors.guest;
}
function getBlogCategoryLabel(category) {
    const labels = {
        placement: 'Placement',
        internship: 'Internship',
        faculty_insight: 'Faculty Insight',
        alumni_experience: 'Alumni Experience',
        research: 'Research',
        general: 'General'
    };
    return labels[category] || category;
}
function getEventTypeLabel(type) {
    const labels = {
        ismp: 'ISMP',
        workshop: 'Workshop',
        seminar: 'Seminar',
        competition: 'Competition',
        cultural: 'Cultural',
        sports: 'Sports',
        esports: 'E-Sports',
        literary: 'Literary',
        club_activity: 'Club Activity',
        fest: 'Fest',
        general: 'General'
    };
    return labels[type] || type;
}
function getConditionColor(condition) {
    const colors = {
        new: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
        like_new: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
        good: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
        fair: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
        poor: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
    };
    return colors[condition] || colors.good;
}
}),
"[project]/components/layout/PageContainer.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PageContainer",
    ()=>PageContainer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-rsc] (ecmascript) <export default as ChevronLeft>");
;
;
;
;
function PageContainer({ title, description, actions, children, className, backHref }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])('space-y-6', className),
        children: [
            (title || actions || backHref) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            backHref && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                href: backHref,
                                className: "inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                        size: 16,
                                        className: "mr-1"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/PageContainer.tsx",
                                        lineNumber: 29,
                                        columnNumber: 17
                                    }, this),
                                    "Back"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/PageContainer.tsx",
                                lineNumber: 28,
                                columnNumber: 15
                            }, this),
                            title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "font-serif font-bold text-2xl md:text-3xl text-foreground",
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/components/layout/PageContainer.tsx",
                                lineNumber: 34,
                                columnNumber: 15
                            }, this),
                            description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-sm text-muted-foreground",
                                children: description
                            }, void 0, false, {
                                fileName: "[project]/components/layout/PageContainer.tsx",
                                lineNumber: 39,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/PageContainer.tsx",
                        lineNumber: 26,
                        columnNumber: 11
                    }, this),
                    actions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: actions
                    }, void 0, false, {
                        fileName: "[project]/components/layout/PageContainer.tsx",
                        lineNumber: 44,
                        columnNumber: 23
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/PageContainer.tsx",
                lineNumber: 25,
                columnNumber: 9
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/PageContainer.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/features/blogs/BlogForm.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BlogForm",
    ()=>BlogForm
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const BlogForm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call BlogForm() from the server but BlogForm is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/features/blogs/BlogForm.tsx <module evaluation>", "BlogForm");
}),
"[project]/components/features/blogs/BlogForm.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BlogForm",
    ()=>BlogForm
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const BlogForm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call BlogForm() from the server but BlogForm is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/features/blogs/BlogForm.tsx", "BlogForm");
}),
"[project]/components/features/blogs/BlogForm.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$features$2f$blogs$2f$BlogForm$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/features/blogs/BlogForm.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$features$2f$blogs$2f$BlogForm$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/features/blogs/BlogForm.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$features$2f$blogs$2f$BlogForm$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/(dashboard)/blogs/create/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CreateBlogPage,
    "metadata",
    ()=>metadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$PageContainer$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/PageContainer.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$features$2f$blogs$2f$BlogForm$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/features/blogs/BlogForm.tsx [app-rsc] (ecmascript)");
;
;
;
const metadata = {
    title: 'Publish Experience | IIT Ropar Community',
    description: 'Share your internship or placement experience with the community.'
};
function CreateBlogPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$PageContainer$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PageContainer"], {
        title: "Share Experience",
        description: "Write an article or share your interview experience.",
        backHref: "/blogs",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$features$2f$blogs$2f$BlogForm$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BlogForm"], {}, void 0, false, {
                fileName: "[project]/app/(dashboard)/blogs/create/page.tsx",
                lineNumber: 17,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/(dashboard)/blogs/create/page.tsx",
            lineNumber: 16,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/(dashboard)/blogs/create/page.tsx",
        lineNumber: 11,
        columnNumber: 9
    }, this);
}
}),
"[project]/app/(dashboard)/blogs/create/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/(dashboard)/blogs/create/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0789f24a._.js.map