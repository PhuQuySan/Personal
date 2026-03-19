import { createBrowserClient } from '@supabase/ssr';
import { type SupabaseClient, type AuthChangeEvent } from '@supabase/supabase-js';

let clientInstance: SupabaseClient | null = null;

/**
 * Tạo/Lấy Supabase Client singleton cho trình duyệt (Client Components).
 */
export const createClient = () => {
    if (clientInstance) return clientInstance;

    clientInstance = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // ✅ Bỏ qua lỗi "signal is aborted without reason" do Next.js StrictMode/Navigation gây ra
    const originalGetUser = clientInstance.auth.getUser.bind(clientInstance.auth);
    clientInstance.auth.getUser = async (...args) => {
        try {
            return await originalGetUser(...args);
        } catch (error: any) {
            if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                return { data: { user: null }, error: null } as any;
            }
            throw error; // Nếu lỗi khác thì vẫn throw/báo đỏ
        }
    };
    const originalGetSession = clientInstance.auth.getSession.bind(clientInstance.auth);
    clientInstance.auth.getSession = async (...args) => {
        try {
            return await originalGetSession(...args);
        } catch (error: any) {
            if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                return { data: { session: null }, error: null } as any;
            }
            throw error;
        }
    };

    // ✅ Listen auth events once per instance
    if (typeof window !== 'undefined') {
        clientInstance.auth.onAuthStateChange((event: AuthChangeEvent) => {
            if (event === 'SIGNED_OUT') {
                console.log('🟢 Auth event: SIGNED_OUT');
            }
            if (event === 'TOKEN_REFRESHED') {
                console.log('🟢 Token refreshed successfully');
            }
        });
    }

    return clientInstance;
};