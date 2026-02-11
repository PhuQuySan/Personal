// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    // 1. Khởi tạo response ban đầu
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const url = request.nextUrl;
    const pathname = url.pathname;

    // 2. ✅ SECURITY HEADERS (Gộp gọn gàng)
    const securityHeaders = {
        'X-DNS-Prefetch-Control': 'on',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
    };

    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    // Headers riêng cho /auth/magic
    if (pathname === '/auth/magic') {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        response.headers.set('X-Robots-Tag', 'noindex, nofollow');
        response.headers.set('Referrer-Policy', 'no-referrer');
        // /auth/magic không cần check user, return luôn để tối ưu
        return response;
    }

    // Cache static assets (Dùng matcher config để lọc bớt nhưng giữ lại đây để chắc chắn)
    if (pathname.startsWith('/_next/static/') || pathname.startsWith('/_next/image/')) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        return response;
    }

    // 3. SUPABASE AUTH & REFRESH TOKEN
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name, value, options) {
                    // Logic này quan trọng để sync cookie giữa Request và Response
                    request.cookies.set({ name, value, ...options });
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name, options) {
                    request.cookies.set({ name, value: '', ...options });
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    // 🔥 FIX: Check User & Refresh Token an toàn
    let supabaseUser = null;
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            // Xóa sạch cookie nếu token lỗi/hết hạn để tránh vòng lặp redirect
            const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0];
            const cookiesToDelete = [
                'sb-access-token',
                'sb-refresh-token',
                `sb-${projectRef}-auth-token`
            ];

            cookiesToDelete.forEach(cookie => {
                if (request.cookies.get(cookie)) {
                    response.cookies.set(cookie, '', { maxAge: 0, path: '/' });
                }
            });
        } else {
            supabaseUser = user;
        }
    } catch (err) {
        // Silent error để không làm rác log build
    }

    // 4. LOGIC ĐIỀU HƯỚNG (REDIRECT)
    const isDemoSession = request.cookies.get('demo-auth-session')?.value === 'demo-user-al-elite-leader-uid';
    const isLoggedIn = !!supabaseUser || isDemoSession;

    // Bảo vệ route QR Confirm
    if (pathname === '/qr-confirm') {
        if (!url.searchParams.has('d')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Redirect logic
    if (!isLoggedIn && pathname.startsWith('/dashboard')) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirected_from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (pathname === '/email-verification' && isLoggedIn) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isLoggedIn && (pathname === '/login' || pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
}

// 5. CONFIG MATCHER (Tối ưu để Middleware KHÔNG chạy vào file tĩnh)
export const config = {
    matcher: [
        /*
         * Match tất cả request paths ngoại trừ:
         * 1. /api/ (API routes)
         * 2. /_next/ (Next.js internals)
         * 3. /_static (inside /public)
         * 4. /_vercel (Vercel internals)
         * 5. Các file tĩnh (favicon.ico, sitemap.xml, robots.txt, hình ảnh...)
         */
        '/((?!api|_next/static|_next/image|_vercel|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};