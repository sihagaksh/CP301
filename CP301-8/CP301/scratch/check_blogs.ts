
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
    .select('category, hiring_type, status');
  
  if (error) {
    console.error('Error fetching blogs:', error);
    return;
  }

  const stats = data.reduce((acc, curr) => {
    const key = `${curr.category} | ${curr.hiring_type} | ${curr.status}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  console.log('Blog statistics:');
  console.log(stats);
}

checkBlogs();
