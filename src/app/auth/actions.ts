// src/app/auth/actions.ts
'use server';

import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache'; // 🌟 ĐÃ THÊM IMPORT

// Thông tin tài khoản Demo
const DEMO_USER = {
    username: process.env.DEMO_USERNAME || 'elite_leader_al',
    password: process.env.DEMO_PASSWORD || 'ITH_2025',
    uid: 'demo-user-al-elite-leader-uid'
};

/**
 * Xử lý Đăng nhập (Sign In)
 */
export async function signIn(formData: FormData) {
    const inputIdentifier = formData.get('email') as string;
    const password = formData.get('password') as string;

    const cookieStore = cookies(); // Lấy cookie store một lần

    // 🎯 TRƯỜNG HỢP 1: KIỂM TRA ĐĂNG NHẬP DEMO (TEST TĨNH)
    if (inputIdentifier === DEMO_USER.username && password === DEMO_USER.password) {
        cookieStore.set('demo-auth-session', DEMO_USER.uid, { // SỬ DỤNG cookieStore đã gán
            maxAge: 60 * 60 * 24 * 7, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/',
        });
        redirect('/dashboard');
    }

    // 🎯 TRƯỜNG HỢP 2: SUPABASE AUTH THỰC TẾ
    if (!inputIdentifier.includes('@') || !inputIdentifier.includes('.')) {
        return `/login?error=${encodeURIComponent('Vui lòng nhập email hợp lệ cho tài khoản Supabase, hoặc sử dụng tài khoản Demo.')}`;
    }

    // Truyền cookieStore vào createServer để đảm bảo ngữ cảnh đúng
    const supabase = createServer(cookieStore);

    const { error } = await supabase.auth.signInWithPassword({ email: inputIdentifier, password });

    if (error) {
        // Thông báo lỗi thân thiện hơn
        const message = (error.message.includes('Invalid login credentials') || error.message.includes('AuthApiError'))
            ? 'Tên tài khoản hoặc mật khẩu không chính xác.'
            : error.message;

        return `/login?error=${encodeURIComponent(message)}`;
    }

    redirect('/dashboard');
}

/**
 * Xử lý Đăng ký (Sign Up)
 */
export async function signUp(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (email === DEMO_USER.username) {
        return `/signup?error=${encodeURIComponent('Không thể dùng username demo để đăng ký tài khoản Supabase.')}`;
    }

    const supabase = createServer();

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
        let message = error.message;

        // Thông báo lỗi "Email đã tồn tại" thân thiện hơn
        if (error.message.includes('User already registered') || error.message.includes('already exists')) {
            message = 'Địa chỉ email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.';
        }

        return `/signup?error=${encodeURIComponent(message)}`;
    }

    throw redirect('/login?message=Vui lòng kiểm tra email để xác nhận đăng ký.');
}

/**
 * Xử lý Đăng xuất (Sign Out)
 */
export async function signOut() {
    // 1. Lấy cookie store một lần
    const cookieStore = cookies();

    // 2. Tạo Supabase Client
    const supabase = createServer(cookieStore); // Truyền cookieStore cho Supabase Client
    await supabase.auth.signOut();

    // 3. 🌟 KHẮC PHỤC LỖI: Sử dụng biến cookieStore đã được gán
    cookieStore.delete('demo-auth-session');

    redirect('/');
}
/**
 * Xử lý thêm/sửa Link Cá nhân
 * @param formData - Dữ liệu form chứa link_name, link_url, description
 */
export async function upsertUserLink(formData: FormData) {
    'use server';

    const id = formData.get('id'); // Có thể là null nếu là thêm mới
    const link_name = formData.get('link_name') as string;
    const link_url = formData.get('link_url') as string;
    const description = formData.get('description') as string;

    const supabase = createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized: User not logged in.' };
    }

    const linkData = {
        user_id: user.id,
        link_name,
        link_url,
        description,
    };

    let error;

    if (id) {
        // Cập nhật (Update)
        ({ error } = await supabase
            .from('user_links')
            .update(linkData)
            .eq('id', id)
            .eq('user_id', user.id)); // Đảm bảo chỉ sửa link của chính mình
    } else {
        // Thêm mới (Insert)
        ({ error } = await supabase
            .from('user_links')
            .insert(linkData));
    }

    if (error) {
        console.error("Lỗi khi upsert link:", error);
        return { error: error.message };
    }

    // Chuyển hướng về dashboard sau khi thành công
    revalidatePath('/dashboard');
    return { success: true };
}

/**
 * Xử lý xóa Link Cá nhân
 */
export async function deleteUserLink(id: number) {
    'use server';

    const supabase = createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized: User not logged in.' };
    }

    // Xóa link
    const { error } = await supabase
        .from('user_links')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Đảm bảo chỉ xóa link của chính mình

    if (error) {
        console.error("Lỗi khi xóa link:", error);
        return { error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true };
}
