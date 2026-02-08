// src/app/api/qr/decode/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const SECRET_KEY = process.env.QR_ENCRYPTION_SECRET || 'default-secret-key-change-in-production-32';
const ALGORITHM = 'aes-256-cbc';

function getKey(secret: string): Buffer {
    return crypto.createHash('sha256').update(secret).digest();
}

export async function POST(req: Request) {
    try {
        const { encoded } = await req.json();

        if (!encoded) {
            return NextResponse.json({ error: 'Missing encoded data' }, { status: 400 });
        }

        // Tách IV và encrypted data
        const parts = encoded.split(':');
        if (parts.length !== 2) {
            return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
        }

        const iv = Buffer.from(parts[0], 'hex');
        const encryptedData = parts[1];
        const key = getKey(SECRET_KEY);

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
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