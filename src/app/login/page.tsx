// src/app/login/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

function LoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const errorMessage = searchParams.get('error');
    const successMessage = searchParams.get('message');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;

            const supabase = createClient();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setIsLoading(false);
                return;
            }

            // ✅ GIẢI PHÁP: Sử dụng router.refresh()
            // Lệnh này sẽ làm mới trang, chạy lại middleware với session mới.
            // Middleware sẽ tự động điều hướng người dùng đến /dashboard.
            router.refresh();

        } catch (err) {
            console.error('❌ [Login] Lỗi exception:', err);
            setError('Đã xảy ra lỗi không mong muốn');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Đăng nhập Elite Leader
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Truy cập khu vực tài nguyên độc quyền.
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-6" action={handleSubmit}>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="Nhập email của bạn"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Mật khẩu
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="Nhập mật khẩu"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Hiển thị thông báo Lỗi */}
                    {(errorMessage || error) && (
                        <div className="p-3 rounded-lg text-sm font-medium bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-400">
                            {error || errorMessage}
                        </div>
                    )}

                    {/* Hiển thị thông báo Thành công */}
                    {successMessage && (
                        <div className="p-3 rounded-lg text-sm font-medium bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400">
                            {successMessage}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Đang đăng nhập...
                            </>
                        ) : (
                            'Đăng Nhập'
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                        Chưa có tài khoản?{' '}
                        <Link
                            href="/signup"
                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>

                {/* Debug Info */}
                <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500 dark:text-gray-400">
                    <p>🔍 <strong>Debug:</strong> Sử dụng client-side authentication</p>
                </div>
            </div>
        </div>
    );
}

// Component chính với Suspense
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
