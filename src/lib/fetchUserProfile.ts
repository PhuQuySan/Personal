// src/lib/fetchUserProfile.ts (Fixed - Auto invalidate on auth change)
'use client';

import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/types';

/**
 * Fetch user profile from Supabase
 * Returns null if not authenticated
 */
export async function fetchUserProfile(): Promise<UserProfile | null> {
    try {
        const supabase = createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.log('📭 No authenticated user');
            return null;
        }

        // Fetch profile from profiles table
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, user_role')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('❌ Profile fetch error:', profileError);
            return null;
        }

        console.log('✅ Profile fetched:', profile?.full_name);

        return profile as UserProfile;
    } catch (error) {
        console.error('❌ fetchUserProfile error:', error);
        return null;
    }
}