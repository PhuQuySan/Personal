// src/app/api/qr/status/route.ts
import { NextResponse } from 'next/server';
import { createServerAdmin } from '@/lib/supabase/server-admin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) return NextResponse.json({ status: 'INVALID' });

        const supabase = createServerAdmin();

        const { data: session } = await supabase
            .from('qr_login_sessions')
            .select('*')
            .eq('token', token)
            .single();

        if (!session) return NextResponse.json({ status: 'INVALID' });

        if (new Date(session.expires_at) < new Date()) {
            return NextResponse.json({ status: 'EXPIRED' });
        }

        if (session.status === 'CONFIRMED') {
            const { data: userRes, error: userErr } =
                await supabase.auth.admin.getUserById(session.user_id);

            if (userErr || !userRes?.user?.email) {
                console.error('❌ User Error:', userErr);
                return NextResponse.json({ status: 'USER_ERROR' });
            }

            const email = userRes.user.email;

            // ✅ TỰ ĐỘNG NHẬN DIỆN DOMAIN
            const requestUrl = new URL(req.url);
            const protocol = requestUrl.protocol; // http: hoặc https:
            const host = req.headers.get('host'); // localhost:3000 hoặc phuquy.online

            // Ưu tiên NEXT_PUBLIC_SITE_URL, fallback về origin
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}//${host}`;
            const redirectTo = `${siteUrl}/auth/magic`;

            console.log('🔗 Magic Link Config:', {
                email,
                siteUrl,
                redirectTo,
                host
            });

            const { data, error } = await supabase.auth.admin.generateLink({
                type: 'magiclink',
                email,
                options: { redirectTo }
            });

            if (error || !data?.properties?.action_link) {
                console.error('❌ MAGICLINK ERROR:', error);
                return NextResponse.json({ status: 'LINK_ERROR' });
            }

            console.log('✅ Magic Link Generated');

            return NextResponse.json({
                status: 'SUCCESS',
                login_url: data.properties.action_link,
            });
        }

        return NextResponse.json({ status: session.status });

    } catch (e) {
        console.error('❌ QR STATUS ERROR:', e);
        return NextResponse.json({ status: 'ERROR' }, { status: 500 });
    }
}