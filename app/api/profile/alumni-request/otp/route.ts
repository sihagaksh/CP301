import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import nodemailer from 'nodemailer';

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

        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        const adminDb = getAdminClient();

        // Store OTP in database
        const { error: dbError } = await adminDb
            .from('email_otps')
            .upsert({ email, otp_code: otp, expires_at: expiresAt.toISOString() });

        if (dbError) {
            console.error('Failed to store OTP:', dbError);
            return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
        }

        // Send Email via Nodemailer if SMTP config exists
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            await transporter.sendMail({
                from: `"IIT Ropar Alumni Portal" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Your Alumni Request OTP Code',
                text: `Your OTP code for the Alumni Request is: ${otp}\n\nIt expires in 15 minutes.`,
                html: `<p>Your OTP code for the Alumni Request is: <strong>${otp}</strong></p><p>It expires in 15 minutes.</p>`,
            });
        } else {
            console.warn('⚠️ SMTP credentials not found. Printing OTP to console instead:');
            console.warn(`[DEVELOPMENT ONLY] OTP for ${email} is ${otp}`);
        }

        return NextResponse.json({ success: true, message: 'OTP generated' });
    } catch (err: any) {
        console.error('OTP Route Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
