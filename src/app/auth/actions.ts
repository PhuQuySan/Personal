// src/app/auth/actions.ts
'use server';

import { createServer } from '@/lib/supabase/server';
import { headers, cookies } from 'next/headers';
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
    const supabase = createServer();
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
    // ✅ Await headers() vì nó trả về Promise
    const headerInstance = await headers();
    const origin = headerInstance.get('origin');
    const baseUrl = origin ? origin : '';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = createServer();

    // 1. Tạo người dùng
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${baseUrl}/auth/callback`,
        },
    });

    if (error) {
        return redirect(`/signup?error=${error.message}`);
    }

    return redirect('/login?message=Kiểm tra email để xác minh tài khoản của bạn.');
}

// Xử lý Đăng xuất Supabase/Demo
export async function signOut() {
    const supabase = createServer();

    // Xóa session Supabase
    await supabase.auth.signOut();

    // ✅ Xóa session Demo bằng cookies() từ Next.js
    const cookieStore = await cookies();
    cookieStore.delete('demo-auth-session');

    return redirect('/');
}