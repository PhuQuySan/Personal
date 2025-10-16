// src/app/api/posts/route.ts

import { createServer } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * LOGIC NGHIỆP VỤ: Xử lý request GET để lấy danh sách bài viết.
 * API này được gọi bởi AdminPanelClient.tsx để tải lại dữ liệu.
 */
export async function GET(request: NextRequest) {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Phân quyền (Chỉ Admin/Elite mới có thể xem toàn bộ bài viết, bao gồm cả nháp)
    const { data: profile } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', user?.id)
        .single();

    const userRole = profile?.user_role;

    if (!user || (userRole !== 'elite' && userRole !== 'super_elite')) {
        return NextResponse.json({ error: 'Truy cập bị từ chối' }, { status: 403 });
    }

    // 2. Lấy tất cả bài viết với ĐẦY ĐỦ fields cần thiết cho form edit
    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            id,
            slug,
            title,
            summary,
            content,
            tag,
            is_published,
            access_level,
            featured_image,
            created_at,
            user_id,
            profiles (full_name)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Lỗi Supabase khi lấy bài viết:', error);
        return NextResponse.json({ error: 'Không thể tải dữ liệu bài viết.' }, { status: 500 });
    }

    // 3. Đảm bảo mỗi post có đầy đủ fields với fallback values
    const postsWithFallbacks = (posts || []).map(post => ({
        id: post.id,
        title: post.title || '',
        slug: post.slug || '',
        summary: post.summary || '',
        content: post.content || '',
        tag: post.tag || '',
        is_published: post.is_published || false,
        access_level: post.access_level || 'public',
        featured_image: post.featured_image || '',
        created_at: post.created_at,
        user_id: post.user_id,
        profiles: post.profiles || null
    }));

    console.log('📊 API trả về số bài viết:', postsWithFallbacks.length);
    if (postsWithFallbacks.length > 0) {
        console.log('📝 Bài viết đầu tiên:', {
            id: postsWithFallbacks[0].id,
            hasContent: !!postsWithFallbacks[0].content,
            hasSummary: !!postsWithFallbacks[0].summary,
            hasFeaturedImage: !!postsWithFallbacks[0].featured_image
        });
    }

    // 4. Trả về dữ liệu
    return NextResponse.json({ posts: postsWithFallbacks }, { status: 200 });
}