import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();

/**
 * Khởi tạo Supabase client an toàn lúc runtime, tránh crash build time trên Vercel khi thiếu Service Key
 */
export function getSupabaseAdmin(): SupabaseClient {
  const serviceKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  ).trim();
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
