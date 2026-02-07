import { createClient } from '@/lib/supabase/client';

/**
 * Kiểm tra xem Bucket và thư mục tồn tại không
 */
export async function checkBucketExists(): Promise<boolean> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase.storage
            .from('images')
            .list('blog-images', { limit: 1 });

        if (error) {
            if (error.message.includes('bucket') || error.message.includes('not found')) {
                console.error('❌ Bucket không tồn tại:', error.message);
                return false;
            }
            return true;
        }
        return true;
    } catch (error) {
        console.error('❌ Bucket check exception:', error);
        return false;
    }
}

/**
 * Liệt kê danh sách file trong thư mục blog-images
 */
export async function listBucketFiles(): Promise<string[]> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase.storage
            .from('images')
            .list('blog-images', { limit: 100, offset: 0 });

        if (error) {
            console.error('❌ List files error:', error);
            return [];
        }
        return data?.map(item => item.name) || [];
    } catch (error) {
        console.error('❌ List files exception:', error);
        return [];
    }
}

/**
 * Tối ưu hóa việc tải ảnh lên với UUID và kiểm tra định dạng
 */
export async function uploadImage(file: File): Promise<string> {
    const supabase = createClient();

    if (!file.type.startsWith('image/')) {
        throw new Error('Chỉ chấp nhận file ảnh (PNG, JPG, JPEG, WEBP)');
    }

    if (file.size > 5 * 1024 * 1024) {
        throw new Error('Kích thước ảnh không được vượt quá 5MB');
    }

    // Sử dụng crypto.randomUUID() để đảm bảo tên file duy nhất tuyệt đối
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

    const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        throw new Error(`Upload thất bại: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

    return publicUrl;
}

/**
 * Xóa ảnh dựa trên URL công khai
 */
export async function deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl) return;
    const supabase = createClient();

    try {
        // Tối ưu hóa việc trích xuất path: tìm chuỗi sau tên bucket 'images/'
        const searchPath = '/storage/v1/object/public/images/';
        const pathIndex = imageUrl.indexOf(searchPath);

        if (pathIndex === -1) {
            console.warn('⚠️ URL không khớp định dạng Supabase Storage:', imageUrl);
            return;
        }

        const filePath = imageUrl.substring(pathIndex + searchPath.length);

        const { error } = await supabase.storage
            .from('images')
            .remove([filePath]);

        if (error) console.error('❌ Delete error:', error.message);
    } catch (error) {
        console.error('❌ Error in deleteImage:', error);
    }
}