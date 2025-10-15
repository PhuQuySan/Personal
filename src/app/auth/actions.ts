// src/app/auth/actions.ts
'use server';

import { createServer } from '@/lib/supabase/server';
import { headers, cookies } from 'next/headers'; // Không cần await ở đây
import { redirect } from 'next/navigation';
import { DEMO_USERNAME, DEMO_PASSWORD } from './constants';
import { createDemoSessionCookie } from './demo-auth-utils';

// Xử lý Đăng nhập Supabase/Demo
export async function signIn(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // 1. Xử lý Đăng nhập Demo (Nếu khớp username/password tĩnh)
    if (email === DEMO_USERNAME && password === DEMO_PASSWORD) {
        await createDemoSessionCookie(email);
        return redirect('/dashboard?message=Đăng nhập Demo thành công!');
    }

    // 2. Xử lý Đăng nhập Supabase (Sử dụng email)
    const supabase = await createServer();
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return redirect(`/login?error=${error.message}`);
    }

    return redirect('/dashboard');
}

// Xử lý Đăng ký Supabase
export async function signUp(formData: FormData) {
    try {
        console.log('🔐 [signUp Action] Bắt đầu đăng ký');

        // 🧹 FIX: Loại bỏ await khỏi headers()
        const headerInstance = headers();
        // @ts-ignore
        const origin = headerInstance.get('origin');
        const baseUrl = origin ? origin : '';

        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        console.log('📧 [signUp Action] Email:', email);

        const supabase = await createServer();

        // 1. Tạo người dùng (User)
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${baseUrl}/auth/callback`,
            },
        });

        if (error) {
            console.error('❌ [signUp Action] Lỗi đăng ký:', error.message);
            // 🧹 FIX: Trả về object thay vì redirect trực tiếp
            return {
                success: false,
                error: error.message,
                redirectUrl: `/signup?error=${encodeURIComponent(error.message)}`
            };
        }

        console.log('✅ [signUp Action] Đăng ký thành công, user:', data.user?.id);

        // 🧹 FIX: Trả về object với thông tin thành công
        return {
            success: true,
            message: 'Kiểm tra email để xác minh tài khoản của bạn.',
            redirectUrl: '/email-verification'
        };

    } catch (error) {
        console.error('❌ [signUp Action] Lỗi exception:', error);
        return {
            success: false,
            error: 'Đã xảy ra lỗi không mong muốn',
            redirectUrl: `/signup?error=${encodeURIComponent('Đã xảy ra lỗi không mong muốn')}`
        };
    }
}

// Xử lý Đăng xuất Supabase/Demo
export async function signOut() {
    const supabase = await createServer();

    // Xóa session Supabase
    await supabase.auth.signOut();

    // 🧹 FIX 2: Loại bỏ await khỏi cookies()
    const cookieStore = cookies();
    // @ts-ignore
    cookieStore.delete('demo-auth-session');

    return redirect('/');
}
