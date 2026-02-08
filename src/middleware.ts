// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    const response = NextResponse.next({
        request: { headers: request.headers },
    });

    // Add security headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Cache static assets
    if (request.nextUrl.pathname.startsWith('/_next/static/')) {
        response.headers.set(
            'Cache-Control',
            'public, max-age=31536000, immutable'
        );
    }

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

    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    const isDemoSession = request.cookies.get('demo-auth-session')?.value === 'demo-user-al-elite-leader-uid';
    const isLoggedIn = !!supabaseUser || isDemoSession;
    const pathname = request.nextUrl.pathname;

    // Cho phép /auth/magic không cần auth
    if (pathname === '/auth/magic') {
        return response;
    }

    // Bảo vệ route QR Confirm
    if (pathname === '/qr-confirm') {
        const hasEncodedData = request.nextUrl.searchParams.has('d');
        if (!hasEncodedData) {
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

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/login',
        '/signup',
        '/email-verification',
        '/qr-confirm',
        '/auth/magic', // ← THÊM DÒNG NÀY
        '/_next/static/:path*',
        '/_next/image/:path*',
    ],
};

