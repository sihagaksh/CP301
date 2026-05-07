import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getUserById } from '@/lib/db/users';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client — bypasses RLS, used only for admin operations
function getAdminClient() {
    return createClient(supabaseUrl, supabaseServiceKey);
}

// Helper: get the calling user from the request header
async function getCallerUser(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    
    const adminDb = getAdminClient();
    const { data: { user } } = await adminDb.auth.getUser(token);
    if (!user) return null;
    
    return getUserById(user.id);
}

export async function POST(req: NextRequest) {
    try {
        const caller = await getCallerUser(req);
        if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!caller.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { requestIds, status } = await req.json();

        if (!requestIds || !Array.isArray(requestIds) || !status) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        if (status !== 'approved' && status !== 'rejected') {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const adminDb = getAdminClient();

        // 1. Fetch the requests to get the users and new emails before we resolve them
        const { data: requests, error: fetchError } = await adminDb
            .from('alumni_requests')
            .select('id, user_id, personal_email')
            .in('id', requestIds)
            .eq('status', 'pending');

        if (fetchError) {
            throw fetchError;
        }

        if (!requests || requests.length === 0) {
            return NextResponse.json({ success: true, message: 'No valid pending requests found' });
        }

        // 2. Call the RPC to update the requests in the DB
        const { error: rpcError } = await adminDb.rpc('bulk_resolve_alumni_requests', {
            p_request_ids: requestIds,
            p_new_status: status,
            p_admin_id: caller.id
        });

        if (rpcError) {
            throw rpcError;
        }

        // 3. If approved, update role, email, and clean up org data
        if (status === 'approved') {
            for (const req of requests) {
                console.log(`[Alumni Approval] Processing user ${req.user_id} → ${req.personal_email}`);

                // 3a. Update role+email via SECURITY DEFINER RPC (bypasses RLS entirely)
                const { error: userUpdateError, data: updatedUser } = await adminDb
                    .rpc('promote_user_to_alumni', {
                        p_user_id: req.user_id,
                        p_new_email: req.personal_email,
                        p_admin_id: caller.id
                    });

                if (userUpdateError) {
                    console.error(`[Alumni Approval] FAILED to promote user ${req.user_id}:`, userUpdateError);
                    throw new Error(`Failed to update user role: ${userUpdateError.message}`);
                }
                console.log(`[Alumni Approval] Role updated via RPC:`, updatedUser);

                // 3b. Update Supabase Auth email (force, no re-verification needed)
                const { error: authUpdateError } = await adminDb.auth.admin.updateUserById(req.user_id, {
                    email: req.personal_email,
                    email_confirm: true
                });

                if (authUpdateError) {
                    console.error(`[Alumni Approval] FAILED to update Auth email for ${req.user_id}:`, authUpdateError);
                    // Non-fatal — DB role already updated, log and continue
                } else {
                    console.log(`[Alumni Approval] Auth email updated for ${req.user_id}`);
                }

                // 3c. Remove all org memberships
                const { error: memberDeleteError } = await adminDb
                    .from('org_members')
                    .delete()
                    .eq('user_id', req.user_id);

                if (memberDeleteError) {
                    console.error(`[Alumni Approval] Failed to remove org memberships for ${req.user_id}:`, memberDeleteError.message);
                }

                // 3d. Deactivate all active PORs
                const { error: porUpdateError } = await adminDb
                    .from('user_positions')
                    .update({ is_active: false })
                    .eq('user_id', req.user_id)
                    .eq('is_active', true);

                if (porUpdateError) {
                    console.error(`[Alumni Approval] Failed to deactivate PORs for ${req.user_id}:`, porUpdateError.message);
                }

                console.log(`[Alumni Approval] Done for user ${req.user_id}`);
            }
        }

        return NextResponse.json({ success: true, message: `Requests marked as ${status}` });

    } catch (err: any) {
        console.error('Admin Alumni Requests Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const caller = await getCallerUser(req);
        if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!caller.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const adminDb = getAdminClient();

        const { data, error } = await adminDb
            .from('alumni_requests')
            .select(`
                id,
                user_id,
                personal_email,
                status,
                created_at,
                resolved_at,
                user:users(id, email, full_name, role, department, batch)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Normalize the joined user object to camelCase since Supabase returns snake_case
        const normalizedData = (data || []).map((req: any) => {
            const rawUser = Array.isArray(req.user) ? req.user[0] : req.user;
            const mappedUser = rawUser ? {
                id: rawUser.id,
                email: rawUser.email,
                fullName: rawUser.full_name,
                role: rawUser.role,
                department: rawUser.department,
                batch: rawUser.batch
            } : null;

            return {
                id: req.id,
                userId: req.user_id,
                personalEmail: req.personal_email,
                status: req.status,
                createdAt: req.created_at,
                resolvedAt: req.resolved_at,
                user: mappedUser
            };
        });

        return NextResponse.json({ data: normalizedData });

    } catch (err: any) {
        console.error('Admin Fetch Alumni Requests Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
