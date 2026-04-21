// app/api/admin/upload/route.ts
// Server-side upload handler using service role key — bypasses storage RLS entirely.
// Verifies the caller is an admin by decoding their Supabase JWT and checking
// the public.users table before accepting any file.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client — server only, never sent to the browser.
// Bypasses ALL RLS policies, including storage.objects.
function getServiceClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!key || key === 'your-service-role-key-here') {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
    }
    return createClient(url, key, {
        auth: { persistSession: false },
    });
}

export async function POST(request: Request) {
    try {
        // ── 1. Extract bearer token from the request ──────────────────────────
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const accessToken = authHeader.slice(7);

        // ── 2. Verify token and get user identity ─────────────────────────────
        const serviceClient = getServiceClient();
        const { data: { user: authUser }, error: authError } = await serviceClient.auth.getUser(accessToken);

        if (authError || !authUser) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        // ── 3. Check is_admin from public.users — same source the portal uses ─
        const { data: profile, error: profileError } = await serviceClient
            .from('users')
            .select('is_admin')
            .eq('id', authUser.id)
            .single();

        if (profileError || !profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
        }

        // ── 4. Parse multipart form data ──────────────────────────────────────
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const bucket = formData.get('bucket') as string | null;
        const path = formData.get('path') as string | null;

        if (!file || !bucket || !path) {
            return NextResponse.json({ error: 'Missing file, bucket, or path' }, { status: 400 });
        }

        // ── 5. Upload using service role — RLS is irrelevant here ─────────────
        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await serviceClient.storage
            .from(bucket)
            .upload(path, arrayBuffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            console.error('[/api/admin/upload] Storage error:', uploadError);
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        // ── 6. Return the public URL ──────────────────────────────────────────
        const { data: urlData } = serviceClient.storage.from(bucket).getPublicUrl(path);

        return NextResponse.json({ publicUrl: urlData.publicUrl });

    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[/api/admin/upload]', err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
