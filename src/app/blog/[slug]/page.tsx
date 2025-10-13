// src/app/blog/[slug]/page.tsx
import { createServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Calendar, Tag, User, Lock } from 'lucide-react';
import Link from "next/link";

interface PostPageProps {
    params: {
        slug: string;
    };
}

interface Post {
    title: string;
    content: string;
    tag: string | null;
    created_at: string;
    access_level: 'public' | 'elite' | 'super_elite'; // Loại truy cập
    profiles: {
        full_name: string | null;
    } | null;
}

export default async function PostPage({ params }: PostPageProps) {
    const supabase = createServer();
    const slug = params.slug;

    // Lấy thông tin người dùng đang truy cập
    const { data: { user } } = await supabase.auth.getUser();

    // TẠM THỜI: Giả định vai trò người dùng (Super Elite = admin)
    // Trong thực tế, bạn phải fetch từ bảng profiles
    const userRole = user?.email?.includes('@admin.com') ? 'super_elite' : (user ? 'elite' : 'normal');

    // 1. Fetch Bài viết
    const { data: post, error } = await supabase
        .from('posts')
        .select('title, content, tag, created_at, access_level, profiles(full_name)')
        .eq('slug', slug)
        .single();

    if (error || !post) {
        return notFound();
    }

    // 2. LOGIC PHÂN QUYỀN TRUY CẬP (Client side check)
    let isAuthorized = false;

    if (post.access_level === 'public') {
        isAuthorized = true; // Ai cũng xem được
    } else if (post.access_level === 'elite' && (userRole === 'elite' || userRole === 'super_elite')) {
        isAuthorized = true; // Chỉ cần đăng nhập
    } else if (post.access_level === 'super_elite' && userRole === 'super_elite') {
        isAuthorized = true; // Chỉ có admin xem được
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-10">
                <div className="text-center p-10 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl max-w-lg">
                    <Lock className="w-10 h-10 mx-auto text-red-600 dark:text-red-400 mb-4" />
                    <h2 className="text-2xl font-bold text-red-700 dark:text-red-300">
                        Truy Cập Bị Hạn Chế
                    </h2>
                    <p className="mt-2 text-red-600 dark:text-red-400">
                        Bài viết này yêu cầu cấp độ truy cập **{post.access_level.toUpperCase()}**. Vui lòng đăng nhập hoặc nâng cấp tài khoản.
                    </p>
                    {userRole === 'normal' && (
                        <Link href="/login" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline">
                            Đăng nhập ngay →
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    // 3. Hiển thị Nội dung Bài viết (Nếu được phép)

    return (
        <article className="min-h-screen bg-white dark:bg-gray-950 p-6 sm:p-10">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                    {post.title}
                </h1>

                {/* Metadata */}
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-500 mb-10 border-b pb-4">
                    <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        Tác giả: <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                            {post.profiles?.full_name || "Vô danh"}
                        </span>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Ngày đăng: {new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase ${post.access_level === 'public' ? 'bg-green-100 text-green-800' : post.access_level === 'elite' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {post.access_level}
                    </span>
                </div>

                {/* Nội dung (Giả định là Markdown/HTML đơn giản) */}
                <div
                    className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }} // Dùng để hiển thị HTML/Markdown đã được xử lý
                >
                </div>
            </div>
        </article>
    );
}

// Bắt buộc để sử dụng slug cho caching
export const revalidate = 60;