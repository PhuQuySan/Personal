// src/app/dashboard/page.tsx
// ... (import statements remain the same)

// ... (interfaces and getDashboardData function remain the same)

// Sử dụng Client Component cho Dashboard để xử lý state
'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import LinkForm from '@/components/LinkForm';
import { upsertUserLink } from '@/app/auth/link.actions';
import { User, Zap, FileText, Settings, Link as LinkIcon, ExternalLink, Edit, Trash2 } from 'lucide-react';
import Link from "next/link";

// Định nghĩa kiểu cho Profile
interface UserProfile {
    full_name: string | null;
    avatar_url: string | null;
    user_role: 'normal' | 'elite' | 'super_elite' | 'demo';
}

// Định nghĩa kiểu cho Link
interface UserLink {
    id: number;
    link_name: string;
    link_url: string;
    description: string | null;
}

export default function DashboardPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [links, setLinks] = useState<UserLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Giả lập dữ liệu ban đầu
    useEffect(() => {
        // Thay thế bằng API call thực tế trong production
        const demoProfile: UserProfile = {
            full_name: "Elite Leader Demo",
            avatar_url: null,
            user_role: "demo",
        };

        const demoLinks: UserLink[] = [
            { id: 1, link_name: "Demo Link", link_url: "https://nextjs.org", description: "Đây là link mẫu cho tài khoản demo." }
        ];

        setProfile(demoProfile);
        setLinks(demoLinks);
        setIsLoading(false);
    }, []);

    const isSuperElite = profile?.user_role === 'super_elite';
    const isDemoUser = profile?.user_role === 'demo';

    const getRoleTag = (role: UserProfile['user_role']) => {
        switch (role) {
            case 'super_elite': return <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-full dark:bg-red-900 dark:text-red-300">SUPER ELITE</span>;
            case 'elite': return <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded-full dark:bg-yellow-900 dark:text-yellow-300">ELITE</span>;
            case 'demo': return <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-300">DEMO ACCESS</span>;
            default: return <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">NORMAL</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    Dashboard Cá nhân
                </h1>

                {isSuperElite && (
                    <Link
                        href="/dashboard/admin"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center transition duration-300 shadow-md hover:shadow-lg"
                    >
                        <Settings className="w-5 h-5 mr-2" />
                        Admin Panel
                    </Link>
                )}
            </div>

            {/* 1. Thông tin Hồ sơ */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-md">
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt={profile.full_name || 'User'}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        ) : (
                            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        )}
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            Chào mừng, {profile?.full_name || 'Bạn'}!
                        </p>
                        <div className="mt-1">
                            {profile && getRoleTag(profile.user_role)}
                        </div>
                    </div>
                </div>
                {isDemoUser && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700 rounded-lg text-sm font-medium flex items-start">
                        <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>Bạn đang ở chế độ <strong>Demo Access</strong>. Hành động sẽ không được lưu vào cơ sở dữ liệu Supabase.</span>
                    </div>
                )}
            </div>

            {/* 2. Quản lý Links */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                        <LinkIcon className="w-7 h-7 mr-3 text-green-600 dark:text-green-400" />
                        Quản lý Liên kết cá nhân
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        {links.length} liên kết
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <LinkForm action={upsertUserLink} />
                    </div>

                    <div className="lg:col-span-2">
                        {links.length > 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Danh sách liên kết của bạn</h3>
                                </div>

                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {links.map((link) => (
                                        <div key={link.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition duration-150">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                                                            <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                                <a
                                                                    href={link.link_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                                                                >
                                                                    {link.link_name}
                                                                </a>
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                                                                {link.description || "Không có mô tả"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2 ml-4">
                                                    <a
                                                        href={link.link_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                        title="Mở liên kết"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>

                                                    <button
                                                        className="p-2 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-3 ml-13 text-xs text-gray-400 dark:text-gray-500">
                                                {link.link_url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 border-dashed p-8 text-center">
                                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                    <LinkIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Chưa có liên kết nào</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                    Bạn chưa thêm liên kết nào. Hãy thêm liên kết đầu tiên của bạn để quản lý dễ dàng hơn.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Quick Access */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Zap className="w-7 h-7 mr-3 text-yellow-600 dark:text-yellow-400" />
                    Truy Cập Nhanh
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/dashboard/files" className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition">
                                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white ml-4">Tệp & Bí mật</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Quản lý và truy cập các tệp tin và thông tin bí mật của bạn.
                        </p>
                        <div className="mt-4 text-blue-600 dark:text-blue-400 font-medium flex items-center group-hover:underline">
                            Truy cập ngay
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>

                    <Link href="/blog" className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition">
                                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white ml-4">Thư Viện Blog</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Xem và quản lý tất cả bài viết trong thư viện blog.
                        </p>
                        <div className="mt-4 text-green-600 dark:text-green-400 font-medium flex items-center group-hover:underline">
                            Truy cập ngay
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>

                    {isSuperElite && (
                        <Link href="/dashboard/admin" className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-800/40 transition">
                                    <Settings className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white ml-4">Admin Panel</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                Quản lý hệ thống, người dùng và các cài đặt nâng cao.
                            </p>
                            <div className="mt-4 text-red-600 dark:text-red-400 font-medium flex items-center group-hover:underline">
                                Truy cập ngay
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}