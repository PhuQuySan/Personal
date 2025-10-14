// src/app/auth/link.actions.ts
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Xử lý tạo/cập nhật liên kết người dùng
export async function upsertUserLink(formData: FormData) {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Vui lòng đăng nhập để thêm liên kết.' };
    }

    const link_name = formData.get('link_name') as string;
    const link_url = formData.get('link_url') as string;
    const description = formData.get('description') as string | null;

    // Kiểm tra các trường bắt buộc
    if (!link_name || !link_url) {
        return { error: 'Vui lòng điền đầy đủ tên liên kết và URL.' };
    }

    // Kiểm tra URL hợp lệ
    try {
        new URL(link_url);
    } catch (e) {
        return { error: 'URL không hợp lệ. Vui lòng nhập URL đầy đủ (https://...)' };
    }

    const linkData = {
        user_id: user.id,
        link_name,
        link_url,
        description: description || null,
    };

    const { error } = await supabase.from('user_links').insert(linkData);

    if (error) {
        console.error('Lỗi khi thêm link:', error.message);
        return { error: `Lỗi khi thêm liên kết: ${error.message}` };
    }

    revalidatePath('/dashboard');
    return { success: true, message: 'Thêm liên kết thành công!' };
}