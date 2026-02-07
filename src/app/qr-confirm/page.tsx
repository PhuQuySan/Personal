'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Check, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function QRConfirmPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Kiểm tra xem điện thoại đã login chưa
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Nếu chưa login, bắt login trên điện thoại trước
                router.push(`/login?returnUrl=/qr-confirm?token=${token}`);
            } else {
                setUser(user);
            }
            setCheckingAuth(false);
        };
        checkUser();
    }, [token, router]);

    const handleConfirm = async () => {
        if (!token || !user) return;
        setLoading(true);
        try {
            const res = await fetch('/api/qr/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            const data = await res.json();

            if (res.ok) {
                setDone(true);
            } else {
                alert(data.error || 'Lỗi xác nhận');
            }
        } catch (e) {
            alert('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    if (checkingAuth) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-10 h-10 text-blue-600" />
                </div>

                <h1 className="text-2xl font-bold mb-2">Xác nhận quyền</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Bạn đang thực hiện đăng nhập vào hệ thống trên **Máy tính**.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl mb-8 flex items-center gap-3 text-left">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Đăng nhập với tư cách</p>
                        <p className="text-sm font-semibold truncate">{user?.email}</p>
                    </div>
                </div>

                {!done ? (
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'XÁC NHẬN TRÊN PC'}
                    </button>
                ) : (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Check className="text-green-600 w-8 h-8" />
                        </div>
                        <p className="text-green-600 font-bold text-lg">Đã cấp quyền thành công!</p>
                        <p className="text-sm text-gray-400 mt-2">Máy tính của bạn sẽ tự động đăng nhập trong giây lát.</p>
                    </div>
                )}
            </div>
        </div>
    );
}