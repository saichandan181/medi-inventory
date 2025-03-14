
import { createClient } from '@supabase/supabase-js';

// Note: These values should be set in your Supabase project dashboard
// and accessed here from environment variables in a production environment
export const supabaseUrl = 'https://your-supabase-project-url.supabase.co';
export const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
