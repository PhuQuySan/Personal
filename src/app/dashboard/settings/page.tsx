// src/app/dashboard/settings/page.tsx
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SettingsClient from '@/components/SettingsClient';

export default async function SettingsPage() {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Lấy thông tin profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, user_role')
        .eq('id', user.id)
        .single();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <SettingsClient
                    initialProfile={{
                        full_name: profile?.full_name || '',
                        avatar_url: profile?.avatar_url || '',
                        email: user.email || '',
                        user_role: profile?.user_role || 'normal'
                    }}
                />
            </div>
        </div>
    );
}