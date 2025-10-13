// src/components/PostForm.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import {Loader2, PlusCircle, Zap} from 'lucide-react';
import { upsertPost } from '@/app/auth/post.actions';

// Các cấp độ truy cập
const ACCESS_LEVELS = ['public', 'elite', 'super_elite'];

interface PostFormProps {
    action: (formData: FormData) => Promise<{ error: string; success?: undefined; } | { success: boolean; error?: undefined; }>;
    defaultPost?: any; // Dữ liệu bài viết để sửa (bỏ qua cho form tạo mới)
}

export default function PostForm({ action, defaultPost }: PostFormProps) {
    const [isPending, setIsPending] = useState(false);
    const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // Thêm useEffect để điền giá trị mặc định khi defaultPost thay đổi
    useEffect(() => {
        if (defaultPost && formRef.current) {
            const form = formRef.current;
            (form.elements.namedItem('title') as HTMLInputElement).value = defaultPost.title || '';
            (form.elements.namedItem('slug') as HTMLInputElement).value = defaultPost.slug || '';
            (form.elements.namedItem('summary') as HTMLTextAreaElement).value = defaultPost.summary || '';
            (form.elements.namedItem('content') as HTMLTextAreaElement).value = defaultPost.content || '';
            (form.elements.namedItem('tag') as HTMLInputElement).value = defaultPost.tag || '';
            (form.elements.namedItem('access_level') as HTMLSelectElement).value = defaultPost.access_level || 'public';
            (form.elements.namedItem('is_published') as HTMLInputElement).checked = defaultPost.is_published || false;

            // Thêm input ẩn cho ID nếu đang chỉnh sửa
            if (defaultPost.id) {
                let idInput = form.elements.namedItem('id') as HTMLInputElement;
                if (!idInput) {
                    idInput = document.createElement('input');
                    idInput.type = 'hidden';
                    idInput.name = 'id';
                    form.appendChild(idInput);
                }
                idInput.value = defaultPost.id.toString();
            }
        }
    }, [defaultPost]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsPending(true);
        setStatus(null);

        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        const result = await action(formData);

        if (result?.error) {
            setStatus({ type: 'error', message: result.error });
        } else if (result?.success) {
            setStatus({ type: 'success', message: 'Thao tác thành công!' });
            // Reset form sau khi tạo mới thành công
            if (!defaultPost) {
                formRef.current.reset();
            }
        }

        setIsPending(false);
        setTimeout(() => setStatus(null), 5000);
    };

    return (
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="p-6 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-4"
        >
            {/* Tiêu đề & Slug */}
            <div className="flex space-x-4">
                <input
                    name="title"
                    type="text"
                    placeholder="Tiêu đề Bài viết"
                    required
                    className="flex-3 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 w-full"
                    defaultValue={defaultPost?.title || ''}
                />
                <input
                    name="slug"
                    type="text"
                    placeholder="Slug (ví dụ: bai-viet-dau-tien)"
                    required
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 min-w-[200px]"
                    defaultValue={defaultPost?.slug || ''}
                />
            </div>

            {/* Tóm tắt */}
            <textarea
                name="summary"
                placeholder="Tóm tắt bài viết (hiển thị ngoài trang Blog List)"
                rows={2}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                defaultValue={defaultPost?.summary || ''}
            />

            {/* Nội dung */}
            <textarea
                name="content"
                placeholder="Nội dung chính (hỗ trợ HTML/Markdown đơn giản)"
                required
                rows={8}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                defaultValue={defaultPost?.content || ''}
            />

            {/* Tag & Access Level */}
            <div className="flex space-x-4 items-center">
                <input
                    name="tag"
                    type="text"
                    placeholder="Tag (ví dụ: NEXTJS)"
                    className="w-1/3 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    defaultValue={defaultPost?.tag || ''}
                />

                {/* Access Level */}
                <select
                    name="access_level"
                    required
                    defaultValue={defaultPost?.access_level || 'public'}
                    className="w-1/3 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                    <option value="" disabled>Cấp độ Truy cập</option>
                    {ACCESS_LEVELS.map(level => (
                        <option key={level} value={level} className="capitalize">{level.toUpperCase()}</option>
                    ))}
                </select>

                {/* Is Published Checkbox */}
                <div className="flex items-center space-x-2 w-1/3">
                    <input
                        type="checkbox"
                        id="is_published"
                        name="is_published"
                        defaultChecked={defaultPost?.is_published || false}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Xuất bản Ngay
                    </label>
                </div>
            </div>

            {/* Thông báo Trạng thái */}
            {status && (
                <div className={`p-3 rounded-lg text-sm font-medium ${
                    status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                    {status.message}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg text-base font-semibold text-white bg-red-600 hover:bg-red-700 transition duration-300 disabled:opacity-50"
            >
                {isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                    <PlusCircle className="w-5 h-5 mr-2" />
                )}
                {isPending ? 'Đang lưu...' : 'Lưu Bài Viết'}
            </button>
        </form>
    );
}