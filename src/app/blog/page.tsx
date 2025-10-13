// src/app/blog/page.tsx
import { createServer } from '@/lib/supabase/server';
import Link from 'next/link';
import { BookOpen, Calendar, Tag, User } from 'lucide-react'; // ✅ Thêm User

interface Post {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    tag: string | null;
    created_at: string;
    profiles: {
        full_name: string | null;
    } | null;
}

export default async function BlogListPage() {
    const supabase = createServer();

    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, slug, summary, tag, created_at, profiles(full_name)')
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 sm:p-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-10 border-b pb-4">
                    Thư Viện Bài Viết Chuyên Sâu
                </h1>

                <div className="space-y-8">
                    {posts.map((post: Post) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="block p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-0.5 border border-gray-200 dark:border-gray-800"
                        >
                            <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                {post.title}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                {post.summary || "Bài viết này hiện chưa có tóm tắt. Nhấp để đọc toàn bộ nội dung..."}
                            </p>

                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                                <div className="flex items-center">
                                    <User className="w-4 h-4 mr-1" />
                                    Tác giả:{" "}
                                    <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                                        {post.profiles?.full_name || "Vô danh"}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {new Date(post.created_at).toLocaleDateString("vi-VN", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </div>
                                {post.tag && (
                                    <div className="flex items-center">
                                        <Tag className="w-4 h-4 mr-1" />
                                        <span className="font-medium text-purple-600 dark:text-purple-400">
                                            {post.tag}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
