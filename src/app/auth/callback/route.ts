// 📁 src/app/auth/callback/route.ts
import { createServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const origin = requestUrl.origin;

    // Log để debug (Xóa khi deploy)
    console.log('📧 [Callback] Code nhận được:', code ? 'CÓ' : 'KHÔNG');

    if (code) {
        const supabase = await createServer();

        // Trao đổi code lấy session - Bước này ghi đè Cookies vào trình duyệt
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (!exchangeError) {
            // Đăng nhập thành công -> Điều hướng về Dashboard sạch sẽ
            const response = NextResponse.redirect(`${origin}/dashboard`);

            // Ép làm mới cache để Navigation nhận diện User ngay lập tức
            response.headers.set('Cache-Control', 'no-store, max-age=0');
            return response;
        }

        console.error('❌ [Callback] Lỗi đổi code:', exchangeError.message);
    }

    // Nếu không có code hoặc lỗi: Về login và ẩn thông tin nhạy cảm
    const errorUrl = new URL('/login', origin);
    errorUrl.searchParams.set('error', 'Authentication failed');
    return NextResponse.redirect(errorUrl);
}