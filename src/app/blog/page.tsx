// src/app/blog/page.tsx

import { createServer } from '@/lib/supabase/server';
import Link from 'next/link';
import { BookOpen, Calendar, User, Shield, Lock, Globe, Filter } from 'lucide-react';
import PostImage from '@/components/PostImage';
import type { Post, ProfileData } from "@/types";
import BlogFilter from '@/components/BlogFilter';

export const revalidate = 3600;

function getFullName(profiles: ProfileData[] | ProfileData | null | undefined): string {
    if (!profiles) return "Vô danh";
    if (Array.isArray(profiles)) {
        return profiles[0]?.full_name ?? "Vô danh";
    }
    return profiles.full_name ?? "Vô danh";
}

function getAccessIcon(level: Post['access_level']) {
    switch (level) {
        case 'super_elite':
            return <Shield className="w-4 h-4 text-red-600" />;
        case 'elite':
            return <Lock className="w-4 h-4 text-yellow-600" />;
        default:
            return <Globe className="w-4 h-4 text-green-600" />;
    }
}

function getAccessBadgeColor(level: Post['access_level']) {
    switch (level) {
        case 'super_elite':
            return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
        case 'elite':
            return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900';
        default:
            return 'bg-gradient-to-r from-green-400 to-emerald-400 text-white';
    }
}

export default async function BlogListPage() {
    const supabase = await createServer();

    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, slug, summary, tag, created_at, access_level, featured_image, profiles(full_name)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Lỗi khi fetch bài viết:", error);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
                <div className="p-10 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-red-500 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Không thể tải bài viết
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {error.message}
                    </p>
                </div>
            </div>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
                <div className="p-20 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Chưa có bài viết nào
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Hãy tạo bài viết đầu tiên của bạn thông qua Dashboard.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Đi tới Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Lấy danh sách tags duy nhất
    const uniqueTags = Array.from(new Set(posts.map(p => p.tag).filter(Boolean))) as string[];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
            {/* Header với gradient overlay */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-white/10 backdrop-blur-lg rounded-2xl">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
                            Thư Viện Bài Viết
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-light">
                            Khám phá kho tàng kiến thức chuyên sâu từ các chuyên gia hàng đầu
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-blue-100">
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                {posts.length} bài viết
                            </span>
                            <span>•</span>
                            <span>{uniqueTags.length} chủ đề</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
                {/* Filter Component - Client Side */}
                <BlogFilter posts={posts} tags={uniqueTags} />
            </div>

            {/* Footer Stats */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-12">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                {posts.length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Tổng số bài viết
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                                {uniqueTags.length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Chủ đề đa dạng
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                                {new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Cập nhật mới nhất
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}