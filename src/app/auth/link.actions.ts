// src/app/auth/link.actions.ts
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Xử lý tạo/cập nhật liên kết người dùng
export async function upsertUserLink(formData: FormData) {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();

    // KIỂM TRA QUYỀN VÀ TRẠNG THÁI DEMO
    const cookieStore = cookies();
    // @ts-ignore
    const isDemo = !!cookieStore.get('demo-auth-session')?.value;

    if (!user && !isDemo) {
        return { error: 'Vui lòng đăng nhập để thêm liên kết.' };
    }

    // Nếu là tài khoản Demo, không cho phép lưu vào DB
    if (isDemo) {
        // Thực hiện logic giả lập thành công để UI không bị lỗi
        revalidatePath('/dashboard');
        return { success: true, message: 'Thêm liên kết Demo thành công! (Không lưu vào DB)' };
    }

    const link_name = formData.get('link_name') as string;
    const link_url = formData.get('link_url') as string;
    const description = formData.get('description') as string | null;

    // ... (logic kiểm tra trường bắt buộc và URL giữ nguyên) ...

    const linkData = {
        user_id: user!.id,
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