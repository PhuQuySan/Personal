import { createServer } from '@/shared/lib/supabase/server';
import ImageWorkspaceClient from '@/features/dashboard/components/ImageWorkspaceClient';
import { redirect } from 'next/navigation';

export default async function ImageWorkspacePage() {
    const supabase = await createServer();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?error=Vui lòng đăng nhập để xem trang Hình Ảnh.');
    }

    // Fetch user profile
    const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, user_role')
        .eq('id', user.id)
        .single();

    // Fallback if profile doesn't exist
    const userProfile = profileData || {
        id: user.id,
        full_name: user.email?.split('@')[0] || "User",
        avatar_url: null,
        user_role: "normal" as any
    };

    // Fetch initial media items
    // First, fetch the current user's items for the "My Images" section
    const { data: myImages } = await supabase
        .from('media_items')
        .select('*, profiles(full_name, avatar_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Then, fetch community images (excluding the user's own) that are marked as public
    const { data: communityImages } = await supabase
        .from('media_items')
        .select('*, profiles(full_name, avatar_url)')
        .neq('user_id', user.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50); // limit to a reasonable number initially

    return (
        <ImageWorkspaceClient
            initialMyImages={myImages || []}
            initialCommunityImages={communityImages || []}
            userId={user.id}
            userProfile={userProfile as any}
        />
    );
}
