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
    // Lưu ý: Tùy thuộc vào logic phân quyền chi tiết của bạn.
    // Giả sử user có role 'super_elite' hoặc 'elite' mới được truy cập admin panel
    const { data: profile } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', user?.id)
        .single();

    const userRole = profile?.user_role;

    if (!user || (userRole !== 'elite' && userRole !== 'super_elite')) {
        return NextResponse.json({ error: 'Truy cập bị từ chối' }, { status: 403 });
    }

    // 2. Lấy tất cả bài viết (bao gồm cả nháp), sắp xếp theo ngày tạo
    // Giả định bảng posts có liên kết (join) với profiles để lấy thông tin tác giả.
    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            id,
            slug,
            title,
            is_published,
            access_level,
            created_at,
            profiles (full_name) // Lấy tên tác giả
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Lỗi Supabase khi lấy bài viết:', error);
        return NextResponse.json({ error: 'Không thể tải dữ liệu bài viết.' }, { status: 500 });
    }

    // 3. Trả về dữ liệu
    return NextResponse.json({ posts: posts || [] }, { status: 200 });
}

// ❌ FIX CẢNH BÁO: Không có default export nào.
// Nếu bạn có các phương thức khác (POST, DELETE, PUT), bạn cũng cần export chúng.
// export async function POST(request: NextRequest) { ... }