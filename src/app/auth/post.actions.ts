// src/app/auth/post.actions.ts
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Xử lý thêm mới hoặc cập nhật bài viết (Upsert)
 */
export async function upsertPost(formData: FormData) {
    try {
        const supabase = await createServer();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Vui lòng đăng nhập để thực hiện hành động này.' };
        }

        const id = formData.get('id') ? parseInt(formData.get('id') as string) : null;
        const title = formData.get('title') as string;
        const slug = formData.get('slug') as string;
        const summary = formData.get('summary') as string;
        const content = formData.get('content') as string;
        const is_published = formData.get('is_published') === 'on';
        const access_level = formData.get('access_level') as 'public' | 'elite' | 'super_elite';
        const tag = formData.get('tag') as string;
        const featured_image = formData.get('featured_image') as string;

        // Kiểm tra các trường bắt buộc
        if (!title || !slug || !content) {
            return { error: 'Vui lòng điền đầy đủ tiêu đề, slug và nội dung.' };
        }

        const postData = {
            title,
            slug,
            summary: summary || null,
            content,
            is_published,
            access_level,
            tag: tag || null,
            featured_image: featured_image || null,
            // user_id: user.id,
            // updated_at: new Date().toISOString()
        };

        const query = id
            ? supabase.from('posts').update(postData).eq('id', id)
            : supabase.from('posts').insert([postData]);

        const { error } = await query;

        if (error) {
            console.error('Lỗi khi upsert post:', error.message);
            return { error: `Lỗi khi lưu bài viết: ${error.message}` };
        }

        // Làm mới cache để hiển thị dữ liệu mới nhất
        revalidatePath('/dashboard');
        revalidatePath('/blog');
        revalidatePath(`/blog/${slug}`);

        return {
            success: true,
            message: id ? 'Bài viết đã được cập nhật thành công!' : 'Bài viết mới đã được tạo thành công!'
        };
    } catch (e: any) {
        return { error: `Đã xảy ra lỗi hệ thống: ${e.message}` };
    }
}

/**
 * Xử lý xóa bài viết
 */
export async function deletePost(postId: number) {
    try {
        const supabase = await createServer();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Vui lòng đăng nhập để thực hiện hành động này.' };
        }

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) {
            console.error('Lỗi khi xóa bài viết:', error.message);
            return { error: `Lỗi khi xóa bài viết: ${error.message}` };
        }

        // Xóa cache các trang quản trị và danh sách
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/admin');
        revalidatePath('/blog');

        return { success: true, message: 'Đã xóa bài viết thành công.' };
    } catch (e: any) {
        return { error: `Không thể xóa bài viết: ${e.message}` };
    }
}