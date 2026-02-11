// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

/**
 * Tạo Supabase Client cho trình duyệt (Client Components).
 */
export const createClient = () => {
    const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 🔥 FIX: Chỉ listen các event thực sự tồn tại
    if (typeof window !== 'undefined') {
        client.auth.onAuthStateChange((event, session) => {
            // ✅ Chỉ xử lý SIGNED_OUT (bỏ USER_DELETED vì không tồn tại trong @supabase/ssr)
            if (event === 'SIGNED_OUT') {
                console.log('🟢 Auth event:', event);
            }

            if (event === 'TOKEN_REFRESHED') {
                console.log('🟢 Token refreshed successfully');
            }
        });
    }

    return client;
};