// 📁 src/app/api/qr/confirm/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('DEBUG QR CONFIRM RECEIVE:', body);

        const { token, user_id } = body;

        if (!token) {
            return NextResponse.json({ error: 'INVALID_DATA', message: 'Missing token' }, { status: 400 });
        }
        if (!user_id) {
            return NextResponse.json({ error: 'INVALID_DATA', message: 'Missing user_id' }, { status: 400 });
        }

        // 1. Lấy session QR
        const { data: session, error: findError } = await supabaseAdmin
            .from('qr_login_sessions')
            .select('*')
            .eq('token', token)
            .single();

        if (findError || !session) {
            console.error('QR CONFIRM: Token not found trong DB', token);
            return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 400 });
        }

        // 2. Check expire
        const now = new Date();
        const expiresAt = new Date(session.expires_at);
        if (expiresAt < now) {
            console.error('QR CONFIRM: Token expired', { expires_at: session.expires_at, now: now.toISOString() });
            return NextResponse.json({ error: 'EXPIRED' }, { status: 400 });
        }

        // 3. Update trạng thái
        const { error: updateError } = await supabaseAdmin
            .from('qr_login_sessions')
            .update({
                status: 'CONFIRMED',
                user_id: user_id,
                confirmed_at: new Date().toISOString(),
            })
            .eq('token', token);

        if (updateError) {
            console.error('QR CONFIRM UPDATE ERROR:', updateError.message);

            // Bắt lỗi vi phạm khóa ngoại (user_id không tồn tại trong auth.users)
            if (updateError.code === '23503') {
                return NextResponse.json({
                    error: 'USER_NOT_FOUND',
                    message: 'ID người dùng không tồn tại trong hệ thống Auth.'
                }, { status: 400 });
            }

            return NextResponse.json({
                error: 'UPDATE_FAILED',
                details: updateError.message
            }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (e) {
        console.error('QR CONFIRM EXCEPTION:', e);
        return NextResponse.json({ error: 'SERVER_ERROR', message: 'Request body is invalid JSON' }, { status: 500 });
    }
}