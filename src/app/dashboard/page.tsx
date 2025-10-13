// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createServer } from '@/lib/supabase/server';
import AdminPanel from '@/components/AdminPanel';
import LinkForm from '@/components/LinkForm';
import { upsertUserLink } from '@/app/auth/link.actions';
import { User, Shield, Zap, Link } from 'lucide-react';
import { cookies } from 'next/headers';
import { DEMO_UID } from '@/app/auth/constants';

// Định nghĩa kiểu cho Profile (phải khớp với Supabase)
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

// Hàm lấy dữ liệu người dùng và liên kết
async function getDashboardData() {
    const supabase = createServer();

    // 1. Lấy thông tin User
    const { data: { user } } = await supabase.auth.getUser();

    // ✅ SỬA LỖI: Await cookies() trước khi gọi .get()
    const cookieStore = await cookies();
    const demoSessionCookie = cookieStore.get('demo-auth-session');

    // Kiểm tra nếu không có user Supabase, nhưng có cookie demo hợp lệ
    if (!user && demoSessionCookie?.value === DEMO_UID) {
        // Đây là người dùng Demo, giả lập profile
        const demoProfile: UserProfile = {
            full_name: "Elite Leader Demo",
            avatar_url: null,
            user_role: "demo",
        };
        const demoLinks: UserLink[] = [
            { id: 1, link_name: "Demo Link", link_url: "https://nextjs.org", description: "Đây là link mẫu cho tài khoản demo." }
        ];
        return { user: { id: 'demo-id' }, profile: demoProfile, links: demoLinks };
    }

    if (!user) {
        redirect('/login?error=Vui lòng đăng nhập để truy cập Dashboard.');
    }

    // 2. Lấy Profile và Links từ Supabase (dựa trên user.id)
    const [{ data: profile }, { data: links }] = await Promise.all([
        supabase.from('profiles').select('full_name, avatar_url, user_role').eq('id', user.id).single(),
        supabase.from('user_links').select('id, link_name, link_url, description').eq('user_id', user.id).order('id', { ascending: true }),
    ]);

    if (!profile) {
        // Xử lý trường hợp không tìm thấy profile (hiếm gặp)
        console.error("Không tìm thấy profile cho user:", user.id);
        redirect('/login?error=Lỗi tải hồ sơ người dùng.');
    }

    return { user, profile: profile as UserProfile, links: (links || []) as UserLink[] };
}

export default async function DashboardPage() {
    const { user, profile, links } = await getDashboardData();
    const isSuperElite = profile.user_role === 'super_elite';
    const isDemoUser = profile.user_role === 'demo';

    const getRoleTag = (role: UserProfile['user_role']) => {
        switch (role) {
            case 'super_elite': return <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-full dark:bg-red-900 dark:text-red-300"><Shield className='w-3 h-3 mr-1' /> SUPER ELITE</span>;
            case 'elite': return <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded-full dark:bg-yellow-900 dark:text-yellow-300"><Zap className='w-3 h-3 mr-1' /> ELITE</span>;
            case 'demo': return <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-300">DEMO ACCESS</span>;
            default: return <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">NORMAL</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
                Dashboard Cá nhân
            </h1>

            {/* 1. Thông tin Hồ sơ */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
                <div className="flex items-center space-x-4">
                    <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            Chào mừng, {profile.full_name || 'Bạn'}!
                        </p>
                        <div className="mt-1">
                            {getRoleTag(profile.user_role)}
                        </div>
                    </div>
                </div>
                {isDemoUser && (
                    <p className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-lg text-sm font-medium">
                        ⚠️ Bạn đang ở chế độ **Demo Access**. Hành động sẽ không được lưu vào cơ sở dữ liệu Supabase.
                    </p>
                )}
            </div>

            {/* 2. Quản lý Links */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Link className="w-6 h-6 mr-3 text-green-600 dark:text-green-400" />
                Quản lý Liên kết cá nhân
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    {/* Form thêm Link (Sử dụng action đã được tái cấu trúc) */}
                    <LinkForm action={upsertUserLink} />
                </div>
                <div className="lg:col-span-2 space-y-3">
                    {links.length > 0 ? (
                        links.map((link) => (
                            <div key={link.id} className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600 flex justify-between items-center transition duration-150 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <div className='min-w-0 flex-1'>
                                    <p className="text-lg font-semibold truncate text-blue-600 dark:text-blue-300">
                                        <a href={link.link_url} target="_blank" rel="noopener noreferrer">{link.link_name}</a>
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        {link.description || link.link_url}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500 ml-4 flex-shrink-0">
                                    {link.link_url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 p-4 border border-dashed rounded-lg">
                            Bạn chưa có liên kết nào. Hãy thêm liên kết đầu tiên của bạn!
                        </p>
                    )}
                </div>
            </div>

            {/* 3. Admin Panel (Chỉ hiển thị cho Super Elite) */}
            {isSuperElite && (
                <div className="mt-12">
                    <AdminPanel />
                </div>
            )}
        </div>
    );
}