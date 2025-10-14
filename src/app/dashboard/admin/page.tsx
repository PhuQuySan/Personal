// src/app/dashboard/admin/page.tsx (Mã đã sửa)

import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Shield } from 'lucide-react';
import AdminPanelClient from '@/components/AdminPanelClient';
// 🌟 THÊM: Tắt cache cho Server Component 🌟
import { unstable_noStore as noStore } from 'next/cache';
import {UserProfile} from '@/types';
// Định nghĩa kiểu cho Profile (Giữ nguyên)
// interface UserProfile {
//     full_name: string | null;
//     avatar_url: string | null;
//     user_role: 'normal' | 'elite' | 'super_elite' | 'demo';
// }

// Hàm lấy dữ liệu người dùng (Giữ nguyên)
async function getUserData() {
    // 🌟 FIX CACHE: Đảm bảo không cache dữ liệu người dùng 🌟
    noStore();
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?error=Vui lòng đăng nhập để truy cập trang này.');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, user_role')
        .eq('id', user.id)
        .single();

    if (!profile || (profile.user_role !== 'super_elite' && profile.user_role !== 'elite')) {
        // Cho phép Elite và Super Elite truy cập admin panel
        redirect('/dashboard?error=Bạn không có quyền truy cập trang này.');
    }

    return { user, profile: profile as UserProfile };
}

// 🌟 HÀM MỚI: Lấy danh sách bài viết cho Admin Panel 🌟
async function getAdminPosts() {
    noStore(); // Đảm bảo query không bị cache
    const supabase = await createServer();

    // Lấy tất cả bài viết, bao gồm cả nháp, sắp xếp theo ngày tạo
    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            id,
            slug,
            title,
            summary,
            content,
            is_published,
            access_level,
            created_at,
            user_id,
            featured_image,
            profiles (full_name) 
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Lỗi khi lấy bài viết cho Admin:', error);
        return [];
    }

    // Đảm bảo kiểu trả về khớp với Post[]
    return posts || [];
}

export default async function AdminPanelPage() {
    // 1. Kiểm tra quyền và lấy thông tin người dùng
    const { user, profile } = await getUserData();

    // 2. Lấy dữ liệu bài viết
    const initialPosts = await getAdminPosts();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* ... (Tiêu đề Admin Panel giữ nguyên) ... */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center">
                    <Shield className="w-8 h-8 mr-3 text-red-600 dark:text-red-400" />
                    Admin Panel
                </h1>

                <a
                    href="/dashboard"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center transition duration-300"
                >
                    Quay lại Dashboard
                </a>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800">
                {/* 🌟 FIX: Truyền dữ liệu và thông tin người dùng xuống Client Component 🌟 */}
                <AdminPanelClient
                    initialPosts={initialPosts}
                    userRole={profile.user_role}
                    userId={user.id}
                />
            </div>
        </div>
    );
}