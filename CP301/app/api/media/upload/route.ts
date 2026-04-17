import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type UploadKind = 'mess-menu-document';

type MessMenuUploadContext = {
    month?: number;
    year?: number;
};

const MAX_MESS_MENU_DOCUMENT_BYTES = 10 * 1024 * 1024;
const MESS_MENU_BUCKET = 'mess-menus';
const ALLOWED_MESS_MENU_MIME_TYPES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
]);

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

function getServiceClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured.');
    }

    if (!key || key === 'your-service-role-key') {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
    }

    return createClient(url, key, {
        auth: { persistSession: false },
    });
}

function isValidMonth(value: unknown): value is number {
    return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 12;
}

function isValidYear(value: unknown): value is number {
    return Number.isInteger(value) && Number(value) >= 2000 && Number(value) <= 2100;
}

function parseContext(value: FormDataEntryValue | null): MessMenuUploadContext {
    if (typeof value !== 'string' || !value.trim()) return {};

    try {
        const parsed = JSON.parse(value);
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
        return {};
    }
}

async function ensurePublicBucket(serviceClient: ReturnType<typeof getServiceClient>, bucket: string) {
    const { error: getError } = await serviceClient.storage.getBucket(bucket);
    if (!getError) return;

    const { error: createError } = await serviceClient.storage.createBucket(bucket, {
        public: true,
    });

    if (createError && !createError.message.toLowerCase().includes('already exists')) {
        throw new Error(`Failed to prepare storage bucket: ${createError.message}`);
    }
}

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const accessToken = authHeader.slice(7);
        const serviceClient = getServiceClient();
        const { data: authData, error: authError } = await serviceClient.auth.getUser(accessToken);
        const authUser = authData.user;

        if (authError || !authUser) {
            return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
        }

        const { data: profile, error: profileError } = await serviceClient
            .from('users')
            .select('is_admin')
            .eq('id', authUser.id)
            .single();

        if (profileError || !profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden: admin access required.' }, { status: 403 });
        }

        const formData = await request.formData();
        const kind = formData.get('kind') as UploadKind | null;
        const file = formData.get('file') as File | null;
        const context = parseContext(formData.get('context'));

        if (kind !== 'mess-menu-document') {
            return NextResponse.json({ error: 'Unsupported upload kind.' }, { status: 400 });
        }

        if (!file) {
            return NextResponse.json({ error: 'Missing upload file.' }, { status: 400 });
        }

        if (!isValidMonth(context.month) || !isValidYear(context.year)) {
            return NextResponse.json({ error: 'Invalid mess menu month or year.' }, { status: 400 });
        }

        if (!ALLOWED_MESS_MENU_MIME_TYPES.has(file.type)) {
            return NextResponse.json({ error: 'Only PDF, PNG, JPEG, or WebP files are allowed.' }, { status: 400 });
        }

        if (file.size > MAX_MESS_MENU_DOCUMENT_BYTES) {
            return NextResponse.json({ error: 'Mess menu document must be 10 MB or smaller.' }, { status: 400 });
        }

        await ensurePublicBucket(serviceClient, MESS_MENU_BUCKET);

        const extension = EXTENSION_BY_MIME_TYPE[file.type] ?? 'bin';
        const path = `${context.year}/${context.month}/original-${Date.now()}.${extension}`;
        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await serviceClient.storage
            .from(MESS_MENU_BUCKET)
            .upload(path, arrayBuffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        const { data: urlData } = serviceClient.storage.from(MESS_MENU_BUCKET).getPublicUrl(path);

        return NextResponse.json({
            bucket: MESS_MENU_BUCKET,
            path,
            publicUrl: urlData.publicUrl,
            kind,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
