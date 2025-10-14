// src/components/AdminPanel.tsx
// (Server Component)

import { createServer } from '@/lib/supabase/server';
import { Shield } from 'lucide-react';
import AdminPanelClient from './AdminPanelClient'; // Import Client Component
import { Post } from '@/types'; // Import interface từ file types

export default async function AdminPanel() {
    const supabase = await createServer();

    // Fetch TẤT CẢ bài viết và CONTENT (cần cho form chỉnh sửa)
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, slug, content, is_published, access_level, created_at, profiles(full_name)')
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

            {/* Truyền dữ liệu bài viết sang Client Component */}
            <AdminPanelClient initialPosts={posts || []} />
        </div>
    );
}