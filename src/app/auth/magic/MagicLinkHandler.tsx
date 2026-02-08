// 📁 src/app/auth/magic/MagicLinkHandler.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function MagicLinkHandler() {
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [error, setError] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        const handleMagicLink = async () => {
            try {
                const hash = window.location.hash;
                if (!hash) return; // Tránh chạy khi hash trống

                // ✅ XÓA HASH KHỎI URL NGAY - Tránh rò rỉ token trong history
                window.history.replaceState(null, '', window.location.pathname);

                const hashParams = new URLSearchParams(hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const type = hashParams.get('type');

                if (!accessToken || type !== 'magiclink') {
                    throw new Error('Tham số Magic Link không hợp lệ hoặc đã hết hạn');
                }

                const supabase = createClient();

                // Set session thủ công từ fragment
                const { error: sessionError } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken || '',
                });

                if (sessionError) throw sessionError;

                setStatus('success');

                // Redirect đồng bộ tương tự trang Login của bạn
                setTimeout(() => {
                    router.push('/dashboard');
                    router.refresh();
                }, 1000);

            } catch (err: any) {
                console.error('❌ Magic link error:', err);
                setError(err.message || 'Xác thực thất bại');
                setStatus('error');

                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        };

        handleMagicLink();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl animate-in zoom-in-95 duration-300">
                {status === 'processing' && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
                        <h2 className="text-xl font-bold dark:text-white">Đang xác thực...</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Vui lòng đợi trong giây lát</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4 text-green-500">
                        <CheckCircle className="w-16 h-16" />
                        <h2 className="text-xl font-bold">Xác thực thành công!</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Đang chuyển hướng đến Dashboard...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4 text-red-500">
                        <XCircle className="w-16 h-16" />
                        <h2 className="text-xl font-bold">Xác thực thất bại</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
                        <p className="text-xs text-gray-400">Đang chuyển về trang đăng nhập...</p>
                    </div>
                )}
            </div>
        </div>
    );
}