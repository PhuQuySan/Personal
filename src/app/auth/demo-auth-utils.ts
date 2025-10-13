// Sửa cảnh báo 'username' is defined but never used
'use server';

import { cookies } from 'next/headers';
import { DEMO_UID } from './constants';

// Hàm tạo cookie session demo
export async function createDemoSessionCookie(_username: string) { // Thêm dấu gạch dưới để chỉ ra biến không sử dụng
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