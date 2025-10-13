// src/app/dashboard/page.tsx
import { createServer } from '@/lib/supabase/server';
import { signOut, upsertUserLink, deleteUserLink } from '@/app/auth/actions';
import { User, LogOut, Link as LinkIcon, Lock, Info, Edit, Trash2 } from 'lucide-react';
import { cookies } from 'next/headers';
import LinkForm from '@/components/LinkForm'; // Sẽ tạo component này sau
import AdminPanel from '@/components/AdminPanel'; // Sẽ tạo component này sau
// import { revalidatePath } from 'next/cache'; // revalidatePath không cần thiết ở đây

// Dữ liệu giả lập demo
const DEMO_USER = {
    email: 'elite_leader_al@demo.com',
    username: 'elite_leader_al',
    password: 'ITH_2025',
    uid: 'demo-user-al-elite-leader-uid'
};

// Định nghĩa kiểu dữ liệu cho Link
interface UserLink {
    id: number;
    link_name: string;
    link_url: string;
    description: string | null;
}

// Định nghĩa kiểu dữ liệu cho Profile
interface UserProfileData {
    full_name: string | null;
    user_role: string;
    avatar_url: string | null;
}

export default async function DashboardPage() {
    const cookieStore = cookies();
    // 🌟 KHẮC PHỤC LỖI createServer: Truyền cookieStore đã gán
    const supabase = createServer(cookieStore);

    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    const isDemoUser = cookieStore.get('demo-auth-session')?.value === DEMO_USER.uid;
    const currentUser = isDemoUser ? { email: DEMO_USER.email, id: DEMO_USER.uid } : supabaseUser;

    if (!currentUser) {
        return null;
    }

    // 1. Lấy thông tin chi tiết (bao gồm Role, Avatar, Name)
    let profileData: UserProfileData = { full_name: null, user_role: 'normal', avatar_url: null };
    let userLinks: UserLink[] = [];

    if (supabaseUser) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, user_role, avatar_url') // 🌟 FETCH THÊM AVATAR VÀ FULL NAME
            .eq('id', supabaseUser.id)
            .single();

        if (profile) {
            profileData = profile as UserProfileData;
        }

        // 2. Fetch Link Cá nhân
        const { data } = await supabase
            .from('user_links')
            .select('id, link_name, link_url, description')
            .eq('user_id', supabaseUser.id)
            .order('sort_order', { ascending: true });

        userLinks = data || [];

    } else if (isDemoUser) {
        // Gán thông tin đầy đủ cho user demo
        profileData = { full_name: 'Elite Leader AL', user_role: 'elite', avatar_url: null };
        // userLinks sẽ là mảng rỗng như đã định nghĩa
    }

    const isAdmin = profileData.user_role === 'super_elite';

    // Hàm hiển thị Avatar/Placeholder
    const Avatar = () => (
        profileData.avatar_url ? (
            <img
                src={profileData.avatar_url}
                alt={profileData.full_name || 'Avatar'}
                className="w-20 h-20 rounded-full border-4 border-blue-400 dark:border-blue-600 object-cover"
            />
        ) : (
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 border-4 border-blue-400 dark:border-blue-600">
                <User className="w-8 h-8" />
            </div>
        )
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-6 sm:p-10 text-gray-800 dark:text-gray-200">
            <div className="max-w-7xl mx-auto">

                {/* Header Dashboard & Đăng Xuất */}
                <div className="flex justify-between items-center border-b pb-4 mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-400 flex items-center">
                        <Lock className="w-8 h-8 mr-3" />
                        Dashboard
                        {isDemoUser && <span className="ml-4 text-sm font-semibold text-yellow-500 bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full">MODE DEMO</span>}
                    </h1>

                    <form action={signOut}>
                        <button
                            type="submit"
                            className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition duration-300"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Đăng Xuất
                        </button>
                    </form>
                </div>

                {/* 🌟 USER INFO SECTION (Avatar & Chức vụ) 🌟 */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl mb-10 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center space-x-4">
                        <Avatar />
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Chào mừng, {profileData.full_name || 'Quý Khách'}!
                            </h2>
                            <p className="text-lg font-medium mt-1 capitalize">
                                Chức vụ: <span className={`px-3 py-1 rounded-full text-white ${
                                profileData.user_role === 'super_elite' ? 'bg-red-600' :
                                    profileData.user_role === 'elite' ? 'bg-yellow-600' :
                                        'bg-gray-500'
                            }`}>
                                    {profileData.user_role.replace('_', ' ')}
                                </span>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Email: {currentUser?.email}
                            </p>
                        </div>
                    </div>

                    {/* Dữ liệu Demo bảo mật */}
                    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700">
                        <h3 className="font-bold text-yellow-800 dark:text-yellow-300 flex items-center">
                            <Info className="w-4 h-4 mr-2" /> Tài khoản Demo (CHỈ DÙNG ĐỂ KIỂM THỬ)
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">Username: <span className="font-mono font-semibold">{DEMO_USER.username}</span></p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">Password: <span className="font-mono font-semibold">{DEMO_USER.password}</span></p>
                    </div>

                </div>

                {/* 3. KHU VỰC QUẢN LÝ LINK CÁ NHÂN (Elite/Normal) */}
                {!isAdmin && (
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 mb-10">
                        <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-700 dark:text-gray-300">
                            <LinkIcon className="w-5 h-5 mr-2" />
                            Quản Lý Link Cá Nhân ({userLinks.length} mục)
                        </h2>

                        <LinkForm action={upsertUserLink} />

                        {/* Danh sách Link */}
                        <div className="mt-6 space-y-4">
                            {userLinks.map(link => (
                                <div key={link.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-blue-600 dark:text-blue-400 truncate hover:text-blue-500">
                                            <a href={link.link_url} target="_blank" rel="noopener noreferrer">{link.link_name}</a>
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{link.description}</p>
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        <button className="text-gray-500 hover:text-blue-500 p-1 rounded-full"><Edit className="w-4 h-4" /></button>
                                        <form action={deleteUserLink.bind(null, link.id)}>
                                            <button type="submit" className="text-red-500 hover:text-red-700 p-1 rounded-full">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. KHU VỰC ADMIN PANEL (Super Elite) */}
                {/* ADMIN PANEL được để lại như một placeholder cho 'super_elite' */}
                {/*{isAdmin && <AdminPanel />}*/}

            </div>
        </div>
    );
}