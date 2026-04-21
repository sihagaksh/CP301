/**
 * 07_seed_blogs.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates 20 blog posts (1 for each user u1-u20) sharing placement / internship
 * experiences at different top tech companies.
 * Includes realistic company cover images.
 *
 * Run with:
 *   npx tsx db/seeds/07_seed_blogs.ts
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

// Create 20 unique high-quality profiles
const BLOG_TEMPLATES = [
  {
    company_name: 'Google',
    role_applied: 'Software Engineering Intern',
    title: 'Cracking the Google SWE Internship',
    category: 'internship',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=1200&q=80',
    tags: ['Google', 'SWE', 'Internship', 'DSA'],
    excerpt: 'My detailed experience going through 3 technical rounds for Google Summer Internship.',
  },
  {
    company_name: 'Microsoft',
    role_applied: 'SDE Placement',
    title: 'Microsoft FTE Experience & Advice',
    category: 'placement',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=1200&q=80',
    tags: ['Microsoft', 'SDE', 'Placement', 'System Design'],
    excerpt: 'Breaking down the Microsoft on-campus placement process. How I tackled the final System Design round.',
  },
  {
    company_name: 'Amazon',
    role_applied: 'SDE Intern',
    title: '6 Months Intern at Amazon AWS',
    category: 'internship',
    hiring_type: 'off_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=1200&q=80',
    tags: ['Amazon', 'AWS', 'Internship', 'Cloud'],
    excerpt: 'Key takeaways from my 6 months off-campus internship at AWS and how I got the PPO.',
  },
  {
    company_name: 'Adobe',
    role_applied: 'Product Engineering Intern',
    title: 'Adobe On-Campus Interview Guide',
    category: 'internship',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1563207153-f404bef2228c?w=1200&q=80',
    tags: ['Adobe', 'Frontend', 'Interview'],
    excerpt: 'What Adobe looks for in their online assessments and technical interviews.',
  },
  {
    company_name: 'Atlassian',
    role_applied: 'Software Engineer',
    title: 'Journey to Atlassian Placement',
    category: 'placement',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
    tags: ['Atlassian', 'Agile', 'Engineering'],
    excerpt: 'A comprehensive guide to cracking Atlassian\'s intense pair-programming rounds.',
  },
  {
    company_name: 'De Shaw',
    role_applied: 'Systems Intern',
    title: 'De Shaw: The Ultimate Quant/Dev Prep',
    category: 'internship',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    tags: ['De Shaw', 'Fintech', 'C++'],
    excerpt: 'My preparation strategy for the challenging OS and low-level C++ questions asked at De Shaw.',
  },
  {
    company_name: 'Goldman Sachs',
    role_applied: 'Summer Analyst',
    title: 'Goldman Sachs Internship Experience',
    category: 'internship',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1611029238634-0a9f4df91e3e?w=1200&q=80',
    tags: ['Goldman Sachs', 'Finance', 'Summer Analyst'],
    excerpt: 'Navigating the 5+ rounds of interviews at Goldman Sachs and securing the offer.',
  },
  {
    company_name: 'Uber',
    role_applied: 'SDE I',
    title: 'Placement at Uber: A Rollercoaster',
    category: 'placement',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1555519808-16e63dc4e9fa?w=1200&q=80',
    tags: ['Uber', 'Backend', 'Go'],
    excerpt: 'How deeply knowing graph algorithms helped me ace the Uber machine coding round.',
  },
  {
    company_name: 'Sprinklr',
    role_applied: 'Product Engineer',
    title: 'Sprinklr Product Engineering Placement',
    category: 'placement',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
    tags: ['Sprinklr', 'Product', 'Interview'],
    excerpt: 'The importance of CS fundamentals and rapid coding during Sprinklr interviews.',
  },
  {
    company_name: 'Arcesium',
    role_applied: 'SDE Intern',
    title: 'Interning at Arcesium',
    category: 'internship',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    tags: ['Arcesium', 'Fintech', 'Data Structures'],
    excerpt: 'Detailed overview of the Hackerrank test and the data structure heavy interview rounds.',
  },
  {
    company_name: 'Databricks',
    role_applied: 'Software Engineer',
    title: 'Databricks Placement Journey',
    category: 'placement',
    hiring_type: 'off_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
    tags: ['Databricks', 'Big Data', 'Distributed Systems'],
    excerpt: 'Why distributed systems knowledge is critical for cracking Databricks.',
  },
  {
    company_name: 'Tower Research',
    role_applied: 'Quant Researcher',
    title: 'Tower Research Core Quant Interview',
    category: 'placement',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80',
    tags: ['Tower', 'HFT', 'Quant', 'Probability'],
    excerpt: 'Probability, puzzles, and insane math: My experience with Tower Research.',
  },
  {
    company_name: 'Optiver',
    role_applied: 'Quant Trader Intern',
    title: 'Trading at Optiver: My Summer',
    category: 'internship',
    hiring_type: 'off_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80',
    tags: ['Optiver', 'Trading', 'Mental Math'],
    excerpt: 'Passing the infamous 80-in-8 test and trading simulations in Amsterdam.',
  },
  {
    company_name: 'Samsung R&D',
    role_applied: 'Research Intern',
    title: 'Samsung SRI Bangalore Experience',
    category: 'internship',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1200&q=80',
    tags: ['Samsung', 'AI/ML', 'Research'],
    excerpt: 'Cracking the GSAT and working on Applied AI at Samsung R&D Institute.',
  },
  {
    company_name: 'Oracle',
    role_applied: 'Member of Technical Staff',
    title: 'Getting placed at Oracle OCI',
    category: 'placement',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&q=80',
    tags: ['Oracle', 'OCI', 'Cloud infrastructure'],
    excerpt: 'My complete interview lifecycle for Oracle Cloud Infrastructure.',
  },
  {
    company_name: 'Apple',
    role_applied: 'Hardware Engineer',
    title: 'Apple Hardware Placement Experience',
    category: 'placement',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80',
    tags: ['Apple', 'Hardware', 'VLSI'],
    excerpt: 'A comprehensive guide for core branch students to crack hardware roles at Apple.',
  },
  {
    company_name: 'Rubrik',
    role_applied: 'Software Engineer',
    title: 'Rubrik: Hacking the Placement Season',
    category: 'placement',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
    tags: ['Rubrik', 'Startups', 'Algorithms'],
    excerpt: 'How competitive programming exclusively helped me land an offer at Rubrik.',
  },
  {
    company_name: 'Salesforce',
    role_applied: 'Software Intern',
    title: 'Summer Intern at Salesforce',
    category: 'internship',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
    tags: ['Salesforce', 'CRM', 'Internship'],
    excerpt: 'The culture, the work, and the interview process at Salesforce.',
  },
  {
    company_name: 'Texas Instruments',
    role_applied: 'Analog Design Intern',
    title: 'Texas Instruments Core Internship',
    category: 'internship',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
    tags: ['TI', 'Analog', 'Core EE'],
    excerpt: 'Insights into circuit design interviews and the hardware internship experience at TI.',
  },
  {
    company_name: 'Qualcomm',
    role_applied: 'Systems Engineer',
    title: 'Qualcomm 5G Systems Placement',
    category: 'placement',
    hiring_type: 'on_campus',
    featured_image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&q=80',
    tags: ['Qualcomm', 'Signal Processing', 'Placement'],
    excerpt: 'From digital communications theory to a full-time offer at Qualcomm.',
  }
];

function generateSlug(title: string, userTag: string) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${userTag}`;
}

async function main() {
  console.log('🚀 Starting seed: 20 Blog Posts for users u1-u20');
  
  // 1. Fetch u1 to u20
  const allEmails = Array.from({ length: 20 }, (_, i) => `2023csb1097+u${i + 1}@iitrpr.ac.in`);
  const { data: users, error: userErr } = await supabase
    .from('users')
    .select('id, email')
    .in('email', allEmails);

  if (userErr || !users || users.length === 0) {
    console.error('❌ Failed to fetch users from DB', userErr);
    process.exit(1);
  }

  // Create a mapping of tag "u1" -> userId
  const userMap: Record<string, string> = {};
  users.forEach(u => {
    const match = u.email.match(/u(\d+)@/);
    if (match) {
      userMap[`u${match[1]}`] = u.id;
    }
  });

  const postsToInsert = [];

  for (let i = 0; i < 20; i++) {
    const tag = `u${i + 1}`;
    const authorId = userMap[tag];

    if (!authorId) {
      console.warn(`   ⚠️ User ${tag} not found, skipping their blog.`);
      continue;
    }

    const tpl = BLOG_TEMPLATES[i];
    
    // Some basic markdown content to make it look realistic
    const content = `
### Background and Prep

I started preparing about 6 months prior to the season. The process focused heavily on DSA, OS, and System Design principles relative to ${tpl.company_name}.
If there's one thing you should take away, it's that consistency matters more than raw hours put in right before the interview.

### The Interview Process

The interview process consisted of:

1. **Online Assessment:** Focused on competitive programming algorithms.
2. **Technical Round 1:** Mostly focused on data structures, specifically trees and dynamic programming.
3. **Technical Round 2:** An extended deep dive into my past projects and low-level design.
4. **HR / Fit Round:** Behavioral questions regarding situations I faced on a team.

### Final Thoughts

To sum it up, working as a ${tpl.role_applied} was an incredibly rigorous but rewarding experience. 
I am extremely grateful to my seniors and friends who guided me throughout!
    `.trim();

    postsToInsert.push({
      author_id: authorId,
      title: tpl.title,
      slug: generateSlug(tpl.title, tag),
      content,
      excerpt: tpl.excerpt,
      featured_image_url: tpl.featured_image_url,
      category: tpl.category,
      tags: tpl.tags,
      company_name: tpl.company_name,
      role_applied: tpl.role_applied,
      hiring_type: tpl.hiring_type,
      status: 'published',
      is_featured: i < 5, // make the first 5 featured
      allow_comments: true,
      view_count: Math.floor(Math.random() * 500) + 50,
      like_count: Math.floor(Math.random() * 100) + 10,
      published_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  const { error } = await supabase.from('blog_posts').insert(postsToInsert);

  if (error) {
    console.error('❌ Failed to insert blogs:', error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully seeded ${postsToInsert.length} placement/internship blogs!`);
}

main().catch(console.error);
