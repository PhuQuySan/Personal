// src/app/auth/post.actions.ts
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Sửa hàm upsertPost để trả về message khi thành công
export async function upsertPost(formData: FormData) {
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

    // Validate required fields
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
        user_id: user.id,
        tag: tag || null,
    };

    const query = id
        ? supabase.from('posts').update(postData).eq('id', id)
        : supabase.from('posts').insert(postData);

    const { error } = await query;

    if (error) {
        console.error('Lỗi khi upsert post:', error.message);
        return { error: `Lỗi khi lưu bài viết: ${error.message}` };
    }

    // Xóa cache và chuyển hướng
    revalidatePath('/dashboard');
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);

    // Sửa: Thêm message vào kết quả thành công
    return {
        success: true,
        message: id ? 'Bài viết đã được cập nhật thành công!' : 'Bài viết mới đã được tạo thành công!'
    };
}

// Xử lý xóa bài viết
export async function deletePost(postId: number) {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Vui lòng đăng nhập để thực hiện hành động này.' };
    }

    // Tùy chọn: Thêm logic kiểm tra quyền (Admin Panel chỉ dành cho Super Elite)

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (error) {
        console.error('Lỗi khi xóa bài viết:', error.message);
        return { error: `Lỗi khi xóa bài viết: ${error.message}` };
    }

    revalidatePath('/dashboard');
    revalidatePath('/blog');
    return { success: true };
}