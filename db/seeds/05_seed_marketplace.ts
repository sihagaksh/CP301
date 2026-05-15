/**
 * 05_seed_marketplace.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds 20 marketplace products (2 for each test user u1-u10).
 * Uses realistic Indian campus items and Unsplash image URLs.
 * 
 * Run with:
 *   npx tsx db/seeds/05_seed_marketplace.ts
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

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Helper for users
const userEmails = Array.from({ length: 10 }, (_, i) => `2023csb1097+u${i + 1}@iitrpr.ac.in`);

const MARKETPLACE_ITEMS = [
  // User 1
  {
    title: 'MacBook Air M1 (2020) Space Grey',
    description: 'Selling my MacBook Air M1. 8GB RAM, 256GB SSD. Battery health 92%. Well maintained with a hard case since day 1. Perfect for coding and daily college tasks.',
    category: 'electronics',
    price: 45000,
    is_negotiable: true,
    condition: 'good',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop'],
    pickup_location: 'Chenab Hostel',
    delivery_available: false,
  },
  {
    title: 'Atomic Habits by James Clear',
    description: 'Read once. The book is in perfect condition, no folds or marks. Great read for developing good habits!',
    category: 'books',
    price: 300,
    is_negotiable: false,
    condition: 'like_new',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop'],
    pickup_location: 'Academic Block Library',
    delivery_available: true,
  },
  // User 2
  {
    title: 'Hero Sprint Pro 21 Speed Cycle',
    description: 'Bought last semester. Used only a few times to go between hostel and classes. Serviced last month, brakes and gears work flawlessly.',
    category: 'cycle',
    price: 4500,
    is_negotiable: true,
    condition: 'good',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop'],
    pickup_location: 'Beas Hostel Cycle Stand',
    delivery_available: false,
  },
  {
    title: 'Drafter + Engineering Drawing Kit',
    description: 'Complete ED kit including mini drafter, clips, scale, and compass box. Only used in 1st semester. Must have for freshers.',
    category: 'stationery',
    price: 400,
    is_negotiable: false,
    condition: 'good',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&auto=format&fit=crop'],
    pickup_location: 'Beas Hostel',
    delivery_available: false,
  },
  // User 3
  {
    title: 'Yonex Badminton Racket (Muscle Power)',
    description: 'Professional grade racket. Scuffs on the edge but the gutting is brand new (done at 26 lbs). Moving to tennis so selling this.',
    category: 'sports',
    price: 1800,
    is_negotiable: true,
    condition: 'fair',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1613918431703-0edded8c82ab?w=800&auto=format&fit=crop'],
    pickup_location: 'Sports Complex',
    delivery_available: false,
  },
  {
    title: 'Calculus - Thomas Finney 9th Edition',
    description: 'The standard math textbook for 1st year. Good condition, spine is intact. Very cheap compared to the library fine!',
    category: 'books',
    price: 450,
    is_negotiable: true,
    condition: 'fair',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop'],
    pickup_location: 'Satluj Hostel',
    delivery_available: true,
  },
  // User 4
  {
    title: 'Study Table Lamp (Rechargeable)',
    description: 'LED table lamp with 3 brightness modes. Battery lasts about 4 hours on low mode. Very useful during power cuts or late night studying.',
    category: 'electronics',
    price: 250,
    is_negotiable: false,
    condition: 'good',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop'],
    pickup_location: 'Chenab Hostel',
    delivery_available: true,
  },
  {
    title: 'IIT Ropar Official Red Hoodie (Size L)',
    description: 'Never worn, received it as part of fest merch but the size is too big for me. Very warm and high quality material.',
    category: 'clothing',
    price: 800,
    is_negotiable: false,
    condition: 'new',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop'],
    pickup_location: 'Main Academic Block',
    delivery_available: false,
  },
  // User 5
  {
    title: 'Casio scientific calculator fx-991EX',
    description: 'Non-programmable Classwiz calculator allowed in semester exams. Perfect condition. Lost the original box.',
    category: 'electronics',
    price: 600,
    is_negotiable: true,
    condition: 'good',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&auto=format&fit=crop'],
    pickup_location: 'Library',
    delivery_available: true,
  },
  {
    title: 'Mattress (Single Bed size)',
    description: 'Selling my extra mattress. Clean and comfortable. Best for people who find the default hostel mattress too hard.',
    category: 'furniture',
    price: 1200,
    is_negotiable: true,
    condition: 'fair',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1536882240095-0379873feb4e?w=800&auto=format&fit=crop'],
    pickup_location: 'Beas Hostel',
    delivery_available: false,
  },
  // User 6
  {
    title: 'Nivia Basketball Size 7',
    description: 'Bought a month ago, played with it twice. Going home for vacation so want to sell it. Excellent grip.',
    category: 'sports',
    price: 450,
    is_negotiable: false,
    condition: 'like_new',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop'],
    pickup_location: 'Basketball Court',
    delivery_available: true,
  },
  {
    title: 'Lab Coat (Size M)',
    description: 'Chemistry lab coat. Washed and ironed. Worn for one semester. Free safety goggles included.',
    category: 'clothing',
    price: 200,
    is_negotiable: false,
    condition: 'good',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1628043640059-3bbf80e4ddba?w=800&auto=format&fit=crop'],
    pickup_location: 'Chemistry Dept',
    delivery_available: true,
  },
  // User 7
  {
    title: 'Sony WH-CH710N Noise Cancelling Headphones',
    description: 'Wireless Bluetooth over-ear headphones. Great noise cancellation. Cups are slightly worn out but sound quality is totally uncompromised.',
    category: 'electronics',
    price: 3500,
    is_negotiable: true,
    condition: 'fair',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&auto=format&fit=crop'],
    pickup_location: 'Chenab Hostel',
    delivery_available: false,
  },
  {
    title: 'Introduction to Algorithms (CLRS)',
    description: 'The absolute DSA bible. Hardcover edition. Fair warning: it is very heavy to carry around.',
    category: 'books',
    price: 800,
    is_negotiable: true,
    condition: 'good',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop'],
    pickup_location: 'Computer Science block',
    delivery_available: true,
  },
  // User 8
  {
    title: 'Gym Dumbbell Set 5kg x 2',
    description: 'Hex dumbbells. Rubber coated so they do not damage the floor. Good for hostel workouts.',
    category: 'sports',
    price: 700,
    is_negotiable: false,
    condition: 'good',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800&auto=format&fit=crop'],
    pickup_location: 'Beas Hostel',
    delivery_available: false,
  },
  {
    title: 'Folding Laptop Table',
    description: 'Wooden finish laptop desk for bed. Has a cup holder and an iPad slot. Very sturdy.',
    category: 'furniture',
    price: 350,
    is_negotiable: false,
    condition: 'like_new',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=800&auto=format&fit=crop'],
    pickup_location: 'Chenab Hostel',
    delivery_available: true,
  },
  // User 9
  {
    title: 'Firefox Mountain Bike 26T',
    description: 'Excellent premium cycle. Front suspension and Shimano gears. Selling because I rarely use it anymore.',
    category: 'cycle',
    price: 6500,
    is_negotiable: true,
    condition: 'good',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&auto=format&fit=crop'],
    pickup_location: 'Satluj Hostel',
    delivery_available: false,
  },
  {
    title: 'Zebronics Mechanical Keyboard',
    description: 'Blue switches, very clicky. TKL layout. All keys work perfectly. RGB backlight is fully functional.',
    category: 'electronics',
    price: 1100,
    is_negotiable: true,
    condition: 'good',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop'],
    pickup_location: 'Library',
    delivery_available: false,
  },
  // User 10
  {
    title: 'Wireless Mouse (Logitech M170)',
    description: 'Small wireless mouse. Great for portability. Missing the battery cover flap at the bottom but it works totally fine.',
    category: 'electronics',
    price: 200,
    is_negotiable: false,
    condition: 'poor',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop'],
    pickup_location: 'Main Academic Block',
    delivery_available: true,
  },
  {
    title: 'Room Heater (Halogen)',
    description: 'Lifesaver for the winter semesters! 800W heater with 2 rods. Working properly.',
    category: 'electronics',
    price: 500,
    is_negotiable: true,
    condition: 'good',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1618392131908-1cc63e52ee3b?w=800&auto=format&fit=crop'],
    pickup_location: 'Beas Hostel',
    delivery_available: false,
  },
];

async function main() {
  console.log('🚀 Seeding 20 Marketplace items...');

  // Fetch all 10 users to get their IDs
  const { data: users, error: userErr } = await db
    .from('users')
    .select('id, email')
    .in('email', userEmails);

  if (userErr || !users || users.length === 0) {
    console.error('❌ Failed to fetch users. Did you run the previous seed file first?');
    process.exit(1);
  }

  // Map users string email -> uuid
  const userMap = new Map();
  for (const u of users) {
    userMap.set(u.email, u.id);
  }

  const itemsToInsert = [];

  // Each user gets 2 items from the array in order
  for (let i = 0; i < MARKETPLACE_ITEMS.length; i++) {
    const userEmail = userEmails[Math.floor(i / 2)];
    const userId = userMap.get(userEmail);

    if (!userId) {
      console.warn(`User ${userEmail} not found in DB! Skipping item...`);
      continue;
    }

    const item = MARKETPLACE_ITEMS[i];

    itemsToInsert.push({
      seller_id: userId,
      title: item.title,
      description: item.description,
      category: item.category,
      price: item.price,
      is_negotiable: item.is_negotiable,
      condition: item.condition,
      status: item.status,
      images: item.images,
      pickup_location: item.pickup_location,
      delivery_available: item.delivery_available,
    });
  }

  const { error } = await db.from('marketplace_items').insert(itemsToInsert);

  if (error) {
    console.error('❌ Failed to insert marketplace items:', error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully seeded ${itemsToInsert.length} marketplace products!`);
}

main().catch(err => console.error(err));
