// src/app/dashboard/page.tsx
// 🌟 SERVER COMPONENT 🌟

import { createServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/DashboardClient';
import { User } from '@supabase/supabase-js';

// Định nghĩa kiểu dữ liệu (Giả định nằm trong src/types/index.ts)
interface UserProfile {
    full_name: string | null;
    avatar_url: string | null;
    user_role: 'normal' | 'elite' | 'super_elite' | 'demo';
}

interface UserLink {
    id: number;
    link_name: string;
    link_url: string;
    description: string | null;
}

// Dữ liệu Demo
const DEMO_PROFILE: UserProfile = {
    full_name: "Normal User Demo", // Giả lập Normal mặc định
    avatar_url: null,
    user_role: "demo",
};

const DEMO_LINKS: UserLink[] = [
    { id: 1, link_name: "Demo Blog Link", link_url: "/blog", description: "Xem các bài viết mới nhất." }
];

/**
 * Hàm lấy dữ liệu Dashboard từ Supabase hoặc trả về dữ liệu Demo.
 */
async function getDashboardData(user: User, isDemo: boolean) {
    if (isDemo) {
        return { profile: DEMO_PROFILE, links: DEMO_LINKS };
    }

    const supabase = await createServer();

    // 1. Lấy Profile (bao gồm user_role)
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, user_role')
        .eq('id', user.id)
        .single();

    // 2. Lấy Links
    const { data: links } = await supabase
        .from('user_links')
        .select('id, link_name, link_url, description')
        .eq('user_id', user.id)
        .order('id', { ascending: true });

    // Đảm bảo profile luôn có role hợp lệ
    const userProfile: UserProfile = (profile as UserProfile) || {
        full_name: user.email,
        avatar_url: null,
        user_role: 'normal'
    };

    return {
        profile: userProfile,
        links: (links as UserLink[]) || [],
    };
}

export default async function DashboardPage() {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Kiểm tra session
    if (!user) {
        redirect('/login?error=Vui lòng đăng nhập để truy cập Dashboard.');
    }

    // 2. Kiểm tra Demo
    const cookieStore = await cookies();
    const isDemo = !!cookieStore.get('demo-auth-session')?.value;

    // 3. Lấy dữ liệu
    const data = await getDashboardData(user, isDemo);

    // 4. Truyền dữ liệu vào Client Component
    return <DashboardClient initialProfile={data.profile} initialLinks={data.links} />;
}