
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error fetching blog_posts:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns in blog_posts:', Object.keys(data[0]));
  } else {
    console.log('Table is empty, checking structure via RPC or info schema...');
    const { data: cols, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'blog_posts' });
    if (colError) {
      // fallback to a generic query that fails if column missing
      const { error: testError } = await supabase.from('blog_posts').select('hiring_type').limit(1);
      if (testError) {
        console.log('hiring_type column DOES NOT exist');
      } else {
        console.log('hiring_type column EXISTS');
      }
    } else {
      console.log('Columns:', cols);
    }
  }
}

checkSchema();
