// src/components/SettingsClient.tsx
'use client';

import { useState } from 'react';
import { User, Mail, Lock, ArrowLeft, Save, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';
import { updateProfile, updateEmail, updatePassword } from '@/app/auth/profile.actions';
import toast from 'react-hot-toast';
import AvatarUploadSimple from './AvatarUploadSimple';

interface SettingsClientProps {
    initialProfile: {
        full_name: string;
        avatar_url: string;
        email: string;
        user_role: string;
    };
}

export default function SettingsClient({ initialProfile }: SettingsClientProps) {
    const [activeTab, setActiveTab] = useState<'profile' | 'email' | 'password'>('profile');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Profile form states
    const [fullName, setFullName] = useState(initialProfile.full_name);
    const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url);

    // Email form state
    const [newEmail, setNewEmail] = useState('');

    // Password form states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Xử lý cập nhật profile
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('full_name', fullName);
        formData.append('avatar_url', avatarUrl);

        const result = await updateProfile(formData);

        if (result.success) {
            toast.success(result.message || 'Cập nhật hồ sơ thành công!');
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
        }

        setIsSubmitting(false);
    };

    // Xử lý cập nhật email
    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result = await updateEmail(newEmail);

        if (result.success) {
            toast.success(result.message || 'Đã gửi email xác nhận!');
            setNewEmail('');
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
        }

        setIsSubmitting(false);
    };

    // Xử lý đổi mật khẩu
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        setIsSubmitting(true);

        const result = await updatePassword(currentPassword, newPassword);

        if (result.success) {
            toast.success(result.message || 'Đổi mật khẩu thành công!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
        }

        setIsSubmitting(false);
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'super_elite':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full">
                        <Shield className="w-3 h-3" />
                        SUPER ELITE
                    </span>
                );
            case 'elite':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full">
                        <Shield className="w-3 h-3" />
                        ELITE
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-gray-200 text-gray-700 rounded-full dark:bg-gray-700 dark:text-gray-300">
                        <User className="w-3 h-3" />
                        NORMAL
                    </span>
                );
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại Dashboard
                </Link>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    Cài đặt tài khoản
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Quản lý thông tin cá nhân và bảo mật tài khoản của bạn
                </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <div className="flex items-center gap-4">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={fullName}
                            className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-lg object-cover"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                            <User className="w-10 h-10 text-white" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {fullName || 'Người dùng'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                            {initialProfile.email}
                        </p>
                        {getRoleBadge(initialProfile.user_role)}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 px-6 py-4 font-medium text-sm transition-colors ${
                            activeTab === 'profile'
                                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        <User className="w-4 h-4 inline mr-2" />
                        Thông tin cá nhân
                    </button>
                    <button
                        onClick={() => setActiveTab('email')}
                        className={`flex-1 px-6 py-4 font-medium text-sm transition-colors ${
                            activeTab === 'email'
                                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        <Mail className="w-4 h-4 inline mr-2" />
                        Đổi Email
                    </button>
                    <button
                        onClick={() => setActiveTab('password')}
                        className={`flex-1 px-6 py-4 font-medium text-sm transition-colors ${
                            activeTab === 'password'
                                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        <Lock className="w-4 h-4 inline mr-2" />
                        Đổi mật khẩu
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Tên đầy đủ
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Nhập tên của bạn"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Avatar
                                </label>
                                <AvatarUploadSimple
                                    currentAvatar={avatarUrl}
                                    onAvatarChange={setAvatarUrl}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Lưu thay đổi
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Email Tab */}
                    {activeTab === 'email' && (
                        <form onSubmit={handleUpdateEmail} className="space-y-6 max-w-2xl">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                    <strong>Email hiện tại:</strong> {initialProfile.email}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Email mới
                                </label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="newemail@example.com"
                                    required
                                />
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Bạn sẽ nhận được email xác nhận tại địa chỉ mới
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-5 h-5" />
                                        Gửi email xác nhận
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-2xl">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Mật khẩu hiện tại
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Nhập mật khẩu hiện tại"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Xác nhận mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Nhập lại mật khẩu mới"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang cập nhật...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5" />
                                        Đổi mật khẩu
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}