// // src/app/auth/media.actions.ts
// 'use server';
//rác
// import { createServer } from '@/lib/supabase/server';
// import { revalidatePath } from 'next/cache';
//
// // Xử lý tải lên hình ảnh lên Supabase Storage
// export async function uploadImage(formData: FormData) {
//     const supabase = await createServer();
//     const { data: { user } } = await supabase.auth.getUser();
//
//     if (!user) {
//         return { error: 'Vui lòng đăng nhập để tải lên.' };
//     }
//
//     // Lấy File từ FormData
//     const file = formData.get('file') as File | null;
//     if (!file || file.size === 0) {
//         return { error: 'Không tìm thấy tệp tin.' };
//     }
//
//     const fileExt = file.name.split('.').pop();
//     const fileName = `${Date.now()}.${fileExt}`;
//     const filePath = `user_uploads/${user.id}/${fileName}`; // Bucket 'user_uploads'
//
//     // Tải lên tệp tin
//     const { data, error } = await supabase.storage
//         .from('images') // Thay 'images' bằng tên Bucket Supabase của bạn
//         .upload(filePath, file);
//
//     if (error) {
//         console.error('Lỗi tải lên:', error.message);
//         return { error: `Lỗi tải lên: ${error.message}` };
//     }
//
//     // Lấy URL công khai
//     const { data: publicUrlData } = supabase.storage
//         .from('images')
//         .getPublicUrl(filePath);
//
//     // Kích hoạt revalidate cho trang dashboard/files (nếu có)
//     revalidatePath('/dashboard/files');
//
//     return {
//         success: true,
//         message: 'Tải lên thành công!',
//         url: publicUrlData.publicUrl
//     };
// }