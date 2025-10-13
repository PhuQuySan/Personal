// src/app/auth/link.actions.ts
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Xử lý tạo/cập nhật liên kết người dùng
export async function upsertUserLink(formData: FormData) {
    const supabase = createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Vui lòng đăng nhập để thêm liên kết.' };
    }

    const link_name = formData.get('link_name') as string;
    const link_url = formData.get('link_url') as string;
    const description = formData.get('description') as string | null;

    const linkData = {
        user_id: user.id,
        link_name,
        link_url,
        description,
        // Giả định không có ID, luôn là insert mới cho đơn giản
    };

    const { error } = await supabase.from('user_links').insert(linkData);

    if (error) {
        console.error('Lỗi khi thêm link:', error.message);
        return { error: `Lỗi khi thêm liên kết: ${error.message}` };
    }

    revalidatePath('/dashboard');
    return { success: true };
}