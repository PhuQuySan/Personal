// 📁 src/app/api/qr/create/route.ts
import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

export async function POST() {
    try {
        const supabase = await createServer();
        const token = randomUUID();

        const expiresAt = new Date(Date.now() + 60 * 1000); // 60s

        const { error } = await supabase
            .from('qr_login_sessions')
            .insert({
                token,
                status: 'PENDING',
                expires_at: expiresAt.toISOString(),
            });

        if (error) {
            console.error('QR CREATE ERROR:', error);
            return NextResponse.json({ error: 'CREATE_FAILED' }, { status: 500 });
        }

        return NextResponse.json({
            token,
            expiresAt,
        });

    } catch (e) {
        console.error('QR CREATE EXCEPTION:', e);
        return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
    }
}
