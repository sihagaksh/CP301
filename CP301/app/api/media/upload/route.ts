import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type UploadKind = 'mess-menu-document' | 'org-icon' | 'event-cover' | 'event-poster' | 'event-venue-map' | 'notice-attachment';

type BaseUploadContext = Record<string, unknown>;

type MessMenuUploadContext = BaseUploadContext & {
    month?: number;
    year?: number;
};

type OrgIconUploadContext = BaseUploadContext & {
    orgId?: string;
};

type EventUploadContext = BaseUploadContext & {
    eventId?: string;
};

type NoticeUploadContext = BaseUploadContext & {
    noticeId?: string;
};

type UploadContextUnion = MessMenuUploadContext | OrgIconUploadContext | EventUploadContext | NoticeUploadContext;

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

type UploadConfig = {
    bucket: string;
    maxSizeBytes: number;
    allowedMimeTypes: Set<string>;
    buildPath: (context: UploadContextUnion, ext: string, userId: string) => string;
    authorize: (serviceClient: ReturnType<typeof createClient>, authUser: any, context: UploadContextUnion) => Promise<boolean>;
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

function parseContext(value: FormDataEntryValue | null): UploadContextUnion {
    if (typeof value !== 'string' || !value.trim()) return {};

    try {
        const parsed = JSON.parse(value);
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
        return {};
    }
}

async function isAdminUser(serviceClient: ReturnType<typeof createClient>, userId: string) {
    const { data: profile } = await serviceClient
        .from('users')
        .select('is_admin')
        .eq('id', userId)
        .single();
    return !!profile?.is_admin;
}

const UPLOAD_CONFIGS: Record<UploadKind, UploadConfig> = {
    'mess-menu-document': {
        bucket: 'mess-menus',
        maxSizeBytes: 10 * 1024 * 1024, // 10 MB
        allowedMimeTypes: new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
        authorize: async (serviceClient, authUser) => isAdminUser(serviceClient, authUser.id),
        buildPath: (ctx: UploadContextUnion, ext: string) => {
            const context = ctx as MessMenuUploadContext;
            if (!isValidMonth(context.month) || !isValidYear(context.year)) {
               throw new Error('Invalid mess menu month or year.');
            }
            return `${context.year}/${context.month}/original-${Date.now()}.${ext}`;
        }
    },
    'org-icon': {
        bucket: 'org-icons',
        maxSizeBytes: 2 * 1024 * 1024, // 2 MB
        allowedMimeTypes: new Set(['image/jpeg', 'image/png', 'image/webp']),
        authorize: async (serviceClient, authUser, ctx) => {
            const context = ctx as OrgIconUploadContext;
            if (await isAdminUser(serviceClient, authUser.id)) return true;
            if (!context.orgId) return false;
            const { count } = await serviceClient
                .from('user_positions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', authUser.id)
                .eq('org_id', context.orgId)
                .eq('is_active', true);
            return (count ?? 0) > 0;
        },
        buildPath: (ctx: UploadContextUnion, ext: string) => {
            const context = ctx as OrgIconUploadContext;
            return `${context.orgId || 'unknown'}/icon-${Date.now()}.${ext}`;
        }
    },
    'event-cover': {
        bucket: 'events-media',
        maxSizeBytes: 10 * 1024 * 1024,
        allowedMimeTypes: new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
        authorize: async (serviceClient, authUser, ctx) => true, // Allowed for authenticated, checking on insert
        buildPath: (ctx: UploadContextUnion, ext: string, userId: string) => {
            const context = ctx as EventUploadContext;
            return `${userId}/${context.eventId || `draft-${Date.now()}`}/cover-${Date.now()}.${ext}`;
        }
    },
    'event-poster': {
        bucket: 'events-media',
        maxSizeBytes: 10 * 1024 * 1024,
        allowedMimeTypes: new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
        authorize: async (serviceClient, authUser, ctx) => true,
        buildPath: (ctx: UploadContextUnion, ext: string, userId: string) => {
            const context = ctx as EventUploadContext;
            return `${userId}/${context.eventId || `draft-${Date.now()}`}/poster-${Date.now()}.${ext}`;
        }
    },
    'event-venue-map': {
        bucket: 'events-media',
        maxSizeBytes: 10 * 1024 * 1024,
        allowedMimeTypes: new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
        authorize: async (serviceClient, authUser, ctx) => true,
        buildPath: (ctx: UploadContextUnion, ext: string, userId: string) => {
            const context = ctx as EventUploadContext;
            return `${userId}/${context.eventId || `draft-${Date.now()}`}/venue-map-${Date.now()}.${ext}`;
        }
    },
    'notice-attachment': {
        bucket: 'notices-media',
        maxSizeBytes: 10 * 1024 * 1024,
        allowedMimeTypes: new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
        authorize: async (serviceClient, authUser, ctx) => true,
        buildPath: (ctx: UploadContextUnion, ext: string, userId: string) => {
            const context = ctx as NoticeUploadContext;
            const index = Math.floor(Math.random() * 1000);
            return `${userId}/${context.noticeId || `draft-${Date.now()}`}/${index}-${Date.now()}.${ext}`;
        }
    }
};

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

        const formData = await request.formData();
        const kind = formData.get('kind') as UploadKind | null;
        const file = formData.get('file') as File | null;
        const context = parseContext(formData.get('context'));

        if (!kind || !UPLOAD_CONFIGS[kind]) {
            return NextResponse.json({ error: 'Unsupported upload kind.' }, { status: 400 });
        }

        const config = UPLOAD_CONFIGS[kind];

        if (!file) {
            return NextResponse.json({ error: 'Missing upload file.' }, { status: 400 });
        }

        const isAuthorized = await config.authorize(serviceClient, authUser, context);
        if (!isAuthorized) {
             return NextResponse.json({ error: 'Forbidden: you do not have permission to upload this file type.' }, { status: 403 });
        }

        if (!config.allowedMimeTypes.has(file.type)) {
            return NextResponse.json({ error: 'Unsupported file type for this upload.' }, { status: 400 });
        }

        if (file.size > config.maxSizeBytes) {
            return NextResponse.json({ error: `File must be smaller than ${Math.floor(config.maxSizeBytes / 1024 / 1024)} MB.` }, { status: 400 });
        }

        await ensurePublicBucket(serviceClient, config.bucket);

        const extension = EXTENSION_BY_MIME_TYPE[file.type] ?? 'bin';
        
        let path: string;
        try {
            path = config.buildPath(context, extension, authUser.id);
        } catch (e: any) {
            return NextResponse.json({ error: e.message || 'Invalid context for upload' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await serviceClient.storage
            .from(config.bucket)
            .upload(path, arrayBuffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        const { data: urlData } = serviceClient.storage.from(config.bucket).getPublicUrl(path);

        return NextResponse.json({
            bucket: config.bucket,
            path,
            publicUrl: urlData.publicUrl,
            kind,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
