// src/components/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

// Lấy thông tin demo từ biến môi trường
const DEMO_USERNAME = process.env.NEXT_PUBLIC_DEMO_USERNAME || 'elite_leader';
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'ITH_2025';

export const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    // Custom Hook để tạo token demo (giả lập JWT) - LƯU Ý: Đã định nghĩa trong AuthProvider
    const createDemoToken = (): string => {
        // Trong thực tế, đây sẽ là JWT được tạo và ký bởi máy chủ
        const payload = {
            userId: username, // Sử dụng tên người dùng nhập vào
            role: 'elite_leader',
            iat: Date.now(),
            exp: Date.now() + 3600 * 1000, // Token hết hạn sau 1 giờ
        };
        return btoa(JSON.stringify(payload)); // Mã hóa Base64 đơn giản (Mô phỏng JWT)
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // **Xác thực Tĩnh/Demo:**
        if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
            // 1. Tạo Token Demo (Giả lập JWT)
            const demoToken = createDemoToken();

            // 2. Lưu token và cập nhật trạng thái
            login(demoToken);

            // 3. Chuyển hướng đến trang dashboard
            router.push('/dashboard');
            console.log('Đăng nhập demo thành công. Token:', demoToken);

        } else {
            setError('Tên người dùng hoặc mật khẩu demo không đúng.');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '300px', margin: '0 auto' }}>
            <h2>Đăng Nhập Demo</h2>
            <p style={{ fontSize: '0.9em', color: '#666' }}>
                Sử dụng tài khoản demo: **{DEMO_USERNAME}** / **{DEMO_PASSWORD}**
            </p>
            <input
                type="text"
                placeholder="Tên tài khoản"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
            <button
                type="submit"
                style={{ padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Đăng Nhập
            </button>
        </form>
    );
};