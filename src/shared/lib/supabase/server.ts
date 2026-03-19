// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServer() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Việc setAll thất bại ở Server Component là bình thường.
                    }
                },
            },
        }
    );

    // ✅ Bỏ qua lỗi "signal is aborted without reason" từ fetch() của Next.js
    const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
    supabase.auth.getUser = async (...args) => {
        try {
            return await originalGetUser(...args);
        } catch (error: any) {
            if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                return { data: { user: null }, error: null } as any;
            }
            throw error;
        }
    };

    const originalGetSession = supabase.auth.getSession.bind(supabase.auth);
    supabase.auth.getSession = async (...args) => {
        try {
            return await originalGetSession(...args);
        } catch (error: any) {
            if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                return { data: { session: null }, error: null } as any;
            }
            throw error;
        }
    };

    return supabase;
}