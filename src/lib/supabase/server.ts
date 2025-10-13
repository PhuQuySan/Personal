// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Hàm tạo client cho Server Component/Route Handler (sử dụng next/headers cookies)
// Tránh lỗi TS2339/TS2345 bằng cách truyền trực tiếp hàm cookies
export function createServer() {
    const cookieStore = cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // Tránh lỗi "cookies() invoked outside of a request scope" trong build
                        console.error("Lỗi khi set cookie ở Server:", error);
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // Tương tự như trên
                        console.error("Lỗi khi remove cookie ở Server:", error);
                    }
                },
            },
        }
    );
}