// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

/**
 * Hàm tạo Supabase Server Client.
 * Nó cần nhận đối tượng cookies() từ Next.js để đọc/ghi cookie.
 * @param cookieStore - Đối tượng cookies() từ 'next/headers'.
 */
export function createServer(cookieStore?: ReadonlyRequestCookies) {

    // Lấy cookieStore từ tham số hoặc từ cookies() nếu không được truyền
    const store = cookieStore || cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return store.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    try {
                        // Cú pháp này chỉ chạy được trong Server Actions/API Routes/Middleware.
                        (cookieStore as any).set({ name, value, ...options });
                    } catch (error) {
                        // Lỗi này là bình thường khi chạy trong Server Component tĩnh.
                        console.warn("Lỗi set cookie từ Server Component (Bình thường).");
                    }
                },
                remove(name: string, options: any) {
                    try {
                        (cookieStore as any).set({ name, value: '', ...options });
                    } catch (error) {
                        console.warn("Lỗi remove cookie từ Server Component (Bình thường).");
                    }
                },
            },
        }
    );
};