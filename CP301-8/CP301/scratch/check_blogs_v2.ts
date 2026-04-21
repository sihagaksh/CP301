
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkBlogs() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, category, hiring_type, featured_image_url, status');
  
  if (error) {
    console.error('Error fetching blogs:', error);
    return;
  }

  console.log('--- Blog Records ---');
  data?.forEach(b => {
    console.log(`Title: ${b.title}`);
    console.log(`Slug: ${b.slug}`);
    console.log(`Category: ${b.category}`);
    console.log(`HiringType: ${b.hiring_type}`);
    console.log(`Image: ${b.featured_image_url}`);
    console.log(`Status: ${b.status}`);
    console.log('-------------------');
  });
}

checkBlogs();
