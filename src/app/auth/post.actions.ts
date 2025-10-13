// src/app/auth/post.actions.ts
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Định nghĩa kiểu dữ liệu cho Post (tương tự như trong Dashboard)
interface PostData {
    id?: number;
    title: string;
    slug: string;
    summary?: string;
    content: string;
    tag?: string;
    is_published: boolean;
    access_level: 'public' | 'elite' | 'super_elite';
}

/**
 * Hàm kiểm tra vai trò người dùng (Tạm thời: dựa trên profiles)
 */
async function checkSuperElite(supabase: ReturnType<typeof createServer>, user: any) {
    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', user.id)
        .single();

    return profile?.user_role === 'super_elite';
}


/**
 * Tạo/Cập nhật Bài viết
 */
export async function upsertPost(formData: FormData) {
    const supabase = createServer();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Kiểm tra quyền Super Elite
    if (!await checkSuperElite(supabase, user)) {
        return { error: 'Unauthorized: Bạn không có quyền Super Elite.' };
    }

    // 2. Lấy dữ liệu từ Form
    const postId = formData.get('id');
    const is_published = formData.get('is_published') === 'on';

    const postData: PostData = {
        title: formData.get('title') as string,
        slug: formData.get('slug') as string,
        summary: formData.get('summary') as string,
        content: formData.get('content') as string,
        tag: formData.get('tag') as string,
        is_published: is_published,
        // Ép kiểu cho access_level
        access_level: formData.get('access_level') as PostData['access_level'],
    };

    let error;

    if (postId) {
        // Cập nhật (UPDATE)
        ({ error } = await supabase
            .from('posts')
            .update(postData)
            .eq('id', postId));
    } else {
        // Thêm mới (INSERT)
        ({ error } = await supabase
            .from('posts')
            .insert({ ...postData, user_id: user?.id })); // Gán user_id cho bài viết
    }

    if (error) {
        console.error("Lỗi khi upsert bài viết:", error);
        return { error: error.message };
    }

    // Cần phải revalidate cả trang blog list và trang chi tiết
    revalidatePath('/dashboard');
    revalidatePath('/blog', 'layout');

    // Chuyển hướng hoặc thông báo thành công
    return { success: true, message: postId ? 'Cập nhật thành công!' : 'Tạo mới thành công!' };
}

/**
 * Xóa Bài viết
 */
export async function deletePost(id: number) {
    'use server';

    const supabase = createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!await checkSuperElite(supabase, user)) {
        return { error: 'Unauthorized: Bạn không có quyền Super Elite.' };
    }

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        return { error: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/blog', 'layout');
    return { success: true };
}