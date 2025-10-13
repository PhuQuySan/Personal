// src/app/blog/page.tsx
import { createServer } from '@/lib/supabase/server';
import Link from 'next/link';
import { BookOpen, Calendar, Tag, User, Shield, Lock, Globe } from 'lucide-react';

interface Post {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    tag: string | null;
    created_at: string;
    access_level: 'public' | 'elite' | 'super_elite';
    profiles: {
        full_name: string | null;
    }[] | null;
}

// ✅ Thêm hàm helper để lấy full_name an toàn
function getFullName(profiles: any): string | null {
    if (!profiles) return null;

    // Nếu profiles là mảng, lấy phần tử đầu tiên
    if (Array.isArray(profiles)) {
        return profiles[0]?.full_name || null;
    }

    // Nếu profiles là đối tượng, lấy trực tiếp
    return profiles.full_name || null;
}

// ✅ Hàm helper để lấy icon cho access level
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

export default async function BlogListPage() {
    const supabase = createServer();

    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, slug, summary, tag, created_at, access_level, profiles(full_name)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Lỗi khi fetch bài viết:", error);
        return (
            <div className="p-10 text-center text-red-500 dark:text-red-400">
                Không thể tải danh sách bài viết: {error.message}
            </div>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <div className="p-20 text-center bg-white dark:bg-gray-800 rounded-xl m-10 shadow-lg">
                <BookOpen className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    Chưa có bài viết nào được xuất bản.
                </h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Hãy tạo bài viết đầu tiên của bạn thông qua Dashboard.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                        Thư Viện Bài Viết Chuyên Sâu
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Khám phá kho tàng kiến thức chuyên sâu từ các chuyên gia hàng đầu
                    </p>
                </div>

                {/* Grid layout cho các bài viết */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {posts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="group block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 transform hover:-translate-y-1"
                        >
                            {/* Phần header của card */}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                        post.access_level === 'public'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : post.access_level === 'elite'
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    }`}>
                                        {getAccessIcon(post.access_level)}
                                        <span className="ml-1 capitalize">{post.access_level}</span>
                                    </span>

                                    {post.tag && (
                                        <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                            {post.tag}
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {post.title}
                                </h2>

                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                                    {post.summary || "Bài viết này hiện chưa có tóm tắt. Nhấp để đọc toàn bộ nội dung..."}
                                </p>
                            </div>

                            {/* Phần footer của card */}
                            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <User className="w-3.5 h-3.5 mr-1" />
                                        <span className="truncate max-w-[100px]">
                                            {getFullName(post.profiles) || "Vô danh"}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-3.5 h-3.5 mr-1" />
                                        {new Date(post.created_at).toLocaleDateString("vi-VN", {
                                            year: "numeric",
                                            month: "numeric",
                                            day: "numeric",
                                        })}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
                    <p>Hiển thị {posts.length} bài viết | Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
                </div>
            </div>
        </div>
    );
}