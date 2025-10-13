// src/app/auth/demo-auth-utils.ts
'use server';

import { cookies } from 'next/headers';
import { DEMO_UID } from './constants'; // Import từ file constants mới

// Hàm tạo cookie session demo
export async function createDemoSessionCookie(username: string) {
    // ✅ Await cookies() vì nó trả về Promise
    const cookieStore = await cookies();

    // Tạo một cookie đơn giản để mô phỏng session
    cookieStore.set('demo-auth-session', DEMO_UID, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 ngày
        path: '/',
    });
}