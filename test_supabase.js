const { createClient } = require('@supabase/supabase-js');
// Load environment manually to ensure we bypass Next.js build caching
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env'));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('total_duration_minutes')
      .limit(1);

    if (error) {
       console.error('QUERY FAILED:', error);
    } else {
       console.log('QUERY SUCCESS:', data);
    }
  } catch (e) {
     console.error('EXCEPTION:', e.message);
  }
  process.exit(0);
}

run();
