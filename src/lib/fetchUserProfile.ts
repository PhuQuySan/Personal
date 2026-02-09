// src/lib/fetchUserProfile.ts

import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/types';

export async function fetchUserProfile(): Promise<UserProfile | null> {
    if (typeof window === 'undefined') return null;

    // Check demo session
    const demoUID = 'demo-user-al-elite-leader-uid';
    const demoSessionCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('demo-auth-session='))
        ?.split('=')[1];

    if (demoSessionCookie === demoUID) {
        return {
            full_name: "Elite Leader Demo",
            avatar_url: null,
            user_role: 'demo'
        };
    }

    // Fetch from Supabase
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, user_role')
        .eq('id', user.id)
        .single();

    return {
        full_name: profile?.full_name || user.email || 'Người dùng',
        avatar_url: profile?.avatar_url || null,
        user_role: (profile?.user_role || 'normal') as UserProfile['user_role']
    };
}