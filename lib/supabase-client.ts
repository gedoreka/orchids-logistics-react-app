import { createClient } from '@supabase/supabase-js';

function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key';
  return createClient(supabaseUrl, supabaseKey);
}

export const supabase = createSupabaseClient();
