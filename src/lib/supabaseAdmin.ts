import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ntkpdadakcyugvivvsjw.supabase.co';

const FALLBACK_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50a3BkYWRha2N5dWd2aXZ2c2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwODA3OTMsImV4cCI6MjEwNTY1Njc5M30.NGTqZizyGv8j7iLbi4cuEPcgMmydux5mV6jOG7qBhjo';

/**
 * Khởi tạo Supabase client an toàn lúc runtime, tránh crash build time trên Vercel khi thiếu Service Key
 */
export function getSupabaseAdmin(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_KEY;
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Proxy tương thích ngược: Chỉ khởi tạo createClient khi có lệnh gọi thực tế
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    const val = (client as any)[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  },
});
