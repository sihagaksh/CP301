import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
    return createClient(supabaseUrl, supabaseServiceKey);
}

// Helper: get the calling user from the request header
async function getSessionUser(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    
    const adminDb = getAdminClient();
    const { data: { user } } = await adminDb.auth.getUser(token);
    return user;
}

export async function POST(req: NextRequest) {
    try {
        const user = await getSessionUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { email, otp, userId } = await req.json();

        if (!email || !otp || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Ensure user is submitting for themselves
        if (user.id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const adminDb = getAdminClient();

        // Check OTP in database
        const { data: otpRecord, error: dbError } = await adminDb
            .from('email_otps')
            .select('*')
            .eq('email', email)
            .single();

        if (dbError || !otpRecord) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        if (otpRecord.otp_code !== otp) {
            return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
        }

        if (new Date(otpRecord.expires_at) < new Date()) {
            return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
        }

        // Delete the OTP record so it can't be reused
        await adminDb.from('email_otps').delete().eq('email', email);

        // Submit the alumni request
        const { data: requestRecord, error: requestError } = await adminDb
            .from('alumni_requests')
            .insert({
                user_id: userId,
                personal_email: email,
                status: 'pending'
            })
            .select('*')
            .single();

        if (requestError) {
            // Check for unique constraint violation
            if (requestError.code === '23505') {
                return NextResponse.json({ error: 'You already have a pending alumni request.' }, { status: 400 });
            }
            throw requestError;
        }

        return NextResponse.json({ success: true, data: requestRecord });
    } catch (err: any) {
        console.error('Verify OTP Route Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
