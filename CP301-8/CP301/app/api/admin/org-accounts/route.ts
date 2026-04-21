// ============================================================
// app/api/admin/org-accounts/route.ts
// API route for creating and listing org accounts.
// Only callable by users with is_admin = true (super-admin).
// Uses service_role key to bypass RLS for auth.admin operations.
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getUserById } from '@/lib/db/users';

// Service role client — bypasses RLS, used only for admin operations
function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// Helper: get the calling user from the request cookie
async function getCallerUser() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll() } }
    );
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    return getUserById(session.user.id);
}

// GET — list all org accounts
export async function GET() {
    const caller = await getCallerUser();
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!caller.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const adminDb = getAdminClient();
    const { data, error } = await adminDb
        .from('users')
        .select(`
            id, email, full_name, linked_org_id, created_at,
            org:organizations!users_linked_org_id_fkey(id, name, slug, type, logo_url)
        `)
        .eq('is_org_account', true)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ accounts: data ?? [] });
}

// POST — create a new org account
export async function POST(request: Request) {
    const caller = await getCallerUser();
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!caller.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { org_id, email, display_name, password } = body;

    if (!org_id || !email || !display_name || !password) {
        return NextResponse.json(
            { error: 'Missing required fields: org_id, email, display_name, password' },
            { status: 400 }
        );
    }
    if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const adminDb = getAdminClient();

    // 1. Verify the org exists
    const { data: orgRow, error: orgError } = await adminDb
        .from('organizations')
        .select('id, name')
        .eq('id', org_id)
        .single();

    if (orgError || !orgRow) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // 2. Check that this org doesn't already have an account
    const { data: existing } = await adminDb
        .from('users')
        .select('id')
        .eq('linked_org_id', org_id)
        .eq('is_org_account', true)
        .maybeSingle();

    if (existing) {
        return NextResponse.json(
            { error: `${orgRow.name} already has an org account` },
            { status: 409 }
        );
    }

    // 3. Create Supabase auth user
    const { data: authData, error: authError } = await adminDb.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // org accounts skip email verification
    });

    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });
    if (!authData.user) return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });

    // 4. Create users profile row via SECURITY DEFINER RPC
    const { error: profileError } = await adminDb.rpc('create_org_account_profile', {
        p_id: authData.user.id,
        p_email: email,
        p_full_name: display_name,
        p_org_id: org_id,
    });

    if (profileError) {
        // Rollback auth user if profile creation fails
        await adminDb.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json(
        { userId: authData.user.id, email, org_id, org_name: orgRow.name },
        { status: 201 }
    );
}