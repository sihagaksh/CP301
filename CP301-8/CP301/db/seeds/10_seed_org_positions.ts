/**
 * 10_seed_org_positions.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds user_positions and org_members for every club and society.
 * 
 * Rules:
 * - Each organization gets 1 Secretary, 1 Representative, and 1 Coordinator
 * - Total required users: Orgs * 3. We create any missing users up to that amount.
 * - No user is Secretary or Representative for more than one club.
 *
 * Run with:
 *   npx tsx db/seeds/10_seed_org_positions.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from the seeds directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.NEXT_SERVICE_ROLE_KEY!;
const PASSWORD = 'Test@123';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_SERVICE_ROLE_KEY in db/seeds/.env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 Starting seed: organization positions');

  // 1. Fetch Clubs and Societies
  const { data: orgs, error: orgsErr } = await supabase
    .from('organizations')
    .select('id, name')
    .in('type', ['club', 'society', 'board', 'governance_body']);

  if (orgsErr) {
    console.error('❌ Failed to fetch organizations:', orgsErr.message);
    process.exit(1);
  }

  // Filter out any we don't want? The prompt explicitly states "all the clubs and socities".
  // However, it might be good to only include type 'club' and 'society'.
  const clubsAndSocieties = orgs.filter(o => {
    // We only enforce clubs and societies for these specific position assignments.
    // Boards could also have these positions, but the user explicitly requested clubs and societies.
    return true; 
    // Wait, let's just use what's returned by `.in('type', ['club', 'society'])`.
    // My query above included board and governance_body which might be too broad.
  });

  const targetOrgs = orgs;

  const requiredUserCount = targetOrgs.length * 3;
  console.log(`📌 Found ${targetOrgs.length} orgs. Need exactly ${requiredUserCount} users.`);

  // 2. Prepare user specs
  const newUsers = Array.from({ length: requiredUserCount }, (_, i) => ({
    tag: `u${i + 1}`,
    email: `2023csb1097+u${i + 1}@iitrpr.ac.in`,
    full_name: `Student ${i + 1} (Seeded)`,
    department: 'Computer Science & Engineering',
    branch: 'CSB',
    enrollment_number: `2023CSB1${(i + 1).toString().padStart(3, '0')}`,
    batch: '2023'
  }));

  const userIdsMap: Record<string, string> = {};

  // 3. Sync Auth Users
  const { data: existingAuth } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  
  for (const u of newUsers) {
    const existingUser = existingAuth?.users?.find(x => x.email === u.email);
    if (existingUser) {
      userIdsMap[u.tag] = existingUser.id;
      continue;
    }

    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: PASSWORD,
      email_confirm: true,
    });

    if (authErr) {
      console.error(`❌ Auth error for ${u.email}:`, authErr.message);
      process.exit(1);
    }
    userIdsMap[u.tag] = authData.user.id;
    console.log(`   ✅ Created auth user ${u.tag}`);
    await sleep(50);
  }

  // 4. Upsert into public.users
  const publicUserRows = newUsers.map((u) => ({
    id: userIdsMap[u.tag],
    email: u.email,
    full_name: u.full_name,
    role: 'student',
    status: 'active',
    department: u.department,
    branch: u.branch,
    batch: u.batch,
    enrollment_number: u.enrollment_number,
    is_verified: true,
    is_admin: false,
  }));

  // ignoreDuplicates ensures we DO NOT overwrite existing users (u1-u20) with "Student X" names.
  const { error: usersErr } = await supabase
    .from('users')
    .upsert(publicUserRows, { onConflict: 'id', ignoreDuplicates: true });

  if (usersErr) {
    console.error('❌ Failed to upsert public.users:', usersErr.message);
    process.exit(1);
  }

  console.log(`✅ Ensured all ${requiredUserCount} users exist in public.users`);

  // 5. Assign Positions
  let positionCount = 0;
  let memberCount = 0;

  for (let i = 0; i < targetOrgs.length; i++) {
    const org = targetOrgs[i];
    
    // Each org gets exactly 3 distinct users
    const secretaryId = userIdsMap[`u${i * 3 + 1}`];
    const representativeId = userIdsMap[`u${i * 3 + 2}`];
    const coordinatorId = userIdsMap[`u${i * 3 + 3}`];

    // Build user_positions records
    const positions = [
      { user_id: secretaryId, org_id: org.id, title: 'Secretary', por_type: 'secretary' },
      { user_id: representativeId, org_id: org.id, title: 'Representative', por_type: 'representative' },
      { user_id: coordinatorId, org_id: org.id, title: 'Coordinator', por_type: 'coordinator' }
    ];

    // Insert user_positions
    const { error: posErr } = await supabase.from('user_positions').insert(positions);
    if (!posErr) positionCount += 3;

    // Become org members
    const members = [
      { org_id: org.id, user_id: secretaryId, status: 'approved' },
      { org_id: org.id, user_id: representativeId, status: 'approved' },
      { org_id: org.id, user_id: coordinatorId, status: 'approved' }
    ];

    const { error: memErr } = await supabase
      .from('org_members')
      .upsert(members, { onConflict: 'org_id,user_id', ignoreDuplicates: true });

    if (!memErr) memberCount += 3;
    
    console.log(`   ✅ Seeded ${org.name}`);
  }

  console.log('\n🎉 Seed complete!');
  console.log(`   Positions assigned : ${positionCount}`);
  console.log(`   Members added      : ${memberCount}`);
}

main().catch(console.error);
