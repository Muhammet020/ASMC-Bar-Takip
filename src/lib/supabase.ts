import { createBrowserClient } from '@supabase/ssr';

// Sabit değişkenlere fallback (varsayılan değer) ekleyelim ki build patlamasın
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);