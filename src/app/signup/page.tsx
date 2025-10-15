// src/app/signup/page.tsx
'use client';

import { signUp } from '@/app/auth/actions';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { Suspense, useState } from 'react';

function SignUpContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const errorMessage = searchParams.get('error');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        //console.log('🚀 [SignUp] Bắt đầu đăng ký');
        setIsLoading(true);
        setError(null);

        try {
            const result = await signUp(formData);

            if (result?.success) {
             //   console.log('✅ [SignUp] Đăng ký thành công, chuyển hướng...');
                // Chuyển hướng đến trang xác nhận email
                router.push(result.redirectUrl || '/email-verification');
            } else {
              //  console.error('❌ [SignUp] Lỗi từ server:', result?.error);
                setError(result?.error || 'Đăng ký thất bại');
                setIsLoading(false);
            }

        } catch (err) {
          //  console.error('❌ [SignUp] Lỗi exception:', err);
            setError('Đã xảy ra lỗi không mong muốn');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <UserPlus className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Đăng ký Elite Leader
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Tham gia cộng đồng và truy cập tài nguyên.
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-6" action={handleSubmit}>
                    {/* Email */}
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
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition duration-200"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Mật khẩu */}
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
                            minLength={6}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition duration-200"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Hiển thị lỗi */}
                    {(errorMessage || error) && (
                        <div className="p-3 rounded-lg text-sm font-medium bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-400">
                            {error || errorMessage}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Đang đăng ký...
                            </>
                        ) : (
                            'Đăng Ký'
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                        Đã có tài khoản?{' '}
                        <Link
                            href="/login"
                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

// Component chính với Suspense boundary
export default function SignUpPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
                </div>
            </div>
        }>
            <SignUpContent />
        </Suspense>
    );
}