// src/lib/supabase/client.ts

import { createBrowserClient } from '@supabase/ssr';

/**
 * Tạo Supabase Client cho trình duyệt (Client Components).
 * Client này sẽ sử dụng các biến NEXT_PUBLIC_ và tự động quản lý cookie/localStorage.
 */
export const createClient = () =>
    createBrowserClient(
        // NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY
        // phải được truyền vào theo chuẩn của Next.js
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );