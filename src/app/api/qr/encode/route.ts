// src/app/api/qr/encode/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const SECRET_KEY = process.env.QR_ENCRYPTION_SECRET || 'default-secret-key-change-in-production-32';
const ALGORITHM = 'aes-256-cbc';

// Đảm bảo key đúng độ dài 32 bytes cho AES-256
function getKey(secret: string): Buffer {
    return crypto.createHash('sha256').update(secret).digest();
}

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

        // Tạo IV ngẫu nhiên (Initialization Vector)
        const iv = crypto.randomBytes(16);
        const key = getKey(SECRET_KEY);

        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(payload, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Kết hợp IV + encrypted data
        const result = iv.toString('hex') + ':' + encrypted;

        return NextResponse.json({ encoded: result });
    } catch (e) {
        console.error('QR ENCODE ERROR:', e);
        return NextResponse.json({ error: 'Encoding failed' }, { status: 500 });
    }
}