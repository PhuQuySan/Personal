// src/components/PostForm.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, PlusCircle, Image, Link as LinkIcon, X } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { PostData, PostFormProps, ActionResult } from '@/types'; // Import các interface từ file types

// Các cấp độ truy cập
const ACCESS_LEVELS = ['public', 'elite', 'super_elite'];

export default function PostForm({ action, defaultPost }: PostFormProps) {
    const [isPending, setIsPending] = useState(false);
    const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
    const [content, setContent] = useState<string>(defaultPost?.content || '');
    const [title, setTitle] = useState<string>(defaultPost?.title || '');
    const formRef = useRef<HTMLFormElement>(null);

    // Thêm useEffect để điền giá trị mặc định khi defaultPost thay đổi
    useEffect(() => {
        if (defaultPost && formRef.current) {
            const form = formRef.current;

            // Tìm input ID
            let idInput = form.querySelector<HTMLInputElement>('input[name="id"]');
            if (!idInput) {
                idInput = document.createElement('input');
                idInput.type = 'hidden';
                idInput.name = 'id';
                form.appendChild(idInput);
            }
            idInput.value = defaultPost.id?.toString() || '';

            // Cập nhật các giá trị khác một cách an toàn
            const titleInput = form.querySelector<HTMLInputElement>('input[name="title"]');
            if (titleInput) titleInput.value = defaultPost.title || '';

            const slugInput = form.querySelector<HTMLInputElement>('input[name="slug"]');
            if (slugInput) slugInput.value = defaultPost.slug || '';

            const summaryInput = form.querySelector<HTMLTextAreaElement>('textarea[name="summary"]');
            if (summaryInput) summaryInput.value = defaultPost.summary || '';

            const tagInput = form.querySelector<HTMLInputElement>('input[name="tag"]');
            if (tagInput) tagInput.value = defaultPost.tag || '';

            const accessSelect = form.querySelector<HTMLSelectElement>('select[name="access_level"]');
            if (accessSelect) accessSelect.value = defaultPost.access_level || 'public';

            const publishedInput = form.querySelector<HTMLInputElement>('input[name="is_published"]');
            if (publishedInput) publishedInput.checked = defaultPost.is_published || false;

            // Cập nhật state local
            setContent(defaultPost.content || '');
            setTitle(defaultPost.title || '');
        }
    }, [defaultPost]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsPending(true);
        setStatus(null);

        if (!formRef.current) return;

        const formData = new FormData(formRef.current);

        // Thêm content vào formData
        formData.set('content', content);

        try {
            const result: ActionResult = await action(formData);

            if (result && 'error' in result) {
                // @ts-ignore
                setStatus({ type: 'error', message: result.error });
            } else if (result && 'success' in result && result.success) {
                setStatus({ type: 'success', message: result.message || 'Thao tác thành công!' });
                // Reset form sau khi tạo mới thành công
                if (!defaultPost) {
                    formRef.current.reset();
                    setContent('');
                    setTitle('');
                }
            }
        } catch (error) {
            console.error('Lỗi khi gửi form:', error);
            setStatus({ type: 'error', message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.' });
        } finally {
            setIsPending(false);
            setTimeout(() => setStatus(null), 5000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Main Form */}
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700 space-y-4"
            >
                {/* Tiêu đề */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tiêu đề bài viết <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="Nhập tiêu đề bài viết"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                            maxLength={200}
                        />
                        <div className="absolute right-3 top-2 text-xs text-gray-500">
                            {title.length}/200
                        </div>
                    </div>
                </div>

                {/* Slug */}
                <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Slug (URL) <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="slug"
                        name="slug"
                        type="text"
                        placeholder="bai-viet-mau"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                        defaultValue={defaultPost?.slug || ''}
                    />
                </div>

                {/* Tóm tắt */}
                <div>
                    <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tóm tắt bài viết
                    </label>
                    <textarea
                        id="summary"
                        name="summary"
                        placeholder="Tóm tắt ngắn về bài viết của bạn"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                        defaultValue={defaultPost?.summary || ''}
                    />
                </div>

                {/* Nội dung */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nội dung bài viết <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Viết nội dung bài viết tại đây..."
                    />
                </div>

                {/* Tag & Access Level */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="tag" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tag
                        </label>
                        <input
                            id="tag"
                            name="tag"
                            type="text"
                            placeholder="Ví dụ: JavaScript"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                            defaultValue={defaultPost?.tag || ''}
                        />
                    </div>

                    <div>
                        <label htmlFor="access_level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Cấp độ truy cập
                        </label>
                        <select
                            id="access_level"
                            name="access_level"
                            required
                            defaultValue={defaultPost?.access_level || 'public'}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                        >
                            {ACCESS_LEVELS.map(level => (
                                <option key={level} value={level} className="capitalize">{level.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <div className="flex items-center h-10">
                            <input
                                id="is_published"
                                name="is_published"
                                type="checkbox"
                                defaultChecked={defaultPost?.is_published || false}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                Xuất bản ngay
                            </label>
                        </div>
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
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition duration-300 disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <PlusCircle className="w-5 h-5 mr-2" />
                            {defaultPost?.id ? 'Cập nhật Bài Viết' : 'Tạo Bài Viết Mới'}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}