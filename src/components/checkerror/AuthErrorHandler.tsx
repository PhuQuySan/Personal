'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function AuthErrorHandler() {
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                // ✅ Chỉ xử lý SIGNED_OUT
                if (event === 'SIGNED_OUT' && !session) {
                    console.log('🔴 Session expired, redirecting to login');
                    router.push('/login');
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    return null; // Component này không render gì
}
