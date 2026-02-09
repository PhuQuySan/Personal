// src/components/DashboardClient.tsx
'use client';

import { useState } from 'react';
import LinkForm from '@/components/Post/LinkForm';
import { upsertUserLink } from '@/app/auth/link.actions';
import { User, Zap, FileText, Settings, Link as LinkIcon, ExternalLink, Edit, Copy, Check, Trash2, User as UserIcon, Bookmark } from 'lucide-react';
import Link from "next/link";
import { ActionResult } from '@/types';
import { Loader2 } from 'lucide-react';
import toast from "react-hot-toast";
import Image from "next/image"



// Giả định các kiểu dữ liệu đã được import từ types/index.ts hoặc được định nghĩa ở đây
interface UserProfile {
    full_name: string | null;
    avatar_url: string | null;
    user_role: 'normal' | 'elite' | 'super_elite' | 'demo';
}

interface UserLink {
    id: number;
    link_name: string;
    link_url: string;
    description: string | null;
}

interface DashboardClientProps {
    initialProfile: UserProfile;
    initialLinks: UserLink[];
}

export default function DashboardClient({ initialProfile, initialLinks }: DashboardClientProps) {
    const [profile, setProfile] = useState<UserProfile>(initialProfile);
    const [links, setLinks] = useState<UserLink[]>(initialLinks);
    const [isSubmittingLink, setIsSubmittingLink] = useState(false);

    const isSuperElite = profile.user_role === 'super_elite';
    const isElite = profile.user_role === 'elite';
    const isEliteOrHigher = isElite || isSuperElite;
    const isNormalOrDemo = profile.user_role === 'normal' || profile.user_role === 'demo';

    // 🌟 Xử lý Link Action (Để cập nhật trạng thái cục bộ cho Demo) 🌟
    const handleLinkAction = async (formData: FormData): Promise<ActionResult> => {
        setIsSubmittingLink(true);
        const result = await upsertUserLink(formData);
        setIsSubmittingLink(false);

        if (result && result.success && isNormalOrDemo) {
            // Nếu là tài khoản Normal hoặc Demo, cập nhật state cục bộ để hiển thị ngay
            const newLink: UserLink = {
                id: Date.now(), // ID tạm thời
                link_name: formData.get('link_name') as string,
                link_url: formData.get('link_url') as string,
                description: formData.get('description') as string || null,
            };
            setLinks(prev => [...prev, newLink]);
        }

        // Đảm bảo luôn trả về một đối tượng ActionResult hợp lệ
        if (result) {
            // @ts-ignore
            return result;
        } else {
            return { success: false, error: "Đã xảy ra lỗi không xác định" };
        }
    };

    // Logic hiển thị Role Tag
    const getRoleTag = (role: UserProfile['user_role']) => {
        switch (role) {
            case 'super_elite': return <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-full dark:bg-red-900 dark:text-red-300">SUPER ELITE</span>;
            case 'elite': return <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded-full dark:bg-yellow-900 dark:text-yellow-300">ELITE</span>;
            case 'demo': return <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-300">DEMO ACCESS</span>;
            default: return <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">NORMAL</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* 1. Profile Summary */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-10">
                <div className="flex flex-wrap items-center gap-4 sm:space-x-4">
                    {/* Avatar */}
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-blue-50 dark:bg-gray-700 flex-shrink-0">
                        <Image
                            src={profile.avatar_url ?? "/avatar-default.png"}
                            alt={profile.full_name ?? "User"}
                            fill
                            sizes="64px"
                            className="object-cover"
                        />
                    </div>

                    <div className="min-w-0">
                        <h1 className="text-fluid font-extrabold text-gray-900 dark:text-white leading-tight break-words">
                            Chào mừng, {profile.full_name || 'Người dùng'}!
                        </h1>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            {getRoleTag(profile.user_role)}
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                ({profile.user_role.toUpperCase()} Member)
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            {/* 2. Quản lý Links - Chỉ Elite/Super Elite/Normal mới có Link */}
            {(isNormalOrDemo || isEliteOrHigher) && (
                <div className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Danh sách liên kết */}
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                            <LinkIcon className="w-7 h-7 mr-3 text-green-600 dark:text-green-400" />
                            Liên kết cá nhân ({links.length})
                        </h2>

                        {links.length === 0 ? (
                            <div className="p-6 text-center bg-gray-50 dark:bg-gray-750 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Bạn chưa có liên kết nào. Hãy thêm một liên kết!
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {links.map((link) => (
                                        <li
                                            key={link.id}
                                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition"
                                        >
                                            {/* Thông tin link */}
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 dark:text-white break-words">
                                                    {link.link_name}
                                                </p>
                                                <p className="text-sm text-blue-600 dark:text-blue-400 truncate max-w-xs">
                                                    {link.link_url}
                                                </p>
                                            </div>

                                            {/* Các nút thao tác */}
                                            <div className="flex space-x-2 shrink-0">
                                                {/* Nút sao chép */}
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await navigator.clipboard.writeText(link.link_url);
                                                            toast.success('Đã sao chép liên kết!', { duration: 2000 });
                                                        } catch (err) {
                                                            toast.error('Không thể sao chép liên kết.');
                                                        }
                                                    }}
                                                    className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full transition"
                                                    title="Sao chép liên kết"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>

                                                {/* Mở liên kết */}
                                                <a
                                                    href={link.link_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition"
                                                    title="Mở liên kết"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>

                                                {/* Xóa liên kết */}
                                                <button
                                                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition"
                                                    title="Xóa liên kết"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Form thêm liên kết */}
                    <div className="lg:col-span-1">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 lg:mt-11">
                            Thêm Link
                        </h2>
                        <LinkForm action={handleLinkAction} isPending={isSubmittingLink} />
                    </div>
                </div>
            )}


            {/* 3. Quick Access / Admin Menu */}
            <div className='mb-12'>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                    <Zap className="w-7 h-7 mr-3 text-yellow-600 dark:text-yellow-400" />
                    Truy Cập Nhanh
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Quản lý Bài viết (Cho phép Normal/Elite/Super Elite) */}
                    <Link href="/dashboard/post-management" className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition duration-200 border border-gray-200 dark:border-gray-700">
                        <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition" />
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Bài viết</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tạo, chỉnh sửa bài viết (cơ bản).</p>
                    </Link>

                    {/* Admin Panel (Chỉ Super Elite) */}
                    {isSuperElite && (
                        <Link href="/dashboard/admin" className="group p-6 bg-red-50 dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition duration-200 border border-red-200 dark:border-red-700">
                            <Settings className="w-8 h-8 text-red-700 dark:text-red-400 mb-3 group-hover:scale-110 transition" />
                            <h3 className="font-bold text-lg text-red-700 dark:text-white">Admin Panel</h3>
                            <p className="text-sm text-red-600 dark:text-red-400">Toàn quyền quản lý hệ thống.</p>
                        </Link>
                    )}

                    {/* Quản lý Quyền/Hồ sơ (Chỉ Elite/Super Elite) */}
                    {isEliteOrHigher && (
                        <Link href="/dashboard/user-management" className="group p-6 bg-yellow-50 dark:bg-gray-750 rounded-xl shadow-md hover:shadow-lg transition duration-200 border border-yellow-200 dark:border-yellow-700">
                            <User className="w-8 h-8 text-yellow-700 dark:text-yellow-400 mb-3 group-hover:scale-110 transition" />
                            <h3 className="font-bold text-lg text-yellow-700 dark:text-white">Quản lý User</h3>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">Phân quyền Elite cho User khác.</p>
                        </Link>
                    )}

                    {/* Cài đặt */}
                    <Link href="/dashboard/settings" className="group p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl shadow-md hover:shadow-lg transition duration-200 border border-indigo-200 dark:border-indigo-700">
                        <Settings className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition" />
                        <h3 className="font-bold text-lg text-indigo-700 dark:text-white">Cài đặt</h3>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">Nâng cấp/chỉnh sửa hồ sơ.</p>
                    </Link>

                    {/* Bài viết đã lưu */}
                    <Link href="/dashboard/saved-posts" className="group p-6 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl shadow-md hover:shadow-lg transition duration-200 border border-pink-200 dark:border-pink-700">
                        <Bookmark className="w-8 h-8 text-pink-600 dark:text-pink-400 mb-3 group-hover:scale-110 transition" />
                        <h3 className="font-bold text-lg text-pink-700 dark:text-white">Bài viết đã lưu</h3>
                        <p className="text-sm text-pink-600 dark:text-pink-400">Xem các bài viết yêu thích.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}