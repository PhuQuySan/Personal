// src/app/dashboard/saved-posts/page.tsx
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SavedPostsClient from '@/components/Post/SAVEPOST/SavedPostsClient';

export default async function SavedPostsPage() {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Lấy danh sách bài viết đã lưu
    const { data: rawSavedPosts } = await supabase
        .from('saved_posts')
        .select(`
            id,
            created_at,
            posts (
                id,
                title,
                slug,
                summary,
                tag,
                featured_image,
                created_at,
                access_level,
                profiles (
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Transform data để match với type
    const savedPosts = (rawSavedPosts || []).map((item: any) => ({
        id: item.id,
        created_at: item.created_at,
        posts: Array.isArray(item.posts) ? item.posts[0] : item.posts
    })).filter((item: any) => item.posts); // Lọc bỏ các item không có posts

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <SavedPostsClient initialSavedPosts={savedPosts} />
            </div>
        </div>
    );
}