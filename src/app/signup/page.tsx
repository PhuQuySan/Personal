// src/app/signup/page.tsx
'use client';

import { signUp } from '@/app/auth/actions';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function SignUpPage() {
    const searchParams = useSearchParams();
    const errorMessage = searchParams.get('error');

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
                <form className="space-y-6" action={signUp}>
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
                        />
                    </div>

                    {/* Hiển thị lỗi */}
                    {errorMessage && (
                        <div
                            className="p-3 rounded-lg text-sm font-medium bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-400"
                        >
                            {errorMessage}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-green-600 hover:bg-green-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Đăng Ký
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