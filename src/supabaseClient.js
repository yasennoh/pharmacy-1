import { createClient } from '@supabase/supabase-js';

// يمكنك العثور على هذه الروابط في لوحة تحكم Supabase الخاصة بك:
// Settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_SUPABASE_PROJECT_URL.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
