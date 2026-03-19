// src/lib/fetchUserProfile.ts (Fixed - Auto invalidate on auth change)
'use client';

import { createClient } from '@/shared/lib/supabase/client';
import type { UserProfile } from '@/shared/types';

/**
 * Fetch user profile from Supabase
 * Returns null if not authenticated
 */
export async function fetchUserProfile(): Promise<UserProfile | null> {
    try {
        const supabase = createClient();

        // Get current user, adding a small retry logic for Supabase AbortError in dev
        let authResult = await supabase.auth.getUser();
        if (authResult.error && authResult.error.name === 'AbortError') {
            console.warn('⚠️ Supabase getUser aborted, retrying...');
            await new Promise(resolve => setTimeout(resolve, 50));
            authResult = await supabase.auth.getUser();
        }

        const { data: { user }, error: authError } = authResult;

        if (authError || !user) {
            if (authError && authError.name === 'AbortError') {
                throw authError; // Throw so that cache does NOT store `null`
            }
            console.log('📭 No authenticated user');
            return null;
        }

        // Fetch profile from profiles table
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, user_role')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('❌ Profile fetch error:', profileError);
            return null;
        }

        return profile as UserProfile;
    } catch (error: any) {
        if (error && error.name === 'AbortError') {
            console.warn('⚠️ fetchUserProfile aborted, preventing null cache.');
            throw error; // Throw so useCachedData stops and doesn't cache null
        }
        console.error('❌ fetchUserProfile error:', error);
        return null;
    }
}