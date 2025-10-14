// src/app/dashboard/admin/page.tsx
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Shield } from 'lucide-react';
import AdminPanelClient from '@/components/AdminPanelClient';

// Định nghĩa kiểu cho Profile
interface UserProfile {
    full_name: string | null;
    avatar_url: string | null;
    user_role: 'normal' | 'elite' | 'super_elite' | 'demo';
}

// Hàm lấy dữ liệu người dùng
async function getUserData() {
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

    if (!profile || profile.user_role !== 'super_elite') {
        redirect('/dashboard?error=Bạn không có quyền truy cập trang này.');
    }

    return { user, profile: profile as UserProfile };
}

export default async function AdminPanelPage() {
    await getUserData(); // Kiểm tra quyền truy cập

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <AdminPanelClient initialPosts={[]} />
            </div>
        </div>
    );
}