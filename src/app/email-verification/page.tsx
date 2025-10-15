// src/app/email-verification/page.tsx
'use client';

import Link from 'next/link';
import { Mail, CheckCircle, Clock } from 'lucide-react';

export default function EmailVerificationPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 text-center">

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <Mail className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                        <CheckCircle className="w-6 h-6 text-green-500 absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Kiểm tra email của bạn
                </h1>

                {/* Message */}
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                    <p className="text-lg">
                        Chúng tôi đã gửi một liên kết xác nhận đến email của bạn.
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-start">
                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="text-left">
                                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                    Hướng dẫn xác nhận:
                                </h3>
                                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                                    <li>• Mở email vừa nhận được</li>
                                    <li>• Click vào liên kết xác nhận</li>
                                    <li>• Quay lại trang để đăng nhập</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Liên kết xác nhận sẽ hết hạn sau 24 giờ.
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-8 space-y-4">
                    <Link
                        href="/login"
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition duration-300"
                    >
                        Quay lại đăng nhập
                    </Link>

                    <div className="text-sm">
                        <p className="text-gray-500 dark:text-gray-400">
                            Không nhận được email?{' '}
                            <button
                                onClick={() => alert('Tính năng gửi lại email đang được phát triển')}
                                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                            >
                                Gửi lại
                            </button>
                        </p>
                    </div>
                </div>

                {/* Support */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Cần hỗ trợ? Liên hệ{' '}
                        <a
                            href="mailto:support@eliteblog.com"
                            className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                        >
                            support@eliteblog.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}