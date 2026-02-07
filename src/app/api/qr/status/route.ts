// 📁 src/app/api/qr/status/route.ts
import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ status: 'INVALID' });
        }

        const supabase = await createServer();

        const { data: session } = await supabase
            .from('qr_login_sessions')
            .select('*')
            .eq('token', token)
            .single();

        if (!session) {
            return NextResponse.json({ status: 'INVALID' });
        }

        if (new Date(session.expires_at) < new Date()) {
            return NextResponse.json({ status: 'EXPIRED' });
        }

        if (session.status === 'CONFIRMED') {
            // 1. Lấy email của user dựa vào user_id từ session
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(session.user_id);

            if (userError || !userData.user?.email) {
                console.error('USER NOT FOUND:', userError);
                return NextResponse.json({ status: 'USER_ERROR' });
            }

            // 2. Generate magic link bằng EMAIL (đúng theo Type của Supabase)
            const { data, error } = await supabase.auth.admin.generateLink({
                type: 'magiclink',
                email: userData.user.email, // Sử dụng email thay vì user_id
            });

            if (error || !data?.properties?.action_link) {
                console.error('MAGICLINK ERROR:', error);
                return NextResponse.json({ status: 'LINK_ERROR' });
            }

            return NextResponse.json({
                status: 'SUCCESS',
                login_url: data.properties.action_link,
            });
        }


        return NextResponse.json({ status: 'PENDING' });

    } catch (e) {
        console.error('QR STATUS ERROR:', e);
        return NextResponse.json({ status: 'ERROR' }, { status: 500 });
    }
}
