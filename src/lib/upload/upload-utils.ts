// src/lib/upload/upload-utils.ts
import { createClient } from '@/lib/supabase/client';

export async function checkBucketExists(): Promise<boolean> {
    try {
        const supabase = createClient();

        // Thử list files thay vì getBucket (dễ thành công hơn)
        const { data, error } = await supabase.storage
            .from('images')
            .list('blog-images', {
                limit: 1
            });

        // Nếu không có lỗi "bucket not found" thì bucket tồn tại
        if (error) {
            if (error.message.includes('bucket') || error.message.includes('not found')) {
                console.error('❌ Bucket không tồn tại:', error.message);
                return false;
            }
            // Các lỗi khác (như không có files) vẫn coi là bucket tồn tại
            console.log('⚠️ Bucket có thể tồn tại, lỗi khác:', error.message);
            return true;
        }

        console.log('✅ Bucket tồn tại, files:', data);
        return true;

    } catch (error) {
        console.error('❌ Bucket check exception:', error);
        return false;
    }
}

export async function listBucketFiles(): Promise<string[]> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase.storage
            .from('images')
            .list('blog-images', {
                limit: 100,
                offset: 0
            });

        if (error) {
            console.error('❌ List files error:', error);
            return [];
        }

        console.log('📁 Bucket files:', data);
        return data?.map(item => item.name) || [];
    } catch (error) {
        console.error('❌ List files exception:', error);
        return [];
    }
}

// Giữ nguyên hàm uploadImage và deleteImage
export async function uploadImage(file: File): Promise<string> {
    const supabase = createClient();

    // Validate file
    if (!file.type.startsWith('image/')) {
        throw new Error('Chỉ chấp nhận file ảnh (PNG, JPG, JPEG, WEBP)');
    }

    if (file.size > 5 * 1024 * 1024) {
        throw new Error('Kích thước ảnh không được vượt quá 5MB');
    }

    // Tạo tên file unique
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

    console.log('📤 Uploading image to bucket "images":', filePath);

    // Upload lên Supabase Storage
    const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('❌ Upload error details:', error);
        throw new Error(`Upload thất bại: ${error.message}`);
    }

    console.log('✅ Upload successful:', data);

    // Lấy public URL
    const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

    console.log('🔗 Public URL:', publicUrl);

    return publicUrl;
}

export async function deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl) return;

    const supabase = createClient();

    try {
        // Extract file path từ URL
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.indexOf('images');

        if (bucketIndex === -1) {
            console.warn('⚠️ Không thể extract file path từ URL:', imageUrl);
            return;
        }

        const filePath = pathParts.slice(bucketIndex + 1).join('/');

        console.log('🗑️ Deleting image:', filePath);

        const { error } = await supabase.storage
            .from('images')
            .remove([filePath]);

        if (error) {
            console.error('❌ Delete error:', error);
        } else {
            console.log('✅ Delete successful');
        }
    } catch (error) {
        console.error('❌ Error in deleteImage:', error);
    }
}