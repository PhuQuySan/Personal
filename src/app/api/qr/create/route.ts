// 📁 src/app/api/qr/create/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔥 service role = bypass RLS
);

export async function POST() {
    try {
        const token = randomUUID();
        const expiresAt = new Date(Date.now() + 60 * 1000); // 60s

        const { error } = await supabaseAdmin
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
