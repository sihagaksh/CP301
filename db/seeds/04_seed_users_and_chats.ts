/**
 * 04_seed_users_and_chats.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates 10 test users (u1–u10) in Supabase Auth + public.users, then
 * seeds 45 (10C2) conversations with ≥100 messages each (≥50 per side).
 *
 * Run with:
 *   npx tsx db/seeds/04_seed_users_and_chats.ts
 *
 * Requires the following in db/seeds/.env:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   NEXT_SERVICE_ROLE_KEY=...
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

// ── User definitions ──────────────────────────────────────────────────────────

const USERS = [
  {
    tag: 'u1',
    email: '2023csb1097+u1@iitrpr.ac.in',
    full_name: 'Arjun Sharma',
    department: 'Computer Science & Engineering',
    branch: 'CSB',
    enrollment_number: '2023CSB1001',
    batch: '2023',
  },
  {
    tag: 'u2',
    email: '2023csb1097+u2@iitrpr.ac.in',
    full_name: 'Priya Mehta',
    department: 'Electrical Engineering',
    branch: 'EEB',
    enrollment_number: '2023EEB1002',
    batch: '2023',
  },
  {
    tag: 'u3',
    email: '2023csb1097+u3@iitrpr.ac.in',
    full_name: 'Rohan Gupta',
    department: 'Mechanical Engineering',
    branch: 'MEB',
    enrollment_number: '2023MEB1003',
    batch: '2023',
  },
  {
    tag: 'u4',
    email: '2023csb1097+u4@iitrpr.ac.in',
    full_name: 'Sneha Patel',
    department: 'Chemical Engineering',
    branch: 'CHB',
    enrollment_number: '2023CHB1004',
    batch: '2023',
  },
  {
    tag: 'u5',
    email: '2023csb1097+u5@iitrpr.ac.in',
    full_name: 'Karan Singh',
    department: 'Civil Engineering',
    branch: 'CEB',
    enrollment_number: '2023CEB1005',
    batch: '2023',
  },
  {
    tag: 'u6',
    email: '2023csb1097+u6@iitrpr.ac.in',
    full_name: 'Ananya Verma',
    department: 'Mathematics & Computing',
    branch: 'MCB',
    enrollment_number: '2023MCB1006',
    batch: '2023',
  },
  {
    tag: 'u7',
    email: '2023csb1097+u7@iitrpr.ac.in',
    full_name: 'Vikram Rao',
    department: 'Physics',
    branch: 'PHB',
    enrollment_number: '2023PHB1007',
    batch: '2023',
  },
  {
    tag: 'u8',
    email: '2023csb1097+u8@iitrpr.ac.in',
    full_name: 'Divya Nair',
    department: 'Chemistry',
    branch: 'CYB',
    enrollment_number: '2023CYB1008',
    batch: '2023',
  },
  {
    tag: 'u9',
    email: '2023csb1097+u9@iitrpr.ac.in',
    full_name: 'Aditya Joshi',
    department: 'Biomedical Engineering',
    branch: 'BMB',
    enrollment_number: '2023BMB1009',
    batch: '2023',
  },
  {
    tag: 'u10',
    email: '2023csb1097+u10@iitrpr.ac.in',
    full_name: 'Meera Krishnan',
    department: 'Humanities & Social Sciences',
    branch: 'HSB',
    enrollment_number: '2023HSB1010',
    batch: '2023',
  },
];

const PASSWORD = 'Test@123';

// ── Message corpus ─────────────────────────────────────────────────────────────
// 120 varied messages so each pair gets a naturally flowing conversation.

const MSG_POOL: string[] = [
  // Greetings / openers
  "Hey! What's up?",
  "Yo, how's it going?",
  "Bhai, aaj class gayi thi tujhe?",
  "Haan yaar, barely made it. Prof was late too 😅",
  "Koi notes share kar sakta hai aaj ka?",
  "Sure, send me your roll number I'll share the drive link.",
  "Thanks a ton! You saved my life literally.",
  "No worries, we've all been there.",

  // Academics
  "Have you started the DSA assignment?",
  "Lol not even touched it. Due tomorrow right?",
  "Yeah at midnight 😰. I'm panicking.",
  "Let's pair-code it. Call me at 10?",
  "Perfect, see you then!",
  "Did the grader give any example test cases?",
  "Nah, the problem statement is deliberately vague smh.",
  "Classic prof move.",
  "I found a similar problem on LeetCode, want the link?",
  "Yes please, send it!",
  "Sent in DM. Approach is O(n log n) btw.",
  "Sweet, I was trying brute force 😂",

  // Campus life
  "Mess ka khana aaj bakwaas tha.",
  "It's always bakwaas on Mondays 😂",
  "Kya scene hai Nescafe mein aaj raat?",
  "Probably packed. Minors week hai.",
  "True. Let's order from Swiggy instead?",
  "Haan bhai, I'm down. What are you getting?",
  "Biryani obviously. You?",
  "Maggi and Momos combo. College diet 💀",
  "We're living our best lives 😂",

  // Events
  "Did you register for Advitya?",
  "Not yet, is it free?",
  "Yeah, most events are. Only workshops have fees.",
  "Cool, I'll register tonight.",
  "Don't forget the cultural night, it's supposed to be amazing.",
  "Who's performing?",
  "Some Punjabi folk band + a standup comedian.",
  "Bro that sounds awesome, counting the days.",

  // Projects / internships
  "Got my intern offer from Microsoft 🎉",
  "NO way!!! That's insane, congratulations!",
  "Still can't believe it tbh.",
  "You deserve it, you've been grinding nonstop.",
  "What's your notice period?",
  "Joining in May. Relocating to Hyderabad.",
  "That's exciting! Hyderabad food is 🔥",
  "Already researching Irani chai joints haha.",

  // Random banter
  "Can you explain recursion to me like I'm 5?",
  "Recursion is when you ask me to explain recursion.",
  "…that's actually brilliant.",
  "Thank you, thank you 🎤 drop.",
  "Our prof literally spent 40 mins on pointers today.",
  "How is that still taking 40 minutes in 3rd semester?",
  "Idk but half the class was asleep.",
  "Including you?",
  "Especially me.",

  // Lab / practical
  "The DBMS lab viva is tomorrow, I'm not ready.",
  "Same. Want to quiz each other tonight?",
  "Yes! Meet at the library at 8?",
  "Sure, I'll bring snacks.",
  "Bro you always bring snacks, bless.",
  "Gotta keep morale up 😂",
  "What topics are definitely coming?",
  "Normalization, transactions, and joins for sure.",
  "I'm fine with joins but normalization 😭",
  "Same situation, let's go through it step by step.",

  // Sports / extracurricular
  "You coming to the football match at 5?",
  "Depends—which ground?",
  "The main one near the gym.",
  "Yeah I'll be there, let me grab my cleats.",
  "We need one more player, can you ask someone?",
  "I'll text Rohan, he plays striker.",
  "Perfect, we're set then.",
  "Game on! 🏆",

  // Late night conversations
  "Bhai it's 2 AM and I still can't sleep.",
  "Assignment stress or existential dread?",
  "Both honestly.",
  "Bro join the club 😅 want to talk?",
  "Nah it's fine, just needed to vent.",
  "Anytime yaar, I'm here.",
  "You're the best, seriously.",
  "Don't get sentimental it's too late for this lmao.",

  // Study plans
  "Mera plan hai ki kal se padhai shuru karoonga.",
  "Bhai you say this every day.",
  "This time I mean it! I have a schedule.",
  "Show me the schedule.",
  "... I'll make it tomorrow.",
  "Predictable 😂",

  // Miscellaneous filler
  "Did you submit the feedback form for the course?",
  "No, does it matter?",
  "They use it for the next semester apparently.",
  "Fine I'll fill it out, 30 seconds right?",
  "Yeah just 10 questions.",
  "Ok done. 3/10 for attendance policy 💀",
  "Brutal but fair.",
  "Someone has to say it.",
  "True true.",
  "Okay gotta sleep now, early class tomorrow.",
  "Same, goodnight!",
  "Goodnight yaar, take care.",
  "You too! 🌙",
  "Ping me when you're awake.",
  "Will do.",
  "Catch you on the other side of 8 AM.",
  "Lmaooo okay bye.",

  // Extra padding
  "What's the WiFi password for the new hostel block?",
  "It's IITRPR@2024 I think, try that.",
  "Worked! Thanks.",
  "Someone posted it in the year group.",
  "I muted that group ages ago 😂",
  "Rookie mistake, so much info there.",
  "Is there a reading week before end-sems?",
  "Yes, 4 days this time.",
  "Finally, decent time to actually study.",
  "Or to finally watch that anime backlog.",
  "Both valid life choices.",
  "Koi suggest karo — study partner chahiye for Algo.",
  "I'm free after 6 every day.",
  "Let's start Monday, library 6:30?",
  "Done ✅",
  "Can you check if OAT is booked tonight?",
  "Yeah there's a movie screening at 8.",
  "Nice, free?",
  "Yep, open to all students.",
  "We're going then, gather the squad.",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Pick messages alternating between sender A and sender B, ensuring ≥50 each. */
function buildMessages(
  convId: string,
  senderId: string,
  receiverId: string,
  baseTime: Date
): {
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}[] {
  const rows = [];
  const totalMessages = 110; // 55 from each side

  for (let i = 0; i < totalMessages; i++) {
    const isEven = i % 2 === 0;
    const sender = isEven ? senderId : receiverId;
    const receiver = isEven ? receiverId : senderId;
    const content = MSG_POOL[i % MSG_POOL.length];

    // Space messages 15-30 minutes apart for realism
    const offset = i * (20 * 60 * 1000); // 20 min per message
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

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Starting seed: users + chats');
  console.log(`   Supabase URL : ${SUPABASE_URL}`);
  console.log(`   Users to seed: ${USERS.length}`);
  console.log('');

  // ── Step 1: Create users in Supabase Auth ──────────────────────────────────
  const createdUserIds: Record<string, string> = {}; // tag → uuid

  for (const u of USERS) {
    console.log(`👤 Creating auth user: ${u.email}`);

    // Delete existing user by listing all and finding by email (idempotent)
    const { data: existing } = await supabase.auth.admin.listUsers();
    const existingUser = existing?.users?.find((x) => x.email === u.email);

    if (existingUser) {
      console.log(`   ↳ Already exists (${existingUser.id}), re-using.`);
      createdUserIds[u.tag] = existingUser.id;
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: PASSWORD,
      email_confirm: true, // skip verification email
    });

    if (error) {
      console.error(`   ❌ Auth error for ${u.email}:`, error.message);
      process.exit(1);
    }

    createdUserIds[u.tag] = data.user.id;
    console.log(`   ✅ Created auth user ${data.user.id}`);
    await sleep(200); // gentle rate-limiting
  }

  // ── Step 2: Upsert into public.users ──────────────────────────────────────
  console.log('\n📋 Upserting into public.users...');

  const publicUserRows = USERS.map((u) => ({
    id: createdUserIds[u.tag],
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

  const { error: usersErr } = await supabase
    .from('users')
    .upsert(publicUserRows, { onConflict: 'id' });

  if (usersErr) {
    console.error('❌ Failed to upsert public.users:', usersErr.message);
    process.exit(1);
  }

  console.log(`✅ Upserted ${USERS.length} rows into public.users`);

  // ── Step 3: Create all 10C2 = 45 conversations + messages ─────────────────
  console.log('\n💬 Creating conversations and messages...');

  const tags = USERS.map((u) => u.tag); // ['u1', ..., 'u10']
  let convCount = 0;
  let msgCount = 0;

  // Base time: 30 days ago so messages are in the past
  const BASE_TIME = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < tags.length; i++) {
    for (let j = i + 1; j < tags.length; j++) {
      const p1Id = createdUserIds[tags[i]];
      const p2Id = createdUserIds[tags[j]];
      const label = `${tags[i]} ↔ ${tags[j]}`;

      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(participant1_id.eq.${p1Id},participant2_id.eq.${p2Id}),and(participant1_id.eq.${p2Id},participant2_id.eq.${p1Id})`
        )
        .maybeSingle();

      let convId: string;

      if (existing) {
        convId = existing.id;
        console.log(`   ⏩ Conversation ${label} already exists (${convId}), skipping creation.`);
      } else {
        // Stagger conversation start times slightly (each pair starts 1hr apart)
        const convStartTime = new Date(BASE_TIME.getTime() + convCount * 60 * 60 * 1000);

        const { data: conv, error: convErr } = await supabase
          .from('conversations')
          .insert({
            participant1_id: p1Id,
            participant2_id: p2Id,
            last_message: MSG_POOL[(conversationIndex(i, j) * 10) % MSG_POOL.length],
            last_message_at: convStartTime.toISOString(),
            last_message_sender_id: p1Id,
          })
          .select('id')
          .single();

        if (convErr) {
          console.error(`   ❌ Conversation insert failed (${label}):`, convErr.message);
          continue;
        }

        convId = conv.id;
        console.log(`   ✅ Conversation ${label} created (${convId})`);

        // Build and insert messages in batches of 50
        const msgs = buildMessages(convId, p1Id, p2Id, convStartTime);

        for (let batchStart = 0; batchStart < msgs.length; batchStart += 50) {
          const batch = msgs.slice(batchStart, batchStart + 50);
          const { error: msgErr } = await supabase.from('messages').insert(batch);
          if (msgErr) {
            console.error(`      ❌ Message batch failed:`, msgErr.message);
          } else {
            msgCount += batch.length;
          }
        }

        // Update last_message to the actual last message in the conversation
        const lastMsg = msgs[msgs.length - 1];
        await supabase
          .from('conversations')
          .update({
            last_message: lastMsg.content,
            last_message_at: lastMsg.created_at,
            last_message_sender_id: lastMsg.sender_id,
          })
          .eq('id', convId);
      }

      convCount++;
      await sleep(100);
    }
  }

  console.log('\n🎉 Seed complete!');
  console.log(`   Conversations created : ${convCount}`);
  console.log(`   Messages inserted     : ${msgCount}`);
  console.log(`   Users created         : ${USERS.length}`);
  console.log('\nCredentials:');
  USERS.forEach((u) => console.log(`   ${u.email.padEnd(40)} → ${PASSWORD}`));
}

// Helper to get a unique index for a pair (i, j) where j > i
function conversationIndex(i: number, j: number): number {
  const n = USERS.length;
  return i * n - ((i * (i + 1)) / 2) + (j - i - 1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
