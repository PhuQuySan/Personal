// src/app/dashboard/page.tsx
// 🌟 SERVER COMPONENT 🌟

import { createServer } from '@/shared/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from '@/features/dashboard/components/DashboardClient';
import { User } from '@supabase/supabase-js';
import { UserProfile, UserLink } from '@/shared/types';

// Dữ liệu Demo
const DEMO_PROFILE: UserProfile = {
    id: "demo",
    full_name: "Normal User Demo",
    avatar_url: null,
    user_role: "demo",
};

const DEMO_LINKS: UserLink[] = [
    {
        id: 1,
        user_id: "demo-user-id",
        link_name: "Demo Blog Link",
        link_url: "/blog",
        description: "Xem các bài viết mới nhất.",
        image_url: null,
        sort_order: 0,
        created_at: new Date().toISOString(),
    }
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

    // 2. Lấy Links - FETCH TẤT CẢ CÁC FIELDS
    const { data: links } = await supabase
        .from('user_links')
        .select('id, user_id, link_name, link_url, description, image_url, sort_order, created_at')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

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