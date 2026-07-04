import { createBrowserClient } from '@supabase/ssr';

// Supabase istemcisini oluştururken ssr paketini kullanıyoruz
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);