/**
 * 11_seed_notices_events.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds 20 notices and 20 events using users equipped with official PORs.
 * 
 * Run with:
 *   npx tsx db/seeds/11_seed_notices_events.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.NEXT_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const noticeTitles = [
  "General Body Meeting for Zenith Club",
  "Registrations open for Dance Club tryouts",
  "Maintenance schedule for main gym",
  "Change in mess menu for next week",
  "Code sprint details - Coding Club",
  "Call for sponsors for Advitya fest",
  "Volunteer selection for ISMP",
  "Results of the Inter-Hostel Athletics",
  "Rules and Regulations for E-sports tournament",
  "Alumni talk series announcement",
  "Workshop on Machine Learning fundamentals",
  "Guidelines for using the new Robotics Lab",
  "Annual budget presentation",
  "Applications open for Club Secretary positions",
  "Feedback form for the recent Cultural Fest",
  "Reminder: Submission of project reports",
  "New books arrived in the Central Library",
  "Registration deadline extension for MUN",
  "Health awareness camp next Saturday",
  "Suspension of academic activities for sports day"
];

const eventTitles = [
  "Annual Zenith Astronomy Night",
  "Dance Club - Fresher's Showcase",
  "Inter-branch Basketball Tournament",
  "Hackathon 2026 - Coding Club",
  "E-Cell Startup Pitch Competition",
  "Music Club Acoustic Night",
  "Drama Club Annual Play Production",
  "Fine Arts Exhibition",
  "Photography Walk around Campus",
  "Robotics Line Follower Challenge",
  "DebSoc Parliamentary Debate",
  "Alfaaz Poetry Slam",
  "Esportz FIFA Tournament",
  "Softcom Web Dev Bootcamp",
  "Automotive Club Go-Kart Racing",
  "Women's Forum Tech Panel",
  "ISMP Mentee Orientation",
  "Aeromodelling Drone Show",
  "Epicure Cooking Competition",
  "Filmski Movie Screening - Interstellar"
];

function generateSlug(text: string, count: number): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + count;
}

async function main() {
  console.log('🚀 Starting seed: notices and events');

  // Fetch active user positions
  const { data: positions, error: posErr } = await supabase
    .from('user_positions')
    .select('id, user_id, org_id, title')
    .eq('is_active', true)
    .limit(40); // 20 for notices, 20 for events

  if (posErr || !positions || positions.length === 0) {
    console.error('❌ Failed to fetch user positions. Ensure positions are seeded first.', posErr);
    process.exit(1);
  }

  // Shuffle positions to randomly assign them
  const shuffledPositions = positions.sort(() => 0.5 - Math.random());
  
  // Need at least 20
  const noticePositions = shuffledPositions.slice(0, 20);
  const eventPositions = shuffledPositions.slice(0, 20); // allow overlapping users 

  // Seed Notices
  const noticesToInsert = noticeTitles.map((title, i) => {
    const p = noticePositions[i % noticePositions.length];
    return {
      posted_by: p.user_id,
      posting_identity_id: p.id,
      title: title,
      content: `This is an official notice regarding ${title}. Please check with the organizing body for more details.`,
      category: 'general',
      priority: 'medium',
      is_active: true,
      is_pinned: false
    };
  });

  const { error: noticesErr } = await supabase.from('notices').insert(noticesToInsert);
  if (noticesErr) {
    console.error('❌ Failed to insert notices:', noticesErr.message);
  } else {
    console.log(`✅ Seeded ${noticesToInsert.length} notices`);
  }

  // Seed Events
  const eventsToInsert = eventTitles.map((title, i) => {
    const p = eventPositions[i % eventPositions.length];
    
    // Future dates
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 7 + i); // start next week, spread out
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2); // 2 hours long
    
    return {
      posted_by: p.user_id,
      organizer_id: p.org_id,
      posting_identity_id: p.id,
      title: title,
      slug: generateSlug(title, i),
      description: `Join us for the amazing ${title}! Everyone is welcome. Don't miss out on this fantastic opportunity to engage with the community.`,
      type: 'general',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      requires_registration: false,
      is_published: true,
      target_roles: ['student', 'faculty', 'staff']
    };
  });

  const { error: eventsErr } = await supabase.from('events').insert(eventsToInsert);
  if (eventsErr) {
    console.error('❌ Failed to insert events:', eventsErr.message);
  } else {
    console.log(`✅ Seeded ${eventsToInsert.length} events`);
  }

  console.log('🎉 Notices and Events seed complete!');
}

main().catch(console.error);
