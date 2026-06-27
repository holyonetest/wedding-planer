import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create the client only if both variables are configured.
// This prevents the application from crashing if the database keys are not yet set up.
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Returns true if Supabase is configured and ready to sync.
 */
export const isSupabaseConfigured = () => {
  return !!supabase;
};
