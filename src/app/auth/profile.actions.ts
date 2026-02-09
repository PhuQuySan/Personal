// src/app/auth/profile.actions.ts
'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Cập nhật thông tin hồ sơ
 */
export async function updateProfile(formData: FormData) {
    try {
        const supabase = await createServer();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Vui lòng đăng nhập để cập nhật hồ sơ.' };
        }

        const full_name = formData.get('full_name') as string;
        const avatar_url = formData.get('avatar_url') as string;

        // Validate
        if (!full_name || full_name.trim().length === 0) {
            return { success: false, error: 'Tên không được để trống.' };
        }

        // Cập nhật profile trong bảng profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: full_name.trim(),
                avatar_url: avatar_url || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (profileError) {
            console.error('Lỗi khi cập nhật profile:', profileError.message);
            return { success: false, error: `Lỗi khi cập nhật hồ sơ: ${profileError.message}` };
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/settings');

        return {
            success: true,
            message: 'Cập nhật hồ sơ thành công!'
        };
    } catch (e: any) {
        console.error('Lỗi hệ thống:', e);
        return { success: false, error: `Đã xảy ra lỗi hệ thống: ${e.message}` };
    }
}

/**
 * Cập nhật email (yêu cầu xác nhận)
 */
export async function updateEmail(newEmail: string) {
    try {
        const supabase = await createServer();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Vui lòng đăng nhập.' };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return { success: false, error: 'Email không hợp lệ.' };
        }

        if (newEmail === user.email) {
            return { success: false, error: 'Email mới giống với email hiện tại.' };
        }

        // Cập nhật email (sẽ gửi email xác nhận)
        const { error } = await supabase.auth.updateUser({
            email: newEmail
        });

        if (error) {
            console.error('Lỗi khi cập nhật email:', error.message);
            return { success: false, error: `Lỗi khi cập nhật email: ${error.message}` };
        }

        return {
            success: true,
            message: 'Đã gửi email xác nhận đến địa chỉ mới. Vui lòng kiểm tra hộp thư để xác nhận.'
        };
    } catch (e: any) {
        console.error('Lỗi hệ thống:', e);
        return { success: false, error: `Đã xảy ra lỗi hệ thống: ${e.message}` };
    }
}

/**
 * Đổi mật khẩu
 */
export async function updatePassword(currentPassword: string, newPassword: string) {
    try {
        const supabase = await createServer();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return { success: false, error: 'Vui lòng đăng nhập.' };
        }

        // Validate mật khẩu mới
        if (newPassword.length < 6) {
            return { success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
        }

        // Xác thực mật khẩu hiện tại
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (signInError) {
            return { success: false, error: 'Mật khẩu hiện tại không đúng.' };
        }

        // Cập nhật mật khẩu mới
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('Lỗi khi cập nhật mật khẩu:', error.message);
            return { success: false, error: `Lỗi khi cập nhật mật khẩu: ${error.message}` };
        }

        return {
            success: true,
            message: 'Đổi mật khẩu thành công!'
        };
    } catch (e: any) {
        console.error('Lỗi hệ thống:', e);
        return { success: false, error: `Đã xảy ra lỗi hệ thống: ${e.message}` };
    }
}

/**
 * Lấy thông tin profile hiện tại
 */
export async function getCurrentProfile() {
    try {
        const supabase = await createServer();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { profile: null, error: 'Vui lòng đăng nhập.' };
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, user_role')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Lỗi khi lấy profile:', error.message);
            return { profile: null, error: error.message };
        }

        return {
            profile: {
                ...profile,
                email: user.email
            },
            error: null
        };
    } catch (e: any) {
        console.error('Lỗi hệ thống:', e);
        return { profile: null, error: e.message };
    }
}