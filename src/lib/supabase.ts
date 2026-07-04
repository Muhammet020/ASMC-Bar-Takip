import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Eğer değişkenler boşsa hatayı burada yakalayalım
  console.error("Supabase ortam değişkenleri bulunamadı!");
}

export const supabase = createBrowserClient(
  supabaseUrl!,
  supabaseAnonKey!
);