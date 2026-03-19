import { createClient } from '@/shared/lib/supabase/client';
import { MediaItem } from '@/shared/types';

export const mediaApi = {
    // 1. Fetch images (All or specific user, or community)
    async getImages(options?: { userId?: string; community?: boolean }): Promise<MediaItem[]> {
        const supabase = createClient();
        let query = supabase
            .from('media_items')
            .select(`
                *,
                profiles (full_name, avatar_url)
            `)
            .order('created_at', { ascending: false });

        if (options?.userId) {
            query = query.eq('user_id', options.userId);
        } else if (options?.community) {
            query = query.eq('is_public', true);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Lỗi khi tải danh sách ảnh:', error);
            throw new Error(error.message);
        }
        return data as unknown as MediaItem[]; // Supabase type assertions can be tricky with nested profiles
    },

    // 2. Add new image to database
    async addImage(item: Omit<MediaItem, 'created_at' | 'profiles'>): Promise<MediaItem> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('media_items')
            .insert([item])
            .select(`
                *,
                profiles (full_name, avatar_url)
            `)
            .single();

        if (error) {
            console.error('Lỗi khi thêm ảnh vào database:', error);
            throw new Error(error.message);
        }
        return data as unknown as MediaItem;
    },

    // 3. Update grid layout for a specific image
    async updateLayout(id: string, layout: { x: number; y: number; w: number; h: number }): Promise<void> {
        const supabase = createClient();
        // Fire and forget style for fast UI updates, but handle errors
        const { error } = await supabase
            .from('media_items')
            .update({
                layout_x: layout.x,
                layout_y: layout.y,
                layout_w: layout.w,
                layout_h: layout.h,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('Lỗi khi cập nhật layout:', error);
            throw new Error(error.message);
        }
    },

    // 4. Update tags for an image
    async updateTags(id: string, tags: string[]): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('media_items')
            .update({
                tags,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('Lỗi khi cập nhật tags:', error);
            throw new Error(error.message);
        }
    },

    // 4.5 Update public status (sharing toggle)
    async updatePublicStatus(id: string, is_public: boolean): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('media_items')
            .update({
                is_public,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('Lỗi khi cập nhật trạng thái chia sẻ:', error);
            throw new Error(error.message);
        }
    },

    // 5. Delete image from database (Storage deletion handled separately)
    async deleteImage(id: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('media_items')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Lỗi khi xóa ảnh khỏi database:', error);
            throw new Error(error.message);
        }
    }
};
