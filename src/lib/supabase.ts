import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";

// Hem fonksiyonu hem de ana nesneyi export edelim
export const getSupabaseClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = getSupabaseClient();