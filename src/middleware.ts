import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Middleware này chịu trách nhiệm làm mới phiên Supabase (session)
// và đảm bảo các token xác thực được lưu trữ đúng trong cookie.
export async function middleware(request: NextRequest) {
    // Tạo response để có thể ghi đè cookie (bắt buộc)
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // 1. Tạo Supabase Client cho Server (sử dụng cookie store)
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: { path?: string; expires?: Date; maxAge?: number; domain?: string; secure?: boolean; httpOnly?: boolean; sameSite?: string | boolean }) { // Sửa any bằng kiểu cụ thể
                    // Cập nhật cookie trong response, sẽ được gửi lại trình duyệt
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                        // Thêm các cờ bảo mật quan trọng
                        sameSite: 'lax',
                        secure: process.env.NODE_ENV === 'production',
                    });
                },
                remove(name: string, options: { path?: string; expires?: Date; maxAge?: number; domain?: string; secure?: boolean; httpOnly?: boolean; sameSite?: string | boolean }) { // Sửa any bằng kiểu cụ thể
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                        sameSite: 'lax',
                        secure: process.env.NODE_ENV === 'production',
                    });
                },
            },
        }
    );

    // 2. Refresh Session: Lấy phiên hiện tại và cập nhật cookie nếu cần.
    // Quan trọng: Phải gọi lệnh này để đảm bảo session được refresh!
    await supabase.auth.getSession();

    // 1. Lấy trạng thái Supabase User và Demo Session
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    const isDemoSession = request.cookies.get('demo-auth-session')?.value === 'demo-user-al-elite-leader-uid'; // Kiểm tra session demo

    // Xác định người dùng có đang đăng nhập không (Supabase hoặc Demo)
    const isLoggedIn = !!supabaseUser || isDemoSession;

    const pathname = request.nextUrl.pathname;

    // 2. Chuyển hướng Bảo vệ Route
    // Nếu người dùng chưa đăng nhập (cả 2 kiểu) và cố truy cập khu vực bảo mật
    if (!isLoggedIn && pathname.startsWith('/dashboard')) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirected_from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Nếu người dùng đã đăng nhập và cố gắng truy cập trang login/signup
    if (isLoggedIn && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
}

// Cấu hình routes mà Middleware sẽ chạy trên đó
export const config = {
    matcher: [
        // Bỏ qua các tệp tĩnh, api và _next
        '/((?!api|_next/static|_next/image|favicon.ico|assets|next.svg).*)',
    ],
};