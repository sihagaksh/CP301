/**
 * 06_seed_org_accounts.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates org accounts for all IIT Ropar clubs/bodies that have official email
 * addresses. Pure ESM, no TypeScript, no dotenv — reads .env manually.
 *
 * Run with:
 *   node db/seeds/06_seed_org_accounts.mjs
 *
 * Requirements:
 *   - Node 18+
 *   - @supabase/supabase-js in node_modules (already installed in this project)
 *   - .env file at project root with NEXT_PUBLIC_SUPABASE_URL + NEXT_SERVICE_ROLE_KEY
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// ── Read .env manually (no dotenv needed) ────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../../.env'); // two levels up from db/seeds/

function loadEnv(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      // Strip surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
    return true;
  } catch {
    return false;
  }
}

const loaded = loadEnv(envPath);
if (!loaded) {
  console.error(`❌  Could not read .env from: ${envPath}`);
  console.error('    Make sure .env exists at the project root.');
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error(`    NEXT_PUBLIC_SUPABASE_URL   = ${SUPABASE_URL ? '[set]' : '[MISSING]'}`);
  console.error(`    SUPABASE_SERVICE_ROLE_KEY  = ${SERVICE_ROLE_KEY ? '[set]' : '[MISSING]'}`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Org account definitions ───────────────────────────────────────────────────
// Only orgs that have an official email get an account.
const ORG_ACCOUNTS = [
  {
    org_id: '00000000-0000-0000-0000-000000000001',
    email: 'president.sc@iitrpr.ac.in',
    display_name: "Students' Gymkhana",
  },
  {
    org_id: '00000000-0000-0000-0001-000000000001',
    email: 'gs.tech@iitrpr.ac.in',
    display_name: 'Board of Science and Technology',
  },
  {
    org_id: '00000000-0000-0000-0001-000000000003',
    email: 'gs.lit@iitrpr.ac.in',
    display_name: 'Board of Literary Activities',
  },
  {
    org_id: '00000000-0000-0000-0001-000000000004',
    email: 'gs.sports@iitrpr.ac.in',
    display_name: 'Board of Sports Affairs',
  },
  {
    org_id: '00000000-0000-0000-0001-000000000006',
    email: 'gs.academic@iitrpr.ac.in',
    display_name: 'Board of Academic Affairs',
  },
  {
    org_id: 'd967a200-c8e3-4682-9832-42e3ed6e271e',
    email: 'aeromodelling@iitrpr.ac.in',
    display_name: 'Aeromodelling Club',
  },
  {
    org_id: '316d29ec-ab37-4316-88ab-d25e7301cc62',
    email: 'alfaaz@iitrpr.ac.in',
    display_name: 'Alfaaz',
  },
  {
    org_id: 'a8f56e2e-5c3c-4d92-93eb-3cc74866172b',
    email: 'alpha@iitrpr.ac.in',
    display_name: 'Alpha',
  },
  {
    org_id: 'e0282237-3731-4738-8848-bafd9536f8c3',
    email: 'aquatics@iitrpr.ac.in',
    display_name: 'Aquatics',
  },
  {
    org_id: 'af7ac929-ad0f-4d4e-87e0-2d3ca9719eeb',
    email: 'automotiveclub@iitrpr.ac.in',
    display_name: 'Automotive Club',
  },
  {
    org_id: '0c1a6047-66b7-4be1-8441-2698ef07ccfa',
    email: 'cimclub@iitrpr.ac.in',
    display_name: 'CIM Club',
  },
  {
    org_id: '39dfd1c1-ed09-4f98-ab20-df3258385bbe',
    email: 'codingclub@iitrpr.ac.in',
    display_name: 'Coding Club',
  },
  {
    org_id: 'f5170646-3dd4-43e9-9e61-f03d64cb7d5a',
    email: 'sa.esportz@iitrpr.ac.in',
    display_name: 'Esportz Club',
  },
  {
    org_id: 'fd25bb90-120b-4313-8acb-b2f9364be02c',
    email: 'fincom@iitrpr.ac.in',
    display_name: 'FinCOM',
  },
  {
    org_id: '0870ee60-55c9-488e-92f6-95e956433c42',
    email: 'club.iotacluster@iitrpr.ac.in',
    display_name: 'Iota Cluster',
  },
  {
    org_id: 'e25d224c-722f-43a6-a471-200017a96a9b',
    email: 'softcom@iitrpr.ac.in',
    display_name: 'Softcom',
  },
  {
    org_id: '0807e935-fde7-447e-9479-cdaf993faf98',
    email: 'zenithclub@iitrpr.ac.in',
    display_name: 'Zenith',
  },
];

const DEFAULT_PASSWORD = 'OrgAdmin@IITRpr2024';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('🏛️  Starting seed: Org Accounts');
  console.log(`   Supabase URL     : ${SUPABASE_URL}`);
  console.log(`   Org accounts     : ${ORG_ACCOUNTS.length}`);
  console.log(`   Default password : ${DEFAULT_PASSWORD}`);
  console.log('');

  // Pre-fetch all existing auth users once (avoid repeated list calls)
  const { data: existingAuthData, error: listErr } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });
  if (listErr) {
    console.error('❌  Failed to list existing auth users:', listErr.message);
    process.exit(1);
  }
  const existingByEmail = new Map(
    (existingAuthData?.users ?? []).map((u) => [u.email, u.id])
  );
  console.log(`   Found ${existingByEmail.size} existing auth users\n`);

  const created = [];
  const reused = [];
  const failed = [];

  for (const org of ORG_ACCOUNTS) {
    process.stdout.write(`🏢  ${org.display_name.padEnd(47)} `);

    let authUserId;

    // ── Step 1: Create or reuse Supabase Auth user ───────────────────────────
    if (existingByEmail.has(org.email)) {
      authUserId = existingByEmail.get(org.email);
      process.stdout.write(`[reuse ${authUserId.slice(0, 8)}…] `);
      reused.push(org);
    } else {
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: org.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
      });
      if (authErr || !authData?.user) {
        const reason = authErr?.message ?? 'No user returned';
        process.stdout.write(`❌  Auth failed: ${reason}\n`);
        failed.push({ org, reason });
        continue;
      }
      authUserId = authData.user.id;
      process.stdout.write(`[new ${authUserId.slice(0, 8)}…] `);
      await sleep(150);
    }

    // ── Step 2: Verify the org exists ────────────────────────────────────────
    const { data: orgRow, error: orgErr } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', org.org_id)
      .maybeSingle();

    if (orgErr || !orgRow) {
      const reason = orgErr?.message ?? `Org ${org.org_id} not found`;
      process.stdout.write(`❌  Org lookup failed: ${reason}\n`);
      failed.push({ org, reason });
      continue;
    }

    // ── Step 3: Upsert public.users row ──────────────────────────────────────
    const { error: upsertErr } = await supabase
      .from('users')
      .upsert(
        {
          id: authUserId,
          email: org.email,
          full_name: org.display_name,
          role: 'staff',
          status: 'active',
          is_org_account: true,
          linked_org_id: org.org_id,
          is_verified: true,
          is_admin: false,
        },
        { onConflict: 'id' }
      );

    if (upsertErr) {
      const reason = upsertErr.message;
      process.stdout.write(`❌  DB upsert failed: ${reason}\n`);
      failed.push({ org, reason });
      continue;
    }

    // ── Step 4: Stamp email on the organization row ──────────────────────────
    await supabase
      .from('organizations')
      .update({ email: org.email })
      .eq('id', org.org_id);

    if (!existingByEmail.has(org.email)) created.push(org);
    process.stdout.write(`✅\n`);
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────────────────────────');
  console.log(`✅  New accounts created : ${created.length}`);
  console.log(`⏩  Reused existing      : ${reused.length}`);
  console.log(`❌  Failed               : ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed:');
    failed.forEach((f) => console.log(`   ${f.org.email.padEnd(42)} ${f.reason}`));
  }

  console.log('\n📋  Credentials (share securely with each org):');
  console.log('─────────────────────────────────────────────────────────────────────');
  console.log(`${'Email'.padEnd(44)} Password`);
  console.log(`${'─'.repeat(44)} ${'─'.repeat(22)}`);
  ORG_ACCOUNTS.forEach((org) => {
    const isFailed = failed.find((f) => f.org.email === org.email);
    const icon = isFailed ? '❌' : '✅';
    console.log(`${icon} ${org.email.padEnd(42)} ${DEFAULT_PASSWORD}`);
  });
  console.log('─────────────────────────────────────────────────────────────────────');
  console.log('\n⚠️   Change passwords via Admin Portal › Org Accounts before sharing.');
}

main().catch((err) => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
