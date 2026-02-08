// src/app/auth/callback/route.ts
import { createServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    // ✅ TỰ ĐỘNG NHẬN DIỆN ORIGIN
    const protocol = requestUrl.protocol;
    const host = request.headers.get('host');
    const origin = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}//${host}`;

    console.log('📧 [Callback] Code nhận được:', code ? 'CÓ' : 'KHÔNG');
    console.log('🌐 [Callback] Origin:', origin);

    if (code) {
        const supabase = await createServer();

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (!exchangeError) {
            const response = NextResponse.redirect(`${origin}/dashboard`);
            response.headers.set('Cache-Control', 'no-store, max-age=0');
            return response;
        }

        console.error('❌ [Callback] Lỗi đổi code:', exchangeError.message);
    }

    const errorUrl = new URL('/login', origin);
    errorUrl.searchParams.set('error', 'Authentication failed');
    return NextResponse.redirect(errorUrl);
}