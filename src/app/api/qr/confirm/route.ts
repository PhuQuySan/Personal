// 📁 src/app/api/qr/confirm/route.ts
import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const { token } = await req.json();
        const supabase = await createServer();

        // Lấy user từ session mobile
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
        }

        // Check session tồn tại
        const { data: session } = await supabase
            .from('qr_login_sessions')
            .select('*')
            .eq('token', token)
            .single();

        if (!session) {
            return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 404 });
        }

        if (session.status !== 'PENDING') {
            return NextResponse.json({ error: 'USED_TOKEN' }, { status: 400 });
        }

        if (new Date(session.expires_at) < new Date()) {
            return NextResponse.json({ error: 'EXPIRED' }, { status: 400 });
        }

        // Confirm
        const { error } = await supabase
            .from('qr_login_sessions')
            .update({
                status: 'CONFIRMED',
                user_id: user.id,
            })
            .eq('token', token);

        if (error) {
            console.error('QR CONFIRM ERROR:', error);
            return NextResponse.json({ error: 'CONFIRM_FAILED' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (e) {
        console.error('QR CONFIRM EXCEPTION:', e);
        return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
    }
}
