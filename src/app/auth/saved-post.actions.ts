// src/app/auth/saved-post.actions.ts
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Lưu bài viết
 */
export async function savePost(postId: number) {
    try {
        const supabase = await createServer();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Vui lòng đăng nhập để lưu bài viết.' };
        }

        // Kiểm tra xem bài viết đã được lưu chưa
        const { data: existingSave } = await supabase
            .from('saved_posts')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', postId)
            .single();

        if (existingSave) {
            return { success: false, error: 'Bài viết đã được lưu trước đó.' };
        }

        // Lưu bài viết
        const { error } = await supabase
            .from('saved_posts')
            .insert([{ user_id: user.id, post_id: postId }]);

        if (error) {
            console.error('Lỗi khi lưu bài viết:', error.message);
            return { success: false, error: `Lỗi khi lưu bài viết: ${error.message}` };
        }

        revalidatePath('/dashboard/saved-posts');
        return { success: true, message: 'Đã lưu bài viết thành công!' };
    } catch (e: any) {
        console.error('Lỗi hệ thống:', e);
        return { success: false, error: `Đã xảy ra lỗi hệ thống: ${e.message}` };
    }
}

/**
 * Bỏ lưu bài viết
 */
export async function unsavePost(postId: number) {
    try {
        const supabase = await createServer();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Vui lòng đăng nhập.' };
        }

        const { error } = await supabase
            .from('saved_posts')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', postId);

        if (error) {
            console.error('Lỗi khi bỏ lưu bài viết:', error.message);
            return { success: false, error: `Lỗi khi bỏ lưu bài viết: ${error.message}` };
        }

        revalidatePath('/dashboard/saved-posts');
        return { success: true, message: 'Đã bỏ lưu bài viết.' };
    } catch (e: any) {
        console.error('Lỗi hệ thống:', e);
        return { success: false, error: `Đã xảy ra lỗi hệ thống: ${e.message}` };
    }
}

/**
 * Kiểm tra xem bài viết đã được lưu chưa
 */
export async function checkIfPostSaved(postId: number) {
    try {
        const supabase = await createServer();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { isSaved: false };
        }

        const { data } = await supabase
            .from('saved_posts')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', postId)
            .single();

        return { isSaved: !!data };
    } catch (e: any) {
        console.error('Lỗi khi kiểm tra trạng thái lưu:', e);
        return { isSaved: false };
    }
}

/**
 * Lấy danh sách bài viết đã lưu
 */
export async function getSavedPosts() {
    try {
        const supabase = await createServer();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { posts: [], error: 'Vui lòng đăng nhập.' };
        }

        const { data, error } = await supabase
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

        if (error) {
            console.error('Lỗi khi lấy bài viết đã lưu:', error.message);
            return { posts: [], error: error.message };
        }

        return { posts: data || [], error: null };
    } catch (e: any) {
        console.error('Lỗi hệ thống:', e);
        return { posts: [], error: e.message };
    }
}