// src/app/auth/demo-auth-utils.ts
'use server';

import { cookies } from 'next/headers';
import { DEMO_UID } from './constants';

// Hàm tạo cookie session demo
export async function createDemoSessionCookie(_username: string) {
    // ✅ FIX: Loại bỏ await
    const cookieStore = cookies();

    // Tạo một cookie đơn giản để mô phỏng session
    // @ts-ignore
    cookieStore.set('demo-auth-session', DEMO_UID, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 ngày
        path: '/',
    });
}