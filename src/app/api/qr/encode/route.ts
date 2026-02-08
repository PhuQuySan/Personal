// src/app/api/qr/encode/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const SECRET_KEY = process.env.QR_ENCRYPTION_SECRET || 'your-secret-key-change-in-production';

export async function POST(req: Request) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: 'Missing token' }, { status: 400 });
        }

        // Mã hóa token với timestamp để tránh replay attack
        const payload = JSON.stringify({
            t: token,
            ts: Date.now()
        });

        const cipher = crypto.createCipher('aes-256-cbc', SECRET_KEY);
        let encrypted = cipher.update(payload, 'utf8', 'hex');
        encrypted += cipher.final('hex');


        return NextResponse.json({ encoded: encrypted });
    } catch (e) {
        console.error('QR ENCODE ERROR:', e);
        return NextResponse.json({ error: 'Encoding failed' }, { status: 500 });
    }
}