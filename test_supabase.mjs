import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY before running this smoke test.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  try {
    console.log('Attempting to contact sanctuary archives...');
    // Try to get auth config or just a simple query
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
      console.error('Connection failed:', error.message);
      if (error.message.includes('API key')) {
        console.error('The ritual token (API Key) appears invalid.');
      }
    } else {
      console.log('Connection successful! Sanctuary archives are accessible.');
    }
  } catch (err) {
    console.error('Unexpected error during ritual:', err);
  }
}

testConnection();
