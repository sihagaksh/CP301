/**
 * 06_seed_more_users_and_chats.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates 10 additional test users (u11–u20) in Supabase Auth + public.users.
 * Then generates all 20C2 (190) possible conversation pairs among ALL 20 users
 * (u1 to u20). Adds ~50 messages per side (100 messages) per conversation.
 * 
 * Existing conversations from the prior seed are automatically skipped.
 *
 * Run with:
 *   npx tsx db/seeds/06_seed_more_users_and_chats.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from the seeds directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.NEXT_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_SERVICE_ROLE_KEY in db/seeds/.env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── User definitions (u11 to u20) ──────────────────────────────────────────

const NEW_USERS = [
  {
    tag: 'u11', email: '2023csb1097+u11@iitrpr.ac.in', full_name: 'Rahul Khanna', 
    department: 'Computer Science & Engineering', branch: 'CSB', enrollment_number: '2023CSB1011', batch: '2023'
  },
  {
    tag: 'u12', email: '2023csb1097+u12@iitrpr.ac.in', full_name: 'Anjali Desai', 
    department: 'Electrical Engineering', branch: 'EEB', enrollment_number: '2023EEB1012', batch: '2023'
  },
  {
    tag: 'u13', email: '2023csb1097+u13@iitrpr.ac.in', full_name: 'Tarun Malik', 
    department: 'Mechanical Engineering', branch: 'MEB', enrollment_number: '2023MEB1013', batch: '2023'
  },
  {
    tag: 'u14', email: '2023csb1097+u14@iitrpr.ac.in', full_name: 'Neha Sharma', 
    department: 'Chemical Engineering', branch: 'CHB', enrollment_number: '2023CHB1014', batch: '2023'
  },
  {
    tag: 'u15', email: '2023csb1097+u15@iitrpr.ac.in', full_name: 'Vikash Jain', 
    department: 'Civil Engineering', branch: 'CEB', enrollment_number: '2023CEB1015', batch: '2023'
  },
  {
    tag: 'u16', email: '2023csb1097+u16@iitrpr.ac.in', full_name: 'Shreya Iyer', 
    department: 'Mathematics & Computing', branch: 'MCB', enrollment_number: '2023MCB1016', batch: '2023'
  },
  {
    tag: 'u17', email: '2023csb1097+u17@iitrpr.ac.in', full_name: 'Aman Rajput', 
    department: 'Physics', branch: 'PHB', enrollment_number: '2023PHB1017', batch: '2023'
  },
  {
    tag: 'u18', email: '2023csb1097+u18@iitrpr.ac.in', full_name: 'Pooja Agarwal', 
    department: 'Chemistry', branch: 'CYB', enrollment_number: '2023CYB1018', batch: '2023'
  },
  {
    tag: 'u19', email: '2023csb1097+u19@iitrpr.ac.in', full_name: 'Siddharth Das', 
    department: 'Biomedical Engineering', branch: 'BMB', enrollment_number: '2023BMB1019', batch: '2023'
  },
  {
    tag: 'u20', email: '2023csb1097+u20@iitrpr.ac.in', full_name: 'Riya Sen', 
    department: 'Humanities & Social Sciences', branch: 'HSB', enrollment_number: '2023HSB1020', batch: '2023'
  },
];

const PASSWORD = 'Test@123';

const MSG_POOL: string[] = [
  "Hey! Did you submit the lab report?",
  "Checking right now. Need a few more minutes.",
  "Same here. The final question is confusing.",
  "We can discuss it near CC?",
  "Sounds good, I will be there in 10 mins.",
  "Which elective did you finally choose?",
  "I went with Deep Learning, but the waitlist is huge.",
  "You should have picked Cryptography, Professor is super chill.",
  "I might drop it if the workload is too much.",
  "Let's see. Have you checked the mess menu for tonight?",
  "It's paneer again 😂",
  "Swiggy it is. Let's order Dominos.",
  "Bro, the placement stats just came out, did you see?",
  "Yeah, the highest package went up again.",
  "Crazy! Motivation enough for DSA grinding.",
  "Speaking of DSA, I'm stuck on a DP problem.",
  "Send the link, I'll take a look later.",
  "Sent. Need some hints on state transitions.",
  "I'll solve it and explain it to you later tonight.",
  "Awesome, thanks man.",
  "Is there a sports club meeting today?",
  "Cancelled. Grounds are completely wet after the rain.",
  "Ah that sucks. I wanted to play cricket.",
  "There's an open mic at the student activity center though.",
  "I'll pass, I have to finish my assignment.",
  "Suit yourself! See you tomorrow in class."
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildMessages(convId: string, senderId: string, receiverId: string, baseTime: Date) {
  const rows = [];
  const totalMessages = 50; // 25 from each side (lightened slightly to prevent timeout mapping 190 pairs!)
  
  for (let i = 0; i < totalMessages; i++) {
    const isEven = i % 2 === 0;
    const sender = isEven ? senderId : receiverId;
    const receiver = isEven ? receiverId : senderId;
    const content = MSG_POOL[i % MSG_POOL.length];

    // Space messages 5 mins apart
    const offset = i * (5 * 60 * 1000); 
    const createdAt = new Date(baseTime.getTime() + offset);

    rows.push({
      conversation_id: convId,
      sender_id: sender,
      receiver_id: receiver,
      content,
      is_read: true,
      created_at: createdAt.toISOString(),
    });
  }
  return rows;
}

async function main() {
  console.log('🚀 Starting seed: users u11-u20 and 20C2 chats');

  const userIdsMap: Record<string, string> = {}; // Tag (u1-u20) -> uuid

  // 1. CREATE u11-u20 if they don't exist
  for (const u of NEW_USERS) {
    const { data: existing } = await supabase.auth.admin.listUsers();
    const existingUser = existing?.users?.find((x) => x.email === u.email);

    if (existingUser) {
      console.log(`   ⏩ Profile ${u.tag} already exists (${existingUser.id})`);
      userIdsMap[u.tag] = existingUser.id;
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: PASSWORD,
      email_confirm: true,
    });

    if (error) {
      console.error(`❌ Auth error for ${u.email}:`, error.message);
      process.exit(1);
    }
    userIdsMap[u.tag] = data.user.id;
    console.log(`   ✅ Created auth user ${u.tag} (${data.user.id})`);
    await sleep(100);
  }

  // 2. UPSERT into public.users
  const publicUserRows = NEW_USERS.map((u) => ({
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

  const { error: usersErr } = await supabase.from('users').upsert(publicUserRows, { onConflict: 'id' });
  if (usersErr) throw new Error('Failed to upsert public.users: ' + usersErr.message);

  console.log(`✅ Upserted ${NEW_USERS.length} rows into public.users`);

  // 3. FETCH u1-u10 ids into userIdsMap to complete the full 20 mapping
  const allEmails = Array.from({ length: 20 }, (_, i) => `2023csb1097+u${i + 1}@iitrpr.ac.in`);
  const { data: allUsers } = await supabase.from('users').select('id, email').in('email', allEmails);
  
  if (!allUsers) throw new Error('Could not fetch all 20 users');

  allUsers.forEach(u => {
    // Determine tag based on email number
    const match = u.email.match(/u(\d+)@/);
    if (match) {
      const tag = `u${match[1]}`;
      userIdsMap[tag] = u.id;
    }
  });

  // Ensure we have exactly 20 mapped users
  const activeTags = Object.keys(userIdsMap);
  console.log(`📌 Retrieved ${activeTags.length} valid users from database.`);
  if (activeTags.length < 20) {
    console.warn(`⚠️ Warning: Found less than 20 users (${activeTags.length}). Proceeding with what we have.`);
  }

  // 4. Create ALL combinations (20C2)
  console.log('\n💬 Creating combinations between all mapped users...');
  
  const tags = Array.from({ length: 20 }, (_, i) => `u${i + 1}`).filter(t => userIdsMap[t]);
  let convCount = 0;
  let msgCount = 0;
  const BASE_TIME = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < tags.length; i++) {
    for (let j = i + 1; j < tags.length; j++) {
      const tag1 = tags[i];
      const tag2 = tags[j];
      const p1Id = userIdsMap[tag1];
      const p2Id = userIdsMap[tag2];

      // Check existing
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${p1Id},participant2_id.eq.${p2Id}),and(participant1_id.eq.${p2Id},participant2_id.eq.${p1Id})`)
        .maybeSingle();

      if (existing) {
        // Skip existing chat so we don't duplicate 
        console.log(`   ⏩ Chat ${tag1} ↔ ${tag2} already exists, skipping.`);
        continue;
      }

      const convStartTime = new Date(BASE_TIME.getTime() + convCount * 60 * 60 * 1000);
      
      const { data: conv, error: convErr } = await supabase
        .from('conversations')
        .insert({
          participant1_id: p1Id,
          participant2_id: p2Id,
          last_message: MSG_POOL[0],
          last_message_at: convStartTime.toISOString(),
          last_message_sender_id: p1Id,
        })
        .select('id')
        .single();

      if (convErr) {
        console.error(`   ❌ Failed to insert ${tag1} ↔ ${tag2}:`, convErr.message);
        continue;
      }

      console.log(`   ✅ Chat ${tag1} ↔ ${tag2} created (${conv.id})`);
      const msgs = buildMessages(conv.id, p1Id, p2Id, convStartTime);

      for (let batchStart = 0; batchStart < msgs.length; batchStart += 50) {
        const batch = msgs.slice(batchStart, batchStart + 50);
        const { error: msgErr } = await supabase.from('messages').insert(batch);
        if (!msgErr) msgCount += batch.length;
      }

      // Update last message status
      const lastMsg = msgs[msgs.length - 1];
      await supabase.from('conversations').update({
        last_message: lastMsg.content,
        last_message_at: lastMsg.created_at,
        last_message_sender_id: lastMsg.sender_id, // Add this here just for extra correctness
      }).eq('id', conv.id);

      convCount++;
    }
  }

  console.log('\n🎉 Seed complete!');
  console.log(`   New conversations  : ${convCount}`);
  console.log(`   Messages inserted  : ${msgCount}`);
}

main().catch(console.error);
