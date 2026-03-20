module.exports = [
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/tags-manifest.external.js [external] (next/dist/server/lib/incremental-cache/tags-manifest.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/tags-manifest.external.js", () => require("next/dist/server/lib/incremental-cache/tags-manifest.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/proxy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "proxy",
    ()=>proxy
]);
// ============================================================
// proxy.ts
// Route protection and authentication proxy (formerly middleware.ts)
// ============================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [middleware] (ecmascript)");
;
// Routes that are ALWAYS public (no auth required)
const PUBLIC_PATHS = [
    '/login',
    '/signup',
    '/forgot-password'
];
// File extensions that should never be intercepted by the proxy
const STATIC_EXTENSIONS = [
    '.js',
    '.css',
    '.map',
    '.json',
    '.xml',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.webp',
    '.avif',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.otf',
    '.mp4',
    '.webm',
    '.mp3',
    '.wav',
    '.pdf',
    '.txt',
    '.html'
];
async function proxy(request) {
    const { pathname } = request.nextUrl;
    console.log(`[${new Date().toISOString()}] [Proxy] Processing: ${pathname}`);
    // ── Skip static assets completely ──
    // Check if the pathname ends with a known static extension
    const hasStaticExt = STATIC_EXTENSIONS.some((ext)=>pathname.endsWith(ext));
    if (hasStaticExt) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Also skip known Next.js internal paths and public directory paths
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/maps/') || pathname === '/favicon.ico') {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // ── Check authentication ──
    // ONLY check our explicitly-managed cookie, NOT Supabase's internal chunked cookies
    // Supabase sets its own cookies (sb-<project>-auth-token.0, .1, etc.) which persist
    // independently of actual session validity. We only trust our synced cookie.
    const authCookie = request.cookies.get('sb-auth-token');
    const isAuthenticated = !!authCookie?.value;
    console.log(`[Proxy] Auth check: sb-auth-token=${!!authCookie}, isAuthenticated=${isAuthenticated}`);
    // ── Public paths ──
    const isPublicPath = PUBLIC_PATHS.some((p)=>pathname === p || pathname.startsWith(p + '/'));
    if (isPublicPath) {
        if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/', request.url));
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // ── Legacy redirect ──
    if (pathname === '/feed') {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/', request.url));
    }
    // ── Protect all dashboard routes ──
    if (!isAuthenticated) {
        console.log(`[${new Date().toISOString()}] [Proxy] [DENIED] Protected route: ${pathname}, isAuthenticated: ${isAuthenticated}. Redirecting to /login`);
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
    }
    console.log(`[${new Date().toISOString()}] [Proxy] [ALLOWED] Path: ${pathname}, isAuthenticated: ${isAuthenticated}`);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    // Keep matcher broad — the function body handles filtering
    matcher: [
        '/((?!_next/static|_next/image).*)'
    ]
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3a9478e2._.js.map