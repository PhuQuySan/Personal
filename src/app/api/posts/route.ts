import { createServer } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServer();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
        }

        // 1. Phân quyền tập trung
        const { data: profile } = await supabase
            .from('profiles')
            .select('user_role')
            .eq('id', user.id)
            .single();

        const isAdmin = profile?.user_role === 'elite' || profile?.user_role === 'super_elite';

        if (!isAdmin) {
            return NextResponse.json({ error: 'Truy cập bị từ chối' }, { status: 403 });
        }

        // 2. Query tối ưu (Chỉ lấy field cần, không lấy dư thừa)
        const { data: posts, error } = await supabase
            .from('posts')
            .select(`
                id, slug, title, summary, content, tag, 
                is_published, access_level, featured_image, 
                created_at, user_id, profiles(full_name)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // 3. Fallback dữ liệu sạch
        const cleanedPosts = (posts || []).map(post => ({
            ...post,
            title: post.title || 'Không tiêu đề',
            content: post.content || '',
            featured_image: post.featured_image || null,
            profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
        }));

        return NextResponse.json({ posts: cleanedPosts }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}