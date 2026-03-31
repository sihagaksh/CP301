// ============================================================
// proxy.ts
// Route protection and authentication proxy (formerly middleware.ts)
// ============================================================

import { type NextRequest, NextResponse } from 'next/server';

// Routes that are ALWAYS public (no auth required)
const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password'];

// Routes accessible to guest users (no Supabase account needed)
const GUEST_PATHS = ['/notices', '/events', '/map', '/mess-menu'];

// File extensions that should never be intercepted by the proxy
const STATIC_EXTENSIONS = [
    '.js', '.css', '.map', '.json', '.xml',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.avif',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    '.mp4', '.webm', '.mp3', '.wav',
    '.pdf', '.txt', '.html',
];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    console.log(`[${new Date().toISOString()}] [Proxy] Processing: ${pathname}`);

    // ── Skip static assets completely ──
    // Check if the pathname ends with a known static extension
    const hasStaticExt = STATIC_EXTENSIONS.some(ext => pathname.endsWith(ext));
    if (hasStaticExt) {
        return NextResponse.next();
    }

    // Also skip known Next.js internal paths and public directory paths
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/maps/') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // ── Check authentication ──
    const authCookie = request.cookies.get('sb-auth-token');
    const guestCookie = request.cookies.get('guest-mode');
    const isAuthenticated = !!authCookie?.value;
    const isGuest = guestCookie?.value === '1';
    console.log(`[Proxy] Auth check: sb-auth-token=${!!authCookie}, guest-mode=${isGuest}`);

    // ── Public paths ──
    const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

    if (isPublicPath) {
        if ((isAuthenticated || isGuest) && (pathname === '/login' || pathname === '/signup')) {
            return NextResponse.redirect(new URL(isGuest ? '/notices' : '/', request.url));
        }
        return NextResponse.next();
    }

    // ── Legacy redirect ──
    if (pathname === '/feed') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // ── Guest access – only allow specific paths ──
    if (isGuest && !isAuthenticated) {
        const isGuestPath = GUEST_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
        if (isGuestPath) {
            return NextResponse.next();
        }
        // Guest trying to access restricted route → redirect to /notices
        return NextResponse.redirect(new URL('/notices', request.url));
    }

    // ── Protect all dashboard routes ──
    if (!isAuthenticated) {
        console.log(`[${new Date().toISOString()}] [Proxy] [DENIED] Protected route: ${pathname}. Redirecting to /login`);
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    console.log(`[${new Date().toISOString()}] [Proxy] [ALLOWED] Path: ${pathname}, isAuthenticated: ${isAuthenticated}`);
    return NextResponse.next();
}

export const config = {
    // Keep matcher broad — the function body handles filtering
    matcher: ['/((?!_next/static|_next/image).*)'],
};
