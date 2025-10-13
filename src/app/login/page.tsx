// src/app/login/page.tsx
'use client';

import { signIn } from '@/app/auth/actions';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, Info } from 'lucide-react';

// Tài khoản demo được sử dụng trong form hướng dẫn (Không cần dùng biến môi trường ở đây)
const DEMO_USERNAME = "elite_leader_al";
const DEMO_PASSWORD = "ITH_2025";


export default function LoginPage() {
    const searchParams = useSearchParams();
    const errorMessage = searchParams.get('error');
    const successMessage = searchParams.get('message');

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

                {/* Hướng dẫn Đăng nhập Demo */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700 mb-6 flex items-start">
                    <Info className="w-5 h-5 text-blue-700 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-blue-800 dark:text-blue-300">Test Tĩnh (Demo)</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            Nhập: **`{DEMO_USERNAME}`** (tên tài khoản) / **`{DEMO_PASSWORD}`** (mật khẩu)
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                            *Dùng email thật để đăng nhập vào tài khoản Supabase (mục đích sản xuất).*
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form className="space-y-6" action={signIn}>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Email (Hoặc Tên tài khoản Demo)
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="text" // Đổi thành type="text" để cho phép nhập username demo
                            required
                            placeholder={`Email Supabase hoặc ${DEMO_USERNAME}`}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
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
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                        />
                    </div>

                    {/* Hiển thị thông báo Lỗi hoặc Thành công */}
                    {(errorMessage || successMessage) && (
                        <div
                            className={`p-3 rounded-lg text-sm font-medium ${
                                errorMessage
                                    ? 'bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-400'
                                    : 'bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400'
                            }`}
                        >
                            {errorMessage || successMessage}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Đăng Nhập
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                        Chưa có tài khoản Supabase?{' '}
                        <Link
                            href="/signup"
                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}