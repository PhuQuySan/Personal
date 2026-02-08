// src/app/qr-confirm/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, Shield, XCircle, Loader2 } from 'lucide-react';

export default function QRConfirmPage() {
    const params = useSearchParams();
    const encodedData = params.get('d'); // Đổi từ 'token' sang 'd' (data)
    const router = useRouter();

    const [status, setStatus] = useState<'LOADING' | 'READY' | 'SUCCESS' | 'ERROR'>('LOADING');
    const [error, setError] = useState<string | null>(null);
    const [decodedToken, setDecodedToken] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            if (!encodedData) {
                setError('Mã QR không hợp lệ');
                setStatus('ERROR');
                return;
            }

            // Giải mã token
            try {
                const decodeRes = await fetch('/api/qr/decode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ encoded: encodedData })
                });

                const decodeData = await decodeRes.json();

                if (!decodeData.token) {
                    setError('Không thể giải mã QR');
                    setStatus('ERROR');
                    return;
                }

                setDecodedToken(decodeData.token);

            } catch (e) {
                setError('Mã QR không hợp lệ hoặc đã hết hạn');
                setStatus('ERROR');
                return;
            }

            // Kiểm tra đăng nhập
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push(`/login?redirect=/qr-confirm?d=${encodedData}`);
                return;
            }

            setStatus('READY');
        };

        init();
    }, [encodedData, router]);

    const handleConfirm = async () => {
        try {
            setStatus('LOADING');

            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError('Vui lòng đăng nhập trước');
                setStatus('ERROR');
                return;
            }

            const res = await fetch('/api/qr/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: decodedToken,
                    user_id: user.id
                })
            });

            const data = await res.json();

            if (data.success) {
                setStatus('SUCCESS');
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            } else {
                setError(data.message || 'Xác nhận thất bại');
                setStatus('ERROR');
            }

        } catch (e) {
            setError('Lỗi kết nối server');
            setStatus('ERROR');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl">

                <Shield className="w-16 h-16 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
                <h1 className="text-2xl font-bold mb-2 dark:text-white">Xác nhận đăng nhập</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                    Thiết bị này sẽ đăng nhập vào tài khoản của bạn
                </p>

                {status === 'LOADING' && (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        <p className="text-sm text-gray-500">Đang xử lý...</p>
                    </div>
                )}

                {status === 'READY' && (
                    <button
                        onClick={handleConfirm}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                    >
                        Xác nhận đăng nhập
                    </button>
                )}

                {status === 'SUCCESS' && (
                    <div className="text-green-500 flex flex-col items-center gap-3">
                        <CheckCircle className="w-16 h-16" />
                        <p className="font-semibold text-lg">Đã xác nhận thành công!</p>
                        <p className="text-xs text-gray-400">Đang chuyển hướng...</p>
                    </div>
                )}

                {status === 'ERROR' && (
                    <div className="text-red-500 flex flex-col items-center gap-3">
                        <XCircle className="w-12 h-12" />
                        <p className="font-semibold">{error}</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="mt-4 px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            Quay lại đăng nhập
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}