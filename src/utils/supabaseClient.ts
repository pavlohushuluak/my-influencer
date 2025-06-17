import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = 'https://db.nymia.ai/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhY2suY3J5cHRvLmNvbSIsInJlZ2lvbl91cmwiOiJ4eXpjb21wYWNrLmNyeXB0by5jb20iLCJpYXQiOjE3MTg1MjMwMjgsImV4cCI6MjAzNDE5OTAyOH0.00000000000000000000000000000000000000000000000000';

// Debug information
console.log('Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  envKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;