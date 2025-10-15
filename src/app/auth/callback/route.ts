// src/app/auth/callback/route.ts
import { createServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    console.log('🔐 [Auth Callback] Bắt đầu xử lý callback');

    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');

    console.log('📧 [Auth Callback] Code:', code ? 'Có' : 'Không');
    console.log('❌ [Auth Callback] Error:', error);
    console.log('📝 [Auth Callback] Error Description:', errorDescription);

    // URL redirect mặc định
    const redirectUrl = new URL('/', request.url);

    // Nếu có lỗi từ Supabase
    if (error) {
        console.error('❌ [Auth Callback] Lỗi từ Supabase:', errorDescription);
        redirectUrl.pathname = '/login';
        redirectUrl.searchParams.set('error', errorDescription || 'Xác thực thất bại');
        return NextResponse.redirect(redirectUrl);
    }

    // Nếu không có code
    if (!code) {
        console.error('❌ [Auth Callback] Không có code xác thực');
        redirectUrl.pathname = '/login';
        redirectUrl.searchParams.set('error', 'Thiếu mã xác thực');
        return NextResponse.redirect(redirectUrl);
    }

    try {
        const supabase = await createServer();

        console.log('🔄 [Auth Callback] Đang trao đổi code cho session...');
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
            console.error('❌ [Auth Callback] Lỗi trao đổi session:', exchangeError.message);
            redirectUrl.pathname = '/login';
            redirectUrl.searchParams.set('error', exchangeError.message);
            return NextResponse.redirect(redirectUrl);
        }

        console.log('✅ [Auth Callback] Xác thực thành công, chuyển hướng đến dashboard');

        // Chuyển hướng đến dashboard sau khi xác thực thành công
        redirectUrl.pathname = '/dashboard';
        return NextResponse.redirect(redirectUrl);

    } catch (error) {
        console.error('❌ [Auth Callback] Lỗi exception:', error);
        redirectUrl.pathname = '/login';
        redirectUrl.searchParams.set('error', 'Đã xảy ra lỗi không mong muốn');
        return NextResponse.redirect(redirectUrl);
    }
}