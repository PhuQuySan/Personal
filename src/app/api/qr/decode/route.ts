// src/app/api/qr/decode/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const SECRET_KEY = process.env.QR_ENCRYPTION_SECRET || 'your-secret-key-change-in-production';

export async function POST(req: Request) {
    try {
        const { encoded } = await req.json();

        if (!encoded) {
            return NextResponse.json({ error: 'Missing encoded data' }, { status: 400 });
        }

        const decipher = crypto.createDecipher('aes-256-cbc', SECRET_KEY);
        let decrypted = decipher.update(encoded, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        const payload = JSON.parse(decrypted);

        // Kiểm tra token không quá 2 phút tuổi (chống replay attack)
        if (Date.now() - payload.ts > 120000) {
            return NextResponse.json({ error: 'Token expired' }, { status: 400 });
        }

        return NextResponse.json({ token: payload.t });
    } catch (e) {
        console.error('QR DECODE ERROR:', e);
        return NextResponse.json({ error: 'Invalid encoded data' }, { status: 400 });
    }
}