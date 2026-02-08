// src/app/qr-test/page.tsx
'use client';

import { useQRLogin } from '@/hooks/useQRLogin'; // Điều chỉnh đường dẫn hook của bạn
import { useState } from 'react';

export default function QRTestPage() {
    const { token, status, expiresAt, createQR, reset } = useQRLogin();
    const [testUserId, setTestUserId] = useState('');
    const [confirmMsg, setConfirmMsg] = useState('');

    // Hàm giả lập hành động "Quét và Xác nhận" từ điện thoại
    const simulateConfirm = async () => {
        if (!token || !testUserId) {
            alert('Vui lòng tạo Token và nhập User ID để test!');
            return;
        }

        try {
            const res = await fetch('/api/qr/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token,
                    user_id: testUserId
                })
            });
            const data = await res.json();
            setConfirmMsg(JSON.stringify(data, null, 2));
        } catch (e) {
            setConfirmMsg('Lỗi khi gọi API Confirm');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>QR Login Test Dashboard</h2>

            <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>1. Trình tạo QR (Phía Web)</h3>
                <p>Trạng thái: <strong>{status}</strong></p>
                {token && (
                    <div style={{ background: '#f0f0f0', padding: '10px', wordBreak: 'break-all' }}>
                        <p><strong>Token:</strong> {token}</p>
                        <p><strong>Hết hạn lúc:</strong> {expiresAt?.toLocaleTimeString()}</p>
                    </div>
                )}
                <div style={{ marginTop: '10px' }}>
                    <button onClick={createQR} disabled={status === 'CREATING' || status === 'PENDING'} style={{ marginRight: '10px', padding: '8px 16px' }}>
                        Tạo Token mới
                    </button>
                    <button onClick={reset} style={{ padding: '8px 16px' }}>Reset</button>
                </div>
            </div>

            <div style={{ border: '1px solid #007bff', padding: '15px', borderRadius: '8px' }}>
                <h3>2. Giả lập App Confirm (Phía Điện thoại)</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    Copy UUID từ bảng <i>auth.users</i> trong Supabase dán vào đây để test logic xác nhận.
                </p>
                <input
                    type="text"
                    placeholder="Dán User UUID vào đây..."
                    value={testUserId}
                    onChange={(e) => setTestUserId(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
                />
                <button
                    onClick={simulateConfirm}
                    disabled={!token}
                    style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Gửi yêu cầu Confirm
                </button>

                {confirmMsg && (
                    <pre style={{ background: '#222', color: '#0f0', padding: '10px', marginTop: '10px', borderRadius: '4px', overflow: 'auto' }}>
                        {confirmMsg}
                    </pre>
                )}
            </div>

            {status === 'SUCCESS' && (
                <div style={{ marginTop: '20px', color: 'green', fontWeight: 'bold' }}>
                    ✅ Đăng nhập thành công! Đang chuyển hướng...
                </div>
            )}
        </div>
    );
}