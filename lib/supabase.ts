
import { createClient } from '@supabase/supabase-js';

/**
 * For Vite projects, environment variables MUST be accessed via import.meta.env.
 * Names must be prefixed with VITE_ in the Vercel dashboard.
 */
const env = (import.meta as any).env;

const supabaseUrl = env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || '';

export const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey);

// Create the client only if config is available
export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;
