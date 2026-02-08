// src/components/QRMethod/QRLoginModal.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useQRLogin } from '@/hooks/useQRLogin';
import { CheckCircle, RefreshCw, XCircle, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const QRCodeCanvas = dynamic(
    () => import('qrcode.react').then((mod) => mod.QRCodeCanvas),
    { ssr: false }
);

export function QRLoginModal({ onClose }: { onClose: () => void }) {
    const { token, status, createQR, reset } = useQRLogin();
    const [encodedToken, setEncodedToken] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        createQR();
    }, [createQR]);

    // Mã hóa token trước khi hiển thị QR
    useEffect(() => {
        if (token && status === 'PENDING') {
            fetch('/api/qr/encode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.encoded) {
                        setEncodedToken(data.encoded);
                    }
                })
                .catch(err => console.error('Encode error:', err));
        }
    }, [token, status]);

    // Lắng nghe Auth State Change
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
                console.log('✅ QR Auth State Change: Thành công');
                router.push('/dashboard');
                router.refresh();
                setTimeout(() => onClose(), 500);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase, router, onClose]);

    // UI phản hồi
    useEffect(() => {
        if (status === 'SUCCESS') {
            const timer = setTimeout(() => {
                onClose();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [status, onClose]);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-5 w-full max-w-[320px] text-center transform transition-all animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Đăng nhập bằng QR
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                    Dùng thiết bị đã đăng nhập để quét mã
                </p>

                <div className="flex flex-col justify-center items-center min-h-[200px] bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    {status === 'CREATING' && (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
                            <p className="text-xs text-gray-400">Đang tạo mã...</p>
                        </div>
                    )}

                    {status === 'PENDING' && encodedToken && (
                        <div className="bg-white p-3 rounded-2xl shadow-sm">
                            <QRCodeCanvas
                                value={`${window.location.origin}/qr-confirm?d=${encodedToken}`}
                                size={220}
                                level="H"
                                includeMargin={false}
                                className="rounded-lg"
                            />
                        </div>
                    )}

                    {status === 'SUCCESS' && (
                        <div className="flex flex-col items-center gap-3 text-green-500 animate-in fade-in zoom-in">
                            <CheckCircle className="w-16 h-16" />
                            <p className="font-bold text-lg">Xác thực thành công!</p>
                            <p className="text-xs text-gray-400 italic">Đang đồng bộ tài khoản...</p>
                        </div>
                    )}

                    {(status === 'EXPIRED' || status === 'ERROR') && (
                        <div className="flex flex-col items-center gap-4 p-4 text-orange-500">
                            <XCircle className="w-14 h-14" />
                            <p className="font-semibold text-center">
                                {status === 'EXPIRED' ? 'QR đã hết hạn' : 'Lỗi kết nối server'}
                            </p>
                            <button
                                onClick={() => {
                                    reset();
                                    setEncodedToken(null);
                                    createQR();
                                }}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Làm mới mã
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-6 text-[11px] text-gray-400 uppercase tracking-widest">
                    Elite Leader Security System
                </div>
            </div>
        </div>
    );
}