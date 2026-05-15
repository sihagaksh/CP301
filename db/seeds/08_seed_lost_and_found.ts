/**
 * 08_seed_lost_and_found.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates 40 Lost and Found items (2 for each user u1-u20) 
 * Specifically 1 Lost item and 1 Found item per user
 * Features realistic Unsplash images for wallets, bottles, electronics, etc.
 *
 * Run with:
 *   npx tsx db/seeds/08_seed_lost_and_found.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

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

// Real-world placeholder items for Lost & Found
const lostTemplates = [
  { itemName: 'Sony WH-1000XM4 Headphones', category: 'electronics', desc: 'Left my black headphones in the library room 204. They are in a hard case.', img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80', loc: 'Library Room 204' },
  { itemName: 'Casio Scientific Calculator', category: 'electronics', desc: 'Lost my calculator during the mid-sem prep. Has my initials "A.S." scratched on the back.', img: 'https://images.unsplash.com/photo-1574607407408-1e681c46041d?w=800&q=80', loc: 'Lecture Hall 1' },
  { itemName: 'Brown Leather Wallet', category: 'wallet', desc: 'Contains my ID card, driving license, and some cash. Really need the ID back!', img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', loc: 'Main Cafeteria' },
  { itemName: 'Milton Thermo Flask', category: 'bottle', desc: 'Black thermo flask, 1 liter. Left it near the basketball court.', img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', loc: 'Basketball Court' },
  { itemName: 'Hostel Room Keys', category: 'keys', desc: 'A bunch of 3 keys with a Captain America keychain attached.', img: 'https://images.unsplash.com/photo-1584447128309-8addffa763c3?w=800&q=80', loc: 'Chenab Hostel Mess' },
  { itemName: 'MacBook Charger (Type C)', category: 'electronics', desc: 'White Apple charging brick and cable. Emergency!', img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80', loc: 'Library Reading Room' },
  { itemName: 'Ray-Ban Aviator Sunglasses', category: 'accessories', desc: 'Gold rim frame. Pretty sure I left it on the bench near admin block.', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', loc: 'Admin Block Bench' },
  { itemName: 'Winter Jacket (Puma)', category: 'clothing', desc: 'Black Puma zipper jacket. Forgot it on the chair during the event.', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', loc: 'Auditorium' },
  { itemName: 'Library Book - "CLRS"', category: 'documents', desc: 'Introduction to Algorithms library book. Need it back before due date to avoid fines.', img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80', loc: 'CS Department Lab' },
  { itemName: 'Boat Airdopes AirPods', category: 'electronics', desc: 'White charging case missing, I only have the right bud.', img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80', loc: 'Sutlej Hostel T.V. Room' }
];

const foundTemplates = [
  { itemName: 'Titan Wrist Watch', category: 'accessories', desc: 'Found a silver analog watch near the water cooler.', img: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80', loc: 'Academic Block Water Cooler' },
  { itemName: 'Blue Umbrella', category: 'other', desc: 'Left behind during yesterday\'s rain outside the lecture hall.', img: 'https://images.unsplash.com/photo-1510484085486-da22956cf570?w=800&q=80', loc: 'Lecture Hall Foyer' },
  { itemName: 'Logitech Wireless Mouse', category: 'electronics', desc: 'Black wireless mouse. I handed it over to the library desk.', img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80', loc: 'Library Main Desk' },
  { itemName: 'Campus ID Card', category: 'documents', desc: 'Found a 2024 batch ID card for someone named Rahul.', img: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&q=80', loc: 'Sports Complex' },
  { itemName: 'Bike Keys', category: 'keys', desc: 'Single bike key with a Royal Enfield leather tag.', img: 'https://images.unsplash.com/photo-1558296316-95a32ba06079?w=800&q=80', loc: 'Main Parking Lot' },
  { itemName: 'Stainless Steel Sipper', category: 'bottle', desc: 'Silver colored gym sipper bottle entirely steel.', img: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80', loc: 'Gymnasium' },
  { itemName: 'Adidas Cap', category: 'clothing', desc: 'Black cap with white stripes found lying on the grass.', img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80', loc: 'Main Grounds' },
  { itemName: 'Pendrive (SanDisk 64GB)', category: 'electronics', desc: 'Found attached to lab computer #14.', img: 'https://images.unsplash.com/photo-1601639011984-ac5ec213608e?w=800&q=80', loc: 'Computer Lab 3' },
  { itemName: 'Spiral Notebook', category: 'other', desc: 'Has "Physics 101" written on it. Some lab readings inside.', img: 'https://images.unsplash.com/photo-1531346878377-a54456ca9681?w=800&q=80', loc: 'First Year Lab' },
  { itemName: 'Gold Ring', category: 'accessories', desc: 'Found a small ring in the washroom. Identify details to claim.', img: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?w=800&q=80', loc: 'Academic Block Washroom' }
];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🚀 Starting seed: 40 Lost & Found Items for users u1-u20');
  
  const allEmails = Array.from({ length: 20 }, (_, i) => `2023csb1097+u${i + 1}@iitrpr.ac.in`);
  const { data: users, error: userErr } = await supabase
    .from('users')
    .select('id, email, full_name, phone_number')
    .in('email', allEmails);

  if (userErr || !users || users.length === 0) {
    console.error('❌ Failed to fetch users from DB', userErr);
    process.exit(1);
  }

  const userMap: Record<string, any> = {};
  users.forEach(u => {
    const match = u.email.match(/u(\d+)@/);
    if (match) {
      userMap[`u${match[1]}`] = u;
    }
  });

  // Delete all items by these users first to clean up old items
  const userIds = Object.values(userMap).map((u: any) => u.id);
  const { error: delErr } = await supabase.from('lost_found_items').delete().in('reporter_id', userIds);
  if (delErr) {
    console.error('⚠️ Failed to clean up existing lost & found items:', delErr.message);
  } else {
    console.log('🧹 Cleaned up existing items for 20 users.');
  }

  const lfToInsert = [];

  for (let i = 0; i < 20; i++) {
    const tag = `u${i + 1}`;
    const user = userMap[tag];

    if (!user) continue;
    
    // Pick 1 lost item
    const lostTpl = getRandom(lostTemplates);
    lfToInsert.push({
        reporter_id: user.id,
        item_name: lostTpl.itemName,
        category: lostTpl.category,
        status: 'lost',
        description: lostTpl.desc,
        location_lost_found: lostTpl.loc,
        date_lost_found: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        contact_info: user.phone_number || user.email,
        images: [lostTpl.img],
        created_at: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Pick 1 found item
    const foundTpl = getRandom(foundTemplates);
    lfToInsert.push({
        reporter_id: user.id,
        item_name: foundTpl.itemName,
        category: foundTpl.category,
        status: 'found',
        description: foundTpl.desc,
        location_lost_found: foundTpl.loc,
        date_lost_found: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
        contact_info: user.phone_number || user.email,
        images: [foundTpl.img],
        created_at: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  // Insert in bulk
  const { error } = await supabase.from('lost_found_items').insert(lfToInsert);

  if (error) {
    console.error('❌ Failed to insert LF items:', error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully seeded ${lfToInsert.length} lost and found items!`);
}

main().catch(console.error);
