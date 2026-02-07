// src/app/email-verification/page.tsx
'use client';

import Link from 'next/link';
import { Mail, CheckCircle, Clock, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function EmailVerificationPage() {
    const [isResending, setIsResending] = useState(false);
    const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [resendMessage, setResendMessage] = useState('');

    const handleResendEmail = async () => {
        setIsResending(true);
        setResendStatus('idle');

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user?.email) {
                setResendStatus('error');
                setResendMessage('Không tìm thấy email. Vui lòng đăng ký lại.');
                setIsResending(false);
                return;
            }

            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user.email,
            });

            if (error) {
                setResendStatus('error');
                setResendMessage(error.message);
            } else {
                setResendStatus('success');
                setResendMessage('Email xác nhận đã được gửi lại!');
            }
        } catch (err) {
            setResendStatus('error');
            setResendMessage('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        } finally {
            setIsResending(false);
            setTimeout(() => setResendStatus('idle'), 5000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
            <div className="w-full max-w-2xl">
                {/* Main Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-lg rounded-full mb-4">
                            <Mail className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Kiểm tra email của bạn
                        </h1>
                        <p className="text-blue-100">
                            Chỉ còn một bước nữa để hoàn tất đăng ký
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        {/* Success Message */}
                        <div className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                            <div className="flex-shrink-0">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">
                                    Email xác nhận đã được gửi!
                                </h3>
                                <p className="text-sm text-green-700 dark:text-green-400">
                                    Chúng tôi đã gửi một liên kết xác nhận đến hộp thư của bạn. Vui lòng kiểm tra email (kể cả thư mục spam).
                                </p>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start space-x-3 mb-4">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <h3 className="font-semibold text-blue-900 dark:text-blue-300 text-lg">
                                    Hướng dẫn xác nhận:
                                </h3>
                            </div>
                            <ol className="space-y-3 text-blue-800 dark:text-blue-300">
                                <li className="flex items-start space-x-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                                    <span>Mở email từ <strong>Elite Leader</strong> trong hộp thư của bạn</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                                    <span>Click vào nút <strong>&quot;Xác nhận Email&quot;</strong> hoặc liên kết trong email</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                                    <span>Bạn sẽ được chuyển hướng và có thể đăng nhập ngay lập tức</span>
                                </li>
                            </ol>
                        </div>

                        {/* Resend Status Messages */}
                        {resendStatus === 'success' && (
                            <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-fade-in-up">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-green-700 dark:text-green-400">{resendMessage}</p>
                            </div>
                        )}

                        {resendStatus === 'error' && (
                            <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-fade-in-up">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 dark:text-red-400">{resendMessage}</p>
                            </div>
                        )}

                        {/* Important Notes */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm space-y-2">
                                    <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                                        Lưu ý quan trọng:
                                    </p>
                                    <ul className="text-yellow-700 dark:text-yellow-400 space-y-1 list-disc list-inside">
                                        <li>Liên kết xác nhận sẽ hết hạn sau <strong>24 giờ</strong></li>
                                        <li>Kiểm tra cả thư mục <strong>Spam/Junk</strong> nếu không thấy email</li>
                                        <li>Email có thể mất vài phút để đến hộp thư của bạn</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-4">
                            <Link
                                href="/login"
                                className="group w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                            >
                                Đã xác nhận? Đăng nhập ngay
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <button
                                onClick={handleResendEmail}
                                disabled={isResending || resendStatus === 'success'}
                                className="w-full inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                {isResending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 dark:border-gray-300 mr-2"></div>
                                        Đang gửi lại...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-5 h-5 mr-2" />
                                        Gửi lại email xác nhận
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Support */}
                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Cần hỗ trợ?{' '}
                                <a
                                    href="mailto:support@eliteleader.com"
                                    className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                >
                                    Liên hệ với chúng tôi
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Info Card */}
                <div className="mt-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Tài khoản của bạn đã được tạo và đang chờ xác nhận</span>
                    </div>
                </div>
            </div>
        </div>
    );
}