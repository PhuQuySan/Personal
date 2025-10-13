// src/components/AdminPanel.tsx
import { createServer } from '@/lib/supabase/server';
import { upsertPost, deletePost } from '@/app/auth/post.actions';
import { Pencil, Trash2, Globe, Lock, Shield, PlusCircle, Check, X } from 'lucide-react';
import PostForm from './PostForm'; // Component form sẽ nằm bên dưới

// Định nghĩa kiểu Post (Lấy đầy đủ các trường cần thiết)
interface Post {
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
    access_level: 'public' | 'elite' | 'super_elite';
    created_at: string;
    profiles: { full_name: string | null } | null;
}

const getAccessIcon = (level: Post['access_level']) => {
    switch (level) {
        case 'super_elite': return <Shield className="w-4 h-4 text-red-600" />;
        case 'elite': return <Lock className="w-4 h-4 text-yellow-600" />;
        default: return <Globe className="w-4 h-4 text-green-600" />;
    }
};

export default async function AdminPanel() {
    const supabase = createServer();

    // Fetch TẤT CẢ bài viết (không cần lọc is_published)
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, slug, is_published, access_level, created_at, profiles(full_name)')
        .order('created_at', { ascending: false });

    if (error) {
        return <div className="text-red-500">Lỗi tải bài viết: {error.message}</div>;
    }

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-3 text-red-600 dark:text-red-400" />
                ADMIN PANEL (Super Elite)
            </h2>

            {/* Form Tạo Bài Mới */}
            <h3 className="text-2xl font-semibold mb-4 text-blue-700 dark:text-blue-400 border-b pb-2">
                Tạo Bài Viết Mới
            </h3>
            <PostForm action={upsertPost} />

            {/* Danh sách Bài Viết */}
            <h3 className="text-2xl font-semibold mt-10 mb-4 text-blue-700 dark:text-blue-400 border-b pb-2">
                Quản lý {posts?.length || 0} Bài Viết
            </h3>
            <div className="space-y-3">
                {posts?.map((post) => (
                    <div key={post.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg transition duration-150 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <div className="flex-1 min-w-0 mr-4">
                            <p className="font-semibold text-lg truncate">{post.title}</p>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-3 mt-1">
                                <span className="flex items-center">
                                    {getAccessIcon(post.access_level)}
                                    <span className="ml-1 capitalize">{post.access_level}</span>
                                </span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {post.profiles?.full_name || 'Admin'}
                                </span>
                                <span className={post.is_published ? "flex items-center text-green-600" : "flex items-center text-red-600"}>
                                    {post.is_published ? <Check className="w-4 h-4 mr-1" /> : <X className="w-4 h-4 mr-1" />}
                                    {post.is_published ? 'Đã Xuất bản' : 'Nháp'}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                            <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition">
                                <Globe className="w-4 h-4" />
                            </Link>
                            <button className="p-2 text-yellow-500 hover:bg-yellow-100 rounded-full transition">
                                <Pencil className="w-4 h-4" />
                            </button>
                            <form action={deletePost.bind(null, post.id)}>
                                <button type="submit" className="p-2 text-red-500 hover:bg-red-100 rounded-full transition">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}