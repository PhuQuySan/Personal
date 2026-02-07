// src/app/signup/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

function SignUpContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const errorMessage = searchParams.get('error');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [passwordStrength, setPasswordStrength] = useState(0);

    const checkPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;
        setPasswordStrength(strength);
    };

    const handlePasswordChange = (password: string) => {
        setFormData({ ...formData, password });
        checkPasswordStrength(password);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const supabase = createClient();

            const { error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (signUpError) {
                setError(signUpError.message);
                setIsLoading(false);
                return;
            }

            // Chuyển hướng đến trang xác nhận email
            router.push('/email-verification');

        } catch (err) {
            console.error('Sign up error:', err);
            setError('Đã xảy ra lỗi không mong muốn');
            setIsLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength === 0) return 'bg-gray-200 dark:bg-gray-700';
        if (passwordStrength <= 2) return 'bg-red-500';
        if (passwordStrength === 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (passwordStrength === 0) return '';
        if (passwordStrength <= 2) return 'Yếu';
        if (passwordStrength === 3) return 'Trung bình';
        return 'Mạnh';
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Background */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
                <div className="relative z-10 flex flex-col items-center justify-center text-white p-12">
                    <div className="max-w-md space-y-6">
                        <h2 className="text-4xl font-bold">
                            Bắt đầu hành trình của bạn
                        </h2>
                        <p className="text-lg text-green-100">
                            Tham gia cộng đồng Elite Leader và mở khóa tiềm năng không giới hạn của bạn.
                        </p>
                        <div className="space-y-4 pt-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4" />
                                </div>
                                <p className="text-green-100">Miễn phí đăng ký vĩnh viễn</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4" />
                                </div>
                                <p className="text-green-100">Truy cập nội dung Public ngay lập tức</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4" />
                                </div>
                                <p className="text-green-100">Nâng cấp Elite/Super Elite bất cứ lúc nào</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo & Header */}
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl mb-4 shadow-lg shadow-green-500/30">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Tạo tài khoản mới
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Tham gia Elite Leader ngay hôm nay
                        </p>
                    </div>

                    {/* Messages */}
                    {(errorMessage || error) && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm animate-fade-in-up">
                            {error || errorMessage}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="your@email.com"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="space-y-2">
                                    <div className="flex gap-1">
                                        {[...Array(4)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-all ${
                                                    i < passwordStrength ? getStrengthColor() : 'bg-gray-200 dark:bg-gray-700'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    {getStrengthText() && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Độ mạnh mật khẩu: <span className="font-semibold">{getStrengthText()}</span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Password Requirements */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <p className="font-medium mb-2">Mật khẩu phải có:</p>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        {formData.password.length >= 8 && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span>Ít nhất 8 ký tự</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.password.match(/[a-z]/) && formData.password.match(/[A-Z]/) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        {formData.password.match(/[a-z]/) && formData.password.match(/[A-Z]/) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span>Chữ hoa và chữ thường</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.password.match(/\d/) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        {formData.password.match(/\d/) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span>Ít nhất 1 số</span>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Đang tạo tài khoản...
                                </>
                            ) : (
                                <>
                                    Tạo tài khoản
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                                    Hoặc
                                </span>
                            </div>
                        </div>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Đã có tài khoản?{' '}
                                <Link
                                    href="/login"
                                    className="font-semibold text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                >
                                    Đăng nhập ngay
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl mb-4 animate-pulse">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
                </div>
            </div>
        }>
            <SignUpContent />
        </Suspense>
    );
}