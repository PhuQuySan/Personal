// src/middleware.ts

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    const response = NextResponse.next({
        request: { headers: request.headers },
    });

    // Add performance and caching headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Cache static assets
    if (request.nextUrl.pathname.startsWith('/_next/static/')) {
        response.headers.set(
            'Cache-Control',
            'public, max-age=31536000, immutable'
        );
    }

    // Cache images
    if (request.nextUrl.pathname.startsWith('/_next/image/')) {
        response.headers.set(
            'Cache-Control',
            'public, max-age=31536000, immutable'
        );
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name, value, options) {
                    response.cookies.set({ name, value, ...options });
                },
                remove(name, options) {
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    // CHỈ GỌI getUser() - Vừa để refresh session, vừa để lấy user bảo mật nhất
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    // Kiểm tra session demo (Elite Leader AL)
    const isDemoSession = request.cookies.get('demo-auth-session')?.value === 'demo-user-al-elite-leader-uid';
    const isLoggedIn = !!supabaseUser || isDemoSession;
    const pathname = request.nextUrl.pathname;

    // Logic chuyển hướng (Redirect logic)
    if (!isLoggedIn && pathname.startsWith('/dashboard')) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirected_from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect từ email-verification nếu đã verify
    if (pathname === '/email-verification' && isLoggedIn) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isLoggedIn && (pathname === '/login' || pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Chỉ chạy Middleware trên các trang cụ thể để tối ưu tốc độ load:
         * 1. Dashboard & Admin
         * 2. Login & Signup
         * 3. Email Verification
         * 4. Static assets & images (for caching headers)
         */
        '/dashboard/:path*',
        '/login',
        '/signup',
        '/email-verification',
        '/_next/static/:path*',
        '/_next/image/:path*',
    ],
};