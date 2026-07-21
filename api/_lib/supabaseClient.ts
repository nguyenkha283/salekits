import { createClient } from '@supabase/supabase-js';

let cachedClient: ReturnType<typeof createClient> | null = null;

/**
 * Dùng Service Role Key (không phải anon key) vì đây là backend tin cậy,
 * cần đọc/ghi trực tiếp không qua Row Level Security. TUYỆT ĐỐI không đưa
 * key này ra frontend — chỉ đọc ở đây (server), không có tiền tố VITE_.
 */
export function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Thiếu biến môi trường SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trên server.'
    );
  }

  cachedClient = createClient(url, serviceRoleKey);
  return cachedClient;
}
